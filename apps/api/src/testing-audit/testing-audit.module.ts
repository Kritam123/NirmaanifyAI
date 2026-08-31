import { Module } from '@nestjs/common';
import { TestingAuditService } from './testing-audit.service';
import { TestingAuditController } from './testing-audit.controller';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [TestingAuditController],
  providers: [TestingAuditService],
  exports: [TestingAuditService],
})
export class TestingAuditModule {}
