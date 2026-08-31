import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
} from '@nestjs/common';
import { TestingAuditService } from './testing-audit.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('audit')
export class TestingAuditController {
  constructor(private readonly auditService: TestingAuditService) {}

  @Post('tests/run')
  @UseGuards(JwtAuthGuard)
  async runTestSuite(@Body() payload: { projectId?: string }) {
    return this.auditService.runTestSuite(payload?.projectId);
  }

  @Get('security')
  @UseGuards(JwtAuthGuard)
  getSecurityAudit() {
    return this.auditService.getSecurityAudit();
  }

  @Get('mvp-checklist')
  getMvpReleaseChecklist() {
    return this.auditService.getMvpReleaseChecklist();
  }
}
