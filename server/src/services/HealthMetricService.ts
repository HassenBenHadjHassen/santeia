// HealthMetricService for business logic
import { HealthMetricRepository } from "@/repositories/HealthMetricRepository";
import { HealthMetric } from "@/models/HealthMetric";
import {
  CreateHealthMetricRequest,
  MetricType,
  ServiceResponse,
} from "@/types";

export class HealthMetricService {
  private healthMetricRepository: HealthMetricRepository;

  constructor() {
    this.healthMetricRepository = new HealthMetricRepository();
  }

  public async createMetric(
    userId: string,
    data: CreateHealthMetricRequest
  ): Promise<ServiceResponse<HealthMetric>> {
    try {
      const metric = await this.healthMetricRepository.create({
        userId,
        ...data,
      });

      return {
        success: true,
        data: metric,
        message: "Health metric recorded successfully",
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to create health metric",
      };
    }
  }

  public async getMetricById(
    id: string
  ): Promise<ServiceResponse<HealthMetric>> {
    try {
      const metric = await this.healthMetricRepository.findById(id);

      if (!metric) {
        return {
          success: false,
          error: "Health metric not found",
        };
      }

      return {
        success: true,
        data: metric,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to get health metric",
      };
    }
  }

  public async getMetricsByUser(
    userId: string,
    filters: any = {},
    pagination: any = {}
  ): Promise<ServiceResponse<HealthMetric[]>> {
    try {
      const metrics = await this.healthMetricRepository.findByUserId(
        userId,
        filters,
        pagination
      );

      return {
        success: true,
        data: metrics,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to get health metrics",
      };
    }
  }

  public async getMetricsByType(
    userId: string,
    metricType: MetricType
  ): Promise<ServiceResponse<HealthMetric[]>> {
    try {
      const metrics = await this.healthMetricRepository.findByMetricType(
        userId,
        metricType
      );

      return {
        success: true,
        data: metrics,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to get metrics by type",
      };
    }
  }

  public async getLatestMetric(
    userId: string,
    metricType: MetricType
  ): Promise<ServiceResponse<HealthMetric>> {
    try {
      const metric = await this.healthMetricRepository.getLatestMetric(
        userId,
        metricType
      );

      if (!metric) {
        return {
          success: false,
          error: "No health metric found for this type",
        };
      }

      return {
        success: true,
        data: metric,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to get latest metric",
      };
    }
  }

