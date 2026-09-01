import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ProjectsService } from './projects.service';
import { ProjectDto } from '@nirmaanify/types';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Projects')
@ApiBearerAuth()
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'List projects in active workspace' })
  async listProjects(@Query('workspaceId') workspaceId?: string) {
    return this.projectsService.listProjects(workspaceId);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('OWNER', 'ADMIN', 'DEVELOPER')
  @ApiOperation({ summary: 'Create new project (Owner/Admin/Developer only)' })
  async createProject(@Body() data: Partial<ProjectDto>) {
    return this.projectsService.createProject(data);
  }
}
