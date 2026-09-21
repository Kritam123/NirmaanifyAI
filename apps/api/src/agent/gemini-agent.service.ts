import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { SandboxDriverFactory } from '@nirmaanify/sandbox-driver';
import { getStarterProjectFiles } from './starter-templates';
import { inngest } from '../inngest/inngest.client';
import { executeGeminiAgentLoop, deriveTitle } from './gemini-agent-engine';
import {
  MessageRole,
  SandboxProvider,
  ToolCallExecution,
  ProjectMessageDto,
  ProjectFragmentDto,
  ProjectSandboxDto,
} from '@nirmaanify/types';

interface AgentPromptOptions {
  prompt: string;
  preferredModel?: string;
  useInngest?: boolean;
}

@Injectable()
export class GeminiAgentService {
  private readonly logger = new Logger(GeminiAgentService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Main entry point: process user prompt with Gemini 3.8 Flash / Gemini 3.0 Pro coding agent
   */
  async processUserPrompt(projectId: string, options: AgentPromptOptions): Promise<ProjectMessageDto> {
    const { prompt, preferredModel = 'gemini-3.8-flash' } = options;
    this.logger.log(`🤖 [Project ${projectId}] Agent received prompt: "${prompt}" using ${preferredModel}`);

    // Trigger Inngest durable event in background
    try {
      await inngest.send({
        name: 'agent/prompt.received',
        data: { projectId, prompt, preferredModel },
      });
      this.logger.log(`⚡ [Inngest] Dispatched durable workflow event for project ${projectId}`);
    } catch (inngestErr: any) {
      this.logger.debug(`Inngest event dispatch notice: ${inngestErr?.message}`);
    }

    // 1. Verify project exists
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        sandbox: true,
        fragments: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    // 2. Resolve or initialize sandbox
    const sandboxRecord = await this.ensureSandbox(projectId, project.sandbox);
    const driver = SandboxDriverFactory.getOrCreateForProject(
      projectId,
      sandboxRecord.provider,
      process.env.E2B_API_KEY,
    );
    await driver.start({ projectId });
    const { webUrl, apiUrl } = driver.getPreviewUrls();

    // 3. Load or initialize project files
    let currentFiles: Record<string, string> = {};
    if (project.fragments && project.fragments.length > 0 && project.fragments[0].files) {
      currentFiles = project.fragments[0].files as Record<string, string>;
    } else {
      // Bootstrap from clean Next.js starter template
      currentFiles = getStarterProjectFiles({
        name: project.name,
        type: project.type,
        description: project.description || undefined,
      });
    }
    await driver.writeFiles(currentFiles);

    // 4. Record user message in Prisma
    await this.prisma.projectMessage.create({
      data: {
        projectId,
        role: 'USER',
        content: prompt,
        modelUsed: preferredModel,
        toolCalls: [],
      },
    });

    // 5. Run Gemini Autonomous Multi-Agent Loop
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || !apiKey.trim()) {
      throw new BadRequestException(
        'GEMINI_API_KEY is not configured in .env. Please provide your Google Gemini API key to enable AI agent code generation.',
      );
    }

    const agentResult = await executeGeminiAgentLoop({
      prompt,
      initialFiles: currentFiles,
      driver,
      apiKey,
      preferredModel,
      logger: this.logger,
    });

    // 6. Calculate diffs
    const diffs: Record<string, { type: 'added' | 'modified' | 'deleted'; diff?: string }> = {};
    for (const [filePath, newContent] of Object.entries(agentResult.updatedFiles)) {
      if (!currentFiles[filePath]) {
        diffs[filePath] = { type: 'added' };
      } else if (currentFiles[filePath] !== newContent) {
        diffs[filePath] = { type: 'modified' };
      }
    }

    // 7. Persist Assistant Message
    const assistantMessage = await this.prisma.projectMessage.create({
      data: {
        projectId,
        role: 'ASSISTANT',
        content: agentResult.content,
        thought: agentResult.thought,
        toolCalls: agentResult.toolCalls as any,
        modelUsed: preferredModel,
      },
    });

    // 8. Persist Fragment Snapshot
    const fragment = await this.prisma.projectFragment.create({
      data: {
        messageId: assistantMessage.id,
        projectId,
        title: agentResult.title,
        sandboxUrl: webUrl,
        apiSandboxUrl: apiUrl,
        files: agentResult.updatedFiles as any,
        diffs: diffs as any,
      },
    });

    // 9. Update Project Sandbox state
    await this.prisma.projectSandbox.update({
      where: { projectId },
      data: {
        status: 'READY',
        hostUrl: webUrl,
        apiHostUrl: apiUrl,
        lastActiveAt: new Date(),
      },
    });

    return {
      id: assistantMessage.id,
      projectId,
      role: 'ASSISTANT',
      content: assistantMessage.content,
      thought: assistantMessage.thought,
      toolCalls: agentResult.toolCalls,
      modelUsed: preferredModel,
      createdAt: assistantMessage.createdAt.toISOString(),
      fragment: {
        id: fragment.id,
        messageId: fragment.messageId,
        projectId: fragment.projectId,
        sandboxUrl: fragment.sandboxUrl,
        apiSandboxUrl: fragment.apiSandboxUrl,
        title: fragment.title,
        files: agentResult.updatedFiles,
        diffs,
        createdAt: fragment.createdAt.toISOString(),
      },
    };
  }

