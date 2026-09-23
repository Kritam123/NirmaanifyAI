import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Headers,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiHeader } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiKeysService } from './api-keys.service';
import { WebhooksService } from './webhooks.service';
import { PrismaService } from '../database/prisma.service';
import {
  CreateApiKeyDto,
  CreateWebhookDto,
  UpdateWebhookDto,
  ExternalServiceStatusDto,
  RegisterDto,
  LoginDto,
} from '@nirmaanify/types';
import { ApiKeyGuard } from './guards/api-key.guard';
import { AuthService } from '../auth/auth.service';

@ApiTags('BaaS & External Services')
@Controller()
export class BaasController {
  constructor(
    private readonly apiKeysService: ApiKeysService,
    private readonly webhooksService: WebhooksService,
    private readonly prisma: PrismaService,
    private readonly authService: AuthService
  ) {}

  @Get('workspaces/:workspaceId/services/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get workspace standalone BaaS telemetry and status' })
  async getStatus(@Param('workspaceId') workspaceId: string): Promise<ExternalServiceStatusDto> {
    const diagramsCount = await this.prisma.diagram.count({
      where: { project: { workspaceId } },
    });

    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

    return {
      gateway: {
        status: 'online',
        version: '1.0.0',
        uptime: Math.floor(process.uptime()),
        apiUrl: apiBase,
        docsUrl: `${apiBase.replace(/\/api\/v1$/, '')}/api/docs`,
      },
      auth: {
        enabled: true,
        jwtIssuer: 'nirmaanify-baas',
        endpoints: {
          signup: '/api/v1/external/auth/signup',
          login: '/api/v1/external/auth/login',
          verify: '/api/v1/external/auth/verify',
        },
      },
      database: {
        connected: true,
        provider: 'postgresql',
        totalCollections: diagramsCount,
        totalItems: diagramsCount,
      },
      storage: {
        driver: process.env.STORAGE_DRIVER || 'local',
        endpoint: process.env.S3_ENDPOINT || 'http://localhost:9001',
      },
    };
  }

  // =========================================================================
  // API KEYS
  // =========================================================================

  @Get('workspaces/:workspaceId/api-keys')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List workspace API keys' })
  async listApiKeys(@Param('workspaceId') workspaceId: string) {
    return this.apiKeysService.listKeys(workspaceId);
  }

  @Post('workspaces/:workspaceId/api-keys')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Generate new scoped API key' })
  async createApiKey(
    @Param('workspaceId') workspaceId: string,
    @Body() dto: CreateApiKeyDto
  ) {
    return this.apiKeysService.createKey(workspaceId, dto);
  }

  @Delete('workspaces/:workspaceId/api-keys/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Revoke API key' })
  async deleteApiKey(
    @Param('workspaceId') workspaceId: string,
    @Param('id') id: string
  ) {
    return this.apiKeysService.deleteKey(workspaceId, id);
  }

  // =========================================================================
  // WEBHOOKS
  // =========================================================================

  @Get('workspaces/:workspaceId/webhooks')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List workspace webhooks' })
  async listWebhooks(@Param('workspaceId') workspaceId: string) {
    return this.webhooksService.listWebhooks(workspaceId);
  }

  @Post('workspaces/:workspaceId/webhooks')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Register a webhook target' })
  async createWebhook(
    @Param('workspaceId') workspaceId: string,
    @Body() dto: CreateWebhookDto
  ) {
    return this.webhooksService.createWebhook(workspaceId, dto);
  }

  @Patch('workspaces/:workspaceId/webhooks/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update webhook subscription' })
  async updateWebhook(
    @Param('workspaceId') workspaceId: string,
    @Param('id') id: string,
    @Body() dto: UpdateWebhookDto
  ) {
    return this.webhooksService.updateWebhook(workspaceId, id, dto);
  }

  @Delete('workspaces/:workspaceId/webhooks/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete webhook subscription' })
  async deleteWebhook(
    @Param('workspaceId') workspaceId: string,
    @Param('id') id: string
  ) {
    return this.webhooksService.deleteWebhook(workspaceId, id);
  }

  @Post('workspaces/:workspaceId/webhooks/:id/test')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Test webhook endpoint ping' })
  async testWebhook(
    @Param('workspaceId') workspaceId: string,
    @Param('id') id: string
  ) {
    return this.webhooksService.testWebhook(workspaceId, id);
  }

  // =========================================================================
  // EXTERNAL BAAS ENDPOINTS (For Next.js / Mobile Apps / Third-party)
  // =========================================================================

  @Post('external/auth/signup')
  @UseGuards(ApiKeyGuard)
  @ApiHeader({ name: 'x-api-key', required: true })
  @ApiOperation({ summary: 'Register user for external application' })
  async externalSignup(@Body() dto: RegisterDto) {
    return this.authService.register(dto as any);
  }

  @Post('external/auth/login')
  @UseGuards(ApiKeyGuard)
  @ApiHeader({ name: 'x-api-key', required: true })
  @ApiOperation({ summary: 'Authenticate user for external application' })
  async externalLogin(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get('external/auth/verify')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verify JWT session for external application' })
  async externalVerify(@Req() req: any) {
    return req.user;
  }

  @Post('external/storage/presigned-url')
  @UseGuards(ApiKeyGuard)
  @ApiHeader({ name: 'x-api-key', required: true })
  @ApiOperation({ summary: 'Generate direct upload URL for external clients' })
  async getPresignedUploadUrl(
    @Body() body: { filename: string; contentType?: string },
    @Req() req: any
  ) {
    const cleanName = (body.filename || 'upload').replace(/[^a-zA-Z0-9.-]/g, '_');
    const key = `baas/${req.workspaceId}/${Date.now()}-${cleanName}`;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

    return {
      uploadUrl: `${baseUrl}/storage/upload?key=${encodeURIComponent(key)}`,
      publicUrl: `${baseUrl}/storage/files/${encodeURIComponent(key)}`,
      key,
    };
  }
}
