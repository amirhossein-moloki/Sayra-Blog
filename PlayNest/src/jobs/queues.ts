import { Queue } from 'bullmq';
import { defaultQueueOptions } from '../config/bullmq';

export const SMS_QUEUE_NAME = 'sms-notifications';
export const CMS_SYNC_MEDIA_QUEUE_NAME = 'cms-post-sync-media';
export const CMS_PUBLISH_QUEUE_NAME = 'cms-post-publish';

export const smsQueue = new Queue(SMS_QUEUE_NAME, defaultQueueOptions);
export const cmsSyncMediaQueue = new Queue(CMS_SYNC_MEDIA_QUEUE_NAME, defaultQueueOptions);
export const cmsPublishQueue = new Queue(CMS_PUBLISH_QUEUE_NAME, defaultQueueOptions);

// Register repeatable jobs
cmsPublishQueue.add(
  'scheduled-post-publish-check',
  {},
  {
    repeat: {
      pattern: '* * * * *', // Every minute
    },
  }
);
