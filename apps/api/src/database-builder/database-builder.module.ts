import { Module } from '@nestjs/common';
import { DatabaseBuilderService } from './database-builder.service';
import { DatabaseBuilderController } from './database-builder.controller';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [DatabaseBuilderController],
  providers: [DatabaseBuilderService],
  exports: [DatabaseBuilderService],
})
export class DatabaseBuilderModule {}
