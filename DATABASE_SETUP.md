# Dark Horse 3PL Platform - Database & Services Setup

## Overview

This document explains how the shared database and microservices are configured in the Dark Horse 3PL platform.

## Architecture

- **Shared Database**: Single PostgreSQL database used by all microservices
- **Prisma ORM**: Type-safe database client with schema management
- **API Gateway**: Routes requests to appropriate microservices
- **Auth Service**: Handles authentication, authorization, and user management

## Setup Instructions

### 1. Environment Configuration

Copy the environment file and configure your database:

```bash
cp .env.example .env
```

Update the `DATABASE_URL` in `.env`:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/dark_horse_3pl_db?schema=public"
```

### 2. Database Setup

Generate Prisma client:
```bash
npm run db:generate
```

Create and run migrations:
```bash
npm run db:migrate
```

Seed the database with initial data:
```bash
npm run db:seed
```

### 3. Start Services

Start API Gateway:
```bash
npm run start:gateway
```

Start Auth Service:
```bash
npm run start:auth
```

Or start all services:
```bash
npm run dev
```

## Database Schema

### Core Models

#### User Management
- **User**: Main user entity with authentication details
- **Role**: System roles (Super Admin, Admin, Merchant, User)
- **Permission**: Granular permissions for different resources
- **UserRoleMapping**: Many-to-many relationship between users and roles
- **RolePermissionMapping**: Many-to-many relationship between roles and permissions
- **UserPermissionMapping**: Direct permission assignments to users

#### Authentication & Security
- **Session**: User session management with device tracking
- **Otp**: One-time passwords for verification
- **AuditLog**: System audit trail for security and compliance

#### System Configuration
- **SystemConfig**: Platform-wide configuration settings
- **NotificationTemplate**: Email/SMS templates
- **Notification**: Notification queue and delivery tracking

### Default Users & Roles

After seeding, you'll have:

- **Super Admin**: `admin@darkhorse3pl.com` / `superadmin123`
- **Roles**: Super Admin, Admin, Merchant, User
- **Permissions**: Full CRUD operations for users, roles, orders, inventory, system settings

## Adding New Services

When creating a new microservice, follow this pattern:

### 1. Create Service Structure

```
apps/your-service/
├── src/
│   ├── main.ts
│   ├── routes/
│   ├── controllers/
│   ├── services/
│   └── utils/
├── package.json
└── tsconfig.json
```

### 2. Database Access

Import and use the shared Prisma client:

```typescript
import prisma from '../../../packages/libs/prisma';

// Use prisma client for database operations
const user = await prisma.user.findUnique({
  where: { email: 'user@example.com' }
});
```

### 3. Add to API Gateway

Update the API Gateway routes in `apps/api-gateway/src/main.ts`:

```typescript
// Your Service (when implemented)
app.use('/api/v1/your-service', proxy(YOUR_SERVICE_URL, {
  proxyReqPathResolver: (req) => `/api/v1/your-service${req.url}`,
  proxyErrorHandler: (err, res, next) => {
    logger.error('Your service proxy error:', err);
    res.status(503).json({ error: 'Your service unavailable' });
  }
}));
```

### 4. Environment Variables

Add service configuration to `.env`:

```env
YOUR_SERVICE_PORT=6006
YOUR_SERVICE_URL=http://localhost:6006
```

## Database Operations

### Migrations

Create a new migration:
```bash
npx prisma migrate dev --name your_migration_name --schema=./packages/libs/database/schema.prisma
```

### Schema Changes

1. Update `packages/libs/database/schema.prisma`
2. Generate new client: `npm run db:generate`
3. Create migration: `npm run db:migrate`

### Database Studio

Open Prisma Studio to view and edit data:
```bash
npm run db:studio
```

## Available Scripts

- `npm run dev` - Start all services in development mode
- `npm run start:gateway` - Start API Gateway only
- `npm run start:auth` - Start Auth Service only
- `npm run db:generate` - Generate Prisma client
- `npm run db:migrate` - Run database migrations
- `npm run db:push` - Push schema changes to database
- `npm run db:studio` - Open Prisma Studio
- `npm run db:seed` - Seed database with initial data
- `npm run build` - Build all projects
- `npm run test` - Run tests
- `npm run lint` - Run linting

## Service Endpoints

### API Gateway (Port 8080)
- `GET /` - Service information
- `GET /health` - Health check
- `POST /api/v1/auth/*` - Auth service routes
- `POST /api/v1/orders/*` - Order service routes (when implemented)
- `POST /api/v1/inventory/*` - Inventory service routes (when implemented)

### Auth Service (Port 6001)
- `GET /` - Service information
- `GET /health` - Health check
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/verify` - Email verification
- `POST /api/v1/auth/forgot-password` - Password reset request
- `POST /api/v1/auth/reset-password` - Password reset

## Validation & Types

Use the shared validators from `packages/libs/database/validators/`:

```typescript
import { UserRegisterSchema } from '../../../packages/libs/database/validators/auth.validators';

// Validate input
const validatedData = UserRegisterSchema.parse(requestBody);
```

## Error Handling

The platform includes standardized error handling:

```typescript
import { ValidationError, ConflictError } from '../../../packages/error-handler';

throw new ValidationError('Invalid email format');
throw new ConflictError('User already exists');
```

## Security Features

- **CORS**: Configurable cross-origin resource sharing
- **Helmet**: Security headers
- **Rate Limiting**: Request rate limiting
- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt password hashing
- **Session Management**: Secure session handling
- **Audit Logging**: System activity tracking

## Next Steps

1. Set up your database (PostgreSQL)
2. Configure environment variables
3. Run database migrations and seeding
4. Start the services
5. Test the API endpoints
6. Add your business logic services

## Support

For questions or issues, refer to the comprehensive architecture documentation in `documentation/scop/microservices-architecture.md`.