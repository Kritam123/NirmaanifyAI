import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import {
  AgentPlanExecution,
  AgentTaskStep,
  AiAgentMemoryStack,
  DesignContextMode,
  ProjectDto,
} from '@nirmaanify/types';
import { AiAgentOrchestrator } from '@nirmaanify/component-registry';

@Injectable()
export class AgentOrchestratorService {
  private activePlans = new Map<string, AgentPlanExecution>();

  constructor(private readonly prisma: PrismaService) {}

  async planExecution(
    projectId: string,
    prompt: string,
    designMode: DesignContextMode = 'platform'
  ): Promise<AgentPlanExecution> {
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new NotFoundException('Project not found.');

    const memoryStack = AiAgentOrchestrator.buildMemoryStack(project as any, designMode);
    const steps = AiAgentOrchestrator.decomposeUserRequest(prompt, memoryStack);

    const plan: AgentPlanExecution = {
      id: `plan-${Date.now().toString(36)}`,
      prompt,
      status: 'EXECUTING',
      steps,
      createdAt: new Date().toISOString(),
      memoryStack,
    };

    this.activePlans.set(plan.id, plan);
    return plan;
  }

  async executeStep(
    projectId: string,
    planId: string,
    stepId: string
  ): Promise<AgentPlanExecution> {
    const plan = this.activePlans.get(planId);
    if (!plan) throw new NotFoundException('Execution plan not found.');

    const stepIdx = plan.steps.findIndex((s) => s.id === stepId);
    if (stepIdx === -1) throw new NotFoundException('Step not found in plan.');

    const updatedStep = await AiAgentOrchestrator.simulateStepExecution(
      plan.steps[stepIdx],
      plan.memoryStack
    );

    plan.steps[stepIdx] = updatedStep;

    // Check overall plan completion
    const allDone = plan.steps.every((s) => s.status === 'COMPLETED');
    const anyWaiting = plan.steps.some((s) => s.status === 'WAITING_APPROVAL');

    if (allDone) plan.status = 'COMPLETED';
    else if (anyWaiting) plan.status = 'WAITING_USER';
    else plan.status = 'EXECUTING';

    this.activePlans.set(planId, plan);
    return plan;
  }

  async approveStep(
    projectId: string,
    planId: string,
    stepId: string
  ): Promise<AgentPlanExecution> {
    const plan = this.activePlans.get(planId);
    if (!plan) throw new NotFoundException('Execution plan not found.');

    const step = plan.steps.find((s) => s.id === stepId);
    if (!step) throw new NotFoundException('Step not found.');

    step.status = 'COMPLETED';
    step.completedAt = new Date().toISOString();

    // Auto-advance next queued step if dependencies met
    const nextQueued = plan.steps.find((s) => s.status === 'QUEUED');
    if (nextQueued) {
      nextQueued.status = 'RUNNING';
    }

    const allDone = plan.steps.every((s) => s.status === 'COMPLETED');
    if (allDone) plan.status = 'COMPLETED';
    else plan.status = 'EXECUTING';

    this.activePlans.set(planId, plan);
    return plan;
  }

  async getMemoryStack(
    projectId: string,
    designMode: DesignContextMode = 'platform'
  ): Promise<AiAgentMemoryStack> {
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new NotFoundException('Project not found.');

    return AiAgentOrchestrator.buildMemoryStack(project as any, designMode);
  }
}
