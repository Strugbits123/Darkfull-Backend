import 'reflect-metadata';
import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';

import { logger } from './utils/logger';
import healthRouter from './routes/health.router';
import v1Router from './routes/v1';
import { swaggerDocument } from './config/swagger-spec';

const app = express();

// Configuration
const NODE_ENV = process.env.NODE_ENV || 'development';
const PORT = process.env.AUTH_SERVICE_PORT || 6001;
const BASE_URL = process.env.AUTH_SERVICE_BASE_URL || `http://localhost:${PORT}/api/v1`;

// Trust proxy for production deployments
app.set('trust proxy', 1);

// =================================
// SECURITY MIDDLEWARE
// =================================

if (process.env.ENABLE_HELMET !== 'false') {
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", 'data:', 'https:'],
        },
      },
      crossOriginEmbedderPolicy: false,
    })
  );
}

// CORS configuration
app.use(
  cors({
    origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);
      
      // In development, allow all origins
      if (NODE_ENV === 'development') {
        return callback(null, true);
      }
      
      // In production, check against allowed origins
      const allowedOrigins = (process.env.ALLOWED_ORIGINS || '').split(',');
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
      'X-API-Key',
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  })
);

// =================================
// GENERAL MIDDLEWARE
// =================================

// Compression middleware
if (process.env.ENABLE_COMPRESSION !== 'false') {
  app.use(compression());
}

// Logging middleware
app.use(
  morgan(NODE_ENV === 'production' ? 'combined' : 'dev', {
    stream: {
      write: (message: string) => {
        logger.info(message.trim());
      },
    },
  })
);

// Body parsing middleware
app.use(
  express.json({
    limit: process.env.MAX_JSON_SIZE || '10mb',
    type: ['application/json', 'text/plain'],
  })
);
app.use(
  express.urlencoded({
    limit: process.env.MAX_JSON_SIZE || '10mb',
    extended: true,
  })
);

// Cookie parser
app.use(cookieParser(process.env.COOKIE_SECRET));

// =================================
// HEALTH CHECK & ROOT
// =================================

// Basic health check
app.get('/', (req: Request, res: Response) => {
  res.json({
    name: process.env.APP_NAME || 'Auth Service',
    version: process.env.APP_VERSION || '1.0.0',
    environment: NODE_ENV,
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
});

// =================================
// SWAGGER DOCUMENTATION
// =================================

// Swagger UI options
const swaggerOptions = {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
};

// Serve swagger JSON
app.get('/api-docs/v1/swagger.json', (req: Request, res: Response) => {
  res.json(swaggerDocument);
});

// Serve swagger UI
app.use('/api-docs/v1', swaggerUi.serve, swaggerUi.setup(swaggerDocument, swaggerOptions));

logger.info(`📚 Swagger documentation available at: http://localhost:${PORT}/api-docs/v1`);

// =================================
// ROUTES
// =================================

app.use('/health', healthRouter);
app.use('/api/v1', v1Router);

// =================================
// ERROR HANDLING
// =================================

// Handle 404 for unmatched routes
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString(),
  });
});

// Global error handling middleware (must be last)
app.use((err: Error, req: Request, res: Response) => {
  logger.error('Auth service error:', err);
  
  const statusCode = (err as any).statusCode || 500;
  const message = err.message || 'Internal server error';
  
  res.status(statusCode).json({
    error: message,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString(),
    ...(NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// =================================
// SERVER STARTUP
// =================================

const server = app.listen(PORT, async () => {
  logger.info(`🚀 Auth Service listening at http://localhost:${PORT}`);
  logger.info(`📚 API base URL: ${BASE_URL}`);
  logger.info(`🌍 Environment: ${NODE_ENV}`);
  logger.info(`🔧 Process ID: ${process.pid}`);

  if (NODE_ENV === 'development') {
    logger.info(`🔍 Health check: http://localhost:${PORT}/health`);
    logger.info(`📊 API base URL: ${BASE_URL}`);
  }
});

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

// =================================
// GRACEFUL SHUTDOWN
// =================================

const gracefulShutdown = async (signal: string) => {
  logger.info(`${signal} received, shutting down gracefully`);

  server.close(async (err) => {
    if (err) {
      logger.error('Error during server shutdown:', err);
      process.exit(1);
    }

    logger.info('HTTP server closed');
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

// Handle process signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

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