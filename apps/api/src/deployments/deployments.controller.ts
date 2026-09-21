import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DeploymentsService } from './deployments.service';
import { ProjectDeploymentDto, TriggerDeploymentDto } from '@nirmaanify/types';

@ApiTags('Deployments')
@Controller('projects/:id/deployments')
export class DeploymentsController {
  constructor(private readonly deploymentsService: DeploymentsService) {}

  @Post('trigger')
  @ApiOperation({ summary: 'Trigger deployment to Vercel, Render, Railway, Docker, or Sandbox' })
  @ApiResponse({ status: 201, description: 'Deployment triggered' })
  async triggerDeployment(
    @Param('id') projectId: string,
    @Body() dto: TriggerDeploymentDto,
    @Request() req: any,
  ): Promise<ProjectDeploymentDto> {
    return this.deploymentsService.triggerDeployment(projectId, dto, req.user?.id);
  }

  @Get()
  @ApiOperation({ summary: 'List recent deployments and status' })
  async listDeployments(
    @Param('id') projectId: string,
  ): Promise<{ deployments: ProjectDeploymentDto[] }> {
    const deployments = await this.deploymentsService.listDeployments(projectId);
    return { deployments };
  }

  @Get(':deployId')
  @ApiOperation({ summary: 'Get deployment status and logs' })
  async getDeployment(
    @Param('id') projectId: string,
    @Param('deployId') deployId: string,
  ): Promise<{ deployment: ProjectDeploymentDto }> {
    const deployment = await this.deploymentsService.getDeployment(projectId, deployId);
    return { deployment };
  }
}
