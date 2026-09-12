import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { ContextMemoryService } from '../memory/context-memory.service';
import { IntentAnalyzer } from './intent-analyzer';
import { SPECIALIZED_AGENT_REGISTRY } from '../specialized/specialized-agents';
import {
  AgentOrchestrationRunDto,
  OrchestratePromptRequestDto,
  OrchestrationTask,
  SpecializedAgentType,
  TaskExecutionStatus,
} from '@nirmaanify/types';
import { deriveTitle } from '../gemini-agent-engine';

@Injectable()
export class AgentOrchestratorService {
  private readonly logger = new Logger(AgentOrchestratorService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly contextMemoryService: ContextMemoryService
  ) {}

  public async orchestrate(
    projectId: string,
    dto: OrchestratePromptRequestDto,
    driver?: any
  ): Promise<AgentOrchestrationRunDto> {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        sandbox: true,
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: { fragment: true },
        },
      },
    });

    if (!project) {
      throw new NotFoundException(`Project ${projectId} not found`);
    }

    // Determine initial files from latest fragment or empty
    const latestFragment = project.messages[0]?.fragment;
    const initialFiles = (latestFragment?.files as Record<string, string>) || {};

    // 1. Build 6-layer Context Memory Snapshot
    const memory = await this.contextMemoryService.buildMemoryContext(projectId, initialFiles);

    // 2. Decompose prompt into DAG Tasks
    const plan = IntentAnalyzer.analyzeAndDecompose(dto.prompt, memory);

    // 3. Create Orchestration Run in Database
    let run: any;
    const initialLogs = [
      {
        timestamp: new Date().toISOString(),
        agent: 'ORCHESTRATOR' as SpecializedAgentType,
        message: `Decomposed request into ${plan.length} specialized agent tasks.`,
      },
    ];

    if ((this.prisma as any).agentOrchestrationRun) {
      run = await (this.prisma as any).agentOrchestrationRun.create({
        data: {
          projectId,
          prompt: dto.prompt,
          status: 'IN_PROGRESS',
          plan: plan as any,
          contextSnapshot: memory as any,
          currentAgent: 'ORCHESTRATOR',
          logs: initialLogs as any,
        },
      });
    } else {
      const runId = require('crypto').randomUUID();
      try {
        await this.prisma.$queryRawUnsafe(
          `INSERT INTO public.agent_orchestration_runs ("id", "projectId", "prompt", "status", "plan", "contextSnapshot", "currentAgent", "logs", "startedAt") VALUES ($1, $2, $3, $4::"TaskExecutionStatus", $5::jsonb, $6::jsonb, $7::"SpecializedAgentType", $8::jsonb, NOW())`,
          runId,
          projectId,
          dto.prompt,
          'IN_PROGRESS',
          JSON.stringify(plan),
          JSON.stringify(memory),
          'ORCHESTRATOR',
          JSON.stringify(initialLogs),
        );
      } catch (err: any) {
        this.logger.warn(`Could not persist initial run via raw SQL: ${err.message}`);
      }
      run = {
        id: runId,
        projectId,
        prompt: dto.prompt,
        status: 'IN_PROGRESS',
        plan,
        contextSnapshot: memory,
        currentAgent: 'ORCHESTRATOR',
        logs: initialLogs,
        startedAt: new Date(),
      };
    }

    // 4. Execute Task DAG
    const logs: Array<{ timestamp: string; agent: SpecializedAgentType; message: string }> = [
      ...initialLogs,
    ];

    let currentFiles = { ...initialFiles };
    let finalThought = '';

    for (const task of plan) {
      task.status = 'IN_PROGRESS';
      logs.push({
        timestamp: new Date().toISOString(),
        agent: task.agent,
        message: `Executing task: ${task.title}`,
      });

      const agentConfig = SPECIALIZED_AGENT_REGISTRY[task.agent];
      const memoryPrompt = this.contextMemoryService.formatMemoryPromptInjection(memory);
      const systemPrompt = agentConfig ? agentConfig.systemPrompt(memory) : '';
      const taskPrompt = `Task: ${task.title}\nDescription: ${task.description}\nDependencies: ${task.dependencies.join(', ') || 'None'}\n\nProject Intent: ${dto.prompt}`;

      const injectedPrompt = `${systemPrompt}\n\n${memoryPrompt}\n\n${taskPrompt}`;

      try {
        const agentOutput = await this.callGemini(
          injectedPrompt,
          dto.preferredModel || 'gemini-3.8-flash'
        );

        if (agentOutput.thought) {
          finalThought += `\n[${task.agent}] ${agentOutput.thought}\n`;
        }

        if (agentOutput.files) {
          currentFiles = { ...currentFiles, ...agentOutput.files };
          task.affectedFiles = Object.keys(agentOutput.files);
        }

        task.status = 'COMPLETED';
        task.outputSummary = agentOutput.summary || agentOutput.outputSummary || 'Task completed successfully.';
        logs.push({
          timestamp: new Date().toISOString(),
          agent: task.agent,
          message: `Task completed: ${task.outputSummary}`,
        });
      } catch (error: any) {
        task.status = 'FAILED';
        task.outputSummary = `Task failed: ${error.message}`;
        logs.push({
          timestamp: new Date().toISOString(),
          agent: task.agent,
          message: `Task failed: ${error.message}`,
        });
        this.logger.error(`Specialized Agent ${task.agent} failed on task ${task.id}: ${error.message}`);
      }
    }

    // 5. Push generated files to sandbox
    let sandboxUrl = project.sandbox?.hostUrl || '';
    if (driver) {
      try {
        await driver.syncFiles(projectId, currentFiles);
        sandboxUrl = driver.getHostUrl(projectId);
      } catch (err: any) {
        this.logger.warn(`Sandbox sync warning: ${err.message}`);
      }
    }

    // 6. Record Assistant Message in Project History
    const message = await this.prisma.projectMessage.create({
      data: {
        projectId,
        role: 'ASSISTANT',
        content: `Coordinated ${plan.length} specialized agent tasks. Created snapshot fragment.`,
        thought: finalThought.trim(),
        modelUsed: dto.preferredModel || 'gemini-3.8-flash',
        toolCalls: plan.map((t) => ({
          name: t.agent.toLowerCase(),
          args: { taskId: t.id, title: t.title, status: t.status },
        })) as any,
      },
    });

    // 7. Create Snapshot Project Fragment
    const fragment = await this.prisma.projectFragment.create({
      data: {
        messageId: message.id,
        projectId,
        title: deriveTitle(dto.prompt),
        files: currentFiles,
        sandboxUrl,
      },
    });

    // 8. Update Orchestration Run
    const finalStatus = plan.some((t) => t.status === 'FAILED') ? 'FAILED' : 'COMPLETED';
    let updatedRun: any;

    if ((this.prisma as any).agentOrchestrationRun) {
      updatedRun = await (this.prisma as any).agentOrchestrationRun.update({
        where: { id: run.id },
        data: {
          messageId: message.id,
          status: finalStatus,
          plan: plan as any,
          logs: logs as any,
          completedAt: new Date(),
        },
      });
    } else {
      try {
        await this.prisma.$queryRawUnsafe(
          `UPDATE public.agent_orchestration_runs SET "messageId" = $1, "status" = $2::"TaskExecutionStatus", "plan" = $3::jsonb, "logs" = $4::jsonb, "completedAt" = NOW() WHERE "id" = $5`,
          message.id,
          finalStatus,
          JSON.stringify(plan),
          JSON.stringify(logs),
          run.id,
        );
      } catch (err: any) {
        this.logger.warn(`Could not update run via raw SQL: ${err.message}`);
      }
      updatedRun = {
        ...run,
        messageId: message.id,
        status: finalStatus,
        plan,
        logs,
        completedAt: new Date(),
      };
    }

    return this.mapToDto(updatedRun);
  }

  public async getRun(runId: string): Promise<AgentOrchestrationRunDto> {
    if ((this.prisma as any).agentOrchestrationRun) {
      const run = await (this.prisma as any).agentOrchestrationRun.findUnique({
        where: { id: runId },
      });
      if (!run) {
        throw new NotFoundException(`Orchestration run ${runId} not found`);
      }
      return this.mapToDto(run);
    }

    try {
      const runs: any[] = await this.prisma.$queryRawUnsafe(
        `SELECT * FROM public.agent_orchestration_runs WHERE "id" = $1 LIMIT 1`,
        runId,
      );
      if (!runs || runs.length === 0) {
        throw new NotFoundException(`Orchestration run ${runId} not found`);
      }
      return this.mapToDto(runs[0]);
    } catch (err: any) {
      if (err instanceof NotFoundException) throw err;
      throw new NotFoundException(`Orchestration run ${runId} not found`);
    }
  }

  public async listRuns(projectId: string): Promise<AgentOrchestrationRunDto[]> {
    if ((this.prisma as any).agentOrchestrationRun) {
      const runs = await (this.prisma as any).agentOrchestrationRun.findMany({
        where: { projectId },
        orderBy: { startedAt: 'desc' },
        take: 20,
      });
      return runs.map((r: any) => this.mapToDto(r));
    }

    try {
      const runs: any[] = await this.prisma.$queryRawUnsafe(
        `SELECT * FROM public.agent_orchestration_runs WHERE "projectId" = $1 ORDER BY "startedAt" DESC LIMIT 20`,
        projectId,
      );
      return runs.map((r: any) => this.mapToDto(r));
    } catch {
      return [];
    }
  }

  private async callGemini(prompt: string, model: string): Promise<any> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured in .env');
    }

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: 'application/json',
        },
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Gemini API returned ${res.status}: ${errText.slice(0, 200)}`);
    }

    const data = await res.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    return JSON.parse(rawText);
  }

  private mapToDto(record: any): AgentOrchestrationRunDto {
    return {
      id: record.id,
      projectId: record.projectId,
      messageId: record.messageId,
      prompt: record.prompt,
      status: record.status as TaskExecutionStatus,
      plan: (record.plan || []) as OrchestrationTask[],
      contextSnapshot: record.contextSnapshot || {},
      currentAgent: record.currentAgent as SpecializedAgentType,
      logs: record.logs || [],
      error: record.error,
      startedAt: record.startedAt.toISOString(),
      completedAt: record.completedAt ? record.completedAt.toISOString() : null,
    };
  }
}
