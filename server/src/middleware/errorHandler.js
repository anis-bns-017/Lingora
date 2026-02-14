import createError from 'http-errors';

// Error handler middleware
export const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error for development
  console.error(err);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = createError(404, message);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    const message = `Duplicate field value: ${field}. Please use another value`;
    error = createError(400, message);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = createError(400, message);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token. Please log in again';
    error = createError(401, message);
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Your token has expired. Please log in again';
    error = createError(401, message);
  }

  // Send response
  res.status(error.status || 500).json({
    success: false,
    error: {
      message: error.message || 'Server Error',
      status: error.status || 500,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
};

// Not found middleware (404 handler)
export const notFound = (req, res, next) => {
  const error = createError(404, `Not Found - ${req.originalUrl}`);
  next(error);
};

// Async handler wrapper to avoid try-catch blocks
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};