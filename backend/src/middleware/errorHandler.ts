import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
}

export const errorHandler = (
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const statusCode = err.statusCode ?? 500;
  const message = err.message || 'Internal Server Error';

  if (process.env.NODE_ENV === 'development') {
    console.error(err.stack);
  } else {
    // Log message and code in production without leaking stack traces to clients
    console.error(`[${new Date().toISOString()}] ${statusCode} ${message}`);
  }

  res.status(statusCode).json({
    success: false,
    message: statusCode === 500 ? 'Internal Server Error' : message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
