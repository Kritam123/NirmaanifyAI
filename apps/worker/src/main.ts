import { Worker } from 'bullmq';
import * as dotenv from 'dotenv';
import { QUEUE_NAMES } from '@nirmaanify/types';
import { createRedisConnection } from './redis.connection';
import { processCodeGeneration } from './processors/code-generation.processor';
import { processCmsPublishing } from './processors/cms-publishing.processor';

dotenv.config();

async function startWorker() {
  console.log('⚡ Nirmaanify Background Jobs Worker starting...');
  const connection = createRedisConnection();

  const codeGenWorker = new Worker(
    QUEUE_NAMES.CODE_GENERATION,
    async (job) => processCodeGeneration(job),
    { connection }
  );

  codeGenWorker.on('completed', (job) => {
    console.log(`✓ Job ${job.id} on queue '${QUEUE_NAMES.CODE_GENERATION}' completed successfully.`);
  });

  codeGenWorker.on('failed', (job, err) => {
    console.error(`✗ Job ${job?.id} failed with error:`, err.message);
  });

  const cmsPublishWorker = new Worker(
    QUEUE_NAMES.CMS_SCHEDULED_PUBLISH,
    async (job) => processCmsPublishing(job),
    { connection }
  );

  cmsPublishWorker.on('completed', (job) => {
    console.log(`✓ Job ${job.id} on queue '${QUEUE_NAMES.CMS_SCHEDULED_PUBLISH}' completed successfully.`);
  });

  cmsPublishWorker.on('failed', (job, err) => {
    console.error(`✗ Job ${job?.id} failed with error:`, err.message);
  });

  console.log(`📡 Listening for background jobs on queues:`);
  console.log(`   - ${QUEUE_NAMES.CODE_GENERATION}`);
  console.log(`   - ${QUEUE_NAMES.CMS_SCHEDULED_PUBLISH}`);
}

startWorker().catch((err) => {
  console.error('Fatal worker startup error:', err);
  process.exit(1);
});
