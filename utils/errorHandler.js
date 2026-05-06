export class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export const globalErrorHandler = (err, req, res, _next) => {
  err.statusCode = err.statusCode || 500;

  const response = {
    success: false,
    message: err.isOperational ? err.message : 'Internal server error',
  };

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    response.message = Object.values(err.errors)
      .map((e) => e.message)
      .join(', ');
    err.statusCode = 400;
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    response.message = `Duplicate value for ${field}`;
    err.statusCode = 409;
  }

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    response.message = `Invalid ${err.path}: ${err.value}`;
    err.statusCode = 400;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    response.message = 'Invalid token';
    err.statusCode = 401;
  }
  if (err.name === 'TokenExpiredError') {
    response.message = 'Token expired';
    err.statusCode = 401;
  }

  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  res.status(err.statusCode).json(response);
};

// Standard success response helper
export const sendResponse = (res, statusCode, data, message = 'Success') => {
  res.status(statusCode).json({ success: true, message, data });
};
