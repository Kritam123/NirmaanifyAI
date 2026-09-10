import { inngest } from '../inngest.client';
import { PrismaService } from '../../database/prisma.service';
import { SandboxDriverFactory } from '@nirmaanify/sandbox-driver';
import { getStarterProjectFiles } from '../../agent/starter-templates';
import { ToolCallExecution, ProjectMessageDto } from '@nirmaanify/types';
import { executeGeminiAgentLoop } from '../../agent/gemini-agent-engine';

// Singleton prisma reference for Inngest step runner
let prismaInstance: PrismaService | null = null;
export function setInngestPrisma(prisma: PrismaService) {
  prismaInstance = prisma;
}

export const agentCodingWorkflowFunction = inngest.createFunction(
  {
    id: 'agentic-fullstack-coding-workflow',
    name: 'Autonomous Full-Stack Coding Agent Workflow',
    retries: 2,
    triggers: [{ event: 'agent/prompt.received' }],
  },
  async ({ event, step }: any) => {
    const { projectId, prompt, preferredModel = 'gemini-3.8-flash' } = event.data;
    const prisma = prismaInstance || new PrismaService();

    // Step 1: Verify Project & Sandbox
    const sandboxState = await step.run('verify-project-and-sandbox', async () => {
      const project = await prisma.project.findUnique({
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
        throw new Error(`Project ${projectId} not found`);
      }

      let sandbox = project.sandbox;
      if (!sandbox) {
        sandbox = await prisma.projectSandbox.create({
          data: {
            projectId,
            provider: 'E2B_CLOUD',
            sandboxId: `sbx-${projectId}`,
            status: 'READY',
            hostUrl: `/preview/${projectId}`,
            apiHostUrl: `http://localhost:4000/api/v1/projects/${projectId}`,
            lastActiveAt: new Date(),
          },
        });
      }

      return {
        provider: sandbox.provider,
        hostUrl: sandbox.hostUrl,
        apiHostUrl: sandbox.apiHostUrl,
        latestFiles: (project.fragments?.[0]?.files as Record<string, string>) || null,
        projectName: project.name,
        projectType: project.type,
        projectDescription: project.description || undefined,
      };
    });

    // Step 2: Initialize & Sync Sandbox Driver
    const workspace = await step.run('prepare-workspace-files', async () => {
      const driver = SandboxDriverFactory.getOrCreateForProject(
        projectId,
        sandboxState.provider,
        process.env.E2B_API_KEY,
      );
      await driver.start({ projectId });

      let currentFiles = sandboxState.latestFiles;
      if (!currentFiles || Object.keys(currentFiles).length === 0) {
        currentFiles = getStarterProjectFiles({
          name: sandboxState.projectName,
          type: sandboxState.projectType,
          description: sandboxState.projectDescription,
        });
      }
      await driver.writeFiles(currentFiles);

      const urls = driver.getPreviewUrls();
      return {
        currentFiles,
        webUrl: urls.webUrl,
        apiUrl: urls.apiUrl,
      };
    });

    // Step 3: Run AI Agent Code Generation (Gemini 3.8 Flash / Gemini 3.0 Pro)
    const agentResult = await step.run('generate-code-with-gemini', async () => {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('GEMINI_API_KEY is not configured in .env for Inngest agent execution.');
      }

      const driver = SandboxDriverFactory.getOrCreateForProject(
        projectId,
        sandboxState.provider,
        process.env.E2B_API_KEY,
      );

      return executeGeminiAgentLoop({
        prompt,
        initialFiles: workspace.currentFiles,
        driver,
        apiKey,
        preferredModel,
      });
    });

    // Step 4: Persist Fragment Snapshot & Message
    const persisted = await step.run('persist-fragment-snapshot', async () => {
      // Calculate diffs
      const diffs: Record<string, { type: 'added' | 'modified' | 'deleted'; diff?: string }> = {};
      for (const [path, content] of Object.entries(agentResult.updatedFiles)) {
        if (!workspace.currentFiles[path]) {
          diffs[path] = { type: 'added' };
        } else if (workspace.currentFiles[path] !== content) {
          diffs[path] = { type: 'modified' };
        }
      }

      const msg = await prisma.projectMessage.create({
        data: {
          projectId,
          role: 'ASSISTANT',
          content: agentResult.content,
          thought: agentResult.thought,
          modelUsed: preferredModel,
          toolCalls: agentResult.toolCalls as any,
        },
      });

      const fragment = await prisma.projectFragment.create({
        data: {
          projectId,
          messageId: msg.id,
          title: agentResult.title,
          sandboxUrl: workspace.webUrl,
          apiSandboxUrl: workspace.apiUrl,
          files: agentResult.updatedFiles,
          diffs,
        },
      });

      return {
        id: msg.id,
        projectId,
        role: msg.role as any,
        content: msg.content,
        thought: msg.thought,
        toolCalls: msg.toolCalls as any,
        modelUsed: msg.modelUsed,
        createdAt: msg.createdAt.toISOString(),
        fragment: {
          id: fragment.id,
          messageId: fragment.messageId,
          projectId: fragment.projectId,
          sandboxUrl: fragment.sandboxUrl,
          apiSandboxUrl: fragment.apiSandboxUrl,
          title: fragment.title,
          files: fragment.files as Record<string, string>,
          diffs: fragment.diffs as any,
          createdAt: fragment.createdAt.toISOString(),
        },
      } as ProjectMessageDto;
    });

    return {
      success: true,
      workflow: 'inngest-agentic-coding',
      message: persisted,
    };
  }
);

export const rollbackWorkflowFunction = inngest.createFunction(
  {
    id: 'agentic-rollback-workflow',
    name: 'Agentic Snapshot Rollback Workflow',
    triggers: [{ event: 'agent/rollback.requested' }],
  },
  async ({ event, step }: any) => {
    const { projectId, fragmentId } = event.data;
    const prisma = prismaInstance || new PrismaService();

    return await step.run('execute-rollback', async () => {
      const fragment = await prisma.projectFragment.findUnique({
        where: { id: fragmentId },
      });

      if (!fragment) {
        throw new Error(`Fragment ${fragmentId} not found`);
      }

      const driver = SandboxDriverFactory.getOrCreateForProject(projectId, 'E2B_CLOUD');
      if (fragment.files) {
        await driver.writeFiles(fragment.files as Record<string, string>);
      }

      return {
        success: true,
        fragmentId,
        revertedFilesCount: Object.keys(fragment.files || {}).length,
      };
    });
  }
);

export const allInngestFunctions = [agentCodingWorkflowFunction, rollbackWorkflowFunction];
