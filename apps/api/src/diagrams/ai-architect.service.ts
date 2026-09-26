import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  AiScaffoldDiagramRequest,
  AiScaffoldDiagramResponse,
  AiArchitectureReviewResponse,
  CanvasNode,
  CanvasEdge,
  DiagramType,
  CloudProvider,
} from '@nirmaanify/types';

@Injectable()
export class AiArchitectService {
  private readonly logger = new Logger(AiArchitectService.name);
  private readonly geminiApiKey: string | undefined;

  constructor(private readonly configService: ConfigService) {
    this.geminiApiKey =
      this.configService.get<string>('GEMINI_API_KEY') ||
      process.env.GEMINI_API_KEY;
  }

  /**
   * Scaffold a complete system architecture or UML diagram from a natural language prompt
   */
  async scaffoldArchitecture(
    request: AiScaffoldDiagramRequest,
  ): Promise<AiScaffoldDiagramResponse> {
    const prompt = request.prompt.trim();
    const diagramType = request.diagramType || this.inferDiagramType(prompt);
    const provider = request.cloudProvider || this.inferProvider(prompt);

    this.logger.log(
      `AI Architecture Scaffolder invoked: "${prompt.slice(0, 80)}" (Type: ${diagramType}, Provider: ${provider})`,
    );

    // If Gemini API Key is available, attempt LLM call; otherwise use rule-based intelligent synthesizer
    if (this.geminiApiKey) {
      try {
        const llmResult = await this.callGeminiArchitectureEngine(prompt, diagramType, provider);
        if (llmResult && llmResult.nodes.length > 0) {
          return llmResult;
        }
      } catch (err: any) {
        this.logger.warn(`Gemini LLM call failed, falling back to heuristic engine: ${err.message}`);
      }
    }

    return this.synthesizeHeuristicArchitecture(prompt, diagramType, provider);
  }

  /**
   * Analyze an existing diagram for bottlenecks, single points of failure, and security risks
   */
  async reviewArchitecture(
    nodes: CanvasNode[],
    edges: CanvasEdge[],
  ): Promise<AiArchitectureReviewResponse> {
    const nodeLabels = nodes.map((n) => n.data.label.toLowerCase());
    const hasCache = nodeLabels.some((l) => l.includes('redis') || l.includes('memcached') || l.includes('cache'));
    const hasQueue = nodeLabels.some((l) => l.includes('kafka') || l.includes('rabbit') || l.includes('sqs') || l.includes('queue'));
    const hasGateway = nodeLabels.some((l) => l.includes('gateway') || l.includes('proxy') || l.includes('ingress'));
    const hasAuth = nodeLabels.some((l) => l.includes('auth') || l.includes('cognito') || l.includes('jwt') || l.includes('iam'));

    const strengths: string[] = [];
    const spofs: string[] = [];
    const bottlenecks: string[] = [];
    const security: string[] = [];

    if (hasGateway) strengths.push('Ingress layer with centralized reverse proxy / gateway is in place.');
    if (hasCache) strengths.push('In-memory caching is implemented to relieve primary database load.');
    if (hasQueue) strengths.push('Asynchronous message queue provides reliable event decoupling.');

    if (!hasGateway) spofs.push('Direct client exposure without an API Gateway or rate-limiting reverse proxy.');
    if (!hasCache) bottlenecks.push('No caching layer detected. Heavy reads will directly impact primary database IOPS.');
    if (!hasQueue && nodes.length > 4) bottlenecks.push('Synchronous HTTP chains between microservices risk cascade timeouts.');
    if (!hasAuth) security.push('Missing explicit Authentication / Authorization verification boundary.');

    const score = Math.max(40, 100 - (spofs.length * 15 + bottlenecks.length * 10 + security.length * 10));

    return {
      score,
      overview: `Architecture review conducted on ${nodes.length} nodes and ${edges.length} connections. Overall architecture resilience score is ${score}/100.`,
      strengths,
      singlePointsOfFailure: spofs.length ? spofs : ['No immediate single point of failure found in top-tier components.'],
      scalingBottlenecks: bottlenecks.length ? bottlenecks : ['Components demonstrate adequate decoupling for current scale.'],
      securityRecommendations: security.length ? security : ['Ensure all ingress ports enforce TLS 1.3 and zero-trust mTLS internally.'],
      suggestedNodes: [
        ...(!hasCache ? [{ action: 'add' as const, description: 'Add a Redis cache before database tier' }] : []),
        ...(!hasQueue ? [{ action: 'add' as const, description: 'Add Kafka or SQS for asynchronous event handling' }] : []),
      ],
    };
  }

