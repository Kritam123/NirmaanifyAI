import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import {
  FullstackExportBundle,
  BuildLogEntry,
  DeploymentRecord,
  DeploymentTarget,
} from '@nirmaanify/types';
import { FullstackProjectExporter } from '@nirmaanify/component-registry';

@Injectable()
export class DeploymentEngineService {
  private deploymentRecords = new Map<string, DeploymentRecord[]>();

  constructor(private readonly prisma: PrismaService) {}

  async getExportBundle(projectId: string): Promise<FullstackExportBundle> {
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new NotFoundException('Project not found.');

    return FullstackProjectExporter.exportProjectBundle(project as any);
  }

  async triggerBuildValidation(projectId: string): Promise<{ logs: BuildLogEntry[]; status: 'SUCCESS' }> {
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new NotFoundException('Project not found.');

    const logs = FullstackProjectExporter.generateBuildLogs(project as any);
    return { logs, status: 'SUCCESS' };
  }

  async triggerDeployment(
    projectId: string,
    target: DeploymentTarget,
    customDomain?: string
  ): Promise<DeploymentRecord> {
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new NotFoundException('Project not found.');

    const deployId = `dep-${Date.now().toString(36)}`;
    const url =
      target === 'vercel'
        ? `https://${project.slug}.nirmaanify.app`
        : target === 'railway'
        ? `https://${project.slug}-production.up.railway.app`
        : target === 'render'
        ? `https://${project.slug}.onrender.com`
        : `http://localhost:3000`;

    const record: DeploymentRecord = {
      id: deployId,
      projectId,
      target,
      status: 'LIVE',
      url,
      customDomain: customDomain || `${project.slug}.nirmaanify.app`,
      commitHash: Math.random().toString(36).substring(2, 9),
      durationSeconds: Math.floor(Math.random() * 12 + 18),
      createdAt: new Date().toISOString(),
    };

    const history = this.deploymentRecords.get(projectId) || [];
    history.unshift(record);
    this.deploymentRecords.set(projectId, history);

    return record;
  }

  async getDeploymentHistory(projectId: string): Promise<DeploymentRecord[]> {
    return this.deploymentRecords.get(projectId) || [];
  }
}
