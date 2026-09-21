import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ApiKeysService } from '../api-keys.service';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly apiKeysService: ApiKeysService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const apiKeyHeader = request.headers['x-api-key'] || request.headers['x-nirmaanify-api-key'];

    if (!apiKeyHeader) {
      throw new UnauthorizedException('Missing x-api-key header');
    }

    const key = await this.apiKeysService.validateKey(apiKeyHeader as string);
    request.apiKey = key;
    request.workspaceId = key.workspaceId;
    return true;
  }
}
