// Swagger configuration for express-jsdoc-swagger

export const getSwaggerOptions = (BASE_URL: string, baseDir: string) => ({
  info: {
    version: '1.0.0',
    title: 'Auth Service API',
    description: 'API documentation for Auth Service',
  },
  security: {
    BearerAuth: {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
    },
  },
  servers: [
    {
      url: `${BASE_URL}`,
      description: 'Development server',
    },
  ],
  baseDir: baseDir,
  filesPattern: ['./routes/v1/*.{ts,js}'], // scans all .ts and .js routes
  swaggerUIPath: '/api-docs/v1',
  exposeSwaggerUI: true,
  exposeApiDocs: false,
  notRequiredAsNullable: false,
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Auth Service API',
      version: '1.0.0',
      description: 'API documentation for Auth Service',
    },
    servers: [
      {
        url: `${BASE_URL}`,
        description: 'Development server',
      },
    ],
  },
});
