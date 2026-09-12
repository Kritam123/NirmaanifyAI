import { Module } from '@nestjs/common';
import { AgentController } from './agent.controller';
import { GeminiAgentService } from './gemini-agent.service';
import { AgentOrchestratorService } from './orchestrator/orchestrator.service';
import { ContextMemoryService } from './memory/context-memory.service';
import { DesignContextService } from './memory/design-context.service';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [AgentController],
  providers: [
    GeminiAgentService,
    AgentOrchestratorService,
    ContextMemoryService,
    DesignContextService,
  ],
  exports: [
    GeminiAgentService,
    AgentOrchestratorService,
    ContextMemoryService,
    DesignContextService,
  ],
})
export class AgentModule {}
