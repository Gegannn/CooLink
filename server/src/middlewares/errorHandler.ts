import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { env } from '../config/env';

export const errorHandler = (
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let statusCode = 500;
  let message = 'An unexpected error occurred. Please try again.';

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  } else if ('code' in err && (err as { code: number }).code === 11000) {
    // Mongo duplicate key error
    statusCode = 409;
    message = 'A record with this unique field already exists.';
  }

  // Never leak internal stack traces or database errors in production
  if (statusCode === 500) {
    console.error('💥 Unhandled Exception:', err);
  }

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      statusCode,
      stack: env.NODE_ENV === 'development' ? err.stack : undefined,
    },
  });
};
