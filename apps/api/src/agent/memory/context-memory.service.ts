import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { DesignContextService } from './design-context.service';
import { AgentMemoryContext } from '@nirmaanify/types';

@Injectable()
export class ContextMemoryService {
  private readonly logger = new Logger(ContextMemoryService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly designContextService: DesignContextService
  ) {}

  public async buildMemoryContext(
    projectId: string,
    existingFiles: Record<string, string> = {}
  ): Promise<AgentMemoryContext> {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        sandbox: true,
        packages: true,
        cmsCollections: { include: { fields: true } },
      },
    });

    if (!project) {
      throw new Error(`Project ${projectId} not found`);
    }

    // 1. Project Context
    const projectInfo = {
      id: project.id,
      name: project.name,
      slug: project.slug,
      type: project.type,
      serverType: project.isBackendEnabled ? 'nestjs' : 'static',
      framework: project.framework,
    };

    // 2. Architecture Context
    const fileKeys = Object.keys(existingFiles);
    const routes = fileKeys
      .filter((f) => f.startsWith('app/') && f.endsWith('page.tsx'))
      .map((f) => {
        if (f === 'app/page.tsx') return '/';
        return '/' + f.replace(/^app\//, '').replace(/\/page\.tsx$/, '');
      });

    const architecture = {
      routes: routes.length > 0 ? routes : ['/'],
      filesCount: fileKeys.length,
      sandboxUrl: project.sandbox?.hostUrl,
      apiSandboxUrl: project.sandbox?.apiHostUrl || undefined,
    };

    // 3. Package Context
    const packages = (project.packages || []).map((p) => ({
      name: p.name,
      version: p.version,
      category: p.category,
    }));

    // 4. Backend & Database Context
    const entities = (project.cmsCollections || []).map((c) => c.name);
    const backend = {
      hasNestJs: project.isBackendEnabled,
      hasCms: (project.cmsCollections || []).length > 0,
      entities,
    };

    // 5. Dual Design Context (User Project Mode)
    const designContext = this.designContextService.getProjectDesignContext(
      { uiLibrary: project.uiLibrary },
      packages
    );

    return {
      project: projectInfo,
      architecture,
      packages,
      backend,
      designContext,
    };
  }

  public formatMemoryPromptInjection(memory: AgentMemoryContext): string {
    return `
================================================================================
NIRMAANIFY MULTI-AGENT 6-LAYER CONTEXT MEMORY SNAPSHOT
================================================================================
1. PROJECT CONTEXT:
   - Name: ${memory.project.name} (${memory.project.type})
   - Framework: ${memory.project.framework}
   - Server Architecture: ${memory.project.serverType}

2. ARCHITECTURE & ROUTES CONTEXT:
   - Active Routes: ${memory.architecture.routes.join(', ')}
   - Sandbox Live Preview URL: ${memory.architecture.sandboxUrl || 'Configuring'}

3. DESIGN CONTEXT & TOKENS:
   - Target Environment: ${memory.designContext.mode.toUpperCase()}
   - UI Library: ${memory.designContext.uiFramework}
   - Animation Engine: ${memory.designContext.animationEngine}
   - Form Engine: ${memory.designContext.formEngine}
   - Primary Brand Color: ${memory.designContext.brandTokens.primaryColor}

4. PACKAGE CONTEXT (CONFIGURED DEPENDENCIES):
   - ${
     memory.packages.length > 0
       ? memory.packages.map((p) => `${p.name}@${p.version} (${p.category})`).join(', ')
       : 'Standard Next.js 15 & Tailwind defaults'
   }

5. BACKEND & DATABASE CONTEXT:
   - NestJS API Enabled: ${memory.backend.hasNestJs ? 'YES' : 'NO'}
   - Headless CMS Collections: ${
     memory.backend.entities.length > 0 ? memory.backend.entities.join(', ') : 'None'
   }
================================================================================
`;
  }
}
