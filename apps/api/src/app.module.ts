import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as path from 'path';
import { DatabaseModule } from './database/database.module';
import { HealthModule } from './health/health.module';
import { StorageModule } from './storage/storage.module';
import { AuthModule } from './auth/auth.module';
import { WorkspacesModule } from './workspaces/workspaces.module';
import { ProjectsModule } from './projects/projects.module';
import { CmsModule } from './cms/cms.module';
import { BackendBuilderModule } from './backend-builder/backend-builder.module';
import { DatabaseBuilderModule } from './database-builder/database-builder.module';
import { PluginsManagerModule } from './plugins-manager/plugins-manager.module';
import { AgentOrchestratorModule } from './agent-orchestrator/agent-orchestrator.module';
import { DeploymentEngineModule } from './deployment-engine/deployment-engine.module';
import { TestingAuditModule } from './testing-audit/testing-audit.module';
import { GovernanceModule } from './governance/governance.module';
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
    StorageModule,
    AuthModule,
    WorkspacesModule,
    ProjectsModule,
    CmsModule,
    BackendBuilderModule,
    DatabaseBuilderModule,
    PluginsManagerModule,
    AgentOrchestratorModule,
    DeploymentEngineModule,
    TestingAuditModule,
    GovernanceModule,
  ],
})
export class AppModule {}
