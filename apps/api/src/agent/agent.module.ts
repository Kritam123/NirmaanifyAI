import { Module } from '@nestjs/common';
import { AgentController } from './agent.controller';
import { GeminiAgentService } from './gemini-agent.service';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [AgentController],
  providers: [GeminiAgentService],
  exports: [GeminiAgentService],
})
export class AgentModule {}
