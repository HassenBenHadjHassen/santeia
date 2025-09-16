// Base repository class for all database operations
import { PrismaClient } from "@prisma/client";
import { getPrismaClient } from "@/config/database";

export abstract class BaseRepository<T> {
  // Lazily resolve Prisma client to avoid requiring a DB connection at import time
  protected get prisma(): PrismaClient {
    return getPrismaClient();
  }

  // Abstract methods that must be implemented by subclasses
  public abstract create(data: Partial<T>): Promise<T>;
  public abstract findById(id: string): Promise<T | null>;
  public abstract findAll(filters?: Record<string, any>): Promise<T[]>;
  public abstract update(id: string, data: Partial<T>): Promise<T | null>;
  public abstract delete(id: string): Promise<boolean>;

  // Common utility methods
  protected async handleDatabaseOperation<TResult>(
    operation: () => Promise<TResult>
  ): Promise<TResult> {
    try {
      return await operation();
    } catch (error) {
      console.error("Database operation failed:", error);
      throw error;
    }
  }

  protected buildWhereClause(filters: Record<string, any>): any {
    const where: any = {};

    for (const [key, value] of Object.entries(filters)) {
      if (value !== undefined && value !== null) {
        if (key === "search" && typeof value === "string") {
          // Handle search functionality - to be implemented by subclasses
          where.OR = this.buildSearchClause(value);
        } else if (key === "isActive" && typeof value === "boolean") {
          where.isActive = value;
        } else if (key === "role" && typeof value === "string") {
          where.role = value;
        } else if (key === "userId" && typeof value === "string") {
          where.userId = value;
        } else if (key === "conversationId" && typeof value === "string") {
          where.conversationId = value;
        } else {
          where[key] = value;
        }
      }
    }

    return where;
  }

  protected buildSearchClause(searchTerm: string): any[] {
    // Default search implementation - can be overridden by subclasses
    return [
      { name: { contains: searchTerm, mode: "insensitive" } },
      { email: { contains: searchTerm, mode: "insensitive" } },
    ];
  }

  protected buildPaginationOptions(
    page: number = 1,
    limit: number = 10
  ): { skip: number; take: number } {
    return {
      skip: (page - 1) * limit,
      take: limit,
    };
  }

  protected buildOrderByClause(
    sortBy?: string,
    sortOrder: "asc" | "desc" = "desc"
  ): any {
    if (!sortBy) {
      return { createdAt: sortOrder };
    }

    return { [sortBy]: sortOrder };
  }
}
