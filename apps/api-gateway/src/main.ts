import 'reflect-metadata';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Request, Response } from 'express';
import expressJSDocSwagger from 'express-jsdoc-swagger';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import morgan from 'morgan';
import proxy from 'express-http-proxy';


import {
  errorMiddleware,
  notFoundHandler,
} from '../packages/error-handaler/error-middleware';
import { getSwaggerOptions } from './config/swagger';
import { logger } from './utils/logger';


// Initialize Express app
const app = express();

// Configuration
const NODE_ENV = process.env.NODE_ENV || 'development';
const PORT = process.env.APP_PORT || 8080; // Default to 8080 if not set
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;

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
if (process.env.ENABLE_RATE_LIMITING !== 'false') {
  const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
    message: {
      error: 'Too many requests from this IP, please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use('/api/', limiter);
}

// =================================
// CORS CONFIGURATION
// =================================

const corsOrigins = process.env.CORS_ORIGINS?.split(',') || [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:6001',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, etc.)
      if (!origin) return callback(null, true);

      if (corsOrigins.includes(origin) || NODE_ENV === 'development') {
        return callback(null, true);
      }

      const msg = `The CORS policy for this origin doesn't allow access from the particular origin: ${origin}`;
      return callback(new Error(msg), false);
    },
    credentials: process.env.CORS_CREDENTIALS === 'true',
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
// API GATEWAY ROUTES
// =================================

app.use('/', proxy("http://localhost:6001"));
app.get('/gateway-health', (req, res) => {
  res.send({ message: 'Welcome to api-gateway!' });
});


// =================================
// SERVER STARTUP
// =================================

const server = app.listen(PORT, async () => {
  logger.info(`🚀 Api Gateway Service listening at http://localhost:${PORT}`);
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

