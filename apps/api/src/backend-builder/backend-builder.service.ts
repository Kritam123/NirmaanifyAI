import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import {
  ProjectBackendSchema,
  getDefaultBackendSchema,
  GeneratedFile,
} from '@nirmaanify/types';
import { NestjsCodeGenerator } from '@nirmaanify/component-registry';

@Injectable()
export class BackendBuilderService {
  constructor(private readonly prisma: PrismaService) {}

  async getBackendConfiguration(projectId: string): Promise<ProjectBackendSchema> {
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new NotFoundException('Project not found.');

    const schema = (project.projectSchema as any) || {};
    if (schema.backendConfiguration && schema.backendConfiguration.modules) {
      return schema.backendConfiguration as ProjectBackendSchema;
    }

    return getDefaultBackendSchema(project.name);
  }

  async updateBackendConfiguration(
    projectId: string,
    backendConfig: ProjectBackendSchema
  ): Promise<ProjectBackendSchema> {
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new NotFoundException('Project not found.');

    const currentSchema = (project.projectSchema as any) || {};
    const updatedSchema = {
      ...currentSchema,
      backendConfiguration: backendConfig,
    };

    await this.prisma.project.update({
      where: { id: projectId },
      data: {
        isBackendEnabled: backendConfig.enabled,
        projectSchema: updatedSchema,
      },
    });

    return backendConfig;
  }

  async generateSourceFiles(projectId: string): Promise<{ files: GeneratedFile[]; totalFiles: number }> {
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new NotFoundException('Project not found.');

    const config = await this.getBackendConfiguration(projectId);
    const files = NestjsCodeGenerator.generateFullBackend(config, project.name);

    return {
      files,
      totalFiles: files.length,
    };
  }

  async testEndpoint(
    projectId: string,
    payload: { method: string; path: string; body?: any; headers?: any }
  ): Promise<{ status: number; data: any; durationMs: number }> {
    const startTime = Date.now();

    // Mock API engine responses
    let responseData: any = {
      message: `Simulated 200 OK from NestJS Router (${payload.method} ${payload.path})`,
      timestamp: new Date().toISOString(),
      runtime: 'NestJS 11 + Express Engine',
      environment: 'Development Sandbox',
    };

    if (payload.path.includes('auth/login')) {
      responseData = {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.simulated_jwt_token',
        tokenType: 'Bearer',
        expiresIn: '7d',
        user: { id: 'usr-1', email: payload.body?.email || 'admin@nirmaanify.dev', role: 'ADMIN' },
      };
    } else if (payload.path.includes('products')) {
      responseData = {
        items: [
          { id: 'prod-1', name: 'Merino Wool Oversized Blazer', price: 189.0, inStock: true },
          { id: 'prod-2', name: 'Structured Mulberry Silk Shirt', price: 145.0, inStock: true },
        ],
        total: 2,
      };
    }

    const durationMs = Date.now() - startTime + Math.floor(Math.random() * 15 + 5);

    return {
      status: 200,
      data: responseData,
      durationMs,
    };
  }
}
