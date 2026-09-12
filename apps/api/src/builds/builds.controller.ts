import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { BuildRunnerService } from './build-runner.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ProjectBuildDto, TriggerBuildDto } from '@nirmaanify/types';

@ApiTags('Builds & Diagnostics')
@Controller('projects/:id/builds')
export class BuildsController {
  constructor(private readonly buildRunner: BuildRunnerService) {}

  @Post('trigger')
  @ApiOperation({ summary: 'Trigger automated build validation and diagnostic pipeline' })
  @ApiResponse({ status: 201, description: 'Build started or completed' })
  async triggerBuild(
    @Param('id') projectId: string,
    @Body() dto: TriggerBuildDto,
    @Request() req: any,
  ): Promise<ProjectBuildDto> {
    return this.buildRunner.triggerBuild(projectId, dto, req.user?.id);
  }

  @Get()
  @ApiOperation({ summary: 'List recent builds and diagnostics for project' })
  async listBuilds(@Param('id') projectId: string): Promise<{ builds: ProjectBuildDto[] }> {
    const builds = await this.buildRunner.listBuilds(projectId);
    return { builds };
  }

  @Get(':buildId')
  @ApiOperation({ summary: 'Get details and logs for a specific build' })
  async getBuild(
    @Param('id') projectId: string,
    @Param('buildId') buildId: string,
  ): Promise<{ build: ProjectBuildDto }> {
    const build = await this.buildRunner.getBuild(projectId, buildId);
    return { build };
  }
}
