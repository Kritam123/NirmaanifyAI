import { Controller, Get } from '@nestjs/common';
import { GovernanceService } from './governance.service';

@Controller('governance')
export class GovernanceController {
  constructor(private readonly governanceService: GovernanceService) {}

  @Get('priorities')
  getPriorities() {
    return this.governanceService.getPriorityMatrix();
  }

  @Get('rules')
  getRules() {
    return this.governanceService.getDevelopmentRules();
  }

  @Get('master-flow')
  getMasterFlow() {
    return this.governanceService.getMasterProductFlow();
  }
}
