import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as path from 'path';
import { DatabaseModule } from './database/database.module';
import { HealthModule } from './health/health.module';
import { StorageModule } from './storage/storage.module';
import { AuthModule } from './auth/auth.module';
import { WorkspacesModule } from './workspaces/workspaces.module';
import { ProjectsModule } from './projects/projects.module';
import { MailModule } from './mail/mail.module';
import { CmsModule } from './cms/cms.module';
import { BaasModule } from './baas/baas.module';
import { AgentModule } from './agent/agent.module';
import { InngestModule } from './inngest/inngest.module';
import { PackagesModule } from './packages/packages.module';
import { PluginsModule } from './plugins/plugins.module';
import { validateEnv } from './config/env.validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        '.env',
        '../../.env',
        path.resolve(process.cwd(), '.env'),
        path.resolve(process.cwd(), '../../.env'),
      ],
      validate: validateEnv,
    }),
    DatabaseModule,
    HealthModule,
    MailModule,
    StorageModule,
    AuthModule,
    WorkspacesModule,
    ProjectsModule,
    CmsModule,
    BaasModule,
    AgentModule,
    InngestModule,
    PackagesModule,
    PluginsModule,
  ],
})
export class AppModule {}
