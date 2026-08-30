import { Module } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { AiPlannerService } from './ai-planner.service';

@Module({
  controllers: [ProjectsController],
  providers: [ProjectsService, AiPlannerService],
  exports: [ProjectsService, AiPlannerService],
})
export class ProjectsModule {}
