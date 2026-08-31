import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import {
  DatabaseApiSchema,
  DataModel,
  getDefaultDatabaseApiSchema,
} from '@nirmaanify/types';
import { DatabaseCompiler } from '@nirmaanify/component-registry';

@Injectable()
export class DatabaseBuilderService {
  constructor(private readonly prisma: PrismaService) {}

  async getSchema(projectId: string): Promise<DatabaseApiSchema> {
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new NotFoundException('Project not found.');

    const schema = (project.projectSchema as any) || {};
    if (schema.databaseApiSchema && schema.databaseApiSchema.models) {
      return schema.databaseApiSchema as DatabaseApiSchema;
    }

    return getDefaultDatabaseApiSchema();
  }

  async updateSchema(
    projectId: string,
    dbSchema: DatabaseApiSchema
  ): Promise<DatabaseApiSchema> {
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new NotFoundException('Project not found.');

    const currentSchema = (project.projectSchema as any) || {};
    const updatedSchema = {
      ...currentSchema,
      databaseApiSchema: dbSchema,
    };

    await this.prisma.project.update({
      where: { id: projectId },
      data: { projectSchema: updatedSchema },
    });

    return dbSchema;
  }

  async createModel(projectId: string, model: DataModel): Promise<DatabaseApiSchema> {
    const schema = await this.getSchema(projectId);
    const existingIdx = schema.models.findIndex((m) => m.id === model.id || m.name === model.name);
    if (existingIdx !== -1) {
      schema.models[existingIdx] = model;
    } else {
      schema.models.push(model);
    }

    // Auto-generate routes for this model
    const newRoutes = DatabaseCompiler.generateDefaultApiRoutes([model]);
    schema.apiRoutes = [
      ...schema.apiRoutes.filter((r) => r.modelId !== model.id && r.modelName !== model.name),
      ...newRoutes,
    ];

    return this.updateSchema(projectId, schema);
  }

  async updateModel(projectId: string, modelId: string, model: DataModel): Promise<DatabaseApiSchema> {
    const schema = await this.getSchema(projectId);
    const idx = schema.models.findIndex((m) => m.id === modelId);
    if (idx === -1) throw new NotFoundException('Model not found in schema.');

    schema.models[idx] = model;
    return this.updateSchema(projectId, schema);
  }

  async deleteModel(projectId: string, modelId: string): Promise<DatabaseApiSchema> {
    const schema = await this.getSchema(projectId);
    schema.models = schema.models.filter((m) => m.id !== modelId);
    schema.apiRoutes = schema.apiRoutes.filter((r) => r.modelId !== modelId);
    return this.updateSchema(projectId, schema);
  }

  async getErDiagram(projectId: string): Promise<{ mermaid: string }> {
    const schema = await this.getSchema(projectId);
    const mermaid = DatabaseCompiler.compileErDiagramMermaid(schema.models);
    return { mermaid };
  }

  async getCompiledPrisma(projectId: string): Promise<{ prismaSchema: string }> {
    const schema = await this.getSchema(projectId);
    const prismaSchema = DatabaseCompiler.compilePrismaSchema(schema.models);
    return { prismaSchema };
  }

  async executeQuery(
    projectId: string,
    payload: { modelName: string; method: string; path: string; query?: any; body?: any }
  ): Promise<{ status: number; data: any; durationMs: number }> {
    const start = Date.now();

    // Mock query runner simulating PostgreSQL response
    const mockRecord = {
      id: `rec-${Date.now().toString(36)}`,
      model: payload.modelName,
      ...payload.body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const durationMs = Date.now() - start + Math.floor(Math.random() * 10 + 4);

    return {
      status: 200,
      data: {
        success: true,
        operation: payload.method,
        model: payload.modelName,
        result: payload.method === 'GET' ? [mockRecord] : mockRecord,
      },
      durationMs,
    };
  }
}
