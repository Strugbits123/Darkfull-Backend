import express, { Request, Response } from 'express';
import expressJSDocSwagger from 'express-jsdoc-swagger';


import {
  errorMiddleware,
  notFoundHandler,
} from '../packages/error-handaler/error-middleware';
import { getSwaggerOptions } from './config/swagger';
import healthRouter from './routes/health.router';
import { logger } from './utils/logger';
import v1Router from './routes/v1';



const app = express();

// Configuration
const NODE_ENV = process.env.NODE_ENV || 'development';
const PORT = process.env.APP_PORT || 6001; // Default to 6001 if not set
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}/api/v1`;

// =================================
// API DOCUMENTATION
// =================================

if (process.env.ENABLE_SWAGGER !== 'false') {
  const swaggerOptions = getSwaggerOptions(BASE_URL, __dirname);
  expressJSDocSwagger(app)(swaggerOptions);
}

// =================================
// HEALTH CHECK & METRICS
// =================================

// Basic health check
app.get('/', (req: Request, res: Response) => {
  res.json({
    name: process.env.APP_NAME,
    version: process.env.APP_VERSION || '1.0.0',
    environment: NODE_ENV,
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
});

// =================================
// ROUTES
// =================================

app.use('/health', healthRouter);
app.use('/api/v1', v1Router);

// =================================
// ERROR HANDLING
// =================================

// Handle 404 for unmatched routes
app.use(notFoundHandler);

// Global error handling middleware (must be last)
app.use(errorMiddleware);

// =================================
// SERVER STARTUP
// =================================

const server = app.listen(PORT, async () => {
  logger.info(`🚀 Server listening at http://localhost:${PORT}`);
  logger.info(
    `📚 Swagger docs available at http://localhost:${PORT}/api-docs/v1`
  );
  logger.info(`🌍 Environment: ${NODE_ENV}`);
  logger.info(`🔧 Process ID: ${process.pid}`);

  if (NODE_ENV === 'development') {
    logger.info(`🔍 Health check: http://localhost:${PORT}/health`);
    logger.info(`📊 API base URL: ${BASE_URL}`);
  }
});

// Handle server errors
server.on('error', error => {
  logger.error('❌ Server error:', error);
});

// =================================
// ERROR HANDLING & GRACEFUL SHUTDOWN
// =================================

// Handle server errors
server.on('error', (error: NodeJS.ErrnoException) => {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof PORT === 'string' ? 'Pipe ' + PORT : 'Port ' + PORT;

  switch (error.code) {
    case 'EACCES':
      logger.error(`${bind} requires elevated privileges`);
      process.exit(1);
      break;
    case 'EADDRINUSE':
      logger.error(`${bind} is already in use`);
      process.exit(1);
      break;
    default:
      throw error;
  }
});

// Graceful shutdown handlers
const gracefulShutdown = (signal: string) => {
  logger.info(`${signal} received, shutting down gracefully`);

  server.close(err => {
    if (err) {
      logger.error('Error during server shutdown:', err);
      process.exit(1);
    }

    logger.info('HTTP server closed');

    // Close database connections, cleanup resources, etc.
    // prisma.$disconnect().catch((err) => logger.error('Error disconnecting from database:', err));

    process.exit(0);
  });

  // Force close after timeout
  setTimeout(() => {
    logger.error(
      'Could not close connections in time, forcefully shutting down'
    );
    process.exit(1);
  }, 10000);
};

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception:', error);
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

// Handle unhandled promise rejections
process.on(
  'unhandledRejection',
  (reason: unknown, promise: Promise<unknown>) => {
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
    gracefulShutdown('UNHANDLED_REJECTION');
  }
);

