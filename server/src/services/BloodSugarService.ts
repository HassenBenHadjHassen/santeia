// BloodSugarService for business logic
import { BloodSugarReadingRepository } from "@/repositories/BloodSugarReadingRepository";
import { AlertRepository } from "@/repositories/AlertRepository";
import { BloodSugarReading } from "@/models/BloodSugarReading";
import {
  CreateBloodSugarReadingRequest,
  BloodSugarStats,
  HbA1cEstimate,
  ReadingType,
  ServiceResponse,
} from "@/types";

export class BloodSugarService {
  private bloodSugarRepository: BloodSugarReadingRepository;
  private alertRepository: AlertRepository;

  constructor() {
    this.bloodSugarRepository = new BloodSugarReadingRepository();
    this.alertRepository = new AlertRepository();
  }

  public async createReading(
    userId: string,
    data: CreateBloodSugarReadingRequest
  ): Promise<ServiceResponse<BloodSugarReading>> {
    try {
      const reading = await this.bloodSugarRepository.create({
        userId,
        ...data,
      });

      // Check for alerts
      await this.checkForAlerts(reading);

      return {
        success: true,
        data: reading,
        message: "Blood sugar reading recorded successfully",
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to create blood sugar reading",
      };
    }
  }

  public async getReadingById(
    id: string
  ): Promise<ServiceResponse<BloodSugarReading>> {
    try {
      const reading = await this.bloodSugarRepository.findById(id);

      if (!reading) {
        return {
          success: false,
          error: "Blood sugar reading not found",
        };
      }

      return {
        success: true,
        data: reading,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to get blood sugar reading",
      };
    }
  }

  public async getReadingsByUser(
    userId: string,
    filters: any = {},
    pagination: any = {}
  ): Promise<ServiceResponse<BloodSugarReading[]>> {
    try {
      const readings = await this.bloodSugarRepository.findByUserId(
        userId,
        filters,
        pagination
      );

      return {
        success: true,
        data: readings,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to get blood sugar readings",
      };
    }
  }

  public async getReadingsByType(
    userId: string,
    readingType: ReadingType,
    pagination: any = {}
  ): Promise<ServiceResponse<BloodSugarReading[]>> {
    try {
      const readings = await this.bloodSugarRepository.findByReadingType(
        userId,
        readingType,
        pagination
      );

      return {
        success: true,
        data: readings,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to get blood sugar readings by type",
      };
    }
  }

