import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { DeploymentEngineService } from './deployment-engine.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DeploymentTarget } from '@nirmaanify/types';

@Controller('projects/:projectId')
@UseGuards(JwtAuthGuard)
export class DeploymentEngineController {
  constructor(private readonly deploymentService: DeploymentEngineService) {}

  @Get('export/bundle')
  async getExportBundle(@Param('projectId') projectId: string) {
    return this.deploymentService.getExportBundle(projectId);
  }

  @Post('build/validate')
  async triggerBuildValidation(@Param('projectId') projectId: string) {
    return this.deploymentService.triggerBuildValidation(projectId);
  }

  @Post('deploy')
  async triggerDeployment(
    @Param('projectId') projectId: string,
    @Body() payload: { target: DeploymentTarget; customDomain?: string }
  ) {
    return this.deploymentService.triggerDeployment(
      projectId,
      payload.target || 'vercel',
      payload.customDomain
    );
  }

  @Get('deployments')
  async getDeploymentHistory(@Param('projectId') projectId: string) {
    return this.deploymentService.getDeploymentHistory(projectId);
  }
}
