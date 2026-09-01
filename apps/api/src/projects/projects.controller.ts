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
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiParam } from '@nestjs/swagger';
import { ProjectsService } from './projects.service';
import {
  ProjectDto,
  ProjectType,
  GeneratePlanDto,
  ApprovePlanDto,
  AIProjectPlan,
} from '@nirmaanify/types';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Projects & AI Planner')
@ApiBearerAuth()
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'List projects for authenticated user in workspace' })
  @ApiQuery({ name: 'workspaceId', required: false })
  @ApiQuery({ name: 'isArchived', required: false, type: Boolean })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'type', required: false, enum: ['WEBSITE', 'BLOG', 'ECOMMERCE', 'PORTFOLIO', 'DASHBOARD', 'SAAS', 'CUSTOM'] })
  async listProjects(
    @CurrentUser('id') userId: string,
    @Query('workspaceId') workspaceId?: string,
    @Query('isArchived') isArchived?: string,
    @Query('search') search?: string,
    @Query('type') type?: ProjectType,
  ) {
    const archivedBool = isArchived !== undefined ? isArchived === 'true' : undefined;
    return this.projectsService.listProjects(workspaceId, userId, archivedBool, search, type);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get project details with tenant access verification' })
  @ApiParam({ name: 'id' })
  async getProject(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.projectsService.getProject(id, userId);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create new project in authorized workspace' })
  async createProject(
    @Body() data: Partial<ProjectDto>,
    @CurrentUser('id') userId: string,
  ) {
    return this.projectsService.createProject(data, userId);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Edit and update project configuration' })
  @ApiParam({ name: 'id' })
  async updateProject(
    @Param('id') id: string,
    @Body() data: Partial<ProjectDto>,
    @CurrentUser('id') userId: string,
  ) {
    return this.projectsService.updateProject(id, data, userId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete project' })
  @ApiParam({ name: 'id' })
  async deleteProject(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.projectsService.deleteProject(id, userId);
  }

  @Post(':id/duplicate')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Duplicate an existing project' })
  @ApiParam({ name: 'id' })
  async duplicateProject(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.projectsService.duplicateProject(id, userId);
  }

  @Patch(':id/archive')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Archive project' })
  @ApiParam({ name: 'id' })
  async archiveProject(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.projectsService.archiveProject(id, userId);
  }

  @Patch(':id/unarchive')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Unarchive project' })
  @ApiParam({ name: 'id' })
  async unarchiveProject(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.projectsService.unarchiveProject(id, userId);
  }

  // --- AI Planner Endpoints ---

  @Post('ai/plan')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Generate structured AI Project Plan from prompt' })
  async generatePlan(@Body() dto: GeneratePlanDto) {
    return this.projectsService.generateAiPlan(dto);
  }

  @Patch('ai/plan/:planId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Modify and refine AI Project Plan before approval' })
  @ApiParam({ name: 'planId' })
  async modifyPlan(
    @Param('planId') planId: string,
    @Body() updates: Partial<AIProjectPlan>,
  ) {
    return this.projectsService.modifyAiPlan(planId, updates);
  }

  @Post('ai/approve')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Approve AI Plan and generate project scaffolding' })
  async approvePlan(
    @Body() dto: ApprovePlanDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.projectsService.approveAiPlan(dto, userId);
  }
}
