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
  ],
})
export class AppModule {}
