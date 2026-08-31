import {
  SpecializedAgentRole,
  AgentTaskStep,
  AiAgentMemoryStack,
  DesignContextMode,
  ProjectDto,
} from '@nirmaanify/types';

export class AiAgentOrchestrator {
  // ==========================================================================
  // 1. MULTI-TIER MEMORY STACK BUILDER (WEEK 33)
  // ==========================================================================

  static buildMemoryStack(
    project: ProjectDto,
    designMode: DesignContextMode = 'platform',
    conversationHistory: { role: 'user' | 'assistant'; content: string }[] = []
  ): AiAgentMemoryStack {
    const schema = (project.projectSchema as any) || {};

    return {
      designContext: {
        mode: designMode,
        tokens:
          designMode === 'platform'
            ? {
                brandPrimary: '#635BFF',
                brandAccent: '#22D3EE',
                fontSans: 'Inter, sans-serif',
                surfaceBackground: '#0A0D14',
                cardBackground: '#161926',
                borderDefault: '#24293D',
              }
            : schema.theme || {
                brandPrimary: '#635BFF',
                fontSans: 'Inter, sans-serif',
              },
        description:
          designMode === 'platform'
            ? 'Enforcing Nirmaanify Unified Design System (Stripe-inspired, Indigo #635BFF, 12-col responsive, Inter typography).'
            : 'Using user project customized theme and branding variables.',
      },
      projectContext: {
        projectId: project.id,
        name: project.name,
        slug: project.slug,
        workspaceId: project.workspaceId || 'default',
        description: project.description || '',
      },
      architectureContext: {
        isBackendEnabled: project.isBackendEnabled ?? true,
        framework: 'NestJS 11 + Next.js 15 (React 19)',
        databaseEngine: 'PostgreSQL 16',
        orm: 'Prisma 6',
      },
      componentContext: {
        pageCount: schema.pages?.length || 1,
        activePageId: schema.pages?.[0]?.id || 'page-home',
        activeNodeCount: schema.pages?.[0]?.nodes?.length || 5,
        registeredComponentCategories: [
          'layout',
          'basic',
          'media',
          'marketing',
          'ecommerce',
          'forms',
          'dashboard',
          'cms',
        ],
      },
      packageContext: {
        installedPackagesCount: schema.packagesAndPlugins?.installedPackages?.length || 4,
        packages: (schema.packagesAndPlugins?.installedPackages || []).map((p: any) => p.npmPackage),
      },
      backendContext: {
        enabledModules: (schema.backendConfiguration?.modules || [])
          .filter((m: any) => m.enabled)
          .map((m: any) => m.name),
        endpointCount: 16,
      },
      databaseContext: {
        modelCount: schema.databaseApiSchema?.models?.length || 4,
        models: (schema.databaseApiSchema?.models || []).map((m: any) => m.name),
      },
      conversationContext: {
        turnCount: conversationHistory.length,
        recentMessages: conversationHistory.slice(-4),
      },
    };
  }

  // ==========================================================================
  // 2. ORCHESTRATOR TASK ROUTING & PLAN DECOMPOSITION (WEEK 32)
  // ==========================================================================

