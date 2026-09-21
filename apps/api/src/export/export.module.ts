import { Module } from '@nestjs/common';
import { ExportController } from './export.controller';
import { ProjectExportService } from './project-export.service';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [ExportController],
  providers: [ProjectExportService],
  exports: [ProjectExportService],
})
export class ExportModule {}
