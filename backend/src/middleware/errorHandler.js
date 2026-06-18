const logger = require('../utils/logger');

const notFound = (req, res, next) => {
  const err = new Error(`Not Found - ${req.originalUrl}`);
  err.statusCode = 404;
  next(err);
};

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || err.status || 500;

  logger.error(`${statusCode} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
  if (err.stack && process.env.NODE_ENV !== 'production') {
    logger.error(err.stack);
  }

  res.status(statusCode).json({
    success: false,
    message: statusCode === 500 && process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
};

module.exports = { notFound, errorHandler };