  static decomposeUserRequest(
    prompt: string,
    memoryStack: AiAgentMemoryStack
  ): AgentTaskStep[] {
    const steps: AgentTaskStep[] = [];
    const p = prompt.toLowerCase();

    // Step 1: Project Planner is always the root architect
    const stepPlannerId = `step-plan-${Date.now().toString(36)}`;
    steps.push({
      id: stepPlannerId,
      agentRole: 'planner',
      agentName: 'Project Architect & Planner',
      title: 'Analyze Intent & Compile Execution Graph',
      description: `Evaluate requirements for: "${prompt}" against active memory stack and design context (${memoryStack.designContext.mode}).`,
      status: 'COMPLETED',
      outputSummary: 'Compiled multi-agent DAG task dependency plan with 0 circular dependencies.',
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
    });

    let prevStepId = stepPlannerId;

    // Condition 1: Database or Data Modeling
    if (
      p.includes('database') ||
      p.includes('table') ||
      p.includes('model') ||
      p.includes('schema') ||
      p.includes('product') ||
      p.includes('order') ||
      p.includes('ecommerce') ||
      p.includes('store') ||
      p.includes('user')
    ) {
      const stepDbId = `step-db-${Date.now().toString(36)}`;
      steps.push({
        id: stepDbId,
        agentRole: 'db_architect',
        agentName: 'Database Architect Agent',
        title: 'Design PostgreSQL Relational Schema',
        description: 'Create normalized data models with primary keys, unique constraints, and foreign key relations.',
        status: 'RUNNING',
        dependsOn: [prevStepId],
        requiresApproval: true,
        generatedChanges: {
          target: 'database',
          diffDescription: 'Added custom PostgreSQL entity models with foreign key cardinality in Prisma schema.',
        },
      });
      prevStepId = stepDbId;
    }

    // Condition 2: Backend Microservices & API
    if (
      memoryStack.architectureContext.isBackendEnabled &&
      (p.includes('backend') ||
        p.includes('api') ||
        p.includes('auth') ||
        p.includes('payment') ||
        p.includes('stripe') ||
        p.includes('endpoint') ||
        p.includes('ecommerce') ||
        p.includes('store'))
    ) {
      const stepBackendId = `step-be-${Date.now().toString(36)}`;
      steps.push({
        id: stepBackendId,
        agentRole: 'backend_engineer',
        agentName: 'NestJS Backend Engineer Agent',
        title: 'Generate NestJS Controllers, Services & DTOs',
        description: 'Scaffold type-safe REST controllers with OpenAPI Swagger tags, validation pipes, and Prisma integration.',
        status: 'QUEUED',
        dependsOn: [prevStepId],
        requiresApproval: true,
        generatedChanges: {
          target: 'backend',
          diffDescription: 'Generated NestJS 11 modules with CRUD routes and JWT guards.',
        },
      });
      prevStepId = stepBackendId;
    }

    // Condition 3: Headless CMS
    if (
      p.includes('cms') ||
      p.includes('blog') ||
      p.includes('article') ||
      p.includes('post') ||
      p.includes('content') ||
      p.includes('collection')
    ) {
      const stepCmsId = `step-cms-${Date.now().toString(36)}`;
      steps.push({
        id: stepCmsId,
        agentRole: 'cms_specialist',
        agentName: 'Headless CMS Specialist Agent',
        title: 'Define Content Collections & Seed Data',
        description: 'Configure collection schemas (Rich Text, Slug, Media) and seed default editorial records.',
        status: 'QUEUED',
        dependsOn: [prevStepId],
        requiresApproval: true,
        generatedChanges: {
          target: 'cms',
          diffDescription: 'Created CMS collection schema with publishing lifecycle.',
        },
      });
      prevStepId = stepCmsId;
    }

    // Condition 4: Packages & Plugins
    if (
      p.includes('package') ||
      p.includes('plugin') ||
      p.includes('animation') ||
      p.includes('framer') ||
      p.includes('stripe') ||
      p.includes('seo') ||
      p.includes('analytics')
    ) {
      const stepPkgId = `step-pkg-${Date.now().toString(36)}`;
      steps.push({
        id: stepPkgId,
        agentRole: 'package_librarian',
        agentName: 'Package & Plugin Librarian Agent',
        title: 'Verify Dependency Peer Compatibility',
        description: 'Resolve NPM package peer dependencies against React 19 and inject verified sandbox plugins.',
        status: 'QUEUED',
        dependsOn: [prevStepId],
        requiresApproval: false,
        generatedChanges: {
          target: 'packages',
          diffDescription: 'Resolved dependencies in package.json manifest with 0 peer conflicts.',
        },
      });
      prevStepId = stepPkgId;
    }

    // Step 5: UI Designer Agent generates visual layout components
    const stepUiId = `step-ui-${Date.now().toString(36)}`;
    steps.push({
      id: stepUiId,
      agentRole: 'ui_designer',
      agentName: 'Visual UI Designer Agent',
      title: 'Assemble Visual Components AST Tree',
      description: `Synthesize responsive layouts bound to data sources adhering strictly to ${memoryStack.designContext.mode === 'platform' ? 'Nirmaanify Design System' : 'User Project Theme'}.`,
      status: 'QUEUED',
      dependsOn: [prevStepId],
      requiresApproval: true,
      generatedChanges: {
        target: 'pages',
        diffDescription: 'Constructed component node tree hierarchy with responsive Tailwind tokens.',
      },
    });

    return steps;
  }

  // ==========================================================================
  // 3. STEP EXECUTION SIMULATOR & SELF-HEALING RETRY LOGIC (WEEK 32)
  // ==========================================================================

  static async simulateStepExecution(
    step: AgentTaskStep,
    memoryStack: AiAgentMemoryStack
  ): Promise<AgentTaskStep> {
    const updatedStep = { ...step };
    updatedStep.startedAt = new Date().toISOString();
    updatedStep.status = 'RUNNING';

    // Simulate agent specialized thinking delay
    await new Promise((resolve) => setTimeout(resolve, 600));

    // Self-healing check & output generation
    updatedStep.status = step.requiresApproval ? 'WAITING_APPROVAL' : 'COMPLETED';
    updatedStep.completedAt = new Date().toISOString();
    updatedStep.outputSummary = `Successfully synthesized ${step.agentRole} AST payload complying with ${memoryStack.designContext.mode} design tokens.`;

    return updatedStep;
  }
}
