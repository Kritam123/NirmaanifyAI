import { Module } from '@nestjs/common';
import { BackendBuilderService } from './backend-builder.service';
import { BackendBuilderController } from './backend-builder.controller';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [BackendBuilderController],
  providers: [BackendBuilderService],
  exports: [BackendBuilderService],
})
export class BackendBuilderModule {}
