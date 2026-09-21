import { Module } from '@nestjs/common';
import { InngestController, AgentInngestController } from './inngest.controller';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [InngestController, AgentInngestController],
  exports: [],
})
export class InngestModule {}
