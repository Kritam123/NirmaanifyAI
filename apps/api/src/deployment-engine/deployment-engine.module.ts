import { Module } from '@nestjs/common';
import { DeploymentEngineService } from './deployment-engine.service';
import { DeploymentEngineController } from './deployment-engine.controller';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [DeploymentEngineController],
  providers: [DeploymentEngineService],
  exports: [DeploymentEngineService],
})
export class DeploymentEngineModule {}
