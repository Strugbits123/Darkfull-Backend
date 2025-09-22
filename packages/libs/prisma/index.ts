import { PrismaClient } from '@prisma/client';
// import { logger } from '../../utils/logger.ts';
import { logger } from '../../utils/logger.js';


declare global {
  var prismadb: PrismaClient | undefined;
}

// Create Prisma client with simple configuration
const prisma = globalThis.prismadb || new PrismaClient({
  log: ['info', 'warn', 'error'],
  errorFormat: 'pretty',
});

// Set up basic logging without events (to avoid TypeScript issues)
if (process.env.NODE_ENV === 'development') {
  logger.info('🔗 Prisma client initialized with logging enabled');
}

// Only assign it in development to avoid multiple instances in dev reloads
if (process.env.NODE_ENV !== 'production') globalThis.prismadb = prisma;

// Database connection health check
export const checkDatabaseConnection = async (): Promise<boolean> => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    logger.info('✅ Database connection established');
    return true;
  } catch (error) {
    logger.error('❌ Database connection failed:', error);
    return false;
  }
};

// Graceful disconnect
export const disconnectDatabase = async (): Promise<void> => {
  try {
    await prisma.$disconnect();
    logger.info('✅ Database disconnected gracefully');
  } catch (error) {
    logger.error('❌ Error disconnecting from database:', error);
  }
};

export default prisma;
export { PrismaClient } from '@prisma/client';
