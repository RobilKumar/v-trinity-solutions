/**
 * server.js — Express application entry point.
 * Bootstraps middleware, Swagger docs, API routes, and starts the HTTP server.
 */

require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const fs = require('fs');

const { notFound, errorHandler } = require('./middleware/errorHandler');
const routes = require('./routes');
const logger = require('./utils/logger');

// Create upload directories if they don't exist on first boot
['logs', 'uploads/images', 'uploads/documents', 'uploads/videos', 'uploads/misc'].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const app = express();

// Required when running behind Nginx reverse proxy so express-rate-limit
// reads the real client IP from X-Forwarded-For instead of the proxy IP
app.set('trust proxy', 1);

// Helmet sets secure HTTP response headers (XSS, clickjacking, etc.)
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }, // allow images to load cross-origin
  contentSecurityPolicy: false, // disabled — handled by Nginx
}));

// CORS — allow requests from the configured frontend origin (supports Vercel preview URLs)
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:3000',
  /^https:\/\/.*\.vercel\.app$/,
];
app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true); // allow server-to-server or curl
    const allowed = allowedOrigins.some(o => (o instanceof RegExp ? o.test(origin) : o === origin));
    cb(allowed ? null : new Error('CORS blocked'), allowed);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Compress all responses to reduce bandwidth
app.use(compression());

// Parse JSON and URL-encoded request bodies (up to 10 MB for file metadata)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// HTTP request logging via Morgan, output piped to Winston logger
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined', {
    stream: { write: msg => logger.info(msg.trim()) },
  }));
}

// Global rate limiter — 500 requests per 15 min per IP across all /api/* routes.
// validate.xForwardedForHeader:false suppresses ERR_ERL_UNEXPECTED_X_FORWARDED_FOR
// warning that fires when trust proxy is enabled.
app.use('/api/', rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX) || 500,
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false },
  message: { success: false, message: 'Too many requests' },
}));

// Serve uploaded files as static assets with 7-day browser cache
app.use('/uploads', express.static(path.resolve(process.env.UPLOAD_PATH || './uploads'), {
  maxAge: '7d',
  etag: true,
}));

// Swagger / OpenAPI interactive documentation at /api-docs
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'V-Trinity Solutions API',
      version: '1.0.0',
      description: 'Complete REST API for V-Trinity Solutions CMS',
    },
    servers: [{ url: `http://localhost:${process.env.PORT || 5000}/api` }],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/routes/*.js'], // JSDoc @swagger annotations in route files
};

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerJsdoc(swaggerOptions)));

// Lightweight health-check endpoint used by Docker HEALTHCHECK and load balancers
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), version: '1.0.0' });
});

// Mount all versioned API routes under /api
app.use('/api', routes);

// 404 handler — catches any request that didn't match a route above
app.use(notFound);

// Global error handler — formats and logs unhandled errors
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);
  logger.info(`📚 API docs available at http://localhost:${PORT}/api-docs`);
  logger.info(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;

