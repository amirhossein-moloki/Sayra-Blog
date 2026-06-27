import { Worker } from 'bullmq';
import { defaultQueueOptions } from '../../config/bullmq';
import { CMS_PUBLISH_QUEUE_NAME } from '../queues';
import { prisma } from '../../config/prisma';
import { PageStatus } from '@prisma/client';
import logger from '../../config/logger';
import { eventEmitter } from '../../common/events/event-emitter';

export const scheduledPostPublisherWorker = new Worker(
  CMS_PUBLISH_QUEUE_NAME,
  async () => {
    logger.info('Checking for scheduled posts to publish...');

    const now = new Date();

    const [postsToPublish, pagesToPublish] = await Promise.all([
      prisma.post.findMany({
        where: { status: PageStatus.SCHEDULED, scheduledAt: { lte: now }, isActive: true },
      }),
      prisma.page.findMany({
        where: { status: PageStatus.SCHEDULED, scheduledAt: { lte: now }, isActive: true },
      }),
    ]);

    if (postsToPublish.length === 0 && pagesToPublish.length === 0) {
      logger.info('No scheduled content to publish.');
      return;
    }

    // Publish Posts
    const postResults = await Promise.all(
      postsToPublish.map(async (post) => {
        try {
          await prisma.post.update({
            where: { id: post.id },
            data: { status: PageStatus.PUBLISHED, publishedAt: post.scheduledAt || now, scheduledAt: null },
          });
          eventEmitter.emit('CMS_POST_PUBLISHED', { postId: post.id, gamingCenterId: post.gamingCenterId });
          return { success: true };
        } catch (error) {
          logger.error(`Failed to publish post ${post.id}: ${error}`);
          return { success: false };
        }
      })
    );

    // Publish Pages
    const pageResults = await Promise.all(
      pagesToPublish.map(async (page) => {
        try {
          await prisma.page.update({
            where: { id: page.id },
            data: { status: PageStatus.PUBLISHED, publishedAt: page.scheduledAt || now, scheduledAt: null },
          });
          eventEmitter.emit('CMS_PAGE_PUBLISHED', { pageId: page.id, gamingCenterId: page.gamingCenterId });
          return { success: true };
        } catch (error) {
          logger.error(`Failed to publish page ${page.id}: ${error}`);
          return { success: false };
        }
      })
    );

    logger.info(`Published ${postResults.filter(r => r.success).length} posts and ${pageResults.filter(r => r.success).length} pages.`);
  },
  { connection: defaultQueueOptions.connection }
);
