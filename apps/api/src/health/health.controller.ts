import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private health: HealthCheckService) {}

  @Get()
  @HealthCheck()
  @ApiOperation({ summary: 'Platform API health check status' })
  check() {
    return this.health.check([
      () => ({
        api: {
          status: 'up',
          version: '1.0.0',
          uptime: process.uptime(),
        },
      }),
    ]);
  }
}
