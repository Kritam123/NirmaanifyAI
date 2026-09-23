import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  CreateDiagramDto,
  UpdateDiagramDto,
  AiScaffoldDiagramRequest,
  CanvasNode,
  CanvasEdge,
} from '@nirmaanify/types';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DiagramsService } from './diagrams.service';
import { AiArchitectService } from './ai-architect.service';

@Controller('v1')
export class DiagramsController {
  constructor(
    private readonly diagramsService: DiagramsService,
    private readonly aiArchitectService: AiArchitectService,
  ) {}

  /**
   * Get built-in architecture boilerplate templates
   */
  @Get('diagrams/templates')
  getTemplates() {
    return this.diagramsService.getTemplates();
  }

  /**
   * List all diagrams for a project
   */
  @Get('projects/:projectId/diagrams')
  @UseGuards(JwtAuthGuard)
  listProjectDiagrams(
    @Param('projectId') projectId: string,
    @Req() req: any,
  ) {
    return this.diagramsService.listProjectDiagrams(projectId, req.user?.id);
  }

  /**
   * Create a new diagram in project
   */
  @Post('projects/:projectId/diagrams')
  @UseGuards(JwtAuthGuard)
  createDiagram(
    @Param('projectId') projectId: string,
    @Body() dto: CreateDiagramDto,
    @Req() req: any,
  ) {
    return this.diagramsService.createDiagram(projectId, dto, req.user?.id);
  }

  /**
   * Get diagram by ID
   */
  @Get('diagrams/:id')
  @UseGuards(JwtAuthGuard)
  getDiagram(@Param('id') id: string, @Req() req: any) {
    return this.diagramsService.getDiagram(id, req.user?.id);
  }

  /**
   * Update diagram canvas state
   */
  @Put('diagrams/:id')
  @UseGuards(JwtAuthGuard)
  updateDiagram(
    @Param('id') id: string,
    @Body() dto: UpdateDiagramDto,
    @Req() req: any,
  ) {
    return this.diagramsService.updateDiagram(id, dto, req.user?.id);
  }

  /**
   * Delete diagram
   */
  @Delete('diagrams/:id')
  @UseGuards(JwtAuthGuard)
  deleteDiagram(@Param('id') id: string, @Req() req: any) {
    return this.diagramsService.deleteDiagram(id, req.user?.id);
  }

  /**
   * Create checkpoint revision
   */
  @Post('diagrams/:id/revisions')
  @UseGuards(JwtAuthGuard)
  createRevision(@Param('id') id: string, @Req() req: any) {
    return this.diagramsService.createRevision(id, req.user?.id);
  }

  /**
   * List revisions for diagram
   */
  @Get('diagrams/:id/revisions')
  @UseGuards(JwtAuthGuard)
  listRevisions(@Param('id') id: string, @Req() req: any) {
    return this.diagramsService.listRevisions(id, req.user?.id);
  }

  /**
   * Restore diagram to past revision
   */
  @Post('diagrams/:id/revisions/:revId/restore')
  @UseGuards(JwtAuthGuard)
  restoreRevision(
    @Param('id') id: string,
    @Param('revId') revId: string,
    @Req() req: any,
  ) {
    return this.diagramsService.restoreRevision(id, revId, req.user?.id);
  }

  /**
   * AI System Architecture Scaffolder
   * Takes a natural language prompt and returns a complete diagram AST + markdown architecture spec
   */
  @Post('diagrams/ai/scaffold')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async scaffoldWithAi(@Body() request: AiScaffoldDiagramRequest) {
    return this.aiArchitectService.scaffoldArchitecture(request);
  }

  /**
   * AI Architecture Reviewer
   * Analyzes current canvas for SPOFs, scaling bottlenecks, and security gaps
   */
  @Post('diagrams/ai/review')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async reviewWithAi(
    @Body() body: { nodes: CanvasNode[]; edges: CanvasEdge[] },
  ) {
    return this.aiArchitectService.reviewArchitecture(body.nodes || [], body.edges || []);
  }
}
