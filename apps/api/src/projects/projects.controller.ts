import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ProjectsService } from './projects.service';
import { ProjectDto } from '@nirmaanify/types';

@ApiTags('Projects')
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  @ApiOperation({ summary: 'List projects in active workspace' })
  async listProjects(@Query('workspaceId') workspaceId?: string) {
    return this.projectsService.listProjects(workspaceId);
  }

  @Post()
  @ApiOperation({ summary: 'Create new project' })
  async createProject(@Body() data: Partial<ProjectDto>) {
    return this.projectsService.createProject(data);
  }
}
