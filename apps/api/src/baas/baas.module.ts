import { Module, Global } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { AuthModule } from '../auth/auth.module';
import { ApiKeysService } from './api-keys.service';
import { WebhooksService } from './webhooks.service';
import { BaasController } from './baas.controller';
import { ApiKeyGuard } from './guards/api-key.guard';

@Global()
@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [BaasController],
  providers: [ApiKeysService, WebhooksService, ApiKeyGuard],
  exports: [ApiKeysService, WebhooksService, ApiKeyGuard],
})
export class BaasModule {}
