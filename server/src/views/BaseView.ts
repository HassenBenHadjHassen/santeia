// Base view class for response formatting
import { ApiResponse, PaginatedResponse } from "@/types";

export abstract class BaseView {
  // Abstract methods that must be implemented by subclasses
  public abstract formatSingle<T>(data: T): Record<string, any>;
  public abstract formatList<T>(data: T[]): Record<string, any>;

  // Common formatting methods
  protected formatTimestamp(date: Date): string {
    return date.toISOString();
  }

  protected formatPagination(page: number, limit: number, total: number) {
    return {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  protected sanitizeOutput(data: Record<string, any>): Record<string, any> {
    const sanitized: Record<string, any> = {};

    for (const [key, value] of Object.entries(data)) {
      if (typeof value === "string") {
        sanitized[key] = this.sanitizeString(value);
      } else if (value instanceof Date) {
        sanitized[key] = this.formatTimestamp(value);
      } else if (typeof value === "object" && value !== null) {
        sanitized[key] = this.sanitizeOutput(value);
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  private sanitizeString(str: string): string {
    return str.replace(/[<>]/g, "").trim();
  }

  // Common response builders
  protected buildSuccessResponse<T>(
    data: T,
    message?: string,
    statusCode: number = 200
  ): ApiResponse<T> {
    return {
      success: true,
      data,
      message,
      statusCode,
    };
  }

  protected buildErrorResponse(
    error: string,
    statusCode: number = 400
  ): ApiResponse {
    return {
      success: false,
      error,
      statusCode,
    };
  }

  protected buildPaginatedResponse<T>(
    data: T[],
    page: number,
    limit: number,
    total: number,
    message?: string
  ): PaginatedResponse<T> {
    return {
      success: true,
      data,
      message,
      statusCode: 200,
      pagination: this.formatPagination(page, limit, total),
    };
  }
}
