import { Injectable, NotFoundException, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { ApiKeyDto, CreateApiKeyDto } from '@nirmaanify/types';
import * as crypto from 'crypto';

@Injectable()
export class ApiKeysService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * List API keys for a workspace (secrets masked)
   */
  async listKeys(workspaceId: string): Promise<ApiKeyDto[]> {
    const keys = await this.prisma.apiKey.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'desc' },
    });

    return keys.map((k) => ({
      id: k.id,
      workspaceId: k.workspaceId,
      name: k.name,
      keyPrefix: k.keyPrefix,
      scopes: k.scopes,
      lastUsedAt: k.lastUsedAt,
      expiresAt: k.expiresAt,
      createdAt: k.createdAt,
      updatedAt: k.updatedAt,
    }));
  }

  /**
   * Create a new API key. Returns secretKey only once!
   */
  async createKey(workspaceId: string, dto: CreateApiKeyDto): Promise<ApiKeyDto> {
    const rawEntropy = crypto.randomBytes(24).toString('hex');
    const secretKey = `nrm_live_${rawEntropy}`;
    const keyPrefix = `nrm_live_${rawEntropy.substring(0, 6)}...`;
    const keyHash = crypto.createHash('sha256').update(secretKey).digest('hex');

    const expiresAt =
      dto.expiresInDays && dto.expiresInDays > 0
        ? new Date(Date.now() + dto.expiresInDays * 24 * 60 * 60 * 1000)
        : null;

    const apiKey = await this.prisma.apiKey.create({
      data: {
        workspaceId,
        name: dto.name.trim(),
        keyPrefix,
        keyHash,
        scopes: dto.scopes && dto.scopes.length > 0 ? dto.scopes : ['cms:read', 'cms:write', 'storage:upload'],
        expiresAt,
      },
    });

    return {
      id: apiKey.id,
      workspaceId: apiKey.workspaceId,
      name: apiKey.name,
      keyPrefix: apiKey.keyPrefix,
      scopes: apiKey.scopes,
      lastUsedAt: apiKey.lastUsedAt,
      expiresAt: apiKey.expiresAt,
      createdAt: apiKey.createdAt,
      updatedAt: apiKey.updatedAt,
      secretKey,
    };
  }

  /**
   * Revoke an API key
   */
  async deleteKey(workspaceId: string, keyId: string): Promise<{ success: boolean; id: string }> {
    const key = await this.prisma.apiKey.findFirst({
      where: { id: keyId, workspaceId },
    });

    if (!key) {
      throw new NotFoundException(`API key "${keyId}" not found in workspace`);
    }

    await this.prisma.apiKey.delete({
      where: { id: keyId },
    });

    return { success: true, id: keyId };
  }

  /**
   * Validate raw API key header and optionally check required scope
   */
  async validateKey(rawKey: string, requiredScope?: string): Promise<any> {
    if (!rawKey || !rawKey.startsWith('nrm_live_')) {
      throw new UnauthorizedException('Invalid or missing API key format');
    }

    const keyHash = crypto.createHash('sha256').update(rawKey.trim()).digest('hex');

    const apiKey = await this.prisma.apiKey.findUnique({
      where: { keyHash },
      include: { workspace: true },
    });

    if (!apiKey) {
      throw new UnauthorizedException('Invalid API key');
    }

    if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
      throw new UnauthorizedException('API key has expired');
    }

    if (requiredScope && apiKey.scopes && apiKey.scopes.length > 0) {
      if (!apiKey.scopes.includes(requiredScope) && !apiKey.scopes.includes('*')) {
        throw new ForbiddenException(`API key lacks required scope: "${requiredScope}"`);
      }
    }

    // Update lastUsedAt asynchronously
    this.prisma.apiKey
      .update({
        where: { id: apiKey.id },
        data: { lastUsedAt: new Date() },
      })
      .catch(() => {});

    return apiKey;
  }
}
