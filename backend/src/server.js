import app from './app.js';
import config from './config.js';
import { closePool, checkConnection } from './db.js';

const server = app.listen(config.PORT, async () => {
  console.log('=======================================================');
  console.log(`🚀 ${config.APP_NAME} v${config.APP_VERSION}`);
  console.log(`🌐 Environment: ${config.NODE_ENV}`);
  console.log(`🔌 Listening on: http://localhost:${config.PORT}`);
  console.log(`🩺 Health Check: http://localhost:${config.PORT}/health`);
  console.log(`📦 Items API:    http://localhost:${config.PORT}/api/v1/items`);
  console.log('=======================================================');

  // Verify database connectivity
  const dbStatus = await checkConnection();
  console.log(`🗄️  Database Status: [${dbStatus.mode}] ${dbStatus.message}`);
});

// Graceful shutdown handling
async function gracefulShutdown(signal) {
  console.log(`\nReceived ${signal}. Shutting down gracefully...`);
  server.close(async () => {
    console.log('HTTP server closed.');
    await closePool();
    console.log('Database connections closed. Exiting process.');
    process.exit(0);
  });

  setTimeout(() => {
    console.error('Forceful shutdown after timeout.');
    process.exit(1);
  }, 10000);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

export default server;
