import { Module } from '@nestjs/common';
import { BuildsController } from './builds.controller';
import { BuildRunnerService } from './build-runner.service';
import { BuildValidationService } from './build-validation.service';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [BuildsController],
  providers: [BuildRunnerService, BuildValidationService],
  exports: [BuildRunnerService, BuildValidationService],
})
export class BuildsModule {}
