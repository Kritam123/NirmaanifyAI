import {
  Controller,
  Get,
  Put,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { DatabaseBuilderService } from './database-builder.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DatabaseApiSchema, DataModel } from '@nirmaanify/types';

@Controller('projects/:projectId/database')
@UseGuards(JwtAuthGuard)
export class DatabaseBuilderController {
  constructor(private readonly dbService: DatabaseBuilderService) {}

  @Get('schema')
  async getSchema(@Param('projectId') projectId: string) {
    return this.dbService.getSchema(projectId);
  }

  @Put('schema')
  async updateSchema(
    @Param('projectId') projectId: string,
    @Body() dto: DatabaseApiSchema
  ) {
    return this.dbService.updateSchema(projectId, dto);
  }

  @Post('models')
  async createModel(
    @Param('projectId') projectId: string,
    @Body() model: DataModel
  ) {
    return this.dbService.createModel(projectId, model);
  }

  @Put('models/:id')
  async updateModel(
    @Param('projectId') projectId: string,
    @Param('id') modelId: string,
    @Body() model: DataModel
  ) {
    return this.dbService.updateModel(projectId, modelId, model);
  }

  @Delete('models/:id')
  async deleteModel(
    @Param('projectId') projectId: string,
    @Param('id') modelId: string
  ) {
    return this.dbService.deleteModel(projectId, modelId);
  }

  @Get('er-diagram')
  async getErDiagram(@Param('projectId') projectId: string) {
    return this.dbService.getErDiagram(projectId);
  }

  @Get('prisma-schema')
  async getCompiledPrisma(@Param('projectId') projectId: string) {
    return this.dbService.getCompiledPrisma(projectId);
  }

  @Post('query')
  async executeQuery(
    @Param('projectId') projectId: string,
    @Body() payload: { modelName: string; method: string; path: string; query?: any; body?: any }
  ) {
    return this.dbService.executeQuery(projectId, payload);
  }
}