  public async getReadingsByDateRange(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<ServiceResponse<BloodSugarReading[]>> {
    try {
      const readings = await this.bloodSugarRepository.findByDateRange(
        userId,
        startDate,
        endDate
      );

      return {
        success: true,
        data: readings,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to get blood sugar readings by date range",
      };
    }
  }

  public async getLatestReading(
    userId: string
  ): Promise<ServiceResponse<BloodSugarReading>> {
    try {
      const reading = await this.bloodSugarRepository.getLatestReading(userId);

      if (!reading) {
        return {
          success: false,
          error: "No blood sugar readings found",
        };
      }

      return {
        success: true,
        data: reading,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to get latest blood sugar reading",
      };
    }
  }

  public async getStats(
    userId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<ServiceResponse<BloodSugarStats>> {
    try {
      const stats = await this.bloodSugarRepository.getStats(
        userId,
        startDate,
        endDate
      );

      return {
        success: true,
        data: stats,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to get blood sugar statistics",
      };
    }
  }

  public async estimateHbA1c(
    userId: string,
    months: number = 3
  ): Promise<ServiceResponse<HbA1cEstimate>> {
    try {
      const estimate = await this.bloodSugarRepository.estimateHbA1c(
        userId,
        months
      );

      return {
        success: true,
        data: estimate,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to estimate HbA1c",
      };
    }
  }

  public async getReadingsByDay(
    userId: string,
    date: Date
  ): Promise<ServiceResponse<BloodSugarReading[]>> {
    try {
      const readings = await this.bloodSugarRepository.getReadingsByDay(
        userId,
        date
      );

      return {
        success: true,
        data: readings,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to get daily blood sugar readings",
      };
    }
  }

  public async getReadingsByWeek(
    userId: string,
    startDate: Date
  ): Promise<ServiceResponse<BloodSugarReading[]>> {
    try {
      const readings = await this.bloodSugarRepository.getReadingsByWeek(
        userId,
        startDate
      );

      return {
        success: true,
        data: readings,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to get weekly blood sugar readings",
      };
    }
  }

  public async getReadingsByMonth(
    userId: string,
    year: number,
    month: number
  ): Promise<ServiceResponse<BloodSugarReading[]>> {
    try {
      const readings = await this.bloodSugarRepository.getReadingsByMonth(
        userId,
        year,
        month
      );

      return {
        success: true,
        data: readings,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to get monthly blood sugar readings",
      };
    }
  }

  public async getHighReadings(
    userId: string,
    threshold: number = 180
  ): Promise<ServiceResponse<BloodSugarReading[]>> {
    try {
      const readings = await this.bloodSugarRepository.getHighReadings(
        userId,
        threshold
      );

      return {
        success: true,
        data: readings,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to get high blood sugar readings",
      };
    }
  }

  public async getLowReadings(
    userId: string,
    threshold: number = 70
  ): Promise<ServiceResponse<BloodSugarReading[]>> {
    try {
      const readings = await this.bloodSugarRepository.getLowReadings(
        userId,
        threshold
      );

      return {
        success: true,
        data: readings,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to get low blood sugar readings",
      };
    }
  }

  public async getInRangeReadings(
    userId: string,
    min: number = 70,
    max: number = 180
  ): Promise<ServiceResponse<BloodSugarReading[]>> {
    try {
      const readings = await this.bloodSugarRepository.getInRangeReadings(
        userId,
        min,
        max
      );

      return {
        success: true,
        data: readings,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to get in-range blood sugar readings",
      };
    }
  }

  public async updateReading(
    id: string,
    data: Partial<CreateBloodSugarReadingRequest>
  ): Promise<ServiceResponse<BloodSugarReading>> {
    try {
      const reading = await this.bloodSugarRepository.update(id, data);

      if (!reading) {
        return {
          success: false,
          error: "Blood sugar reading not found",
        };
      }

      // Check for alerts after update
      await this.checkForAlerts(reading);

      return {
        success: true,
        data: reading,
        message: "Blood sugar reading updated successfully",
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to update blood sugar reading",
      };
    }
  }

  public async deleteReading(id: string): Promise<ServiceResponse<boolean>> {
    try {
      const success = await this.bloodSugarRepository.delete(id);

      if (!success) {
        return {
          success: false,
          error: "Failed to delete blood sugar reading",
        };
      }

      return {
        success: true,
        data: true,
        message: "Blood sugar reading deleted successfully",
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to delete blood sugar reading",
      };
    }
  }

  private async checkForAlerts(reading: BloodSugarReading): Promise<void> {
    try {
      // Check for high blood sugar alert
      if (reading.isHigh()) {
        await this.alertRepository.createBloodSugarAlert(
          reading.userId,
          true,
          reading.value,
          { min: 70, max: 180 } // Default target range
        );
      }

      // Check for low blood sugar alert
      if (reading.isLow()) {
        await this.alertRepository.createBloodSugarAlert(
          reading.userId,
          false,
          reading.value,
          { min: 70, max: 180 } // Default target range
        );
      }
    } catch (error) {
      console.error("Failed to create blood sugar alert:", error);
    }
  }

  public async getReadingInsights(
    userId: string,
    days: number = 7
  ): Promise<
    ServiceResponse<{
      average: number;
      trend: "up" | "down" | "stable";
      inRangePercentage: number;
      highReadings: number;
      lowReadings: number;
      recommendations: string[];
    }>
  > {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const stats = await this.bloodSugarRepository.getStats(
        userId,
        startDate,
        endDate
      );
      const readings = await this.bloodSugarRepository.findByDateRange(
        userId,
        startDate,
        endDate
      );

      const highReadings = readings.filter((r) => r.isHigh()).length;
      const lowReadings = readings.filter((r) => r.isLow()).length;

      const recommendations: string[] = [];

      if (stats.inRange < 70) {
        recommendations.push(
          "Consider discussing your blood sugar management with your healthcare provider"
        );
      }

      if (stats.trend === "up") {
        recommendations.push(
          "Your blood sugar trend is increasing. Consider reviewing your meal planning and medication timing"
        );
      } else if (stats.trend === "down") {
        recommendations.push(
          "Your blood sugar trend is decreasing. Monitor for signs of hypoglycemia"
        );
      }

      if (highReadings > readings.length * 0.3) {
        recommendations.push(
          "You have many high readings. Consider adjusting your carbohydrate intake or medication"
        );
      }

      if (lowReadings > readings.length * 0.2) {
        recommendations.push(
          "You have several low readings. Consider adjusting your insulin or meal timing"
        );
      }

      return {
        success: true,
        data: {
          average: stats.average,
          trend: stats.trend,
          inRangePercentage: stats.inRange,
          highReadings,
          lowReadings,
          recommendations,
        },
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to get reading insights",
      };
    }
  }
}
