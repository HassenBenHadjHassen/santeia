// Global error handling middleware
import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "@/types";

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export class CustomError extends Error implements AppError {
  public statusCode: number;
  public isOperational: boolean;

  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  error: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let statusCode = error.statusCode || 500;
  let message = error.message || "Internal Server Error";

  // Handle specific error types
  if (error.name === "ValidationError") {
    statusCode = 400;
    message = "Validation Error";
  } else if (error.name === "CastError") {
    statusCode = 400;
    message = "Invalid ID format";
  } else if (error.name === "MongoError" && (error as any).code === 11000) {
    statusCode = 409;
    message = "Duplicate field value";
  }

  // Log error in development
  if (process.env.NODE_ENV === "development") {
    console.error("Error:", {
      message: error.message,
      stack: error.stack,
      statusCode,
      url: req.url,
      method: req.method,
    });
  }

  const response: ApiResponse = {
    success: false,
    error: message,
    statusCode,
  };

  res.status(statusCode).json(response);
};

export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const response: ApiResponse = {
    success: false,
    error: `Route ${req.originalUrl} not found`,
    statusCode: 404,
  };

  res.status(404).json(response);
};

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