  private inferDiagramType(prompt: string): DiagramType {
    const p = prompt.toLowerCase();
    if (p.includes('uml') || p.includes('class diagram') || p.includes('clean architecture') || p.includes('domain model')) {
      return 'UML_CLASS';
    }
    if (p.includes('sequence') || p.includes('flow of') || p.includes('auth flow') || p.includes('interaction') || p.includes('oauth') || p.includes('pkce')) {
      return 'UML_SEQUENCE';
    }
    if (p.includes('erd') || p.includes('database schema') || p.includes('tables') || p.includes('sql') || p.includes('relational')) {
      return 'DATABASE_ERD';
    }
    if (p.includes('aws') || p.includes('gcp') || p.includes('azure') || p.includes('cloud') || p.includes('serverless')) {
      return 'CLOUD_INFRASTRUCTURE';
    }
    return 'SYSTEM_ARCHITECTURE';
  }

  private inferProvider(prompt: string): CloudProvider {
    const p = prompt.toLowerCase();
    if (p.includes('aws') || p.includes('s3') || p.includes('lambda') || p.includes('dynamo')) return 'aws';
    if (p.includes('gcp') || p.includes('google cloud') || p.includes('bigquery') || p.includes('gke')) return 'gcp';
    if (p.includes('azure') || p.includes('cosmos')) return 'azure';
    if (p.includes('k8s') || p.includes('kubernetes')) return 'k8s';
    if (p.includes('docker') || p.includes('container')) return 'docker';
    return 'generic';
  }

