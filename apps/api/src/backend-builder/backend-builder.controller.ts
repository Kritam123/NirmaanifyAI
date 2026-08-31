import {
  Controller,
  Get,
  Put,
  Post,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { BackendBuilderService } from './backend-builder.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ProjectBackendSchema } from '@nirmaanify/types';

@Controller('projects/:projectId/backend')
@UseGuards(JwtAuthGuard)
export class BackendBuilderController {
  constructor(private readonly backendService: BackendBuilderService) {}

  @Get('config')
  async getConfig(@Param('projectId') projectId: string) {
    return this.backendService.getBackendConfiguration(projectId);
  }

  @Put('config')
  async updateConfig(
    @Param('projectId') projectId: string,
    @Body() dto: ProjectBackendSchema
  ) {
    return this.backendService.updateBackendConfiguration(projectId, dto);
  }

  @Post('generate')
  async generateSourceCode(@Param('projectId') projectId: string) {
    return this.backendService.generateSourceFiles(projectId);
  }

  @Post('test-endpoint')
  async testEndpoint(
    @Param('projectId') projectId: string,
    @Body() payload: { method: string; path: string; body?: any; headers?: any }
  ) {
    return this.backendService.testEndpoint(projectId, payload);
  }
}
