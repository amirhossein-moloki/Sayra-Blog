import { Worker, Job } from 'bullmq';
import { defaultQueueOptions } from '../../config/bullmq';
import { CMS_PUBLISH_QUEUE_NAME } from '../queues';
import { prisma } from '../../config/prisma';
import { PageStatus } from '@prisma/client';
import logger from '../../config/logger';
import { eventEmitter } from '../../common/events/event-emitter';

export const scheduledPostPublisherWorker = new Worker(
  CMS_PUBLISH_QUEUE_NAME,
  async (job: Job) => {
    logger.info('Checking for scheduled posts to publish...');

    const now = new Date();

    const postsToPublish = await prisma.post.findMany({
      where: {
        status: PageStatus.SCHEDULED,
        scheduledAt: { lte: now },
        isActive: true,
      },
    });

    if (postsToPublish.length === 0) {
      logger.info('No scheduled posts to publish.');
      return;
    }

    const publishResults = await Promise.all(
      postsToPublish.map(async (post) => {
        try {
          await prisma.post.update({
            where: { id: post.id },
            data: {
              status: PageStatus.PUBLISHED,
              publishedAt: post.scheduledAt || now,
              scheduledAt: null,
            },
          });
          logger.info(`Successfully published post: ${post.id}`);

          // Emit domain event
          eventEmitter.emit('CMS_POST_PUBLISHED', { postId: post.id, gamingCenterId: post.gamingCenterId });

          return { id: post.id, success: true };
        } catch (error) {
          logger.error(`Failed to publish post ${post.id}: ${error instanceof Error ? error.message : String(error)}`);
          return { id: post.id, success: false };
        }
      })
    );

    const successful = publishResults.filter((r) => r.success).length;
    logger.info(`Published ${successful}/${postsToPublish.length} scheduled posts.`);
  },
  { connection: defaultQueueOptions.connection }
);
