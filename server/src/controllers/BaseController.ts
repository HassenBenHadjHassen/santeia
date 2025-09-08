// Base controller class for all API controllers
import { Request, Response, NextFunction } from "express";
import { ApiResponse, ServiceResponse } from "@/types";

export abstract class BaseController {
  // Abstract methods that must be implemented by subclasses
  public abstract create(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void>;
  public abstract findById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void>;
  public abstract findAll(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void>;
  public abstract update(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void>;
  public abstract delete(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void>;

  // Common response methods
  protected sendSuccess<T>(
    res: Response,
    data: T,
    message?: string,
    statusCode: number = 200
  ): void {
    const response: ApiResponse<T> = {
      success: true,
      data,
      message,
      statusCode,
    };
    res.status(statusCode).json(response);
  }

  protected sendError(
    res: Response,
    error: string,
    statusCode: number = 400,
    validationErrors?: any[]
  ): void {
    const response: ApiResponse = {
      success: false,
      error,
      statusCode,
    };

    if (validationErrors) {
      response.error = validationErrors
        .map((err) => `${err.field}: ${err.message}`)
        .join(", ");
    }

    res.status(statusCode).json(response);
  }

  protected sendServiceResponse<T>(
    res: Response,
    serviceResponse: ServiceResponse<T>,
    successStatusCode: number = 200,
    errorStatusCode: number = 400
  ): void {
    if (serviceResponse.success) {
      this.sendSuccess(
        res,
        serviceResponse.data,
        serviceResponse.message,
        successStatusCode
      );
    } else {
      this.sendError(
        res,
        serviceResponse.error || "An error occurred",
        errorStatusCode,
        serviceResponse.validationErrors
      );
    }
  }

  // Common validation methods
  protected validateRequired(req: Request, fields: string[]): string[] {
    const missing: string[] = [];

    for (const field of fields) {
      if (
        !req.body[field] ||
        (typeof req.body[field] === "string" && req.body[field].trim() === "")
      ) {
        missing.push(field);
      }
    }

    return missing;
  }

  protected validateParams(req: Request, fields: string[]): string[] {
    const missing: string[] = [];

    for (const field of fields) {
      if (!req.params[field]) {
        missing.push(field);
      }
    }

    return missing;
  }

  protected validateQuery(req: Request, fields: string[]): string[] {
    const missing: string[] = [];

    for (const field of fields) {
      if (!req.query[field]) {
        missing.push(field);
      }
    }

    return missing;
  }

  // Error handling wrapper
  protected async handleRequest(
    req: Request,
    res: Response,
    next: NextFunction,
    handler: () => Promise<void>
  ): Promise<void> {
    try {
      await handler();
    } catch (error) {
      next(error);
    }
  }
}
