import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import {
  TestCaseResult,
  SecurityAuditItem,
  MvpChecklistModule,
} from '@nirmaanify/types';
import { TestingSecurityEngine } from '@nirmaanify/component-registry';

@Injectable()
export class TestingAuditService {
  constructor(private readonly prisma: PrismaService) {}

  async runTestSuite(projectId?: string): Promise<TestCaseResult[]> {
    let project = null;
    if (projectId) {
      project = await this.prisma.project.findUnique({ where: { id: projectId } });
    }
    if (!project) {
      project = (await this.prisma.project.findFirst()) || {
        id: 'mock-proj',
        name: 'Nirmaanify Production App',
        slug: 'nirmaanify-prod-app',
        isBackendEnabled: true,
      };
    }

    return TestingSecurityEngine.runFullSystemTestSuite(project as any);
  }

  getSecurityAudit(): SecurityAuditItem[] {
    return TestingSecurityEngine.runSecurityAudit();
  }

  getMvpReleaseChecklist(): MvpChecklistModule[] {
    return TestingSecurityEngine.getMvpReleaseChecklist();
  }
}
