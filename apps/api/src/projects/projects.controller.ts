import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiParam } from '@nestjs/swagger';
import { ProjectsService } from './projects.service';
import {
  ProjectDto,
  ProjectType,
  GeneratePlanDto,
  ApprovePlanDto,
  AIProjectPlan,
} from '@nirmaanify/types';

@ApiTags('Projects & AI Planner')
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  @ApiOperation({ summary: 'List projects with filtering by workspace, status, search, and type' })
  @ApiQuery({ name: 'workspaceId', required: false })
  @ApiQuery({ name: 'isArchived', required: false, type: Boolean })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'type', required: false, enum: ['WEBSITE', 'BLOG', 'ECOMMERCE', 'PORTFOLIO', 'DASHBOARD', 'SAAS', 'CUSTOM'] })
  async listProjects(
    @Query('workspaceId') workspaceId?: string,
    @Query('isArchived') isArchived?: string,
    @Query('search') search?: string,
    @Query('type') type?: ProjectType,
  ) {
    const archivedBool = isArchived !== undefined ? isArchived === 'true' : undefined;
    return this.projectsService.listProjects(workspaceId, archivedBool, search, type);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get project details by ID' })
  @ApiParam({ name: 'id' })
  async getProject(@Param('id') id: string) {
    return this.projectsService.getProject(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create new project manually' })
  async createProject(@Body() data: Partial<ProjectDto>) {
    return this.projectsService.createProject(data);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Edit and update project configuration' })
  @ApiParam({ name: 'id' })
  async updateProject(@Param('id') id: string, @Body() data: Partial<ProjectDto>) {
    return this.projectsService.updateProject(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete project' })
  @ApiParam({ name: 'id' })
  async deleteProject(@Param('id') id: string) {
    return this.projectsService.deleteProject(id);
  }

  @Post(':id/duplicate')
  @ApiOperation({ summary: 'Duplicate an existing project' })
  @ApiParam({ name: 'id' })
  async duplicateProject(@Param('id') id: string) {
    return this.projectsService.duplicateProject(id);
  }

  @Patch(':id/archive')
  @ApiOperation({ summary: 'Archive project' })
  @ApiParam({ name: 'id' })
  async archiveProject(@Param('id') id: string) {
    return this.projectsService.archiveProject(id);
  }

  @Patch(':id/unarchive')
  @ApiOperation({ summary: 'Unarchive project' })
  @ApiParam({ name: 'id' })
  async unarchiveProject(@Param('id') id: string) {
    return this.projectsService.unarchiveProject(id);
  }

  // --- AI Planner Endpoints ---

  @Post('ai/plan')
  @ApiOperation({ summary: 'Generate structured AI Project Plan from prompt' })
  async generatePlan(@Body() dto: GeneratePlanDto) {
    return this.projectsService.generateAiPlan(dto);
  }

  @Patch('ai/plan/:planId')
  @ApiOperation({ summary: 'Modify and refine AI Project Plan before approval' })
  @ApiParam({ name: 'planId' })
  async modifyPlan(
    @Param('planId') planId: string,
    @Body() updates: Partial<AIProjectPlan>,
  ) {
    return this.projectsService.modifyAiPlan(planId, updates);
  }

  @Post('ai/approve')
  @ApiOperation({ summary: 'Approve AI Plan and generate project scaffolding' })
  async approvePlan(@Body() dto: ApprovePlanDto) {
    return this.projectsService.approveAiPlan(dto);
  }
}
