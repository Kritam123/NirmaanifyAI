import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@nirmaanify/database';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('✓ Connected to PostgreSQL database');
    } catch (err: any) {
      this.logger.warn(`Could not connect to PostgreSQL on startup: ${err.message}. Ensure Docker/Postgres is running.`);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
