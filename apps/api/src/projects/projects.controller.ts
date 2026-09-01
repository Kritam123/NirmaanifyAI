import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ProjectsService } from './projects.service';
import { ProjectDto } from '@nirmaanify/types';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Projects')
@ApiBearerAuth()
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'List projects for authenticated user in workspace' })
  async listProjects(
    @CurrentUser('id') userId: string,
    @Query('workspaceId') workspaceId?: string
  ) {
    return this.projectsService.listProjects(workspaceId, userId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get project details with tenant access verification' })
  async getProject(
    @Param('id') id: string,
    @CurrentUser('id') userId: string
  ) {
    return this.projectsService.getProjectById(id, userId);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create new project in authorized workspace' })
  async createProject(
    @Body() data: Partial<ProjectDto>,
    @CurrentUser('id') userId: string
  ) {
    return this.projectsService.createProject(data, userId);
  }
}
