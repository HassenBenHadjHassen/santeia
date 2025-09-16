// Meal Service - Handles meal tracking operations
import { ApiClient } from "../client";
import type { RequestConfig, ServiceResponse } from "../types";

export interface Meal {
  id: string;
  userId: string;
  name: string;
  description?: string;
  calories?: number;
  carbohydrates?: number;
  proteins?: number;
  fats?: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  timestamp: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateMealRequest {
  name: string;
  description?: string;
  calories?: number;
  carbohydrates?: number;
  proteins?: number;
  fats?: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  timestamp?: Date;
  notes?: string;
}

export interface UpdateMealRequest {
  name?: string;
  description?: string;
  calories?: number;
  carbohydrates?: number;
  proteins?: number;
  fats?: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  mealType?: "breakfast" | "lunch" | "dinner" | "snack";
  timestamp?: Date;
  notes?: string;
}

export interface MealFilters {
  mealType?: string;
  startDate?: Date;
  endDate?: Date;
  minCalories?: number;
  maxCalories?: number;
}

export class MealService {
  constructor(private client: ApiClient) {}

  // Create a new meal
  async createMeal(
    data: CreateMealRequest,
    token: string,
    config?: RequestConfig
  ): Promise<ServiceResponse<Meal>> {
    return this.client.post("/meals", data, {
      ...config,
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  // Get meal by ID
  async getMealById(
    id: string,
    token: string,
    config?: RequestConfig
  ): Promise<ServiceResponse<Meal>> {
    return this.client.get(`/meals/${id}`, {
      ...config,
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  // Get all meals for user
  async getMeals(
    filters: MealFilters = {},
    pagination: any = {},
    token: string,
    config?: RequestConfig
  ): Promise<ServiceResponse<Meal[]>> {
    const params = new URLSearchParams();

    if (filters.mealType) params.append("mealType", filters.mealType);
    if (filters.startDate)
      params.append("startDate", filters.startDate.toISOString());
    if (filters.endDate)
      params.append("endDate", filters.endDate.toISOString());
    if (filters.minCalories !== undefined)
      params.append("minCalories", filters.minCalories.toString());
    if (filters.maxCalories !== undefined)
      params.append("maxCalories", filters.maxCalories.toString());

    // Add pagination params
    if (pagination.page) params.append("page", pagination.page.toString());
    if (pagination.limit) params.append("limit", pagination.limit.toString());
    if (pagination.sortBy) params.append("sortBy", pagination.sortBy);
    if (pagination.sortOrder) params.append("sortOrder", pagination.sortOrder);

    const queryString = params.toString();
    const url = queryString ? `/meals?${queryString}` : "/meals";

    return this.client.get(url, {
      ...config,
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  // Update meal
  async updateMeal(
    id: string,
    data: UpdateMealRequest,
    token: string,
    config?: RequestConfig
  ): Promise<ServiceResponse<Meal>> {
    return this.client.put(`/meals/${id}`, data, {
      ...config,
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  // Delete meal
  async deleteMeal(
    id: string,
    token: string,
    config?: RequestConfig
  ): Promise<ServiceResponse<boolean>> {
    return this.client.delete(`/meals/${id}`, {
      ...config,
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  // Get meal statistics
  async getStatistics(
    filters: MealFilters = {},
    token: string,
    config?: RequestConfig
  ): Promise<
    ServiceResponse<{
      totalCalories: number;
      averageCalories: number;
      totalMeals: number;
      byMealType: Array<{ mealType: string; count: number; calories: number }>;
      trends: Array<{ date: string; calories: number; count: number }>;
    }>
  > {
    const params = new URLSearchParams();

    if (filters.mealType) params.append("mealType", filters.mealType);
    if (filters.startDate)
      params.append("startDate", filters.startDate.toISOString());
    if (filters.endDate)
      params.append("endDate", filters.endDate.toISOString());
    if (filters.minCalories !== undefined)
      params.append("minCalories", filters.minCalories.toString());
    if (filters.maxCalories !== undefined)
      params.append("maxCalories", filters.maxCalories.toString());

    const queryString = params.toString();
    const url = queryString
      ? `/meals/statistics?${queryString}`
      : "/meals/statistics";

    return this.client.get(url, {
      ...config,
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  // Health check
  async healthCheck(
    config?: RequestConfig
  ): Promise<ServiceResponse<{ status: string; timestamp: string }>> {
    return this.client.get("/health", config);
  }
}
