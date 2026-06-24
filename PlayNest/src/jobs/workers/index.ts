import { smsWorker } from './sms.worker';
import { postMediaSyncWorker } from './post-media-sync.worker';
import { scheduledPostPublisherWorker } from './scheduled-post-publisher.worker';
import logger from '../../config/logger';
import '../monitoring/queue-monitor';

export const initWorkers = () => {
  logger.info('Initializing BullMQ workers...');

  smsWorker.on('ready', () => logger.info('SMS Worker ready'));
  postMediaSyncWorker.on('ready', () => logger.info('Post Media Sync Worker ready'));
  scheduledPostPublisherWorker.on('ready', () => logger.info('Scheduled Post Publisher Worker ready'));

  // Workers start automatically upon instantiation,
  // but we export this to ensure they are loaded.
};
