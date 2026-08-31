import { Module } from '@nestjs/common';
import { PluginsManagerService } from './plugins-manager.service';
import { PluginsManagerController } from './plugins-manager.controller';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [PluginsManagerController],
  providers: [PluginsManagerService],
  exports: [PluginsManagerService],
})
export class PluginsManagerModule {}
