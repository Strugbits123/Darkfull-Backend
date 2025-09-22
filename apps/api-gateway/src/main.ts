import 'reflect-metadata';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import morgan from 'morgan';
import proxy from 'express-http-proxy';
import docsRouter from './routes/docs.router';

const logger = {
  info: (message: string, ...args: unknown[]) => console.log(`[INFO] ${new Date().toISOString()} - ${message}`, ...args),
  error: (message: string, ...args: unknown[]) => console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, ...args),
  warn: (message: string, ...args: unknown[]) => console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, ...args),
};

// Initialize Express app
const app = express();

// Configuration
const NODE_ENV = process.env.NODE_ENV || 'development';
const PORT = process.env.GATEWAY_PORT || 8080;
const BASE_URL = process.env.GATEWAY_BASE_URL || `http://localhost:${PORT}`;

// Service URLs
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:6001';
const ORDER_SERVICE_URL = process.env.ORDER_SERVICE_URL || 'http://localhost:6002';
const INVENTORY_SERVICE_URL = process.env.INVENTORY_SERVICE_URL || 'http://localhost:6003';
const WAREHOUSE_SERVICE_URL = process.env.WAREHOUSE_SERVICE_URL || 'http://localhost:6004';
const NOTIFICATION_SERVICE_URL = process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:6005';

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

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: {
    error: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

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
// HEALTH CHECK
// =================================

app.get('/health', async (req: Request, res: Response) => {
  // Simple health check without database dependency for gateway
  res.status(200).json({
    status: 'healthy',
    service: 'api-gateway',
    timestamp: new Date().toISOString(),
    version: process.env.APP_VERSION || '1.0.0',
    uptime: process.uptime(),
  });
});

// Root endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'Dark Horse 3PL Platform API Gateway',
    version: process.env.APP_VERSION || '1.0.0',
    environment: NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// =================================
// API GATEWAY ROUTES
// =================================

// Global API Documentation
app.use('/docs', docsRouter);

// Authentication Service
app.use('/api/v1/auth', proxy(AUTH_SERVICE_URL, {
  proxyReqPathResolver: (req: Request) => `/api/v1/auth${req.url}`,
  proxyErrorHandler: (err: Error, res: Response) => {
    logger.error('Auth service proxy error:', err);
    res.status(503).json({ error: 'Auth service unavailable' });
  }
}));

// Order Service (when implemented)
app.use('/api/v1/orders', proxy(ORDER_SERVICE_URL, {
  proxyReqPathResolver: (req: Request) => `/api/v1/orders${req.url}`,
  proxyErrorHandler: (err: Error, res: Response) => {
    logger.error('Order service proxy error:', err);
    res.status(503).json({ error: 'Order service unavailable' });
  }
}));

// Inventory Service (when implemented)
app.use('/api/v1/inventory', proxy(INVENTORY_SERVICE_URL, {
  proxyReqPathResolver: (req: Request) => `/api/v1/inventory${req.url}`,
  proxyErrorHandler: (err: Error, res: Response) => {
    logger.error('Inventory service proxy error:', err);
    res.status(503).json({ error: 'Inventory service unavailable' });
  }
}));

// Warehouse Service (when implemented)
app.use('/api/v1/warehouse', proxy(WAREHOUSE_SERVICE_URL, {
  proxyReqPathResolver: (req: Request) => `/api/v1/warehouse${req.url}`,
  proxyErrorHandler: (err: Error, res: Response) => {
    logger.error('Warehouse service proxy error:', err);
    res.status(503).json({ error: 'Warehouse service unavailable' });
  }
}));

// Notification Service (when implemented)
app.use('/api/v1/notifications', proxy(NOTIFICATION_SERVICE_URL, {
  proxyReqPathResolver: (req: Request) => `/api/v1/notifications${req.url}`,
  proxyErrorHandler: (err: Error, res: Response) => {
    logger.error('Notification service proxy error:', err);
    res.status(503).json({ error: 'Notification service unavailable' });
  }
}));

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
app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  logger.error('Gateway error:', err);
  
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
  logger.info(`🚀 API Gateway listening at ${BASE_URL}`);
  logger.info(`🌍 Environment: ${NODE_ENV}`);
  logger.info(`🔧 Process ID: ${process.pid}`);
  
  if (NODE_ENV === 'development') {
    logger.info(`🔍 Health check: ${BASE_URL}/health`);
    logger.info(`📊 Auth service: ${AUTH_SERVICE_URL}`);
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
      logger.error(`${bind} requires elevated privileges`);
      process.exit(1);
      break;
    default:
      throw error;
  }
});

// =================================
// GRACEFUL SHUTDOWN
// =================================

const gracefulShutdown = (signal: string) => {
  logger.info(`${signal} received, shutting down gracefully`);

  server.close(err => {
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