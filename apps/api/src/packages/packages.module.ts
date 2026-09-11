import { Module } from '@nestjs/common';
import { PackagesController } from './packages.controller';
import { PackagesService } from './packages.service';
import { CompatibilityService } from './compatibility.service';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [PackagesController],
  providers: [PackagesService, CompatibilityService],
  exports: [PackagesService, CompatibilityService],
})
export class PackagesModule {}
