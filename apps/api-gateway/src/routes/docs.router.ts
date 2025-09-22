// Global Swagger Documentation Aggregator
import express, { Router } from 'express';
import swaggerUi from 'swagger-ui-express';
import axios from 'axios';

interface ServiceConfig {
  name: string;
  url: string;
  docsPath: string;
  version: string;
}

interface SwaggerSpec {
  openapi: string;
  info: {
    title: string;
    version: string;
    description?: string;
  };
  servers?: Array<{
    url: string;
    description?: string;
  }>;
  paths: Record<string, unknown>;
  components?: {
    schemas?: Record<string, unknown>;
    securitySchemes?: Record<string, unknown>;
  };
  tags?: Array<{ name: string; description?: string }>;
}

const docsRouter: Router = express.Router();

// Service configuration
const SERVICES: Record<string, ServiceConfig> = {
  'auth-service': {
    name: 'Authentication Service',
    url: process.env.AUTH_SERVICE_URL || 'http://localhost:6001',
    docsPath: '/api-docs/v1/swagger.json',
    version: '1.0.0',
  },
  'order-service': {
    name: 'Order Management Service', 
    url: process.env.ORDER_SERVICE_URL || 'http://localhost:6002',
    docsPath: '/api-docs/v1/swagger.json',
    version: '1.0.0',
  },
  'inventory-service': {
    name: 'Inventory Management Service',
    url: process.env.INVENTORY_SERVICE_URL || 'http://localhost:6003', 
    docsPath: '/api-docs/v1/swagger.json',
    version: '1.0.0',
  },
  'warehouse-service': {
    name: 'Warehouse Management Service',
    url: process.env.WAREHOUSE_SERVICE_URL || 'http://localhost:6004',
    docsPath: '/api-docs/v1/swagger.json', 
    version: '1.0.0',
  },
  'notification-service': {
    name: 'Notification Service',
    url: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:6005',
    docsPath: '/api-docs/v1/swagger.json',
    version: '1.0.0',
  },
};

