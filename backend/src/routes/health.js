import { Router } from 'express';
import config from '../config.js';
import { checkConnection } from '../db.js';

const router = Router();

router.get('/', async (req, res) => {
  const dbStatus = await checkConnection();
  const uptimeSeconds = Math.floor(process.uptime());

  res.status(200).json({
    status: 'UP',
    service: config.APP_NAME,
    version: config.APP_VERSION,
    environment: config.NODE_ENV,
    uptime: uptimeSeconds,
    timestamp: new Date().toISOString(),
    database: dbStatus,
    system: {
      nodeVersion: process.version,
      memoryUsage: {
        rssMB: Math.round(process.memoryUsage().rss / 1024 / 1024),
        heapUsedMB: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      },
    },
  });
});

export default router;