  public async getMetricsByDateRange(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<ServiceResponse<HealthMetric[]>> {
    try {
      const metrics = await this.healthMetricRepository.findByDateRange(
        userId,
        startDate,
        endDate
      );

      return {
        success: true,
        data: metrics,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to get metrics by date range",
      };
    }
  }

  public async getMetricsByDay(
    userId: string,
    date: Date
  ): Promise<ServiceResponse<HealthMetric[]>> {
    try {
      const metrics = await this.healthMetricRepository.getMetricsByDay(
        userId,
        date
      );

      return {
        success: true,
        data: metrics,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to get daily metrics",
      };
    }
  }

  public async getWeightHistory(
    userId: string,
    days: number = 30
  ): Promise<ServiceResponse<HealthMetric[]>> {
    try {
      const metrics = await this.healthMetricRepository.getWeightHistory(
        userId,
        days
      );

      return {
        success: true,
        data: metrics,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to get weight history",
      };
    }
  }

  public async getBloodPressureHistory(
    userId: string,
    days: number = 30
  ): Promise<
    ServiceResponse<{
      systolic: HealthMetric[];
      diastolic: HealthMetric[];
    }>
  > {
    try {
      const history = await this.healthMetricRepository.getBloodPressureHistory(
        userId,
        days
      );

      return {
        success: true,
        data: history,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to get blood pressure history",
      };
    }
  }

  public async getCholesterolHistory(
    userId: string,
    days: number = 90
  ): Promise<
    ServiceResponse<{
      total: HealthMetric[];
      hdl: HealthMetric[];
      ldl: HealthMetric[];
      triglycerides: HealthMetric[];
    }>
  > {
    try {
      const history = await this.healthMetricRepository.getCholesterolHistory(
        userId,
        days
      );

      return {
        success: true,
        data: history,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to get cholesterol history",
      };
    }
  }

  public async getHeartRateHistory(
    userId: string,
    days: number = 30
  ): Promise<ServiceResponse<HealthMetric[]>> {
    try {
      const metrics = await this.healthMetricRepository.getHeartRateHistory(
        userId,
        days
      );

      return {
        success: true,
        data: metrics,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to get heart rate history",
      };
    }
  }

  public async getBMITrend(
    userId: string,
    days: number = 30
  ): Promise<ServiceResponse<HealthMetric[]>> {
    try {
      const metrics = await this.healthMetricRepository.getBMITrend(
        userId,
        days
      );

      return {
        success: true,
        data: metrics,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to get BMI trend",
      };
    }
  }

  public async getMetricStats(
    userId: string,
    metricType: MetricType,
    days: number = 30
  ): Promise<
    ServiceResponse<{
      average: number;
      min: number;
      max: number;
      count: number;
      trend: "up" | "down" | "stable";
      latest: HealthMetric | null;
    }>
  > {
    try {
      const stats = await this.healthMetricRepository.getMetricStats(
        userId,
        metricType,
        days
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
            : "Failed to get metric statistics",
      };
    }
  }

  public async getMetricsRequiringAttention(
    userId: string
  ): Promise<ServiceResponse<HealthMetric[]>> {
    try {
      const metrics =
        await this.healthMetricRepository.getMetricsRequiringAttention(userId);

      return {
        success: true,
        data: metrics,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to get metrics requiring attention",
      };
    }
  }

  public async getNormalRangeMetrics(
    userId: string
  ): Promise<ServiceResponse<HealthMetric[]>> {
    try {
      const metrics = await this.healthMetricRepository.getNormalRangeMetrics(
        userId
      );

      return {
        success: true,
        data: metrics,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to get normal range metrics",
      };
    }
  }

  public async getMetricCategories(userId: string): Promise<
    ServiceResponse<{
      weight: HealthMetric[];
      bloodPressure: HealthMetric[];
      cholesterol: HealthMetric[];
      heartRate: HealthMetric[];
      bmi: HealthMetric[];
    }>
  > {
    try {
      const categories = await this.healthMetricRepository.getMetricCategories(
        userId
      );

      return {
        success: true,
        data: categories,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to get metric categories",
      };
    }
  }

  public async getRecentMetrics(
    userId: string,
    limit: number = 10
  ): Promise<ServiceResponse<HealthMetric[]>> {
    try {
      const metrics = await this.healthMetricRepository.getRecentMetrics(
        userId,
        limit
      );

      return {
        success: true,
        data: metrics,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to get recent metrics",
      };
    }
  }

  public async searchMetrics(
    userId: string,
    query: string
  ): Promise<ServiceResponse<HealthMetric[]>> {
    try {
      const metrics = await this.healthMetricRepository.searchMetrics(
        userId,
        query
      );

      return {
        success: true,
        data: metrics,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to search metrics",
      };
    }
  }

  public async getMetricSummary(userId: string): Promise<
    ServiceResponse<{
      totalMetrics: number;
      weightCount: number;
      bloodPressureCount: number;
      cholesterolCount: number;
      heartRateCount: number;
      bmiCount: number;
      requiringAttention: number;
      latestWeight: HealthMetric | null;
      latestBloodPressure: {
        systolic: HealthMetric | null;
        diastolic: HealthMetric | null;
      };
    }>
  > {
    try {
      const summary = await this.healthMetricRepository.getMetricSummary(
        userId
      );

      return {
        success: true,
        data: summary,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to get metric summary",
      };
    }
  }

  public async updateMetric(
    id: string,
    data: Partial<CreateHealthMetricRequest>
  ): Promise<ServiceResponse<HealthMetric>> {
    try {
      const metric = await this.healthMetricRepository.update(id, data);

      if (!metric) {
        return {
          success: false,
          error: "Health metric not found",
        };
      }

      return {
        success: true,
        data: metric,
        message: "Health metric updated successfully",
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to update health metric",
      };
    }
  }

  public async deleteMetric(id: string): Promise<ServiceResponse<boolean>> {
    try {
      const success = await this.healthMetricRepository.delete(id);

      if (!success) {
        return {
          success: false,
          error: "Failed to delete health metric",
        };
      }

      return {
        success: true,
        data: true,
        message: "Health metric deleted successfully",
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to delete health metric",
      };
    }
  }

  public async getHealthInsights(
    userId: string,
    days: number = 30
  ): Promise<
    ServiceResponse<{
      weightTrend: "up" | "down" | "stable";
      bloodPressureStatus: "normal" | "elevated" | "high";
      cholesterolStatus: "normal" | "elevated" | "high";
      heartRateStatus: "normal" | "elevated" | "high";
      bmiStatus: "underweight" | "normal" | "overweight" | "obese";
      metricsRequiringAttention: number;
      recommendations: string[];
    }>
  > {
    try {
      const [
        weightStats,
        bloodPressureHistory,
        cholesterolHistory,
        heartRateStats,
        bmiStats,
        metricsRequiringAttention,
      ] = await Promise.all([
        this.healthMetricRepository.getMetricStats(userId, "WEIGHT", days),
        this.healthMetricRepository.getBloodPressureHistory(userId, days),
        this.healthMetricRepository.getCholesterolHistory(userId, days),
        this.healthMetricRepository.getMetricStats(userId, "HEART_RATE", days),
        this.healthMetricRepository.getMetricStats(userId, "BMI", days),
        this.healthMetricRepository.getMetricsRequiringAttention(userId),
      ]);

      const recommendations: string[] = [];

      // Weight recommendations
      if (weightStats.trend === "up") {
        recommendations.push(
          "Consider increasing physical activity and monitoring portion sizes"
        );
      } else if (weightStats.trend === "down") {
        recommendations.push(
          "Monitor your weight loss to ensure it's healthy and sustainable"
        );
      }

      // Blood pressure recommendations
      const latestSystolic =
        bloodPressureHistory.systolic[bloodPressureHistory.systolic.length - 1];
      const latestDiastolic =
        bloodPressureHistory.diastolic[
          bloodPressureHistory.diastolic.length - 1
        ];

      if (latestSystolic && latestSystolic.value >= 140) {
        recommendations.push(
          "Your blood pressure is high. Consider reducing sodium intake and increasing physical activity"
        );
      } else if (latestSystolic && latestSystolic.value >= 130) {
        recommendations.push(
          "Your blood pressure is elevated. Monitor it regularly and consider lifestyle changes"
        );
      }

      // Cholesterol recommendations
      const latestTotalCholesterol =
        cholesterolHistory.total[cholesterolHistory.total.length - 1];
      if (latestTotalCholesterol && latestTotalCholesterol.value >= 240) {
        recommendations.push(
          "Your cholesterol is high. Consider reducing saturated fat intake and increasing fiber"
        );
      }

      // Heart rate recommendations
      if (heartRateStats.latest && heartRateStats.latest.value >= 100) {
        recommendations.push(
          "Your resting heart rate is elevated. Consider stress management and regular exercise"
        );
      }

      // BMI recommendations
      if (bmiStats.latest) {
        if (bmiStats.latest.value < 18.5) {
          recommendations.push(
            "Your BMI suggests you may be underweight. Consider consulting with a healthcare provider"
          );
        } else if (bmiStats.latest.value >= 30) {
          recommendations.push(
            "Your BMI suggests obesity. Consider a comprehensive weight management plan"
          );
        } else if (bmiStats.latest.value >= 25) {
          recommendations.push(
            "Your BMI suggests overweight. Consider lifestyle changes for better health"
          );
        }
      }

      if (metricsRequiringAttention.length > 0) {
        recommendations.push(
          `You have ${metricsRequiringAttention.length} health metrics that require attention. Consider discussing with your healthcare provider`
        );
      }

      return {
        success: true,
        data: {
          weightTrend: weightStats.trend,
          bloodPressureStatus: latestSystolic
            ? latestSystolic.value >= 140
              ? "high"
              : latestSystolic.value >= 130
              ? "elevated"
              : "normal"
            : "normal",
          cholesterolStatus: latestTotalCholesterol
            ? latestTotalCholesterol.value >= 240
              ? "high"
              : latestTotalCholesterol.value >= 200
              ? "elevated"
              : "normal"
            : "normal",
          heartRateStatus: heartRateStats.latest
            ? heartRateStats.latest.value >= 100
              ? "high"
              : heartRateStats.latest.value >= 80
              ? "elevated"
              : "normal"
            : "normal",
          bmiStatus: bmiStats.latest
            ? bmiStats.latest.value < 18.5
              ? "underweight"
              : bmiStats.latest.value >= 30
              ? "obese"
              : bmiStats.latest.value >= 25
              ? "overweight"
              : "normal"
            : "normal",
          metricsRequiringAttention: metricsRequiringAttention.length,
          recommendations,
        },
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to get health insights",
      };
    }
  }

  public async getMetricTargets(): Promise<
    ServiceResponse<{
      weight: { min: number; max: number; unit: string };
      bloodPressure: {
        systolic: { min: number; max: number };
        diastolic: { min: number; max: number };
      };
      cholesterol: {
        total: { min: number; max: number };
        hdl: { min: number; max: number };
        ldl: { min: number; max: number };
      };
      heartRate: { min: number; max: number };
      bmi: { min: number; max: number };
    }>
  > {
    try {
      const targets = {
        weight: { min: 50, max: 100, unit: "kg" },
        bloodPressure: {
          systolic: { min: 90, max: 120 },
          diastolic: { min: 60, max: 80 },
        },
        cholesterol: {
          total: { min: 0, max: 200 },
          hdl: { min: 40, max: 100 },
          ldl: { min: 0, max: 100 },
        },
        heartRate: { min: 60, max: 100 },
        bmi: { min: 18.5, max: 24.9 },
      };

      return {
        success: true,
        data: targets,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to get metric targets",
      };
    }
  }
}