// Cache for swagger specs
const specCache = new Map<string, { spec: SwaggerSpec; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Fetch Swagger specification from a service
 */
async function fetchServiceSpec(serviceName: string, serviceConfig: ServiceConfig): Promise<SwaggerSpec> {
  const cacheKey = serviceName;
  const cached = specCache.get(cacheKey);
  
  if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
    return cached.spec;
  }

  try {
    const response = await axios.get(`${serviceConfig.url}${serviceConfig.docsPath}`, {
      timeout: 5000,
      headers: {
        'Accept': 'application/json',
      },
    });

    const spec = response.data as SwaggerSpec;
    specCache.set(cacheKey, {
      spec,
      timestamp: Date.now(),
    });

    return spec;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Failed to fetch docs from ${serviceName}:`, errorMessage);
    
    // Return a placeholder spec if service is down
    return {
      openapi: '3.0.0',
      info: {
        title: serviceConfig.name,
        version: serviceConfig.version,
        description: `${serviceConfig.name} - Service unavailable`,
      },
      paths: {},
      components: {},
    };
  }
}

/**
 * Merge multiple OpenAPI specs into one
 */
function mergeSwaggerSpecs(specs: SwaggerSpec[]): SwaggerSpec {
  const mergedSpec: SwaggerSpec = {
    openapi: '3.0.0',
    info: {
      title: 'Dark Full 3PL Platform API',
      version: '1.0.0',
      description: 'Comprehensive API documentation for all microservices in the Dark Full 3PL Platform',
    },
    servers: [
      {
        url: 'http://localhost:8080',
        description: 'API Gateway - Development server',
      },
    ],
    paths: {},
    components: {
      schemas: {},
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT Authorization header using the Bearer scheme',
        },
      },
    },
    tags: [],
  };

  // Merge paths and components from each service
  for (const spec of specs) {
    if (!spec || !spec.paths) continue;

    // Merge paths with API Gateway prefix
    Object.entries(spec.paths).forEach(([path, pathItem]) => {
      // Add /api/v1 prefix to match API Gateway routing
      const gatewayPath = `/api/v1${path}`;
      mergedSpec.paths[gatewayPath] = pathItem;
    });

    // Merge components/schemas
    if (spec.components?.schemas) {
      Object.entries(spec.components.schemas).forEach(([name, schema]) => {
        if (mergedSpec.components && mergedSpec.components.schemas) {
          mergedSpec.components.schemas[name] = schema;
        }
      });
    }

    // Merge tags
    if (spec.tags && Array.isArray(spec.tags)) {
      spec.tags.forEach((tag) => {
        if (mergedSpec.tags && !mergedSpec.tags.find((t) => t.name === tag.name)) {
          mergedSpec.tags.push(tag);
        }
      });
    }
  }

  return mergedSpec;
}

/**
 * Generate aggregated Swagger JSON
 */
docsRouter.get('/swagger.json', async (req, res) => {
  try {
    const specs = await Promise.all(
      Object.entries(SERVICES).map(([serviceName, config]) =>
        fetchServiceSpec(serviceName, config)
      )
    );

    const mergedSpec = mergeSwaggerSpecs(specs);
    
    res.json(mergedSpec);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error generating aggregated docs:', errorMessage);
    res.status(500).json({
      error: 'Failed to generate API documentation',
      message: errorMessage,
    });
  }
});

/**
 * Serve Swagger UI for aggregated docs
 */
docsRouter.use('/', swaggerUi.serve);
docsRouter.get('/', swaggerUi.setup(null, {
  swaggerOptions: {
    url: '/docs/swagger.json',
    persistAuthorization: true,
    tryItOutEnabled: true,
    filter: true,
    displayRequestDuration: true,
  },
  customCss: `
    .swagger-ui .topbar { display: none; }
    .swagger-ui .info .title { color: #2563eb; }
    .swagger-ui .scheme-container { 
      background: #f8fafc; 
      border: 1px solid #e2e8f0; 
      padding: 10px; 
      margin: 20px 0; 
    }
  `,
  customSiteTitle: 'Dark Full 3PL Platform API Documentation',
}));

/**
 * Get service health and documentation status
 */
docsRouter.get('/status', async (req, res) => {
  const serviceStatus = await Promise.all(
    Object.entries(SERVICES).map(async ([serviceName, config]) => {
      try {
        await axios.get(`${config.url}/health`, {
          timeout: 3000,
        });
        
        return {
          service: serviceName,
          name: config.name,
          status: 'healthy',
          url: config.url,
          version: config.version,
          docsAvailable: true,
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return {
          service: serviceName,
          name: config.name,
          status: 'unhealthy',
          url: config.url,
          version: config.version,
          docsAvailable: false,
          error: errorMessage,
        };
      }
    })
  );

  res.json({
    title: 'Dark Full 3PL Platform - Service Status',
    timestamp: new Date().toISOString(),
    services: serviceStatus,
    totalServices: serviceStatus.length,
    healthyServices: serviceStatus.filter(s => s.status === 'healthy').length,
  });
});

/**
 * Individual service documentation endpoints
 */
Object.entries(SERVICES).forEach(([serviceName, config]) => {
  docsRouter.get(`/${serviceName}`, async (req, res) => {
    try {
      const spec = await fetchServiceSpec(serviceName, config);
      
      const swaggerHtml = swaggerUi.generateHTML(spec, {
        customSiteTitle: `${config.name} API Documentation`,
        customCss: `
          .swagger-ui .topbar { display: none; }
          .swagger-ui .info .title { color: #2563eb; }
        `,
      });
      
      res.send(swaggerHtml);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({
        error: `Failed to load documentation for ${serviceName}`,
        message: errorMessage,
      });
    }
  });

  docsRouter.get(`/${serviceName}/swagger.json`, async (req, res) => {
    try {
      const spec = await fetchServiceSpec(serviceName, config);
      res.json(spec);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({
        error: `Failed to load specification for ${serviceName}`,
        message: errorMessage,
      });
    }
  });
});

export default docsRouter;