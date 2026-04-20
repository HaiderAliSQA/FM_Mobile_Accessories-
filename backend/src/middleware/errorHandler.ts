// backend/src/middleware/errorHandler.ts
import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export const createError = (
  message: string,
  statusCode: number = 500
): AppError => {
  const error: AppError = new Error(message);
  error.statusCode = statusCode;
  error.isOperational = true;
  return error;
};

const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const statusCode = err.statusCode ?? 500;
  const message = err.message ?? 'Internal Server Error';

  // Log error for server-side debugging
  if (process.env.NODE_ENV !== 'production') {
    console.error(`[ERROR] ${req.method} ${req.path} —`, {
      message,
      statusCode,
      stack: err.stack,
    });
  } else {
    // In production, only log non-operational errors
    if (!err.isOperational) {
      console.error(`[CRITICAL ERROR]`, err);
    }
  }

  // Handle specific Mongoose errors
  if (err.name === 'ValidationError') {
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      error: message,
    });
    return;
  }

  if (err.name === 'CastError') {
    res.status(400).json({
      success: false,
      message: 'Invalid ID format',
      error: 'The provided ID is not valid',
    });
    return;
  }

  // Handle MongoDB duplicate key error
  if ('code' in err && (err as NodeJS.ErrnoException).code === '11000') {
    res.status(409).json({
      success: false,
      message: 'Duplicate entry',
      error: 'A record with this value already exists',
    });
    return;
  }

  res.status(statusCode).json({
    success: false,
    message,
    error:
      process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};

export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found`,
  });
};

export default errorHandler;
