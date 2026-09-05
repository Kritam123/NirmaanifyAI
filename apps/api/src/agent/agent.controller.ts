import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { GeminiAgentService } from './gemini-agent.service';
import {
  ProjectMessageDto,
  ProjectFragmentDto,
  ProjectSandboxDto,
  AgentPromptRequestDto,
  SwitchSandboxDto,
} from '@nirmaanify/types';

@ApiTags('Agent')
@Controller(['projects/:id/agent', 'api/projects/:id/agent'])
export class AgentController {
  constructor(private readonly agentService: GeminiAgentService) {}

  @Post('messages')
  @ApiOperation({ summary: 'Send prompt to autonomous Gemini 3.0 Pro coding agent' })
  @ApiResponse({ status: 201, description: 'Prompt processed and fragment snapshot created' })
  async sendMessage(
    @Param('id') projectId: string,
    @Body() dto: AgentPromptRequestDto,
  ): Promise<ProjectMessageDto> {
    return this.agentService.processUserPrompt(projectId, {
      prompt: dto.prompt,
      preferredModel: dto.preferredModel,
    });
  }

  @Get('messages')
  @ApiOperation({ summary: 'Retrieve agent conversation messages and fragment snapshots' })
  @ApiResponse({ status: 200, description: 'List of messages with fragments' })
  async getMessages(@Param('id') projectId: string): Promise<ProjectMessageDto[]> {
    return this.agentService.getMessages(projectId);
  }

  @Patch('sandbox/switch')
  @ApiOperation({ summary: 'Switch sandbox provider (Cloud E2B vs Local Docker)' })
  @ApiResponse({ status: 200, description: 'Sandbox provider switched successfully' })
  async switchSandbox(
    @Param('id') projectId: string,
    @Body() dto: SwitchSandboxDto,
  ): Promise<ProjectSandboxDto> {
    return this.agentService.switchSandbox(projectId, dto.provider);
  }

  @Get('sandbox/status')
  @ApiOperation({ summary: 'Get current sandbox container status and live preview URLs' })
  @ApiResponse({ status: 200, description: 'Current sandbox status' })
  async getSandboxStatus(@Param('id') projectId: string): Promise<ProjectSandboxDto> {
    return this.agentService.getSandboxStatus(projectId);
  }

  @Post('rollback/:fragmentId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rollback project codebase to an earlier fragment snapshot' })
  @ApiResponse({ status: 200, description: 'Codebase restored to selected fragment' })
  async rollback(
    @Param('id') projectId: string,
    @Param('fragmentId') fragmentId: string,
  ): Promise<ProjectFragmentDto> {
    return this.agentService.rollback(projectId, fragmentId);
  }
}
