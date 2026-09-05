import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { WebhookSubscriptionDto, CreateWebhookDto, UpdateWebhookDto } from '@nirmaanify/types';
import * as crypto from 'crypto';

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);

  constructor(private readonly prisma: PrismaService) {}

  async listWebhooks(workspaceId: string): Promise<WebhookSubscriptionDto[]> {
    const webhooks = await this.prisma.webhookSubscription.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'desc' },
    });

    return webhooks.map((w) => ({
      id: w.id,
      workspaceId: w.workspaceId,
      name: w.name,
      targetUrl: w.targetUrl,
      secret: w.secret ? '••••••••' : null,
      events: w.events,
      isActive: w.isActive,
      createdAt: w.createdAt,
      updatedAt: w.updatedAt,
    }));
  }

  async createWebhook(workspaceId: string, dto: CreateWebhookDto): Promise<WebhookSubscriptionDto> {
    const secret = dto.secret?.trim() || `whsec_${crypto.randomBytes(16).toString('hex')}`;

    const webhook = await this.prisma.webhookSubscription.create({
      data: {
        workspaceId,
        name: dto.name.trim(),
        targetUrl: dto.targetUrl.trim(),
        secret,
        events: dto.events && dto.events.length > 0 ? dto.events : ['content.published'],
        isActive: true,
      },
    });

    return {
      id: webhook.id,
      workspaceId: webhook.workspaceId,
      name: webhook.name,
      targetUrl: webhook.targetUrl,
      secret: webhook.secret,
      events: webhook.events,
      isActive: webhook.isActive,
      createdAt: webhook.createdAt,
      updatedAt: webhook.updatedAt,
    };
  }

  async updateWebhook(
    workspaceId: string,
    webhookId: string,
    dto: UpdateWebhookDto
  ): Promise<WebhookSubscriptionDto> {
    const existing = await this.prisma.webhookSubscription.findFirst({
      where: { id: webhookId, workspaceId },
    });

    if (!existing) {
      throw new NotFoundException(`Webhook "${webhookId}" not found`);
    }

    const updated = await this.prisma.webhookSubscription.update({
      where: { id: webhookId },
      data: {
        name: dto.name !== undefined ? dto.name.trim() : existing.name,
        targetUrl: dto.targetUrl !== undefined ? dto.targetUrl.trim() : existing.targetUrl,
        secret: dto.secret !== undefined ? dto.secret.trim() : existing.secret,
        events: dto.events !== undefined ? dto.events : existing.events,
        isActive: dto.isActive !== undefined ? dto.isActive : existing.isActive,
      },
    });

    return {
      id: updated.id,
      workspaceId: updated.workspaceId,
      name: updated.name,
      targetUrl: updated.targetUrl,
      secret: updated.secret ? '••••••••' : null,
      events: updated.events,
      isActive: updated.isActive,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    };
  }

  async deleteWebhook(workspaceId: string, webhookId: string): Promise<{ success: boolean; id: string }> {
    const existing = await this.prisma.webhookSubscription.findFirst({
      where: { id: webhookId, workspaceId },
    });

    if (!existing) {
      throw new NotFoundException(`Webhook "${webhookId}" not found`);
    }

    await this.prisma.webhookSubscription.delete({
      where: { id: webhookId },
    });

    return { success: true, id: webhookId };
  }

  async testWebhook(
    workspaceId: string,
    webhookId: string
  ): Promise<{ success: boolean; statusCode?: number; responseTimeMs?: number; error?: string }> {
    const webhook = await this.prisma.webhookSubscription.findFirst({
      where: { id: webhookId, workspaceId },
    });

    if (!webhook) {
      throw new NotFoundException(`Webhook "${webhookId}" not found`);
    }

    const startTime = Date.now();
    try {
      const payload = {
        event: 'ping',
        workspaceId,
        timestamp: new Date().toISOString(),
        message: 'Nirmaanify test webhook ping',
      };

      const signature = webhook.secret
        ? crypto.createHmac('sha256', webhook.secret).update(JSON.stringify(payload)).digest('hex')
        : '';

      const res = await fetch(webhook.targetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Nirmaanify-Webhook-Agent/1.0',
          ...(signature ? { 'x-nirmaanify-signature': signature } : {}),
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(5000),
      });

      const responseTimeMs = Date.now() - startTime;
      return {
        success: res.ok,
        statusCode: res.status,
        responseTimeMs,
        error: res.ok ? undefined : `HTTP status ${res.status}: ${res.statusText}`,
      };
    } catch (err: any) {
      const responseTimeMs = Date.now() - startTime;
      return {
        success: false,
        responseTimeMs,
        error: err.message || 'Connection failed',
      };
    }
  }

  async dispatch(workspaceId: string, event: string, payload: any): Promise<void> {
    const activeHooks = await this.prisma.webhookSubscription.findMany({
      where: {
        workspaceId,
        isActive: true,
        events: { has: event },
      },
    });

    if (activeHooks.length === 0) return;

    for (const hook of activeHooks) {
      const body = JSON.stringify({
        event,
        workspaceId,
        timestamp: new Date().toISOString(),
        data: payload,
      });

      const signature = hook.secret
        ? crypto.createHmac('sha256', hook.secret).update(body).digest('hex')
        : '';

      fetch(hook.targetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Nirmaanify-Webhook-Agent/1.0',
          ...(signature ? { 'x-nirmaanify-signature': signature } : {}),
        },
        body,
        signal: AbortSignal.timeout(6000),
      }).catch((err) => {
        this.logger.warn(`Failed webhook delivery to ${hook.targetUrl}: ${err.message}`);
      });
    }
  }
}
