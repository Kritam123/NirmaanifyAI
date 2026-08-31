import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AgentOrchestratorService } from './agent-orchestrator.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DesignContextMode } from '@nirmaanify/types';

@Controller('projects/:projectId/orchestrator')
@UseGuards(JwtAuthGuard)
export class AgentOrchestratorController {
  constructor(private readonly orchestratorService: AgentOrchestratorService) {}

  @Post('plan')
  async planExecution(
    @Param('projectId') projectId: string,
    @Body() payload: { prompt: string; designMode?: DesignContextMode }
  ) {
    return this.orchestratorService.planExecution(
      projectId,
      payload.prompt,
      payload.designMode || 'platform'
    );
  }

  @Post('execute-step')
  async executeStep(
    @Param('projectId') projectId: string,
    @Body() payload: { planId: string; stepId: string }
  ) {
    return this.orchestratorService.executeStep(projectId, payload.planId, payload.stepId);
  }

  @Post('approve-step')
  async approveStep(
    @Param('projectId') projectId: string,
    @Body() payload: { planId: string; stepId: string }
  ) {
    return this.orchestratorService.approveStep(projectId, payload.planId, payload.stepId);
  }

  @Get('memory')
  async getMemory(
    @Param('projectId') projectId: string,
    @Query('designMode') designMode?: DesignContextMode
  ) {
    return this.orchestratorService.getMemoryStack(projectId, designMode || 'platform');
  }
}
