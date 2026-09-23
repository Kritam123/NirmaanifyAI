import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { DiagramsController } from './diagrams.controller';
import { DiagramsService } from './diagrams.service';
import { AiArchitectService } from './ai-architect.service';

@Module({
  imports: [DatabaseModule],
  controllers: [DiagramsController],
  providers: [DiagramsService, AiArchitectService],
  exports: [DiagramsService, AiArchitectService],
})
export class DiagramsModule {}