  /**
   * Get all messages for a project
   */
  async getMessages(projectId: string): Promise<ProjectMessageDto[]> {
    const messages = await this.prisma.projectMessage.findMany({
      where: { projectId },
      include: { fragment: true },
      orderBy: { createdAt: 'asc' },
    });

    return messages.map((m) => ({
      id: m.id,
      projectId: m.projectId,
      role: m.role as MessageRole,
      content: m.content,
      thought: m.thought,
      toolCalls: (m.toolCalls as any) || [],
      modelUsed: m.modelUsed,
      createdAt: m.createdAt.toISOString(),
      fragment: m.fragment
        ? {
            id: m.fragment.id,
            messageId: m.fragment.messageId,
            projectId: m.fragment.projectId,
            sandboxUrl: m.fragment.sandboxUrl,
            apiSandboxUrl: m.fragment.apiSandboxUrl,
            title: m.fragment.title,
            files: (m.fragment.files as any) || {},
            diffs: (m.fragment.diffs as any) || null,
            createdAt: m.fragment.createdAt.toISOString(),
          }
        : null,
    }));
  }

  /**
   * Switch sandbox between E2B_CLOUD and LOCAL_DOCKER
   */
  async switchSandbox(projectId: string, provider: SandboxProvider): Promise<ProjectSandboxDto> {
    const sandbox = await this.prisma.projectSandbox.findUnique({
      where: { projectId },
    });

    const newDriver = SandboxDriverFactory.getOrCreateForProject(
      projectId,
      provider,
      process.env.E2B_API_KEY,
    );
    await newDriver.start({ projectId });
    const { webUrl, apiUrl } = newDriver.getPreviewUrls();

    // Migrate latest files to new driver
    const latestFragment = await this.prisma.projectFragment.findFirst({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
    });

    if (latestFragment && latestFragment.files) {
      await newDriver.writeFiles(latestFragment.files as Record<string, string>);
    }

    const updated = await this.prisma.projectSandbox.upsert({
      where: { projectId },
      create: {
        projectId,
        provider,
        sandboxId: `sandbox-${provider.toLowerCase()}-${projectId}`,
        status: 'READY',
        hostUrl: webUrl,
        apiHostUrl: apiUrl,
        lastActiveAt: new Date(),
      },
      update: {
        provider,
        status: 'READY',
        hostUrl: webUrl,
        apiHostUrl: apiUrl,
        lastActiveAt: new Date(),
      },
    });

    return {
      id: updated.id,
      projectId: updated.projectId,
      provider: updated.provider as SandboxProvider,
      sandboxId: updated.sandboxId,
      status: 'READY',
      hostUrl: updated.hostUrl,
      apiHostUrl: updated.apiHostUrl,
      lastActiveAt: updated.lastActiveAt.toISOString(),
    };
  }

  /**
   * Get sandbox status
   */
  async getSandboxStatus(projectId: string): Promise<ProjectSandboxDto> {
    const sandbox =
      (await this.prisma.projectSandbox.findUnique({
        where: { projectId },
      })) || (await this.ensureSandbox(projectId));

    return {
      id: sandbox.id,
      projectId: sandbox.projectId,
      provider: sandbox.provider as SandboxProvider,
      sandboxId: sandbox.sandboxId,
      status: 'READY',
      hostUrl: sandbox.hostUrl,
      apiHostUrl: sandbox.apiHostUrl,
      lastActiveAt: sandbox.lastActiveAt.toISOString(),
    };
  }

  /**
   * Rollback snapshot to an earlier fragment
   */
  async rollback(projectId: string, fragmentId: string): Promise<ProjectFragmentDto> {
    const targetFragment = await this.prisma.projectFragment.findUnique({
      where: { id: fragmentId },
    });

    if (!targetFragment) {
      throw new NotFoundException(`Fragment with ID ${fragmentId} not found`);
    }

    const sandbox = await this.ensureSandbox(projectId);
    const driver = SandboxDriverFactory.getOrCreateForProject(
      projectId,
      sandbox.provider,
      process.env.E2B_API_KEY,
    );

    const files = targetFragment.files as Record<string, string>;
    await driver.writeFiles(files);

    // Save a system message and fragment for the rollback action
    const rollbackMsg = await this.prisma.projectMessage.create({
      data: {
        projectId,
        role: 'SYSTEM',
        content: `Rolled back workspace to snapshot: "${targetFragment.title}"`,
        modelUsed: 'system',
        toolCalls: [
          {
            name: 'rollbackSnapshot',
            args: { fragmentId, title: targetFragment.title },
            status: 'success',
            output: `Restored ${Object.keys(files).length} files`,
          },
        ] as any,
      },
    });

    const newFragment = await this.prisma.projectFragment.create({
      data: {
        messageId: rollbackMsg.id,
        projectId,
        title: `Rollback: ${targetFragment.title}`,
        sandboxUrl: targetFragment.sandboxUrl,
        apiSandboxUrl: targetFragment.apiSandboxUrl,
        files: files as any,
      },
    });

    return {
      id: newFragment.id,
      messageId: newFragment.messageId,
      projectId: newFragment.projectId,
      sandboxUrl: newFragment.sandboxUrl,
      apiSandboxUrl: newFragment.apiSandboxUrl,
      title: newFragment.title,
      files,
      createdAt: newFragment.createdAt.toISOString(),
    };
  }

  // ===========================================================================
  // PRIVATE AGENT EXECUTION METHODS
  // ===========================================================================

  private async ensureSandbox(projectId: string, existing?: any) {
    if (existing) return existing;
    return this.prisma.projectSandbox.upsert({
      where: { projectId },
      create: {
        projectId,
        provider: 'E2B_CLOUD',
        sandboxId: `e2b-sandbox-${projectId}`,
        status: 'READY',
        hostUrl: `/preview/${projectId}`,
        apiHostUrl: `http://localhost:4000/api/v1/projects/${projectId}`,
        lastActiveAt: new Date(),
      },
      update: {},
    });
  }

  private deriveTitle(prompt: string): string {
    return deriveTitle(prompt);
  }
}
