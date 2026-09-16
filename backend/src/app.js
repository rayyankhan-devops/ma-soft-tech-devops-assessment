import express from 'express';
import cors from 'cors';
import healthRouter from './routes/health.js';
import itemsRouter from './routes/items.js';

const app = express();

// Standard middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (process.env.NODE_ENV !== 'test') {
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`);
    }
  });
  next();
});

// Root API discovery endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    service: 'MA Soft Tech Solutions - DevOps Backend API',
    status: 'ONLINE',
    endpoints: {
      health: '/health',
      items: '/api/v1/items',
    },
    documentation: 'See README.md for endpoint specifications',
  });
});

// Mount Routes
app.use('/health', healthRouter);
app.use('/api/v1/items', itemsRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Not Found',
    message: `Endpoint ${req.originalUrl} does not exist`,
  });
});

// Centralized error handling
app.use((err, req, res, _next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal Server Error',
    message: err.message || 'An unexpected error occurred',
  });
});

export default app;
