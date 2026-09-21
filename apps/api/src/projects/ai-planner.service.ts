import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import {
  AIProjectPlan,
  GeneratePlanDto,
  ApprovePlanDto,
  ProjectType,
} from '@nirmaanify/types';
import { PrismaService } from '../database/prisma.service';

const PLAN_TTL_MS = 1000 * 60 * 60 * 24; // 24 hours

@Injectable()
export class AiPlannerService {
  private readonly logger = new Logger(AiPlannerService.name);

  constructor(private readonly prisma: PrismaService) {}

  async generatePlan(
    dto: GeneratePlanDto,
    userId?: string,
  ): Promise<AIProjectPlan> {
    const prompt = dto.prompt.trim();
    this.logger.log(`🤖 AI Planner synthesizing blueprint for prompt: "${prompt}"`);

    const detectedType = dto.preferredType || this.inferProjectType(prompt);

    const geminiApiKey = process.env.GEMINI_API_KEY;
    let plan: AIProjectPlan;
    if (geminiApiKey) {
      try {
        plan = await this.generateWithGemini(prompt, detectedType, geminiApiKey);
      } catch (err: any) {
        this.logger.warn(
          `Gemini generation failed or timed out: ${err.message}. Falling back to deterministic AI planner engine.`,
        );
        plan = this.generateDeterministicPlan(prompt, detectedType);
      }
    } else {
      plan = this.generateDeterministicPlan(prompt, detectedType);
    }

    try {
      const workspaceId = await this.resolveWorkspaceId(dto.workspaceId, userId);
      if (workspaceId) {
        const expiresAt = new Date(Date.now() + PLAN_TTL_MS);
        const persisted = await this.prisma.aIProjectPlan.create({
          data: {
            id: plan.id,
            workspaceId,
            prompt: plan.prompt,
            plan: plan as any,
            status: plan.status,
            createdById: userId,
            expiresAt,
          },
        });
        plan = { ...plan, id: persisted.id };
        this.logger.log(`✓ AI plan persisted (${persisted.id}) for workspace ${workspaceId}`);
      } else {
        this.logger.warn(
          'No workspaceId available — plan generated ephemerally (in-memory only for this request lifecycle).',
        );
      }
    } catch (err: any) {
      this.logger.warn(
        `Could not persist AI plan to database (${err.message}). Falling back to in-memory return.`,
      );
    }

    return plan;
  }

  async getPlan(planId: string): Promise<AIProjectPlan | null> {
    const row = await this.prisma.aIProjectPlan.findUnique({ where: { id: planId } });
    if (!row) return null;
    if (row.expiresAt && row.expiresAt.getTime() < Date.now()) {
      await this.prisma.aIProjectPlan.delete({ where: { id: planId } }).catch(() => undefined);
      return null;
    }
    return row.plan as unknown as AIProjectPlan;
  }

  async updatePlan(
    planId: string,
    updates: Partial<AIProjectPlan>,
  ): Promise<AIProjectPlan> {
    const row = await this.prisma.aIProjectPlan.findUnique({ where: { id: planId } });
    if (!row) {
      throw new NotFoundException(`AI plan ${planId} not found`);
    }
    if (row.expiresAt && row.expiresAt.getTime() < Date.now()) {
      await this.prisma.aIProjectPlan.delete({ where: { id: planId } }).catch(() => undefined);
      throw new NotFoundException(`AI plan ${planId} has expired`);
    }

    const existing = row.plan as unknown as AIProjectPlan;
    const merged: AIProjectPlan = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    } as AIProjectPlan;

    await this.prisma.aIProjectPlan.update({
      where: { id: planId },
      data: {
        plan: merged as any,
        updatedAt: new Date(),
      },
    });