  private async callGeminiArchitectureEngine(
    prompt: string,
    diagramType: DiagramType,
    provider: string,
  ): Promise<AiScaffoldDiagramResponse | null> {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.geminiApiKey}`;

    const systemPrompt = `You are a Principal Software Architect. Given the user's system request, generate a production-ready system architecture blueprint in JSON.
The response MUST be valid JSON conforming to this schema:
{
  "name": "Concise Architecture Title",
  "description": "Short explanation",
  "diagramType": "${diagramType}",
  "layoutTiers": ["Client", "Gateway", "Services", "Data"],
  "document": "Comprehensive markdown architecture document including overview, component duties, latency SLAs, bottlenecks, and security rules",
  "summary": "1 sentence executive summary",
  "nodes": [
    {
      "id": "node-1",
      "type": "cloud-service",
      "position": {"x": 100, "y": 200},
      "data": {
        "label": "API Gateway",
        "subtitle": "Envoy Proxy",
        "icon": "api-gateway",
        "category": "networking",
        "provider": "${provider}",
        "status": "active"
      }
    }
  ],
  "edges": [
    {
      "id": "edge-1",
      "source": "node-1",
      "target": "node-2",
      "type": "smoothstep",
      "data": {"label": "HTTPS", "animated": true}
    }
  ]
}
Ensure node X positions progress left-to-right (100, 350, 600, 850, 1100) or top-to-bottom so there is NO overlap!`;

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: `${systemPrompt}\n\nUSER REQUEST: ${prompt}` }],
          },
        ],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      }),
    });

    if (!res.ok) {
      throw new Error(`Gemini API returned status ${res.status}: ${await res.text()}`);
    }

    const data = await res.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) return null;

    const parsed = JSON.parse(rawText);
    return {
      name: parsed.name || 'System Architecture',
      description: parsed.description || prompt,
      diagramType: parsed.diagramType || diagramType,
      nodes: parsed.nodes || [],
      edges: parsed.edges || [],
      document: parsed.document || `# Architecture Specification\n\n${prompt}`,
      summary: parsed.summary || 'Architecture blueprint scaffolded successfully.',
      layoutTiers: parsed.layoutTiers || ['Ingress', 'Application', 'Persistence'],
    };
  }

  /**
   * High-accuracy heuristic synthesis generating balanced diagrams with zero node collisions
   */
  private synthesizeHeuristicArchitecture(
    prompt: string,
    diagramType: DiagramType,
    provider: CloudProvider,
  ): AiScaffoldDiagramResponse {
    const p = prompt.toLowerCase();

    // 1. UML Class Diagram flow
    if (diagramType === 'UML_CLASS') {
      return {
        name: 'Domain Model & Clean Architecture',
        description: `UML Class Diagram generated from: "${prompt}"`,
        diagramType: 'UML_CLASS',
        layoutTiers: ['Controllers', 'Use Cases', 'Domain Entities', 'Repositories'],
        summary: 'Generated clean architecture UML class model with encapsulation and dependency inversion.',
        document: `# Domain Model Architecture Specification

## Overview
Domain-Driven Design (DDD) model generated for: **${prompt}**.

## Layers
1. **Domain Entities**: Core business logic invariants, encapsulated state, and domain events.
2. **Use Cases / Interactors**: Orchestrate flow of data to and from entities.
3. **Repository Interfaces**: Abstract persistence mechanism via Dependency Inversion Principle.
4. **Infrastructure Implementations**: Concrete ORM adapters (Prisma / TypeORM).
`,
        nodes: [
          {
            id: 'n-controller',
            type: 'uml-class',
            position: { x: 50, y: 180 },
            data: {
              label: 'ResourceController',
              stereotype: '<<controller>>',
              umlAttributes: [{ name: 'useCase', type: 'IResourceUseCase', visibility: '-' }],
              umlMethods: [{ name: 'handleRequest', returnType: 'Promise<Response>', visibility: '+', params: 'req: Request' }],
            },
          },
          {
            id: 'n-usecase',
            type: 'uml-class',
            position: { x: 380, y: 180 },
            data: {
              label: 'ProcessTransactionUseCase',
              stereotype: '<<use case>>',
              umlAttributes: [
                { name: 'entityRepo', type: 'IRepository', visibility: '-' },
                { name: 'notifier', type: 'INotificationService', visibility: '-' },
              ],
              umlMethods: [{ name: 'execute', returnType: 'Promise<Result>', visibility: '+', params: 'dto: CommandDto' }],
            },
          },
          {
            id: 'n-entity',
            type: 'uml-class',
            position: { x: 720, y: 80 },
            data: {
              label: 'CoreAggregateRoot',
              stereotype: '<<entity>>',
              umlAttributes: [
                { name: 'id', type: 'UUID', visibility: '+' },
                { name: 'status', type: 'StateEnum', visibility: '+' },
                { name: 'createdAt', type: 'Date', visibility: '+' },
              ],
              umlMethods: [
                { name: 'transitionState', returnType: 'void', visibility: '+', params: 'next: StateEnum' },
                { name: 'validate', returnType: 'boolean', visibility: '+' },
              ],
            },
          },
          {
            id: 'n-repo-interface',
            type: 'uml-class',
            position: { x: 720, y: 320 },
            data: {
              label: 'IRepository',
              stereotype: '<<interface>>',
              umlMethods: [
                { name: 'findById', returnType: 'Promise<CoreEntity>', visibility: '+', params: 'id: UUID' },
                { name: 'save', returnType: 'Promise<void>', visibility: '+', params: 'entity: CoreEntity' },
              ],
            },
          },
          {
            id: 'n-repo-impl',
            type: 'uml-class',
            position: { x: 1040, y: 320 },
            data: {
              label: 'PostgresRepositoryImpl',
              stereotype: '<<adapter>>',
              umlAttributes: [{ name: 'prisma', type: 'PrismaClient', visibility: '-' }],
              umlMethods: [
                { name: 'findById', returnType: 'Promise<CoreEntity>', visibility: '+' },
                { name: 'save', returnType: 'Promise<void>', visibility: '+' },
              ],
            },
          },
        ],
        edges: [
          { id: 'e-1', source: 'n-controller', target: 'n-usecase', type: 'smoothstep', data: { label: 'invokes' } },
          { id: 'e-2', source: 'n-usecase', target: 'n-entity', type: 'smoothstep', data: { label: 'mutates' } },
          { id: 'e-3', source: 'n-usecase', target: 'n-repo-interface', type: 'smoothstep', data: { label: 'depends on' } },
          { id: 'e-4', source: 'n-repo-impl', target: 'n-repo-interface', type: 'smoothstep', data: { label: 'implements' } },
        ],
      };
    }

    // 2. Database ERD flow
    if (diagramType === 'DATABASE_ERD') {
      return {
        name: 'Relational Database Schema (ERD)',
        description: `Entity-Relationship Diagram generated for: "${prompt}"`,
        diagramType: 'DATABASE_ERD',
        layoutTiers: ['Identity', 'Domain Models', 'Transactions'],
        summary: 'Normalized relational schema with primary keys, foreign key constraints, and index models.',
        document: `# Database Architecture Specification

## Entity Modeling
- **users**: Master tenant identity table.
- **workspaces**: Multi-tenant isolation boundary.
- **transactions / orders**: High-volume immutable ledger table.
- **audit_logs**: Append-only compliance log.
`,
        nodes: [
          {
            id: 'erd-users',
            type: 'database-table',
            position: { x: 80, y: 160 },
            data: {
              label: 'users',
              columns: [
                { name: 'id', type: 'UUID', isPrimary: true },
                { name: 'email', type: 'VARCHAR(255)', nullable: false },
                { name: 'role', type: 'VARCHAR(50)' },
                { name: 'created_at', type: 'TIMESTAMP' },
              ],
            },
          },
          {
            id: 'erd-workspaces',
            type: 'database-table',
            position: { x: 420, y: 160 },
            data: {
              label: 'workspaces',
              columns: [
                { name: 'id', type: 'UUID', isPrimary: true },
                { name: 'owner_id', type: 'UUID', isForeign: true },
                { name: 'name', type: 'VARCHAR(120)' },
                { name: 'plan', type: 'VARCHAR(50)' },
              ],
            },
          },
          {
            id: 'erd-records',
            type: 'database-table',
            position: { x: 760, y: 160 },
            data: {
              label: 'records',
              columns: [
                { name: 'id', type: 'UUID', isPrimary: true },
                { name: 'workspace_id', type: 'UUID', isForeign: true },
                { name: 'title', type: 'VARCHAR(255)' },
                { name: 'payload', type: 'JSONB' },
                { name: 'updated_at', type: 'TIMESTAMP' },
              ],
            },
          },
        ],
        edges: [
          { id: 'ee-1', source: 'erd-workspaces', target: 'erd-users', type: 'smoothstep', data: { label: 'owner_id' } },
          { id: 'ee-2', source: 'erd-records', target: 'erd-workspaces', type: 'smoothstep', data: { label: 'workspace_id' } },
        ],
      };
    }

    // 3. UML Sequence Diagram flow (OAuth2 / Authentication / Service Interactions)
    if (diagramType === 'UML_SEQUENCE' || p.includes('sequence') || p.includes('oauth') || p.includes('pkce')) {
      const isOAuth = p.includes('oauth') || p.includes('auth') || p.includes('token') || p.includes('pkce') || p.includes('login');
      if (isOAuth) {
        return {
          name: 'OAuth 2.0 Authorization Flow with PKCE',
          description: `OAuth 2.0 sequence diagram generated for: "${prompt}"`,
          diagramType: 'UML_SEQUENCE',
          layoutTiers: ['Resource Owner', 'Client SPA', 'Authorization Server', 'Resource API'],
          summary: 'Cryptographically secured OAuth 2.0 Authorization Code flow with Proof Key for Code Exchange (PKCE).',
          document: `# OAuth 2.0 + PKCE Authorization Code Flow Specification

## Protocol Overview
Designed for Single Page Applications (SPAs) and public mobile clients where client secrets cannot be securely stored.

### Sequence Steps:
1. **Initiate Authentication**: The User triggers login. The SPA generates a cryptographic \`code_verifier\` and derives the SHA-256 \`code_challenge\`.
2. **Authorization Request**: Client redirects User to \`/authorize?response_type=code&code_challenge=...&code_challenge_method=S256\`.
3. **Authentication & Consent**: Authorization Server prompts User for credentials and scope consents.
4. **Authorization Code Callback**: Auth Server redirects back to SPA redirect URI with a short-lived authorization code.
5. **Token Exchange**: SPA issues POST to \`/oauth/token\` transmitting the authorization code and original \`code_verifier\`.
6. **PKCE Verification & Token Issuance**: Auth Server computes SHA-256 on verifier, matches original challenge, and returns Access & ID Tokens (JWT).
7. **Resource Access**: Client accesses Resource Server supplying \`Authorization: Bearer <token>\`.
8. **Protected Response**: Resource API validates signature against Auth Server JWKS and serves protected resource.
`,
          nodes: [
            {
              id: 'seq-user',
              type: 'uml-sequence',
              position: { x: 60, y: 140 },
              data: {
                label: 'User / Browser',
                stereotype: '<<actor>>',
                category: 'compute',
              },
            },
            {
              id: 'seq-client',
              type: 'uml-sequence',
              position: { x: 340, y: 140 },
              data: {
                label: 'SPA Client (Next.js)',
                stereotype: '<<participant>>',
                category: 'compute',
              },
            },
            {
              id: 'seq-auth-server',
              type: 'uml-sequence',
              position: { x: 640, y: 140 },
              data: {
                label: 'Auth Server (IdP)',
                stereotype: '<<participant>>',
                category: 'security',
              },
            },
            {
              id: 'seq-resource-api',
              type: 'uml-sequence',
              position: { x: 940, y: 140 },
              data: {
                label: 'Resource API',
                stereotype: '<<participant>>',
                category: 'compute',
              },
            },
          ],
          edges: [
            { id: 'seq-e1', source: 'seq-user', target: 'seq-client', type: 'smoothstep', data: { label: '1. Click Login (PKCE Challenge)', animated: true } },
            { id: 'seq-e2', source: 'seq-client', target: 'seq-auth-server', type: 'smoothstep', data: { label: '2. /authorize?code_challenge=...', animated: true } },
            { id: 'seq-e3', source: 'seq-auth-server', target: 'seq-user', type: 'smoothstep', data: { label: '3. Prompt Credentials & Consent' } },
            { id: 'seq-e4', source: 'seq-user', target: 'seq-auth-server', type: 'smoothstep', data: { label: '4. Submit Credentials' } },
            { id: 'seq-e5', source: 'seq-auth-server', target: 'seq-client', type: 'smoothstep', data: { label: '5. Redirect with ?code=xyz', animated: true } },
            { id: 'seq-e6', source: 'seq-client', target: 'seq-auth-server', type: 'smoothstep', data: { label: '6. POST /token (code + code_verifier)', animated: true } },
            { id: 'seq-e7', source: 'seq-auth-server', target: 'seq-client', type: 'smoothstep', data: { label: '7. Return JWT Access & ID Token' } },
            { id: 'seq-e8', source: 'seq-client', target: 'seq-resource-api', type: 'smoothstep', data: { label: '8. Request with Bearer Token', animated: true } },
            { id: 'seq-e9', source: 'seq-resource-api', target: 'seq-client', type: 'smoothstep', data: { label: '9. Return Protected Data' } },
          ],
        };
      }

      // Generic sequence interaction flow
      return {
        name: 'Sequence Interaction Flow',
        description: `Sequence diagram generated for: "${prompt}"`,
        diagramType: 'UML_SEQUENCE',
        layoutTiers: ['Caller', 'API Gateway', 'Core Service', 'Database'],
        summary: 'Synchronous and asynchronous message exchange sequence with lifeline activations.',
        document: `# Sequence Flow Specification\n\n${prompt}\n\n## Participants\n- **Client / Actor**: Initiator of execution cycle.\n- **Gateway / Controller**: Validation and routing layer.\n- **Domain Service**: Business logic execution.\n- **Data Store**: Persistence layer.\n`,
        nodes: [
          {
            id: 'seq-caller',
            type: 'uml-sequence',
            position: { x: 80, y: 140 },
            data: { label: 'Client / Actor', stereotype: '<<actor>>', category: 'compute' },
          },
          {
            id: 'seq-gateway',
            type: 'uml-sequence',
            position: { x: 380, y: 140 },
            data: { label: 'API Gateway', stereotype: '<<participant>>', category: 'networking' },
          },
          {
            id: 'seq-service',
            type: 'uml-sequence',
            position: { x: 680, y: 140 },
            data: { label: 'Domain Service', stereotype: '<<participant>>', category: 'compute' },
          },
          {
            id: 'seq-db',
            type: 'uml-sequence',
            position: { x: 980, y: 140 },
            data: { label: 'Database', stereotype: '<<participant>>', category: 'database' },
          },
        ],
        edges: [
          { id: 'gseq-1', source: 'seq-caller', target: 'seq-gateway', type: 'smoothstep', data: { label: '1. HTTP Request', animated: true } },
          { id: 'gseq-2', source: 'seq-gateway', target: 'seq-service', type: 'smoothstep', data: { label: '2. Route Dispatched', animated: true } },
          { id: 'gseq-3', source: 'seq-service', target: 'seq-db', type: 'smoothstep', data: { label: '3. Query Record' } },
          { id: 'gseq-4', source: 'seq-db', target: 'seq-service', type: 'smoothstep', data: { label: '4. Row Dataset' } },
          { id: 'gseq-5', source: 'seq-service', target: 'seq-gateway', type: 'smoothstep', data: { label: '5. Response Entity' } },
          { id: 'gseq-6', source: 'seq-gateway', target: 'seq-caller', type: 'smoothstep', data: { label: '6. 200 OK Payload' } },
        ],
      };
    }

    // 4. Default System Architecture flow (Cloud / Microservices)
    const hasKafka = p.includes('kafka') || p.includes('stream') || p.includes('queue') || p.includes('event');
    const hasRedis = p.includes('redis') || p.includes('cache') || p.includes('fast');

    return {
      name: `${prompt.slice(0, 40).replace(/[^a-zA-Z0-9 ]/g, '')} System Architecture`,
      description: `Distributed system architecture designed for: "${prompt}"`,
      diagramType: 'SYSTEM_ARCHITECTURE',
      layoutTiers: ['Edge & Ingress', 'API Gateway', 'Microservices', 'Message Bus & Caching', 'Databases'],
      summary: 'High-availability microservice architecture with edge routing, horizontal compute, and distributed caching.',
      document: `# Architecture Specification: ${prompt}

## System Overview
Distributed topology engineered for high availability, fault tolerance, and independent service deployability.

## Architectural Layers
- **Edge Layer**: Global CDN / WAF performing SSL termination and DDoS mitigation.
- **Ingress Gateway**: Reverse proxy performing rate limiting, JWT token validation, and API routing.
- **Service Mesh**: Decoupled domain microservices deployed in autonomous containers.
${hasKafka ? '- **Event Bus (Apache Kafka)**: Asynchronous event messaging enabling at-least-once delivery.' : ''}
${hasRedis ? '- **In-Memory Cache (Redis)**: Sub-millisecond data cache reducing hot-path database load.' : ''}
- **Primary Data Tier**: Relational ACID storage with primary/replica read-scale distribution.
`,
      nodes: [
        {
          id: 'n-client',
          type: 'cloud-service',
          position: { x: 50, y: 220 },
          data: {
            label: 'Web & Mobile Clients',
            subtitle: 'React / Next.js / Mobile',
            icon: 'client',
            category: 'compute',
            provider: 'generic',
            status: 'active',
          },
        },
        {
          id: 'n-gateway',
          type: 'cloud-service',
          position: { x: 300, y: 220 },
          data: {
            label: 'API Gateway & WAF',
            subtitle: provider === 'aws' ? 'Amazon API Gateway' : 'Envoy / Kong',
            icon: 'api-gateway',
            category: 'networking',
            provider,
            status: 'active',
          },
        },
        {
          id: 'n-core-svc',
          type: 'cloud-service',
          position: { x: 580, y: 140 },
          data: {
            label: 'Core Business Service',
            subtitle: provider === 'aws' ? 'AWS Lambda / ECS' : 'Node.js / Go Service',
            icon: 'compute',
            category: 'compute',
            provider,
            status: 'active',
          },
        },
        {
          id: 'n-worker-svc',
          type: 'cloud-service',
          position: { x: 580, y: 320 },
          data: {
            label: 'Background Worker',
            subtitle: 'Async Event Consumer',
            icon: 'compute',
            category: 'compute',
            provider,
            status: 'active',
          },
        },
        {
          id: 'n-cache',
          type: 'cloud-service',
          position: { x: 860, y: 80 },
          data: {
            label: 'Redis Cluster',
            subtitle: 'Read Cache & Sessions',
            icon: 'redis',
            category: 'database',
            provider,
            status: 'active',
          },
        },
        {
          id: 'n-queue',
          type: 'cloud-service',
          position: { x: 860, y: 240 },
          data: {
            label: hasKafka ? 'Kafka Event Bus' : 'SQS / RabbitMQ',
            subtitle: 'Message Topics & Queues',
            icon: hasKafka ? 'kafka' : 'queue',
            category: 'queue',
            provider,
            status: 'active',
          },
        },
        {
          id: 'n-db',
          type: 'cloud-service',
          position: { x: 860, y: 400 },
          data: {
            label: 'PostgreSQL Primary',
            subtitle: 'ACID Relational Storage',
            icon: 'postgres',
            category: 'database',
            provider,
            status: 'active',
          },
        },
      ],
      edges: [
        { id: 'se-1', source: 'n-client', target: 'n-gateway', type: 'smoothstep', data: { label: 'HTTPS / WSS', animated: true } },
        { id: 'se-2', source: 'n-gateway', target: 'n-core-svc', type: 'smoothstep', data: { label: '/api/v1', animated: true } },
        { id: 'se-3', source: 'n-core-svc', target: 'n-cache', type: 'smoothstep', data: { label: 'Get / Set' } },
        { id: 'se-4', source: 'n-core-svc', target: 'n-queue', type: 'smoothstep', data: { label: 'Publish Event', animated: true } },
        { id: 'se-5', source: 'n-queue', target: 'n-worker-svc', type: 'smoothstep', data: { label: 'Consume Msg', animated: true } },
        { id: 'se-6', source: 'n-core-svc', target: 'n-db', type: 'smoothstep', data: { label: 'Write Transactions' } },
        { id: 'se-7', source: 'n-worker-svc', target: 'n-db', type: 'smoothstep', data: { label: 'Async Updates' } },
      ],
    };
  }
}
