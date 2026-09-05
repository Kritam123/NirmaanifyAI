import { Controller, All, Post, Req, Res, Param, Body, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { serve } from 'inngest/express';
import { inngest } from './inngest.client';
import { allInngestFunctions, setInngestPrisma } from './functions/agent-coding-workflow';
import { PrismaService } from '../database/prisma.service';
import { AgentPromptRequestDto, InngestWorkflowRunDto } from '@nirmaanify/types';

const inngestServeHandler = serve({
  client: inngest,
  functions: allInngestFunctions,
});

@ApiTags('Inngest')
@Controller(['inngest', 'api/inngest'])
export class InngestController {
  private readonly logger = new Logger(InngestController.name);

  constructor(private readonly prisma: PrismaService) {
    setInngestPrisma(this.prisma);
  }

  @All()
  @ApiOperation({ summary: 'Inngest Engine Webhook & Dev Server Endpoint' })
  async handleInngestWebhook(@Req() req: Request, @Res() res: Response) {
    return inngestServeHandler(req, res);
  }
}

@ApiTags('Agent')
@Controller(['projects/:id/agent/inngest', 'api/projects/:id/agent/inngest'])
export class AgentInngestController {
  private readonly logger = new Logger(AgentInngestController.name);

  constructor(private readonly prisma: PrismaService) {
    setInngestPrisma(this.prisma);
  }

  @Post('trigger')
  @ApiOperation({ summary: 'Trigger Inngest durable agentic coding workflow' })
  @ApiResponse({ status: 201, description: 'Inngest event dispatched' })
  async triggerInngestWorkflow(
    @Param('id') projectId: string,
    @Body() dto: AgentPromptRequestDto,
  ): Promise<InngestWorkflowRunDto> {
    const preferredModel = dto.preferredModel || 'gemini-3.8-flash';
    this.logger.log(`⚡ Dispatching Inngest workflow for project ${projectId} with model ${preferredModel}`);

    const eventResult = await inngest.send({
      name: 'agent/prompt.received',
      data: {
        projectId,
        prompt: dto.prompt,
        preferredModel,
      },
    });

    const eventId = eventResult.ids?.[0] || `evt-${Date.now()}`;

    return {
      eventId,
      status: 'queued',
      projectId,
      stepName: 'verify-project-and-sandbox',
      message: `Inngest durable workflow initiated for model ${preferredModel}`,
    };
  }
}
