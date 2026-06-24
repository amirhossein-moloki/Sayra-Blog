import { Worker, Job } from 'bullmq';
import { defaultQueueOptions } from '../../config/bullmq';
import { CMS_SYNC_MEDIA_QUEUE_NAME } from '../queues';
import { prisma } from '../../config/prisma';
import { extractMediaKeysFromHtml } from '../../common/utils/htmlParser';
import logger from '../../config/logger';

export const postMediaSyncWorker = new Worker(
  CMS_SYNC_MEDIA_QUEUE_NAME,
  async (job: Job) => {
    const { postId } = job.data;
    logger.info(`Syncing media for post: ${postId}`);

    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      logger.error(`Post not found: ${postId}`);
      return;
    }

    const mediaKeys = extractMediaKeysFromHtml(post.content);

    // Find media IDs for these keys
    const medias = await prisma.media.findMany({
      where: {
        storageKey: { in: mediaKeys },
        gamingCenterId: post.gamingCenterId,
      },
    });

    const foundMediaIds = medias.map((m) => m.id);

    // Current attachments
    const currentAttachments = await prisma.postMedia.findMany({
      where: {
        postId: post.id,
        attachmentType: 'in-content',
      },
    });

    const currentMediaIds = currentAttachments.map((a) => a.mediaId);

    // IDs to add
    const idsToAdd = foundMediaIds.filter((id) => !currentMediaIds.includes(id));
    // IDs to remove
    const idsToRemove = currentMediaIds.filter((id) => !foundMediaIds.includes(id));

    await prisma.$transaction([
      ...idsToAdd.map((mediaId) =>
        prisma.postMedia.create({
          data: {
            postId: post.id,
            mediaId,
            attachmentType: 'in-content',
          },
        })
      ),
      prisma.postMedia.deleteMany({
        where: {
          postId: post.id,
          mediaId: { in: idsToRemove },
          attachmentType: 'in-content',
        },
      }),
    ]);

    logger.info(`Synced media for post ${postId}: added ${idsToAdd.length}, removed ${idsToRemove.length}`);
  },
  { connection: defaultQueueOptions.connection }
);
