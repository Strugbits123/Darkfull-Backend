# Dark Full 3PL Platform - Microservices Architecture

## Overview

The Dark Full 3PL Platform is a comprehensive microservices-based system designed for Third-Party Logistics (3PL) operations. This platform is built using modern Node.js technologies within an Nx monorepo structure, providing scalability, maintainability, and efficient development workflows.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Technology Stack](#technology-stack)
3. [Current Services](#current-services)
4. [Planned Services](#planned-services)
5. [Data Flow & Communication](#data-flow--communication)
6. [Security Architecture](#security-architecture)
7. [Shared Libraries](#shared-libraries)
8. [Development Workflow](#development-workflow)
9. [Deployment Strategy](#deployment-strategy)

## Architecture Overview

### High-Level Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Client Apps   │    │   Admin Panel   │    │  Partner APIs   │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
          ┌─────────────────────────────────────────────┐
          │            API Gateway                       │
          │     (Load Balancer, Rate Limiting,          │
          │      Authentication, Routing)               │
          └─────────────────┬───────────────────────────┘
                            │
    ┌───────────────────────┼───────────────────────┐
    │                       │                       │
    ▼                       ▼                       ▼
┌─────────┐          ┌─────────────┐        ┌─────────────┐
│  Auth   │          │ Warehouse   │        │  Inventory  │
│ Service │          │  Service    │        │   Service   │
└─────────┘          └─────────────┘        └─────────────┘
    │                       │                       │
    │                       │                       │
    ▼                       ▼                       ▼
┌─────────┐          ┌─────────────┐        ┌─────────────┐
│ Billing │          │ Shipping    │        │   Order     │
│ Service │          │  Service    │        │  Service    │
└─────────┘          └─────────────┘        └─────────────┘
    │                       │                       │
    └───────────────────────┼───────────────────────┘
                            │
              ┌─────────────────────────┐
              │    Shared Services      │
              │  - Database (Prisma)    │
              │  - Redis Cache          │
              │  - Email Service        │
              │  - Logging & Monitoring │
              └─────────────────────────┘
```

### Microservices Principles

- **Single Responsibility**: Each service handles a specific business domain
- **Autonomous Development**: Services can be developed, deployed, and scaled independently
- **Database Per Service**: Each service manages its own data store
- **API-First Design**: Well-defined REST APIs with comprehensive documentation
- **Event-Driven Architecture**: Services communicate through events for loose coupling

## Technology Stack

### Core Technologies

| Component | Technology | Version | Purpose |
|-----------|------------|---------|---------|
| **Runtime** | Node.js | Latest LTS | JavaScript runtime environment |
| **Framework** | Express.js | ^4.21.2 | Web application framework |
| **Language** | TypeScript | Latest | Type-safe JavaScript development |
| **Monorepo** | Nx | 21.5.2 | Development workflow and build system |
| **Database ORM** | Prisma | ^6.16.2 | Database toolkit and ORM |
| **Caching** | Redis (ioredis) | ^5.7.0 | In-memory data store for caching |
| **Authentication** | JWT | ^9.0.2 | Stateless authentication tokens |

### Middleware & Utilities

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Security** | Helmet | Security headers and protection |
| **CORS** | cors | Cross-origin resource sharing |
| **Rate Limiting** | express-rate-limit | API rate limiting |
| **Compression** | compression | Response compression |
| **Logging** | Winston | Structured logging |
| **Validation** | Zod | Schema validation |
| **Documentation** | Swagger/OpenAPI | API documentation |
| **Proxy** | express-http-proxy | API Gateway routing |
| **Email** | SendGrid | Email delivery service |

### Development Tools

| Tool | Purpose |
|------|---------|
| **ESLint** | Code linting and style enforcement |
| **Jest** | Unit and integration testing |
| **Docker** | Containerization |
| **TypeScript** | Static type checking |
| **Prettier** | Code formatting |

## Current Services

### 1. API Gateway
**Port**: 8080  
**Responsibility**: Central entry point for all client requests

#### Features:
- **Route Management**: Proxies requests to appropriate microservices
- **Security**: Helmet security headers, CORS configuration
- **Rate Limiting**: Configurable request throttling
- **Load Balancing**: Request distribution across service instances
- **Compression**: Response compression for better performance
- **Logging**: Request/response logging with Morgan
- **Health Monitoring**: Gateway health check endpoint

#### Configuration:
- Configurable CORS origins
- Environment-based security toggles
- Rate limiting: 100 requests per 15 minutes (configurable)
- JSON payload limit: 10MB (configurable)

### 2. Authentication Service
**Port**: 6001  
**Responsibility**: User authentication, authorization, and session management

#### Features:
- **User Registration**: With email verification via OTP
- **User Login**: Credential-based authentication
- **Password Management**: Forgot password, reset password workflows
- **JWT Token Management**: Access and refresh token generation
- **Session Management**: Session creation, validation, and invalidation
- **OTP System**: Email-based verification codes
- **Role-Based Access**: User role management
- **Security**: Password hashing with bcrypt

#### API Endpoints:
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/verify` - Email verification
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/forgot-password` - Initiate password reset
- `POST /api/v1/auth/verify-forgot-password` - Verify reset OTP
- `POST /api/v1/auth/reset-password` - Reset password
- `POST /api/v1/auth/refresh-token` - Refresh access token
- `POST /api/v1/auth/logout` - User logout
- `POST /api/v1/auth/resend-otp` - Resend verification OTP

## Planned Services

### 3. Warehouse Management Service
**Port**: 6002 (Planned)  
**Responsibility**: Physical warehouse operations and facility management

#### Features:
- Warehouse location management
- Storage zone configuration
- Facility capacity tracking
- Warehouse staff management
- Equipment and infrastructure tracking

### 4. Inventory Management Service
**Port**: 6003 (Planned)  
**Responsibility**: Stock tracking and inventory control

#### Features:
- Real-time inventory tracking
- Stock level monitoring
- Product catalog management
- Inventory adjustments
- Low stock alerts
- Batch and serial number tracking

### 5. Order Management Service
**Port**: 6004 (Planned)  
**Responsibility**: Order processing and fulfillment

#### Features:
- Order creation and validation
- Order status tracking
- Fulfillment workflow management
- Order modification and cancellation
- Integration with inventory and shipping

### 6. Shipping Service
**Port**: 6005 (Planned)  
**Responsibility**: Shipping and logistics coordination

#### Features:
- Carrier integration
- Shipping rate calculation
- Label generation
- Tracking integration
- Delivery scheduling
- Returns management

### 7. Billing Service
**Port**: 6006 (Planned)  
**Responsibility**: Financial operations and billing

#### Features:
- Invoice generation
- Payment processing
- Billing cycles management
- Tax calculations
- Financial reporting
- Credit management

### 8. Notification Service
**Port**: 6007 (Planned)  
**Responsibility**: Multi-channel communication

#### Features:
- Email notifications
- SMS alerts
- Push notifications
- Notification templates
- Delivery tracking
- Event-driven messaging

### 9. Analytics Service
**Port**: 6008 (Planned)  
**Responsibility**: Business intelligence and reporting

#### Features:
- Performance metrics
- Custom dashboards
- Data aggregation
- Trend analysis
- Operational insights
- Real-time monitoring

### 10. Integration Service
**Port**: 6009 (Planned)  
**Responsibility**: Third-party system integrations

#### Features:
- ERP system connections
- E-commerce platform APIs
- Carrier API integrations
- Webhook management
- Data synchronization
- Legacy system bridges

## Data Flow & Communication

### Request Flow
1. **Client Request**: Client applications send requests to the API Gateway
2. **Gateway Processing**: API Gateway applies security, rate limiting, and logging
3. **Service Routing**: Gateway routes requests to appropriate microservices
4. **Service Processing**: Individual services process requests and interact with databases
5. **Response Assembly**: Services return responses through the gateway to clients

### Inter-Service Communication
- **Synchronous**: HTTP/REST APIs for real-time operations
- **Asynchronous**: Event-driven messaging for decoupled operations
- **Data Consistency**: Eventually consistent model with event sourcing
- **Service Discovery**: Static configuration with plans for dynamic discovery

### Event-Driven Patterns
```
Order Created → Inventory Reserved → Shipping Scheduled → Billing Generated
      ↓               ↓                    ↓                   ↓
   Email Sent    Stock Updated      Label Generated    Invoice Created
```

## Security Architecture

### Authentication & Authorization
- **JWT Tokens**: Stateless authentication with access and refresh tokens
- **Role-Based Access Control (RBAC)**: Fine-grained permission system
- **Session Management**: Secure session handling with Redis
- **Password Security**: bcrypt hashing with salting

### API Security
- **Rate Limiting**: Per-IP request throttling
- **CORS**: Configurable cross-origin policies
- **Helmet**: Security headers (CSP, HSTS, etc.)
- **Input Validation**: Zod schema validation
- **SQL Injection Protection**: Prisma ORM parameterized queries

### Infrastructure Security
- **Environment Variables**: Sensitive configuration management
- **HTTPS**: SSL/TLS encryption in production
- **Container Security**: Docker security best practices
- **Monitoring**: Security event logging and alerting

## Shared Libraries

### Error Handling (`packages/error-handler`)
- **Custom Error Classes**: Structured error handling
- **Global Error Middleware**: Centralized error processing
- **Validation Helpers**: Input validation utilities
- **Async Wrappers**: Error handling for async operations

### Database Layer (`packages/libs/prisma`)
- **Prisma Client**: Type-safe database client
- **Connection Management**: Optimized connection pooling
- **Migration System**: Database schema versioning
- **Global Instance**: Singleton pattern for client management

### Utilities (`packages/utils`)
- **JWT Helpers**: Token generation and validation
- **Session Helpers**: Session management utilities
- **Logger**: Centralized logging configuration
- **Email Templates**: Reusable email components
- **Async Handlers**: Common async operation patterns

### SendGrid Integration (`packages/libs/sendgrid`)
- **Email Service**: Transactional email delivery
- **Template Management**: Dynamic email templates
- **Delivery Tracking**: Email status monitoring

## Development Workflow

### Nx Workspace Benefits
- **Code Generation**: Automated service and library scaffolding
- **Dependency Graph**: Visual representation of service dependencies
- **Build Optimization**: Incremental builds and caching
- **Testing**: Integrated testing across all services
- **Linting**: Consistent code quality across the monorepo

### Development Commands
```bash
# Run all services in development
npm run dev

# Build specific service
nx build auth-service

# Test specific service
nx test auth-service

# Generate new service
nx generate @nx/express:app new-service

# Lint all projects
nx run-many --target=lint --all
```

### Service Development Pattern
1. **Service Generation**: Use Nx generators for consistent structure
2. **API Design**: Define OpenAPI/Swagger specifications
3. **Database Schema**: Design Prisma models and migrations
4. **Business Logic**: Implement service-specific functionality
5. **Testing**: Write comprehensive unit and integration tests
6. **Documentation**: Update API documentation and architecture docs

## Deployment Strategy

### Containerization
- **Docker**: Each service runs in its own container
- **Multi-stage Builds**: Optimized production images
- **Health Checks**: Container health monitoring
- **Resource Limits**: CPU and memory constraints

### Orchestration (Planned)
- **Kubernetes**: Container orchestration platform
- **Service Mesh**: Istio for inter-service communication
- **Load Balancing**: Horizontal pod autoscaling
- **Configuration Management**: ConfigMaps and Secrets

### CI/CD Pipeline (Planned)
- **Source Control**: Git-based workflow
- **Automated Testing**: Unit, integration, and e2e tests
- **Build Pipeline**: Automated Docker image building
- **Deployment**: Blue-green deployment strategy
- **Monitoring**: Application and infrastructure monitoring

### Environment Management
- **Development**: Local development with Docker Compose
- **Staging**: Production-like environment for testing
- **Production**: High-availability deployment with redundancy

## Monitoring & Observability

### Logging
- **Structured Logging**: JSON-formatted logs with Winston
- **Centralized Collection**: Log aggregation system
- **Request Tracing**: Request ID tracking across services
- **Error Tracking**: Comprehensive error logging and alerting

### Metrics (Planned)
- **Application Metrics**: Response times, error rates, throughput
- **Business Metrics**: Order processing, inventory levels, revenue
- **Infrastructure Metrics**: CPU, memory, disk usage
- **Custom Dashboards**: Service-specific monitoring views

### Health Monitoring
- **Health Checks**: Individual service health endpoints
- **Dependency Checks**: Database and external service monitoring
- **Uptime Monitoring**: Service availability tracking
- **Alerting**: Automated incident response

## Performance Considerations

### Scalability
- **Horizontal Scaling**: Multiple service instances
- **Database Scaling**: Read replicas and sharding strategies
- **Caching**: Redis for frequently accessed data
- **CDN**: Static asset delivery optimization

### Optimization
- **Response Compression**: Gzip compression for API responses
- **Database Indexing**: Optimized query performance
- **Connection Pooling**: Efficient database connections
- **Lazy Loading**: On-demand data fetching

## Data Management

### Database Strategy
- **Database per Service**: Isolated data stores
- **Prisma ORM**: Type-safe database operations
- **Migration Management**: Version-controlled schema changes
- **Backup Strategy**: Automated backup and recovery

### Data Consistency
- **Eventual Consistency**: Event-driven synchronization
- **Saga Pattern**: Distributed transaction management
- **Compensating Actions**: Rollback mechanisms
- **Event Sourcing**: Audit trail and state reconstruction

## Testing Strategy

### Testing Pyramid
- **Unit Tests**: Individual function and class testing
- **Integration Tests**: Service integration testing
- **Contract Tests**: API contract verification
- **End-to-End Tests**: Full workflow testing

### Test Environment
- **Test Databases**: Isolated test data
- **Mock Services**: External dependency mocking
- **Test Data Management**: Consistent test datasets
- **Automated Testing**: CI/CD integrated test execution

## Future Enhancements

### Short-term (3-6 months)
- Complete implementation of all planned services
- Service mesh implementation with Istio
- Comprehensive monitoring and alerting
- Performance optimization and caching

### Medium-term (6-12 months)
- Advanced analytics and reporting
- Mobile application support
- Machine learning integration
- Advanced workflow automation

### Long-term (12+ months)
- Multi-tenant architecture
- Global deployment and CDN
- Advanced AI/ML capabilities
- Blockchain integration for supply chain

## Conclusion

The Dark Full 3PL Platform represents a modern, scalable approach to logistics management systems. Built on proven technologies and following microservices best practices, it provides a solid foundation for growth and adaptation to changing business requirements.

The architecture's emphasis on modularity, security, and observability ensures that the platform can scale efficiently while maintaining high availability and performance standards. The use of Nx as a monorepo tool facilitates efficient development workflows and code sharing across services.

As the platform evolves, the modular architecture will enable rapid feature development and deployment while maintaining system stability and reliability.