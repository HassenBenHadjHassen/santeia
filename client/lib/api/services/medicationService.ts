// Medication Service - Handles medication management operations
import { ApiClient } from "../client";
import type { RequestConfig, ServiceResponse } from "../types";

export interface Medication {
  id: string;
  userId: string;
  name: string;
  type: "oral" | "injection" | "inhaler" | "topical" | "other";
  dosage: string;
  unit: "mg" | "g" | "ml" | "units" | "pills";
  frequency: "daily" | "weekly" | "monthly" | "as_needed";
  timesPerDay?: number;
  specificTimes?: string[]; // Array of time strings in HH:MM format
  startDate: Date;
  endDate?: Date;
  instructions?: string;
  sideEffects?: string;
  notes?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface MedicationDose {
  id: string;
  medicationId: string;
  userId: string;
  dosage: string;
  unit: string;
  takenAt: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateMedicationRequest {
  name: string;
  type: "oral" | "injection" | "inhaler" | "topical" | "other";
  dosage: string;
  unit: "mg" | "g" | "ml" | "units" | "pills";
  frequency: "daily" | "weekly" | "monthly" | "as_needed";
  timesPerDay?: number;
  specificTimes?: string[];
  startDate: Date;
  endDate?: Date;
  instructions?: string;
  sideEffects?: string;
  notes?: string;
}

export interface UpdateMedicationRequest {
  name?: string;
  type?: "oral" | "injection" | "inhaler" | "topical" | "other";
  dosage?: string;
  unit?: "mg" | "g" | "ml" | "units" | "pills";
  frequency?: "daily" | "weekly" | "monthly" | "as_needed";
  timesPerDay?: number;
  specificTimes?: string[];
  startDate?: Date;
  endDate?: Date;
  instructions?: string;
  sideEffects?: string;
  notes?: string;
  isActive?: boolean;
}

export interface CreateDoseRequest {
  medicationId: string;
  dosage: string;
  unit: string;
  takenAt?: Date;
  notes?: string;
}

export interface MedicationFilters {
  type?: string;
  frequency?: string;
  isActive?: boolean;
  startDate?: Date;
  endDate?: Date;
}

export class MedicationService {
  constructor(private client: ApiClient) {}

  // Create a new medication
  async createMedication(
    data: CreateMedicationRequest,
    token: string,
    config?: RequestConfig
  ): Promise<ServiceResponse<Medication>> {
    return this.client.post("/medications", data, {
      ...config,
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  // Get medication by ID
  async getMedicationById(
    id: string,
    token: string,
    config?: RequestConfig
  ): Promise<ServiceResponse<Medication>> {
    return this.client.get(`/medications/${id}`, {
      ...config,
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  // Get all medications for user
  async getMedications(
    filters: MedicationFilters = {},
    pagination: any = {},
    token: string,
    config?: RequestConfig
  ): Promise<ServiceResponse<Medication[]>> {
    const params = new URLSearchParams();

    if (filters.type) params.append("type", filters.type);
    if (filters.frequency) params.append("frequency", filters.frequency);
    if (filters.isActive !== undefined)
      params.append("isActive", filters.isActive.toString());
    if (filters.startDate)
      params.append("startDate", filters.startDate.toISOString());
    if (filters.endDate)
      params.append("endDate", filters.endDate.toISOString());

    // Add pagination params
    if (pagination.page) params.append("page", pagination.page.toString());
    if (pagination.limit) params.append("limit", pagination.limit.toString());
    if (pagination.sortBy) params.append("sortBy", pagination.sortBy);
    if (pagination.sortOrder) params.append("sortOrder", pagination.sortOrder);

    const queryString = params.toString();
    const url = queryString ? `/medications?${queryString}` : "/medications";

    return this.client.get(url, {
      ...config,
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  // Update medication
  async updateMedication(
    id: string,
    data: UpdateMedicationRequest,
    token: string,
    config?: RequestConfig
  ): Promise<ServiceResponse<Medication>> {
    return this.client.put(`/medications/${id}`, data, {
      ...config,
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  // Delete medication
  async deleteMedication(
    id: string,
    token: string,
    config?: RequestConfig
  ): Promise<ServiceResponse<boolean>> {
    return this.client.delete(`/medications/${id}`, {
      ...config,
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  // Log a medication dose
  async logDose(
    data: CreateDoseRequest,
    token: string,
    config?: RequestConfig
  ): Promise<ServiceResponse<MedicationDose>> {
    return this.client.post("/medications/doses", data, {
      ...config,
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  // Get medication doses
  async getDoses(
    medicationId?: string,
    filters: { startDate?: Date; endDate?: Date } = {},
    pagination: any = {},
    token: string,
    config?: RequestConfig
  ): Promise<ServiceResponse<MedicationDose[]>> {
    const params = new URLSearchParams();

    if (medicationId) params.append("medicationId", medicationId);
    if (filters.startDate)
      params.append("startDate", filters.startDate.toISOString());
    if (filters.endDate)
      params.append("endDate", filters.endDate.toISOString());

    // Add pagination params
    if (pagination.page) params.append("page", pagination.page.toString());
    if (pagination.limit) params.append("limit", pagination.limit.toString());
    if (pagination.sortBy) params.append("sortBy", pagination.sortBy);
    if (pagination.sortOrder) params.append("sortOrder", pagination.sortOrder);

    const queryString = params.toString();
    const url = queryString
      ? `/medications/doses?${queryString}`
      : "/medications/doses";

    return this.client.get(url, {
      ...config,
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  // Get medication statistics
  async getStatistics(
    filters: MedicationFilters = {},
    token: string,
    config?: RequestConfig
  ): Promise<
    ServiceResponse<{
      totalMedications: number;
      activeMedications: number;
      inactiveMedications: number;
      byType: Array<{ type: string; count: number }>;
      byFrequency: Array<{ frequency: string; count: number }>;
      adherenceRate: number;
      recentDoses: Array<{
        medicationName: string;
        takenAt: Date;
        dosage: string;
      }>;
    }>
  > {
    const params = new URLSearchParams();

    if (filters.type) params.append("type", filters.type);
    if (filters.frequency) params.append("frequency", filters.frequency);
    if (filters.isActive !== undefined)
      params.append("isActive", filters.isActive.toString());
    if (filters.startDate)
      params.append("startDate", filters.startDate.toISOString());
    if (filters.endDate)
      params.append("endDate", filters.endDate.toISOString());

    const queryString = params.toString();
    const url = queryString
      ? `/medications/statistics?${queryString}`
      : "/medications/statistics";

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
