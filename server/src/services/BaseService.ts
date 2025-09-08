// Base service class for all business logic
import { ServiceResponse, ValidationError } from "@/types";

export abstract class BaseService<T> {
  protected abstract modelName: string;

  // Abstract methods that must be implemented by subclasses
  public abstract create(data: Partial<T>): Promise<ServiceResponse<T>>;
  public abstract findById(id: string): Promise<ServiceResponse<T>>;
  public abstract findAll(
    filters?: Record<string, any>
  ): Promise<ServiceResponse<T[]>>;
  public abstract update(
    id: string,
    data: Partial<T>
  ): Promise<ServiceResponse<T>>;
  public abstract delete(id: string): Promise<ServiceResponse<boolean>>;

  // Common utility methods
  protected createSuccessResponse<T>(
    data: T,
    message?: string
  ): ServiceResponse<T> {
    return {
      success: true,
      data,
      ...(message && { message }),
    };
  }

  protected createErrorResponse(
    error: string,
    validationErrors?: ValidationError[]
  ): ServiceResponse {
    return {
      success: false,
      error,
      ...(validationErrors && { validationErrors }),
    };
  }

  protected validateRequiredFields(
    data: Record<string, any>,
    requiredFields: string[]
  ): ValidationError[] {
    const errors: ValidationError[] = [];

    for (const field of requiredFields) {
      if (
        !data[field] ||
        (typeof data[field] === "string" && data[field].trim() === "")
      ) {
        errors.push({
          field,
          message: `${field} is required`,
          value: data[field],
        });
      }
    }

    return errors;
  }

  protected validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  protected sanitizeInput(input: string): string {
    return input.trim().replace(/[<>]/g, "");
  }

  protected generatePagination(page: number, limit: number, total: number) {
    const totalPages = Math.ceil(total / limit);
    return {
      page,
      limit,
      total,
      totalPages,
    };
  }
}
