import { Job } from 'bullmq';
import { prisma } from '@nirmaanify/database';
import { CmsScheduledPublishJobData } from '@nirmaanify/types';

export async function processCmsPublishing(
  job: Job<CmsScheduledPublishJobData>
): Promise<{ publishedCount: number; message: string }> {
  console.log(`[CMS Publisher] Processing scheduled publication job: ${job.id}`);
  const now = new Date();

  const where: any = {
    status: 'SCHEDULED',
    scheduledAt: { lte: now },
  };

  if (job.data?.projectId) {
    where.projectId = job.data.projectId;
  }
  if (job.data?.contentItemId) {
    where.id = job.data.contentItemId;
  }

  const itemsToPublish = await prisma.cmsContentItem.findMany({
    where,
    select: { id: true, slug: true, projectId: true },
  });

  if (itemsToPublish.length === 0) {
    console.log('[CMS Publisher] No overdue scheduled content items found.');
    return { publishedCount: 0, message: 'No items to publish' };
  }

  const result = await prisma.cmsContentItem.updateMany({
    where: {
      id: { in: itemsToPublish.map((i: { id: string }) => i.id) },
    },
    data: {
      status: 'PUBLISHED',
      publishedAt: now,
    },
  });

  console.log(
    `[CMS Publisher] Successfully published ${result.count} content items: ${itemsToPublish
      .map((i: { slug: string | null }) => i.slug)
      .filter(Boolean)
      .join(', ')}`
  );

  return {
    publishedCount: result.count,
    message: `Published ${result.count} scheduled items`,
  };
}
