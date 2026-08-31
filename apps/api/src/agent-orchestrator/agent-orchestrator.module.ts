import { Module } from '@nestjs/common';
import { AgentOrchestratorService } from './agent-orchestrator.service';
import { AgentOrchestratorController } from './agent-orchestrator.controller';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [AgentOrchestratorController],
  providers: [AgentOrchestratorService],
  exports: [AgentOrchestratorService],
})
export class AgentOrchestratorModule {}