    return merged;
  }

  private async resolveWorkspaceId(
    explicitId?: string,
    userId?: string,
  ): Promise<string | undefined> {
    if (explicitId) return explicitId;
    if (!userId) return undefined;
    const ws = await this.prisma.workspace.findFirst({
      where: {
        OR: [
          { ownerId: userId },
          { members: { some: { userId } } },
        ],
      },
      orderBy: { createdAt: 'asc' },
      select: { id: true },
    });
    return ws?.id;
  }

  private inferProjectType(prompt: string): ProjectType {
    const p = prompt.toLowerCase();
    if (
      p.includes('store') ||
      p.includes('shop') ||
      p.includes('clothing') ||
      p.includes('cart') ||
      p.includes('checkout') ||
      p.includes('ecommerce') ||
      p.includes('commerce')
    ) {
      return 'ECOMMERCE';
    }
    if (
      p.includes('saas') ||
      p.includes('video') ||
      p.includes('generator') ||
      p.includes('automation') ||
      p.includes('ai tool') ||
      p.includes('studio') ||
      p.includes('platform')
    ) {
      return 'SAAS';
    }
    if (
      p.includes('blog') ||
      p.includes('news') ||
      p.includes('articles') ||
      p.includes('content') ||
      p.includes('magazine') ||
      p.includes('journal') ||
      p.includes('documentation')
    ) {
      return 'BLOG';
    }
    if (
      p.includes('dashboard') ||
      p.includes('analytics') ||
      p.includes('crm') ||
      p.includes('finance') ||
      p.includes('admin') ||
      p.includes('metrics')
    ) {
      return 'DASHBOARD';
    }
    if (
      p.includes('portfolio') ||
      p.includes('resume') ||
      p.includes('showcase') ||
      p.includes('freelance') ||
      p.includes('photography') ||
      p.includes('agency') ||
      p.includes('case study')
    ) {
      return 'PORTFOLIO';
    }
    if (
      p.includes('landing') ||
      p.includes('marketing') ||
      p.includes('homepage') ||
      p.includes('company site') ||
      p.includes('lead capture')
    ) {
      return 'WEBSITE';
    }
    return 'CUSTOM';
  }

  private generateDeterministicPlan(prompt: string, type: ProjectType): AIProjectPlan {
    const id = `plan-${Date.now()}`;
    const words = prompt
      .split(/\s+/)
      .filter((w) => !['i', 'want', 'to', 'build', 'create', 'a', 'an', 'the', 'app', 'with', 'for'].includes(w.toLowerCase()));
    const titleWords = words
      .slice(0, 3)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');

    let name = titleWords ? `${titleWords}` : 'Next-Gen Project';
    if (!name.toLowerCase().includes('store') && type === 'ECOMMERCE') name += ' Boutique';
    if (!name.toLowerCase().includes('saas') && !name.toLowerCase().includes('studio') && type === 'SAAS') name += ' Studio';
    if (!name.toLowerCase().includes('hub') && type === 'DASHBOARD') name += ' Analytics Hub';
    if (!name.toLowerCase().includes('portfolio') && type === 'PORTFOLIO') name += ' Portfolio';
    if (!name.toLowerCase().includes('studio') && type === 'WEBSITE') name += ' Studio';

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const blueprint = this.getDomainBlueprint(type, prompt, name);

    return {
      id,
      prompt,
      name,
      slug,
      description: blueprint.description,
      type,
      framework: 'Next.js 15 App Router (React 19)',
      uiLibrary: 'shadcn/ui + Tailwind CSS + Radix UI',
      pages: blueprint.pages,
      features: blueprint.features,
      components: blueprint.components,
      requiredPackages: blueprint.requiredPackages,
      backendRequirements: blueprint.backendRequirements,
      databaseRequirements: blueprint.databaseRequirements,
      cmsRequirements: blueprint.cmsRequirements,
      pluginRecommendations: blueprint.pluginRecommendations,
      architecturePlan: blueprint.architecturePlan,
      status: 'DRAFT',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  private async generateWithGemini(
    prompt: string,
    type: ProjectType,
    apiKey: string,
  ): Promise<AIProjectPlan> {
    const candidateModels = ['gemini-3.8-flash', 'gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];
    const systemInstruction = `You are Nirmaanify AI Project Architect. Given a user prompt and project type, generate a comprehensive, production-ready JSON blueprint matching the AIProjectPlan schema. Return ONLY valid raw JSON with keys: name, slug, description, pages (array with name, path, description, isProtected, components), features (array with title, description, category), components (array with name, type, source, description), requiredPackages (array with name, version, scope, purpose), backendRequirements (enabled, framework, modules with endpoints, auth, queueJobs), databaseRequirements (engine, models with fields), cmsRequirements (enabled, type, collections), pluginRecommendations (array with name, category, reason, isRecommended), architecturePlan (summary, frontendStack, backendStack, databaseStack, deploymentTarget, scalabilityNotes).`;

    let lastError: Error | null = null;
    let data: any = null;

    for (const model of candidateModels) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [
                  { text: `${systemInstruction}\n\nUser Prompt: "${prompt}"\nProject Type: ${type}\n\nOutput JSON:` },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.2,
              responseMimeType: 'application/json',
            },
          }),
        });

        if (!response.ok) {
          if (response.status === 404 || response.status === 400) {
            continue;
          }
          throw new Error(`Gemini API error ${response.status}: ${response.statusText}`);
        }

        data = await response.json();
        break;
      } catch (err: any) {
        lastError = err;
      }
    }

    if (!data) {
      throw lastError || new Error('Failed to generate plan with Gemini');
    }

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      throw new Error('Empty response from Gemini');
    }

    const parsed = JSON.parse(text);
    return {
      id: `plan-${Date.now()}`,
      prompt,
      name: parsed.name || 'AI Generated Project',
      slug: (parsed.name || 'ai-app').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: parsed.description || prompt,
      type: parsed.type || type,
      framework: parsed.framework || 'Next.js 15 App Router (React 19)',
      uiLibrary: parsed.uiLibrary || 'shadcn/ui + Tailwind CSS',
      pages: parsed.pages || [],
      features: parsed.features || [],
      components: parsed.components || [],
      requiredPackages: parsed.requiredPackages || [],
      backendRequirements: parsed.backendRequirements || {
        enabled: true,
        framework: 'NestJS 11',
        modules: [],
        auth: { type: 'jwt', providers: ['Email/Password'] },
      },
      databaseRequirements: parsed.databaseRequirements || { engine: 'PostgreSQL 16', models: [] },
      cmsRequirements: parsed.cmsRequirements || { enabled: false, type: 'None', collections: [] },
      pluginRecommendations: parsed.pluginRecommendations || [],
      architecturePlan: parsed.architecturePlan || {
        summary: 'Modern fullstack decoupled microservices architecture',
        frontendStack: ['Next.js 15', 'Tailwind CSS', 'shadcn/ui'],
        backendStack: ['NestJS 11', 'Fastify', 'BullMQ'],
        databaseStack: ['PostgreSQL 16', 'Prisma ORM'],
        deploymentTarget: 'Vercel + Docker AWS',
        scalabilityNotes: 'Auto-scaling stateless API with Redis caching and distributed worker queues.',
      },
      status: 'DRAFT',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  private getDomainBlueprint(type: ProjectType, prompt: string, name: string) {
    switch (type) {
      case 'ECOMMERCE':
        return {
          description: `Full-featured e-commerce platform for ${name} with catalog management, cart, checkout, Stripe payments, and order tracking.`,
          pages: [
            { name: 'Home Storefront', path: '/', description: 'Curated hero banners, featured collections, flash sales, and bestsellers.', isProtected: false, components: ['HeroBanner', 'ProductGrid', 'CategoryCarousel', 'TestimonialsSection'] },
            { name: 'Product Catalog', path: '/products', description: 'Searchable and filterable catalog by category, price, size, and rating.', isProtected: false, components: ['SearchFilterBar', 'ProductCard', 'Pagination', 'FacetSidebar'] },
            { name: 'Product Details', path: '/products/[slug]', description: 'High-res image gallery, variant selectors, stock badge, and customer reviews.', isProtected: false, components: ['ProductGallery', 'VariantSelector', 'AddToCartButton', 'ReviewsAccordion'] },
            { name: 'Shopping Cart', path: '/cart', description: 'Itemized bag with quantity modifier, promo code input, and shipping calculation.', isProtected: false, components: ['CartItemList', 'PromoCodeInput', 'OrderSummaryCard'] },
            { name: 'Checkout', path: '/checkout', description: 'Stripe Elements secure payment, address validation, and express checkout options.', isProtected: true, components: ['AddressForm', 'PaymentMethodSelector', 'StripeCardElement', 'SecurityBadge'] },
            { name: 'Customer Account', path: '/account/orders', description: 'Order history, tracking numbers, invoice download, and saved addresses.', isProtected: true, components: ['OrderHistoryTable', 'TrackingTimeline', 'ProfileSettings'] },
          ],
          features: [
            { title: 'Dynamic Product Catalog & Variants', description: 'Multi-variant support (size, color, material) with real-time inventory checks.', category: 'core' as const },
            { title: 'Secure Stripe Checkout', description: 'Integrated Stripe Payment Intents with 3D Secure verification and Apple Pay / Google Pay.', category: 'billing' as const },
            { title: 'Real-time Stock Management', description: 'Transactional stock reservation during checkout preventing over-selling.', category: 'core' as const },
            { title: 'Customer Authentication & Profiles', description: 'Email/Password & Social OAuth login with JWT and saved shipping addresses.', category: 'auth' as const },
            { title: 'Merchant Admin Panel', description: 'Admin dashboard to manage products, categories, fulfillment status, and coupons.', category: 'admin' as const },
          ],
          components: [
            { name: 'ProductCard', type: 'ui' as const, source: 'shadcn' as const, description: 'Card displaying product thumbnail, badge, price, and quick-add button' },
            { name: 'CartDrawer', type: 'layout' as const, source: 'shadcn' as const, description: 'Slide-over cart sheet showing live subtotal and direct checkout trigger' },
            { name: 'VariantSelector', type: 'form' as const, source: 'custom' as const, description: 'Pill and swatch selectors for sizes, colors, and SKU variations' },
            { name: 'StripePaymentForm', type: 'feature' as const, source: 'custom' as const, description: 'Stripe Elements embedded iframe for PCI-compliant checkout' },
          ],
          requiredPackages: [
            { name: '@stripe/stripe-js', version: '^4.1.0', scope: 'dependencies' as const, purpose: 'Client-side Stripe Elements integration' },
            { name: 'stripe', version: '^16.12.0', scope: 'dependencies' as const, purpose: 'Server-side payment intents and webhook verification' },
            { name: 'zustand', version: '^5.0.3', scope: 'dependencies' as const, purpose: 'Persistent client-side shopping cart state' },
            { name: 'zod', version: '^3.24.2', scope: 'dependencies' as const, purpose: 'Schema validation for addresses and checkout' },
          ],
          backendRequirements: {
            enabled: true,
            framework: 'NestJS 11 (Express / Fastify)',
            modules: [
              {
                name: 'ProductsModule',
                description: 'Product catalog, categorization, search, inventory querying',
                endpoints: [
                  { method: 'GET' as const, path: '/api/v1/products', description: 'List products with filters, sorting and pagination' },
                  { method: 'GET' as const, path: '/api/v1/products/:slug', description: 'Get detailed product information and variants' },
                  { method: 'POST' as const, path: '/api/v1/products', description: 'Create product (Admin only)' },
                ],
              },
              {
                name: 'OrdersModule',
                description: 'Cart calculation, order creation, tracking and fulfillment',
                endpoints: [
                  { method: 'POST' as const, path: '/api/v1/orders', description: 'Create new pending order' },
                  { method: 'GET' as const, path: '/api/v1/orders/:id', description: 'Retrieve order details and invoice' },
                  { method: 'GET' as const, path: '/api/v1/orders/user/history', description: 'Customer order history' },
                ],
              },
              {
                name: 'PaymentsModule',
                description: 'Stripe Payment Intent generation and webhook reconciliation',
                endpoints: [
                  { method: 'POST' as const, path: '/api/v1/payments/create-intent', description: 'Generate Stripe PaymentIntent client secret' },
                  { method: 'POST' as const, path: '/api/v1/payments/webhook', description: 'Handle Stripe webhook events (checkout.session.completed)' },
                ],
              },
            ],
            auth: { type: 'jwt' as const, providers: ['Email/Password', 'Google OAuth'] },
            queueJobs: [
              { queue: 'orders', jobName: 'process-fulfillment', description: 'Dispatches confirmation email and notifies warehouse' },
              { queue: 'inventory', jobName: 'sync-stock-alerts', description: 'Checks low stock threshold and alerts admin' },
            ],
          },
          databaseRequirements: {
            engine: 'PostgreSQL 16 with Prisma ORM',
            models: [
              {
                name: 'Product',
                description: 'Primary product entity',
                fields: [
                  { name: 'id', type: 'String (UUID)', isPrimary: true },
                  { name: 'title', type: 'String' },
                  { name: 'slug', type: 'String', isUnique: true },
                  { name: 'description', type: 'String' },
                  { name: 'price', type: 'Decimal' },
                  { name: 'inventory', type: 'Int' },
                  { name: 'images', type: 'String[]' },
                  { name: 'categoryId', type: 'String', relation: 'Category' },
                ],
              },
              {
                name: 'Order',
                description: 'Customer purchase record',
                fields: [
                  { name: 'id', type: 'String (UUID)', isPrimary: true },
                  { name: 'userId', type: 'String', relation: 'User' },
                  { name: 'status', type: 'OrderStatus (PENDING, PAID, SHIPPED, DELIVERED)' },
                  { name: 'totalAmount', type: 'Decimal' },
                  { name: 'paymentIntentId', type: 'String', isUnique: true },
                  { name: 'shippingAddress', type: 'Json' },
                ],
              },
              {
                name: 'OrderItem',
                description: 'Line item in an order',
                fields: [
                  { name: 'id', type: 'String (UUID)', isPrimary: true },
                  { name: 'orderId', type: 'String', relation: 'Order' },
                  { name: 'productId', type: 'String', relation: 'Product' },
                  { name: 'quantity', type: 'Int' },
                  { name: 'unitPrice', type: 'Decimal' },
                ],
              },
            ],
          },
          cmsRequirements: {
            enabled: true,
            type: 'Dynamic Headless' as const,
            collections: [
              { name: 'Promotional Banners', fields: ['title', 'imageUrl', 'linkUrl', 'isActive'], description: 'Homepage carousel banners' },
              { name: 'Store FAQs', fields: ['question', 'answer', 'category'], description: 'Shipping & returns FAQ' },
            ],
          },
          pluginRecommendations: [
            { name: 'Stripe Payments', category: 'Payments' as const, reason: 'Essential for PCI-compliant cards, Apple Pay, and webhook handling.', isRecommended: true },
            { name: 'S3 Storage Driver (MinIO / AWS)', category: 'Storage' as const, reason: 'High-speed storage and CDN optimization for product images.', isRecommended: true },
            { name: 'BullMQ Redis Queue', category: 'Queue' as const, reason: 'Asynchronous email dispatch and inventory reconciliation.', isRecommended: true },
          ],
          architecturePlan: {
            summary: 'Next.js 15 App Router frontend with SSR product pages for optimal SEO, backed by a NestJS REST API with PostgreSQL and Redis queues.',
            frontendStack: ['Next.js 15', 'Tailwind CSS', 'shadcn/ui', 'Zustand'],
            backendStack: ['NestJS 11', 'Prisma ORM', 'Stripe SDK', 'BullMQ'],
            databaseStack: ['PostgreSQL 16', 'Redis 7'],
            deploymentTarget: 'Vercel (Frontend) + Docker Container / AWS ECS (Backend)',
            scalabilityNotes: 'Edge caching for product listings, stateless JWT auth for APIs, and BullMQ worker decoupling for order processing.',
          },
        };

      case 'SAAS':
        return {
          description: `Enterprise-grade SaaS platform for ${name} with AI inference engine, subscription tiers, team workspaces, and usage metering.`,
          pages: [
            { name: 'Landing Page', path: '/', description: 'Conversion-focused hero, interactive demo, pricing tiers, and social proof.', isProtected: false, components: ['HeroInteractive', 'FeatureBentoGrid', 'PricingCards', 'TestimonialScroll'] },
            { name: 'App Dashboard', path: '/dashboard', description: 'Main control center, recent activity, usage quotas, and quick actions.', isProtected: true, components: ['StatsOverview', 'RecentGenerationsGrid', 'QuotaProgressBar', 'ActionDrawer'] },
            { name: 'AI Studio Workspace', path: '/studio', description: 'Core creative engine with real-time prompt editor, model selection, and asset preview.', isProtected: true, components: ['PromptEditor', 'ModelSettingsPanel', 'LiveOutputCanvas', 'AssetHistory'] },
            { name: 'Team & Collaboration', path: '/team', description: 'Manage members, invite team via email, RBAC permission roles (Owner, Admin, Member).', isProtected: true, components: ['MemberTable', 'InviteModal', 'RoleSelect'] },
            { name: 'Billing & Subscriptions', path: '/billing', description: 'Stripe Customer Portal, active plan status, credit top-ups, and invoices.', isProtected: true, components: ['CurrentPlanCard', 'InvoicesList', 'UsageMeter'] },
          ],
          features: [
            { title: 'AI Generation Pipeline', description: 'Asynchronous AI inference pipeline with background job queue and streaming updates.', category: 'core' as const },
            { title: 'Subscription & Credits Metering', description: 'Tiered subscription (Free, Pro, Enterprise) with automatic monthly credit replenishment.', category: 'billing' as const },
            { title: 'Multi-Tenant Workspace RBAC', description: 'Granular permissions per workspace (Owner, Admin, Developer, Viewer).', category: 'auth' as const },
            { title: 'Asset Storage & CDN', description: 'Automated artifact export to S3 bucket with presigned URLs.', category: 'integration' as const },
          ],
          components: [
            { name: 'PromptEditor', type: 'feature' as const, source: 'custom' as const, description: 'Rich textarea with token counter, prompt enhancement, and presets' },
            { name: 'StatsOverview', type: 'ui' as const, source: 'shadcn' as const, description: 'Grid of KPI cards showing monthly usage, generation count, and credits remaining' },
            { name: 'ModelSettingsPanel', type: 'form' as const, source: 'shadcn' as const, description: 'Sliders for temperature, resolution, aspect ratio, and inference parameters' },
          ],
          requiredPackages: [
            { name: 'stripe', version: '^16.12.0', scope: 'dependencies' as const, purpose: 'Subscription lifecycle management' },
            { name: 'bullmq', version: '^5.41.6', scope: 'dependencies' as const, purpose: 'Background job queuing for AI generation' },
            { name: 'lucide-react', version: '^0.475.0', scope: 'dependencies' as const, purpose: 'UI iconography' },
            { name: 'framer-motion', version: '^12.4.7', scope: 'dependencies' as const, purpose: 'Smooth layout animations and interactive canvas' },
          ],
          backendRequirements: {
            enabled: true,
            framework: 'NestJS 11 (Express / Fastify)',
            modules: [
              {
                name: 'GenerationModule',
                description: 'AI task scheduling, status polling, result retrieval',
                endpoints: [
                  { method: 'POST' as const, path: '/api/v1/generate', description: 'Enqueue new AI generation task' },
                  { method: 'GET' as const, path: '/api/v1/generate/:id', description: 'Poll generation progress and output assets' },
                ],
              },
              {
                name: 'BillingModule',
                description: 'Stripe Checkout sessions, subscription webhooks, credit deductions',
                endpoints: [
                  { method: 'POST' as const, path: '/api/v1/billing/checkout', description: 'Create Stripe subscription checkout' },
                  { method: 'POST' as const, path: '/api/v1/billing/portal', description: 'Open Stripe Customer Portal' },
                ],
              },
            ],
            auth: { type: 'jwt' as const, providers: ['Email/Password', 'GitHub', 'Google'] },
            queueJobs: [
              { queue: 'ai-inference', jobName: 'run-generation', description: 'Executes heavy ML model inference task in worker' },
            ],
          },
          databaseRequirements: {
            engine: 'PostgreSQL 16 with Prisma ORM',
            models: [
              {
                name: 'GenerationTask',
                description: 'Record of AI generation requests and output metadata',
                fields: [
                  { name: 'id', type: 'String (UUID)', isPrimary: true },
                  { name: 'userId', type: 'String', relation: 'User' },
                  { name: 'prompt', type: 'String' },
                  { name: 'status', type: 'String (PENDING, PROCESSING, COMPLETED, FAILED)' },
                  { name: 'outputUrls', type: 'String[]' },
                  { name: 'tokensUsed', type: 'Int' },
                  { name: 'createdAt', type: 'DateTime' },
                ],
              },
              {
                name: 'Subscription',
                description: 'Stripe subscription state',
                fields: [
                  { name: 'id', type: 'String (UUID)', isPrimary: true },
                  { name: 'workspaceId', type: 'String', relation: 'Workspace' },
                  { name: 'planTier', type: 'String' },
                  { name: 'creditsRemaining', type: 'Int' },
                  { name: 'stripeSubscriptionId', type: 'String', isUnique: true },
                ],
              },
            ],
          },
          cmsRequirements: { enabled: false, type: 'None' as const, collections: [] },
          pluginRecommendations: [
            { name: 'BullMQ Worker Engine', category: 'Queue' as const, reason: 'Essential to process CPU/GPU-heavy generation tasks without blocking HTTP server.', isRecommended: true },
            { name: 'Stripe Billing & Metering', category: 'Payments' as const, reason: 'Automated recurring subscriptions and credit deductions.', isRecommended: true },
            { name: 'AWS S3 / Vercel Blob', category: 'Storage' as const, reason: 'Persistent storage for generated images, videos, and project files.', isRecommended: true },
          ],
          architecturePlan: {
            summary: 'Distributed event-driven architecture with Next.js frontend, NestJS API gateway, BullMQ background worker nodes, and PostgreSQL for relational multi-tenancy.',
            frontendStack: ['Next.js 15 App Router', 'Tailwind CSS', 'Framer Motion', 'Zustand'],
            backendStack: ['NestJS 11', 'BullMQ Worker', 'Prisma ORM', 'IORedis'],
            databaseStack: ['PostgreSQL 16', 'Redis 7'],
            deploymentTarget: 'Vercel (App) + AWS ECS Worker Cluster (Backend/Workers)',
            scalabilityNotes: 'Worker processes auto-scale based on BullMQ queue depth. API gateway remains fast and lightweight.',
          },
        };

      case 'DASHBOARD':
        return {
          description: `High-density analytics and operations dashboard for ${name} with data tables, interactive charting, export tools, and audit logs.`,
          pages: [
            { name: 'Executive Overview', path: '/dashboard', description: 'KPI cards, revenue run-rate, conversion funnel, and real-time user activity.', isProtected: true, components: ['MetricCards', 'RevenueChart', 'ActivityFeed'] },
            { name: 'Analytics & Insights', path: '/analytics', description: 'Deep-dive metrics with date range picker, dimensional breakdowns, and cohort analysis.', isProtected: true, components: ['CohortTable', 'ConversionFunnel', 'DateRangePicker'] },
            { name: 'Entity Data Management', path: '/records', description: 'Full-featured data table with multi-column sorting, facet filters, inline editing, and CSV export.', isProtected: true, components: ['DataTable', 'FilterDrawer', 'BulkActionsBar'] },
            { name: 'Audit & System Logs', path: '/logs', description: 'Security audit trail tracking all user actions, IP addresses, and configuration changes.', isProtected: true, components: ['AuditLogTable', 'JsonViewerModal'] },
            { name: 'Settings & Integrations', path: '/settings', description: 'API keys, webhook endpoints, team notification rules, and theme preferences.', isProtected: true, components: ['ApiKeyManager', 'WebhookForm', 'NotificationPreferences'] },
          ],
          features: [
            { title: 'Interactive Multi-Metric Charting', description: 'Area charts, bar charts, and donut distributions powered by Recharts.', category: 'ui' as const },
            { title: 'High-Performance Data Grids', description: 'Virtualized tables supporting 10,000+ rows with column reordering and CSV/Excel export.', category: 'core' as const },
            { title: 'Granular Audit Logging', description: 'Structured JSON logging on every mutation with actor ID and timestamp.', category: 'admin' as const },
          ],
          components: [
            { name: 'MetricCard', type: 'ui' as const, source: 'shadcn' as const, description: 'Card displaying KPI value, trend indicator (+12%), and mini sparkline' },
            { name: 'DataTable', type: 'feature' as const, source: 'shadcn' as const, description: 'TanStack Table v8 implementation with search, pagination, and multi-sort' },
            { name: 'DateRangeFilter', type: 'form' as const, source: 'shadcn' as const, description: 'Calendar popover supporting 7d, 30d, 90d, and custom date spans' },
          ],
          requiredPackages: [
            { name: 'recharts', version: '^2.15.1', scope: 'dependencies' as const, purpose: 'Responsive declarative chart visualizations' },
            { name: '@tanstack/react-table', version: '^8.21.2', scope: 'dependencies' as const, purpose: 'Headless robust data table logic' },
            { name: 'date-fns', version: '^4.1.0', scope: 'dependencies' as const, purpose: 'Date math and formatting' },
          ],
          backendRequirements: {
            enabled: true,
            framework: 'NestJS 11 (Fastify)',
            modules: [
              {
                name: 'AnalyticsModule',
                description: 'Time-series metric aggregation and report generation',
                endpoints: [
                  { method: 'GET' as const, path: '/api/v1/analytics/overview', description: 'Fetch high-level KPI trends' },
                  { method: 'GET' as const, path: '/api/v1/analytics/timeseries', description: 'Query time-series metric data with granularity' },
                ],
              },
              {
                name: 'RecordsModule',
                description: 'CRUD operations with pagination, dynamic filtering, and export',
                endpoints: [
                  { method: 'GET' as const, path: '/api/v1/records', description: 'Paginated record search' },
                  { method: 'POST' as const, path: '/api/v1/records/export', description: 'Generate CSV / Excel export' },
                ],
              },
            ],
            auth: { type: 'jwt' as const, providers: ['Email/Password', 'SAML SSO'] },
          },
          databaseRequirements: {
            engine: 'PostgreSQL 16 (TimescaleDB optional) + Prisma ORM',
            models: [
              {
                name: 'MetricRecord',
                description: 'Time-stamped metric point for analytics',
                fields: [
                  { name: 'id', type: 'String (UUID)', isPrimary: true },
                  { name: 'metricKey', type: 'String' },
                  { name: 'value', type: 'Float' },
                  { name: 'dimensions', type: 'Json' },
                  { name: 'timestamp', type: 'DateTime' },
                ],
              },
            ],
          },
          cmsRequirements: { enabled: false, type: 'None' as const, collections: [] },
          pluginRecommendations: [
            { name: 'Redis Cache Layer', category: 'Analytics' as const, reason: 'Cache heavy analytics aggregations with 60-second TTL to keep dashboard snappy.', isRecommended: true },
          ],
          architecturePlan: {
            summary: 'Client-side rendered high-interactivity dashboard connecting to cached NestJS analytical endpoints with PostgreSQL indexing.',
            frontendStack: ['Next.js 15 App Router', 'Recharts', 'TanStack Table', 'Tailwind CSS'],
            backendStack: ['NestJS 11 Fastify', 'Redis Caching', 'Prisma ORM'],
            databaseStack: ['PostgreSQL 16'],
            deploymentTarget: 'Vercel / Cloudflare Pages + Docker API',
            scalabilityNotes: 'Composite indexes on (metricKey, timestamp) for sub-50ms analytics aggregations.',
          },
        };

      case 'BLOG':
        return {
          description: `Modern developer and editorial publication platform for ${name} with MDX support, author profiles, category taxonomy, and newsletter capture.`,
          pages: [
            { name: 'Blog Home', path: '/', description: 'Featured hero article, newsletter subscription box, category pills, and latest post stream.', isProtected: false, components: ['HeroArticleCard', 'ArticleGrid', 'NewsletterForm', 'CategoryPills'] },
            { name: 'Article Reader', path: '/blog/[slug]', description: 'Full MDX article with reading progress bar, table of contents, syntax highlighting, and author bio.', isProtected: false, components: ['MdxContent', 'TableOfContents', 'ReadingProgress', 'AuthorBioCard'] },
            { name: 'Categories & Tags', path: '/category/[slug]', description: 'Filtered article archive with pagination.', isProtected: false, components: ['CategoryHeader', 'ArticleList', 'Pagination'] },
            { name: 'Author Profile', path: '/authors/[slug]', description: 'Author biography, social links, and published articles.', isProtected: false, components: ['AuthorHeader', 'ArticleGrid'] },
          ],
          features: [
            { title: 'Rich MDX & Code Syntax Highlighting', description: 'Support for interactive React components inside markdown with copyable code snippets.', category: 'ui' as const },
            { title: 'SEO & OpenGraph Dynamic Generator', description: 'Automated metadata tags, RSS feed (feed.xml), sitemap.xml, and dynamic OG image generation.', category: 'core' as const },
            { title: 'Newsletter Capture & Webhook', description: 'Integrated subscriber collection with double opt-in verification.', category: 'integration' as const },
          ],
          components: [
            { name: 'ArticleCard', type: 'ui' as const, source: 'shadcn' as const, description: 'Card displaying cover image, reading time estimate, date, and category badge' },
            { name: 'TableOfContents', type: 'layout' as const, source: 'custom' as const, description: 'Sticky side navigation highlighting current heading while scrolling' },
            { name: 'NewsletterBox', type: 'form' as const, source: 'shadcn' as const, description: 'Email capture form with success state' },
          ],
          requiredPackages: [
            { name: 'next-mdx-remote', version: '^5.0.0', scope: 'dependencies' as const, purpose: 'Render MDX content dynamically' },
            { name: 'shiki', version: '^1.29.0', scope: 'dependencies' as const, purpose: 'Beautiful syntax highlighting for code snippets' },
            { name: 'reading-time', version: '^1.5.0', scope: 'dependencies' as const, purpose: 'Calculate estimated read time' },
          ],
          backendRequirements: {
            enabled: false,
            framework: 'Next.js 15 Static Site Generation (SSG / ISR)',
            modules: [],
            auth: { type: 'jwt' as const, providers: ['None (Static)'] },
          },
          databaseRequirements: {
            engine: 'Git-based MDX Content / Headless CMS',
            models: [],
          },
          cmsRequirements: {
            enabled: true,
            type: 'Markdown / MDX' as const,
            collections: [
              { name: 'Articles', fields: ['title', 'slug', 'publishedAt', 'excerpt', 'coverImage', 'author', 'tags', 'content'], description: 'Blog articles and tutorials' },
              { name: 'Authors', fields: ['name', 'slug', 'avatar', 'bio', 'twitter', 'github'], description: 'Publication authors' },
            ],
          },
          pluginRecommendations: [
            { name: 'Tailwind Typography', category: 'UI / Design' as const, reason: 'Prose styles for clean and legible long-form reading typography.', isRecommended: true },
            { name: 'Resend Email', category: 'Email' as const, reason: 'Reliable subscriber newsletter dispatching.', isRecommended: true },
          ],
          architecturePlan: {
            summary: 'Statically generated Next.js 15 site with Incremental Static Regeneration (ISR) for lightning-fast page loads and top-tier SEO scores.',
            frontendStack: ['Next.js 15', 'MDX', 'Tailwind Typography', 'Shiki'],
            backendStack: ['None (Static / Server Actions)'],
            databaseStack: ['File-based / Headless CMS'],
            deploymentTarget: 'Vercel / Cloudflare Pages',
            scalabilityNotes: 'Edge CDN caching serves 100% of traffic without server load.',
          },
        };

      case 'WEBSITE': {
        return {
          description: `High-conversion marketing website for ${name} with hero, feature sections, testimonials, pricing, and lead capture forms.`,
          pages: [
            { name: 'Home Landing', path: '/', description: 'Hero with primary CTA, social proof logos, bento feature grid, and conversion-optimized footer.', isProtected: false, components: ['HeroWithVideo', 'LogoCloud', 'BentoFeatures', 'TestimonialMarquee', 'CtaSection'] },
            { name: 'Features Overview', path: '/features', description: 'Detailed feature breakdown with interactive tabs, screenshots, and comparison table.', isProtected: false, components: ['FeatureTabs', 'ScreenshotGallery', 'ComparisonTable'] },
            { name: 'Pricing Page', path: '/pricing', description: 'Tiered pricing cards with monthly/annual toggle and FAQ accordion.', isProtected: false, components: ['PricingToggle', 'PricingCard', 'PricingFaq'] },
            { name: 'About Company', path: '/about', description: 'Founding story, mission, leadership grid, and investor showcase.', isProtected: false, components: ['StoryTimeline', 'LeadershipGrid', 'BackersList'] },
            { name: 'Contact / Book Demo', path: '/contact', description: 'Calendly embed, validated inquiry form, and alternative contact methods.', isProtected: false, components: ['ContactForm', 'CalendlyEmbed', 'OfficeLocations'] },
          ],
          features: [
            { title: 'Conversion-Optimized Landing Templates', description: 'Pre-tuned Hero/Cta patterns proven to maximize signup conversion.', category: 'ui' as const },
            { title: 'SEO & Open Graph Engine', description: 'Auto-generated metadata, sitemap.xml, robots.txt, and dynamic OG images.', category: 'core' as const },
            { title: 'Lead Capture & CRM Webhooks', description: 'Validated forms with webhook delivery to HubSpot, Resend, or Slack.', category: 'integration' as const },
            { title: 'Edge-A/B Testing Ready', description: 'Compatible with Vercel Edge Middleware A/B flag routing.', category: 'admin' as const },
          ],
          components: [
            { name: 'HeroWithVideo', type: 'layout' as const, source: 'shadcn' as const, description: 'Full-bleed hero with background video, headline, and dual CTAs' },
            { name: 'BentoFeatures', type: 'ui' as const, source: 'shadcn' as const, description: 'Asymmetric grid showcasing 4–6 product features with icons' },
            { name: 'PricingCard', type: 'feature' as const, source: 'shadcn' as const, description: 'Highlighted pricing tier with feature checklist and CTA' },
          ],
          requiredPackages: [
            { name: 'next-themes', version: '^0.4.4', scope: 'dependencies' as const, purpose: 'Theme switcher with no-hydration flash' },
            { name: 'framer-motion', version: '^12.4.7', scope: 'dependencies' as const, purpose: 'Scroll-triggered section animations' },
            { name: 'lucide-react', version: '^0.475.0', scope: 'dependencies' as const, purpose: 'Pixel-perfect UI iconography' },
          ],
          backendRequirements: {
            enabled: false,
            framework: 'Next.js 15 Server Actions',
            modules: [],
            auth: { type: 'jwt' as const, providers: ['None'] },
          },
          databaseRequirements: {
            engine: 'Headless CMS (Sanity / Contentful) or MDX',
            models: [],
          },
          cmsRequirements: {
            enabled: true,
            type: 'Markdown / MDX' as const,
            collections: [
              { name: 'Marketing Pages', fields: ['slug', 'title', 'seoTitle', 'seoDescription', 'sections'], description: 'Page Builder JSON for marketing pages' },
              { name: 'Testimonials', fields: ['quote', 'name', 'role', 'company', 'avatarUrl'], description: 'Customer quotes with attribution' },
              { name: 'Pricing Tiers', fields: ['name', 'priceMonthly', 'priceAnnual', 'features', 'ctaLabel'], description: 'Pricing tiers synced from CMS' },
            ],
          },
          pluginRecommendations: [
            { name: 'Resend Email API', category: 'Email' as const, reason: 'Reliable transactional + lead-form email delivery.', isRecommended: true },
            { name: 'Tailwind Typography', category: 'UI / Design' as const, reason: 'Prose styles for long-form marketing copy and blog sections.', isRecommended: true },
            { name: 'Cal.com Embed', category: 'Integration' as const, reason: 'Self-hosted scheduling embed for demo bookings.', isRecommended: false },
          ],
          architecturePlan: {
            summary: 'Static-first Next.js 15 marketing site with Server Actions for form submissions and ISR for near-real-time content updates.',
            frontendStack: ['Next.js 15 App Router', 'Tailwind CSS', 'shadcn/ui', 'Framer Motion'],
            backendStack: ['Next.js Server Actions', 'Resend Webhooks'],
            databaseStack: ['Headless CMS (optional)'],
            deploymentTarget: 'Vercel / Cloudflare Pages',
            scalabilityNotes: 'Edge-rendered globally; sub-100ms TTFB on every continent.',
          },
        };
      }

      case 'PORTFOLIO': {
        return {
          description: `Personal / agency portfolio for ${name} with case study narratives, project galleries, lead capture, and an integrated blog.`,
          pages: [
            { name: 'Home Showcase', path: '/', description: 'Bold hero with name/role, signature projects mosaic, and rotating client logos.', isProtected: false, components: ['AnimatedHero', 'ProjectMosaic', 'ClientMarquee'] },
            { name: 'Work / Case Studies', path: '/work', description: 'Filterable grid of case study cards with stack tags.', isProtected: false, components: ['CaseStudyGrid', 'StackFilterPills', 'FeaturedRibbon'] },
            { name: 'Case Study Detail', path: '/work/[slug]', description: 'Long-form story with hero image, problem/solution/outcome, gallery, and metrics.', isProtected: false, components: ['CaseStudyHero', 'BeforeAfterSlider', 'MetricStrip', 'ProjectGallery'] },
            { name: 'About & Experience', path: '/about', description: 'Bio timeline, tools & skills, and downloadable resume.', isProtected: false, components: ['BioTimeline', 'SkillCloud', 'ResumeDownload'] },
            { name: 'Contact / Inquiry', path: '/contact', description: 'Project inquiry form with budget and timeline selectors plus calendar link.', isProtected: false, components: ['ProjectIntakeForm', 'CalendlyInline'] },
          ],
          features: [
            { title: 'Interactive Case Study Templates', description: 'Modular narrative blocks (problem, role, stack, outcome) with metrics strip.', category: 'ui' as const },
            { title: 'Image-Heavy Performance', description: 'Optimized next/image with blur placeholders, AVIF/WebP, and CDN delivery.', category: 'core' as const },
            { title: 'Inquiry Lead Routing', description: 'Smart form with budget detection and Slack/email notifications.', category: 'integration' as const },
            { title: 'MDX-Powered Content', description: 'Author case studies and posts in MDX with embedded React components.', category: 'ui' as const },
          ],
          components: [
            { name: 'ProjectMosaic', type: 'layout' as const, source: 'custom' as const, description: 'Asymmetric mosaic grid showcasing signature projects with hover preview' },
            { name: 'CaseStudyHero', type: 'layout' as const, source: 'shadcn' as const, description: 'Cinematic full-bleed hero with project title, year, and role chips' },
            { name: 'MetricStrip', type: 'ui' as const, source: 'shadcn' as const, description: 'Three-up stat strip highlighting project impact (KPIs)' },
            { name: 'ProjectIntakeForm', type: 'form' as const, source: 'shadcn' as const, description: 'Multi-step inquiry form with budget and timeline guards' },
          ],
          requiredPackages: [
            { name: 'next-mdx-remote', version: '^5.0.0', scope: 'dependencies' as const, purpose: 'MDX content for case studies and blog posts' },
            { name: 'framer-motion', version: '^12.4.7', scope: 'dependencies' as const, purpose: 'Scroll-triggered animations on hero and case studies' },
            { name: 'shiki', version: '^1.29.0', scope: 'dependencies' as const, purpose: 'Syntax-highlighted code samples inside case studies' },
          ],
          backendRequirements: {
            enabled: false,
            framework: 'Next.js 15 Static Site Generation (ISR)',
            modules: [],
            auth: { type: 'jwt' as const, providers: ['None'] },
          },
          databaseRequirements: {
            engine: 'File-based MDX / Headless CMS (Sanity / Contentful)',
            models: [],
          },
          cmsRequirements: {
            enabled: true,
            type: 'Markdown / MDX' as const,
            collections: [
              { name: 'Case Studies', fields: ['title', 'slug', 'year', 'role', 'stack', 'coverImage', 'metrics', 'content'], description: 'Long-form case study with embedded React components' },
              { name: 'Client Logos', fields: ['name', 'logoUrl', 'websiteUrl'], description: 'Trusted-by logo wall' },
              { name: 'Testimonials', fields: ['quote', 'name', 'role', 'company', 'avatarUrl'], description: 'Social proof from past clients' },
            ],
          },
          pluginRecommendations: [
            { name: 'Tailwind Typography', category: 'UI / Design' as const, reason: 'Elegant prose styles for long-form case study content.', isRecommended: true },
            { name: 'Resend Email', category: 'Email' as const, reason: 'Reliable inquiry-form delivery with reply-to threading.', isRecommended: true },
          ],
          architecturePlan: {
            summary: 'Static-first Next.js 15 portfolio with MDX-driven case studies, image-optimized galleries, and Server Actions for lead intake.',
            frontendStack: ['Next.js 15', 'MDX', 'Tailwind CSS', 'shadcn/ui', 'Framer Motion'],
            backendStack: ['Next.js Server Actions', 'Resend Webhooks'],
            databaseStack: ['File-based / Headless CMS'],
            deploymentTarget: 'Vercel / Netlify',
            scalabilityNotes: 'Edge-rendered globally with ISR for sub-second content updates.',
          },
        };
      }

      case 'CUSTOM': {
        return {
          description: `Bespoke modular application for ${name} — a service-oriented architecture ready for any mix of frontend, backend, and integration requirements.`,
          pages: [
            { name: 'Home / Login', path: '/', description: 'Public landing with auth entry point and product pitch.', isProtected: false, components: ['PublicLanding', 'AuthEntryForm'] },
            { name: 'Dashboard Home', path: '/app', description: 'Personal dashboard with widgets, recent activity, and quick actions.', isProtected: true, components: ['DashboardShell', 'WidgetGrid', 'ActivityStream'] },
            { name: 'Workspace / Resources', path: '/app/resources', description: 'CRUD workspace for the primary domain entities of the application.', isProtected: true, components: ['ResourceTable', 'BulkActionBar', 'ResourceDrawer'] },
            { name: 'API Reference', path: '/api-docs', description: 'Auto-generated OpenAPI explorer for the NestJS endpoints.', isProtected: false, components: ['SwaggerExplorer', 'EndpointCard'] },
            { name: 'Account Settings', path: '/app/settings', description: 'Profile, security, integrations, and notification preferences.', isProtected: true, components: ['ProfileForm', 'SecurityPanel', 'IntegrationTiles'] },
          ],
          features: [
            { title: 'Service-Modular Architecture', description: 'Hexagonal NestJS modules with clear ports/adapters and dependency injection.', category: 'core' as const },
            { title: 'Pluggable Auth & RBAC', description: 'Strategy-based authentication supporting JWT, OAuth, and WebAuthn side-by-side.', category: 'auth' as const },
            { title: 'Event Bus & Webhook System', description: 'Internal event emitter exposed as outbound webhooks for external consumers.', category: 'integration' as const },
            { title: 'Audit Trail & Compliance', description: 'Structured per-request audit log with PII redaction hooks.', category: 'admin' as const },
          ],
          components: [
            { name: 'DashboardShell', type: 'layout' as const, source: 'shadcn' as const, description: 'App-shell layout with collapsible sidebar and command palette' },
            { name: 'ResourceTable', type: 'feature' as const, source: 'shadcn' as const, description: 'TanStack Table with virtualization, filters, and inline editing' },
            { name: 'SwaggerExplorer', type: 'feature' as const, source: 'custom' as const, description: 'Embedded OpenAPI explorer bound to the NestJS Swagger module' },
          ],
          requiredPackages: [
            { name: '@tanstack/react-table', version: '^8.21.2', scope: 'dependencies' as const, purpose: 'Virtualized resource grids and inline editing' },
            { name: 'zod', version: '^3.24.2', scope: 'dependencies' as const, purpose: 'End-to-end request/response validation' },
            { name: 'bullmq', version: '^5.41.6', scope: 'dependencies' as const, purpose: 'Background event processing and webhook delivery' },
            { name: 'next-themes', version: '^0.4.4', scope: 'dependencies' as const, purpose: 'Theme switcher with no hydration flash' },
          ],
          backendRequirements: {
            enabled: true,
            framework: 'NestJS 11 (Hexagonal / Ports & Adapters)',
            modules: [
              {
                name: 'CoreModule',
                description: 'Cross-cutting concerns: config, logger, request context, audit middleware',
                endpoints: [
                  { method: 'GET' as const, path: '/api/v1/health', description: 'Liveness & readiness probe' },
                  { method: 'GET' as const, path: '/api/v1/audit-log', description: 'Paginated audit trail with filtering' },
                ],
              },
              {
                name: 'IdentityModule',
                description: 'Authentication, OAuth callbacks, session management',
                endpoints: [
                  { method: 'POST' as const, path: '/api/v1/auth/login', description: 'Issue JWT + refresh token pair' },
                  { method: 'POST' as const, path: '/api/v1/auth/logout', description: 'Invalidate refresh token' },
                  { method: 'GET' as const, path: '/api/v1/auth/me', description: 'Resolve current authenticated profile' },
                ],
              },
              {
                name: 'ResourcesModule',
                description: 'Generic CRUD scaffold for the primary domain entity',
                endpoints: [
                  { method: 'GET' as const, path: '/api/v1/resources', description: 'List resources with pagination and filtering' },
                  { method: 'POST' as const, path: '/api/v1/resources', description: 'Create resource' },
                  { method: 'PATCH' as const, path: '/api/v1/resources/:id', description: 'Partial update resource' },
                  { method: 'DELETE' as const, path: '/api/v1/resources/:id', description: 'Soft delete resource' },
                ],
              },
            ],
            auth: { type: 'jwt' as const, providers: ['Email/Password', 'OAuth Provider-agnostic'] },
            queueJobs: [
              { queue: 'webhooks', jobName: 'deliver-webhook', description: 'Deliver signed outbound webhooks with exponential retry' },
              { queue: 'audit', jobName: 'archive-logs', description: 'Periodically archive cold audit logs to object storage' },
            ],
          },
          databaseRequirements: {
            engine: 'PostgreSQL 16 with Prisma ORM',
            models: [
              {
                name: 'AuditEvent',
                description: 'Append-only audit log row',
                fields: [
                  { name: 'id', type: 'String (UUID)', isPrimary: true },
                  { name: 'actorId', type: 'String', relation: 'User' },
                  { name: 'action', type: 'String' },
                  { name: 'entity', type: 'String' },
                  { name: 'entityId', type: 'String' },
                  { name: 'metadata', type: 'Json' },
                  { name: 'createdAt', type: 'DateTime' },
                ],
              },
              {
                name: 'WebhookSubscription',
                description: 'Per-workspace webhook endpoint',
                fields: [
                  { name: 'id', type: 'String (UUID)', isPrimary: true },
                  { name: 'workspaceId', type: 'String', relation: 'Workspace' },
                  { name: 'targetUrl', type: 'String' },
                  { name: 'secretHash', type: 'String' },
                  { name: 'eventTypes', type: 'String[]' },
                  { name: 'isActive', type: 'Boolean' },
                ],
              },
            ],
          },
          cmsRequirements: { enabled: false, type: 'None' as const, collections: [] },
          pluginRecommendations: [
            { name: 'BullMQ Worker Engine', category: 'Queue' as const, reason: 'Decouple webhooks and audit pipelines from request lifecycle.', isRecommended: true },
            { name: 'S3 Storage Driver (MinIO / AWS)', category: 'Storage' as const, reason: 'Persistent object storage for uploads and archived audit logs.', isRecommended: true },
            { name: 'OpenRouter / Anthropic Provider', category: 'AI / LLM' as const, reason: 'Provider-agnostic LLM gateway for future AI features.', isRecommended: false },
          ],
          architecturePlan: {
            summary: 'Custom Next.js 15 + NestJS 11 hexagonal monolith with clear ports/adapters, ready to evolve into microservices when scale demands.',
            frontendStack: ['Next.js 15 App Router', 'Tailwind CSS', 'shadcn/ui', 'TanStack Table'],
            backendStack: ['NestJS 11 (Hexagonal)', 'Prisma ORM', 'BullMQ Worker'],
            databaseStack: ['PostgreSQL 16', 'Redis 7'],
            deploymentTarget: 'Vercel (App) + Docker / AWS ECS (API + Worker)',
            scalabilityNotes: 'Stateless API horizontally scales; workers auto-scale on BullMQ queue depth.',
          },
        };
      }

      default:
        return {
          description: `Custom web application for ${name} built with modular Next.js components.`,
          pages: [
            { name: 'Home Landing', path: '/', description: 'Brand showcase, hero message, core offerings, and call to action.', isProtected: false, components: ['HeroSection', 'FeaturesGrid', 'CtaBanner', 'Footer'] },
            { name: 'About & Story', path: '/about', description: 'Company mission and team profiles.', isProtected: false, components: ['TeamGrid'] },
            { name: 'Contact & Inquiry', path: '/contact', description: 'Interactive contact form with email notification.', isProtected: false, components: ['ContactForm'] },
          ],
          features: [
            { title: 'Responsive Design System', description: 'Mobile, tablet, and desktop polish out-of-the-box.', category: 'ui' as const },
            { title: 'Contact Lead Intake', description: 'Validated form with email and Slack delivery.', category: 'core' as const },
          ],
          components: [
            { name: 'HeroSection', type: 'layout' as const, source: 'shadcn' as const, description: 'Hero with headline, badges, and primary action button' },
            { name: 'ContactForm', type: 'form' as const, source: 'shadcn' as const, description: 'Validated form with name, email, and message fields' },
          ],
          requiredPackages: [
            { name: 'lucide-react', version: '^0.475.0', scope: 'dependencies' as const, purpose: 'Iconography' },
          ],
          backendRequirements: {
            enabled: false,
            framework: 'Next.js 15 Server Actions',
            modules: [],
            auth: { type: 'jwt' as const, providers: ['None'] },
          },
          databaseRequirements: { engine: 'PostgreSQL (optional)', models: [] },
          cmsRequirements: { enabled: true, type: 'Static' as const, collections: [] },
          pluginRecommendations: [],
          architecturePlan: {
            summary: 'Static-first Next.js 15 site with Server Actions for contact forms.',
            frontendStack: ['Next.js 15', 'Tailwind CSS', 'shadcn/ui'],
            backendStack: ['Next.js Server Actions'],
            databaseStack: ['PostgreSQL (optional)'],
            deploymentTarget: 'Vercel',
            scalabilityNotes: 'Edge-rendered globally.',
          },
        };
    }
  }
}
