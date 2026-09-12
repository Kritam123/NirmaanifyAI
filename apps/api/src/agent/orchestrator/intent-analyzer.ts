import {
  SpecializedAgentType,
  OrchestrationTask,
  AgentMemoryContext,
} from '@nirmaanify/types';

export class IntentAnalyzer {
  /**
   * Decomposes user request into a prioritized Directed Acyclic Graph (DAG) of specialized subtasks
   */
  public static analyzeAndDecompose(
    prompt: string,
    memory: AgentMemoryContext
  ): OrchestrationTask[] {
    const p = prompt.toLowerCase();
    const tasks: OrchestrationTask[] = [];

    // Step 1: Always starts with Project Planner for high-level architecture
    const plannerTaskId = 'task-planner-1';
    tasks.push({
      id: plannerTaskId,
      agent: 'PROJECT_PLANNER',
      title: 'Analyze Architecture & User Stories',
      description: `Formulate the technical strategy and layout structure for: "${prompt.slice(0, 80)}..."`,
      dependencies: [],
      status: 'QUEUED',
    });

    let prevDependencies = [plannerTaskId];

    // Check for Database / Entity needs (models, relations, prisma)
    const hasDatabaseIntent =
      p.includes('database') ||
      p.includes('schema') ||
      p.includes('table') ||
      p.includes('model') ||
      p.includes('crud') ||
      p.includes('entity') ||
      p.includes('prisma') ||
      p.includes('postgres') ||
      p.includes('store') ||
      p.includes('ecommerce') ||
      p.includes('product');

    if (hasDatabaseIntent) {
      const dbTaskId = 'task-db-1';
      tasks.push({
        id: dbTaskId,
        agent: 'DATABASE_AGENT',
        title: 'Define PostgreSQL Prisma Schema',
        description: 'Design data models, relations, indices, and database migration entities.',
        dependencies: prevDependencies,
        status: 'QUEUED',
        requiresApproval: p.includes('drop') || p.includes('delete table') || p.includes('migrate'),
      });
      prevDependencies = [dbTaskId];
    }

    // Check for Backend API needs (NestJS, REST endpoints, controllers)
    const hasBackendIntent =
      hasDatabaseIntent ||
      p.includes('backend') ||
      p.includes('api') ||
      p.includes('nestjs') ||
      p.includes('controller') ||
      p.includes('service') ||
      p.includes('endpoint');

    if (hasBackendIntent) {
      const backendTaskId = 'task-backend-1';
      tasks.push({
        id: backendTaskId,
        agent: 'BACKEND_AGENT',
        title: 'Generate NestJS REST API Module',
        description: 'Create NestJS controllers, services, DTO validation, and Swagger docs.',
        dependencies: prevDependencies,
        status: 'QUEUED',
      });
      prevDependencies = [backendTaskId];
    }

    // Check for CMS needs (blogs, articles, content items, collections)
    const hasCmsIntent =
      p.includes('cms') ||
      p.includes('blog') ||
      p.includes('article') ||
      p.includes('content') ||
      p.includes('post') ||
      p.includes('collection');

    if (hasCmsIntent) {
      const cmsTaskId = 'task-cms-1';
      tasks.push({
        id: cmsTaskId,
        agent: 'CMS_AGENT',
        title: 'Configure Headless CMS Collection',
        description: 'Set up dynamic collection fields, rich-text schemas, and sample content records.',
        dependencies: prevDependencies,
        status: 'QUEUED',
      });
      prevDependencies = [cmsTaskId];
    }

    // Check for Plugins needs (Stripe payments, Clerk/Supabase auth, PostHog analytics, SEO)
    const hasPluginIntent =
      p.includes('stripe') ||
      p.includes('payment') ||
      p.includes('checkout') ||
      p.includes('auth') ||
      p.includes('clerk') ||
      p.includes('supabase') ||
      p.includes('analytics') ||
      p.includes('posthog') ||
      p.includes('seo');

    if (hasPluginIntent) {
      const pluginTaskId = 'task-plugin-1';
      tasks.push({
        id: pluginTaskId,
        agent: 'PLUGIN_AGENT',
        title: 'Configure Third-Party Plugins & Integrations',
        description: 'Integrate verified plugins with secure configuration and permission scopes.',
        dependencies: prevDependencies,
        status: 'QUEUED',
        requiresApproval: true,
      });
      prevDependencies = [pluginTaskId];
    }

    // Check for Package needs (Framer Motion, GSAP, Recharts, TanStack Table)
    const hasPackageIntent =
      p.includes('chart') ||
      p.includes('table') ||
      p.includes('animate') ||
      p.includes('motion') ||
      p.includes('gsap') ||
      p.includes('formik') ||
      p.includes('package') ||
      p.includes('library');

    if (hasPackageIntent) {
      const pkgTaskId = 'task-pkg-1';
      tasks.push({
        id: pkgTaskId,
        agent: 'PACKAGE_AGENT',
        title: 'Resolve & Validate NPM Packages',
        description: 'Verify React 19 / Next.js 15 compatibility, peer dependencies, and root providers.',
        dependencies: prevDependencies,
        status: 'QUEUED',
      });
      prevDependencies = [pkgTaskId];
    }

    // Final Step: UI Agent synthesizes interactive visual presentation
    const uiTaskId = 'task-ui-1';
    tasks.push({
      id: uiTaskId,
      agent: 'UI_AGENT',
      title: 'Synthesize Interactive Next.js 15 UI',
      description: `Build responsive React 19 client components with ${memory.designContext.uiFramework} and animations.`,
      dependencies: prevDependencies,
      status: 'QUEUED',
    });

    return tasks;
  }
}
