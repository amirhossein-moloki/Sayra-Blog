import app from './app';
import { env } from './config/env';
import { initWorkers } from './jobs/workers';
import logger from './config/logger';

const PORT = env.PORT;

// Support dynamic process toggling for microservices separation
const isWorkerEnabled = process.env.DISABLE_WORKERS !== 'true';
const isHttpEnabled = process.env.DISABLE_HTTP !== 'true';

if (isWorkerEnabled) {
  initWorkers();
} else {
  logger.info('Workers are disabled via DISABLE_WORKERS env flag.');
}

if (isHttpEnabled) {
  const server = app.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`);
  });

  process.on('unhandledRejection', (err: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
    logger.fatal({ err }, 'UNHANDLED REJECTION! 💥 Shutting down...');
    server.close(() => {
      process.exit(1);
    });
  });

  process.on('uncaughtException', (err: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
    logger.fatal({ err }, 'UNCAUGHT EXCEPTION! 💥 Shutting down...');
    server.close(() => {
      process.exit(1);
    });
  });
} else {
  logger.info('HTTP server is disabled via DISABLE_HTTP env flag. Running in worker-only daemon mode.');

  // In worker-only mode, keep the process alive gracefully
  const handleShutdown = () => {
    logger.info('Shutting down worker process...');
    process.exit(0);
  };
  process.on('SIGTERM', handleShutdown);
  process.on('SIGINT', handleShutdown);
}
