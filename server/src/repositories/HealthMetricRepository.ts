// HealthMetric repository for database operations
import { BaseRepository } from "./BaseRepository";
import { HealthMetric } from "@/models/HealthMetric";
import { HealthMetric as IHealthMetric, MetricType } from "@/types";
import { PrismaClient } from "@prisma/client";

export class HealthMetricRepository extends BaseRepository<HealthMetric> {
  public async create(data: Partial<IHealthMetric>): Promise<HealthMetric> {
    const metric = new HealthMetric(data);

    if (!metric.validate()) {
      throw new Error("Invalid health metric data");
    }

    const created = await this.prisma.healthMetric.create({
      data: {
        userId: metric.userId,
        metricType: metric.metricType,
        value: metric.value,
        unit: metric.unit,
        notes: metric.notes,
        timestamp: metric.timestamp,
      },
    });

    return new HealthMetric({
      ...created,
      metricType: created.metricType as MetricType,
      notes: created.notes === null ? undefined : created.notes,
    });
  }

  public async findById(id: string): Promise<HealthMetric | null> {
    const metric = await this.prisma.healthMetric.findUnique({
      where: { id },
    });

    return metric
      ? new HealthMetric({
          ...metric,
          metricType: metric.metricType as MetricType,
          notes: metric.notes === null ? undefined : metric.notes,
        })
      : null;
  }

  public async findAll(
    filters: any = {},
    pagination: any = {}
  ): Promise<HealthMetric[]> {
    const {
      page = 1,
      limit = 10,
      sortBy = "timestamp",
      sortOrder = "desc",
    } = pagination;
    const skip = (page - 1) * limit;

    const metrics = await this.prisma.healthMetric.findMany({
      where: filters,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
    });

    return metrics.map(
      (metric) =>
        new HealthMetric({
          ...metric,
          metricType: metric.metricType as MetricType,
          notes: metric.notes === null ? undefined : metric.notes,
        })
    );
  }

  public async update(
    id: string,
    data: Partial<IHealthMetric>
  ): Promise<HealthMetric | null> {
    const updated = await this.prisma.healthMetric.update({
      where: { id },
      data: {
        ...data,
      },
    });

    return new HealthMetric({
      ...updated,
      metricType: updated.metricType as MetricType,
      notes: updated.notes === null ? undefined : updated.notes,
    });
  }

  public async delete(id: string): Promise<boolean> {
    try {
      await this.prisma.healthMetric.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  // Specialized methods for health metrics
  public async findByUserId(
    userId: string,
    filters: any = {},
    pagination: any = {}
  ): Promise<HealthMetric[]> {
    return this.findAll({ userId, ...filters }, pagination);
  }

  public async findByMetricType(
    userId: string,
    metricType: MetricType
  ): Promise<HealthMetric[]> {
    return this.findAll({ userId, metricType });
  }

  public async findByDateRange(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<HealthMetric[]> {
    return this.findAll({
      userId,
      timestamp: {
        gte: startDate,
        lte: endDate,
      },
    });
  }

  public async getLatestMetric(
    userId: string,
    metricType: MetricType
  ): Promise<HealthMetric | null> {
    const metric = await this.prisma.healthMetric.findFirst({
      where: { userId, metricType },
      orderBy: { timestamp: "desc" },
    });

    return metric
      ? new HealthMetric({
          ...metric,
          metricType: metric.metricType as MetricType,
          notes: metric.notes === null ? undefined : metric.notes,
        })
      : null;
  }

  public async getMetricsByDay(
    userId: string,
    date: Date
  ): Promise<HealthMetric[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return this.findByDateRange(userId, startOfDay, endOfDay);
  }

  public async getMetricsByWeek(
    userId: string,
    startDate: Date
  ): Promise<HealthMetric[]> {
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 7);

    return this.findByDateRange(userId, startDate, endDate);
  }

  public async getMetricsByMonth(
    userId: string,
    year: number,
    month: number
  ): Promise<HealthMetric[]> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    return this.findByDateRange(userId, startDate, endDate);
  }

  public async getWeightHistory(
    userId: string,
    days: number = 30
  ): Promise<HealthMetric[]> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return this.findAll(
      {
        userId,
        metricType: "WEIGHT",
        timestamp: {
          gte: startDate,
          lte: endDate,
        },
      },
      { sortBy: "timestamp", sortOrder: "asc" }
    );
  }

  public async getBloodPressureHistory(
    userId: string,
    days: number = 30
  ): Promise<{
    systolic: HealthMetric[];
    diastolic: HealthMetric[];
  }> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [systolic, diastolic] = await Promise.all([
      this.findAll(
        {
          userId,
          metricType: "BLOOD_PRESSURE_SYSTOLIC",
          timestamp: { gte: startDate, lte: endDate },
        },
        { sortBy: "timestamp", sortOrder: "asc" }
      ),
      this.findAll(
        {
          userId,
          metricType: "BLOOD_PRESSURE_DIASTOLIC",
          timestamp: { gte: startDate, lte: endDate },
        },
        { sortBy: "timestamp", sortOrder: "asc" }
      ),
    ]);

    return { systolic, diastolic };
  }

  public async getCholesterolHistory(
    userId: string,
    days: number = 90
  ): Promise<{
    total: HealthMetric[];
    hdl: HealthMetric[];
    ldl: HealthMetric[];
    triglycerides: HealthMetric[];
  }> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [total, hdl, ldl, triglycerides] = await Promise.all([
      this.findAll(
        {
          userId,
          metricType: "CHOLESTEROL_TOTAL",
          timestamp: { gte: startDate, lte: endDate },
        },
        { sortBy: "timestamp", sortOrder: "asc" }
      ),
      this.findAll(
        {
          userId,
          metricType: "CHOLESTEROL_HDL",
          timestamp: { gte: startDate, lte: endDate },
        },
        { sortBy: "timestamp", sortOrder: "asc" }
      ),
      this.findAll(
        {
          userId,
          metricType: "CHOLESTEROL_LDL",
          timestamp: { gte: startDate, lte: endDate },
        },
        { sortBy: "timestamp", sortOrder: "asc" }
      ),
      this.findAll(
        {
          userId,
          metricType: "TRIGLYCERIDES",
          timestamp: { gte: startDate, lte: endDate },
        },
        { sortBy: "timestamp", sortOrder: "asc" }
      ),
    ]);

    return { total, hdl, ldl, triglycerides };
  }

  public async getHeartRateHistory(
    userId: string,
    days: number = 30
  ): Promise<HealthMetric[]> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return this.findAll(
      {
        userId,
        metricType: "HEART_RATE",
        timestamp: {
          gte: startDate,
          lte: endDate,
        },
      },
      { sortBy: "timestamp", sortOrder: "asc" }
    );
  }

  public async getBMITrend(
    userId: string,
    days: number = 30
  ): Promise<HealthMetric[]> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return this.findAll(
      {
        userId,
        metricType: "BMI",
        timestamp: {
          gte: startDate,
          lte: endDate,
        },
      },
      { sortBy: "timestamp", sortOrder: "asc" }
    );
  }

  public async getMetricStats(
    userId: string,
    metricType: MetricType,
    days: number = 30
  ): Promise<{
    average: number;
    min: number;
    max: number;
    count: number;
    trend: "up" | "down" | "stable";
    latest: HealthMetric | null;
  }> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const metrics = await this.findAll(
      {
        userId,
        metricType,
        timestamp: {
          gte: startDate,
          lte: endDate,
        },
      },
      { sortBy: "timestamp", sortOrder: "asc" }
    );

    if (metrics.length === 0) {
      return {
        average: 0,
        min: 0,
        max: 0,
        count: 0,
        trend: "stable",
        latest: null,
      };
    }

    const values = metrics.map((m) => m.value);
    const average = values.reduce((sum, val) => sum + val, 0) / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const count = values.length;

    // Calculate trend (comparing first half vs second half)
    const midPoint = Math.floor(values.length / 2);
    const firstHalf = values.slice(0, midPoint);
    const secondHalf = values.slice(midPoint);

    const firstHalfAvg =
      firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
    const secondHalfAvg =
      secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;

    let trend: "up" | "down" | "stable" = "stable";
    if (secondHalfAvg > firstHalfAvg + average * 0.05) trend = "up";
    else if (secondHalfAvg < firstHalfAvg - average * 0.05) trend = "down";

    return {
      average: Math.round(average * 100) / 100,
      min,
      max,
      count,
      trend,
      latest: metrics[metrics.length - 1],
    };
  }

  public async getMetricsRequiringAttention(
    userId: string
  ): Promise<HealthMetric[]> {
    const metrics = await this.findByUserId(userId);
    return metrics.filter((metric) => metric.requiresAttention());
  }

  public async getNormalRangeMetrics(userId: string): Promise<HealthMetric[]> {
    const metrics = await this.findByUserId(userId);
    return metrics.filter((metric) => metric.isWithinNormalRange());
  }

  public async getMetricCategories(userId: string): Promise<{
    weight: HealthMetric[];
    bloodPressure: HealthMetric[];
    cholesterol: HealthMetric[];
    heartRate: HealthMetric[];
    bmi: HealthMetric[];
  }> {
    const metrics = await this.findByUserId(userId);

    return {
      weight: metrics.filter((m) => m.isWeight()),
      bloodPressure: metrics.filter((m) => m.isBloodPressure()),
      cholesterol: metrics.filter((m) => m.isCholesterol()),
      heartRate: metrics.filter((m) => m.isHeartRate()),
      bmi: metrics.filter((m) => m.isBMI()),
    };
  }

  public async getRecentMetrics(
    userId: string,
    limit: number = 10
  ): Promise<HealthMetric[]> {
    return this.findAll(
      { userId },
      { limit, sortBy: "timestamp", sortOrder: "desc" }
    );
  }

  public async searchMetrics(
    userId: string,
    query: string
  ): Promise<HealthMetric[]> {
    return this.findAll({
      userId,
      OR: [{ notes: { contains: query, mode: "insensitive" } }],
    });
  }

  public async getMetricSummary(userId: string): Promise<{
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
  }> {
    const metrics = await this.findByUserId(userId);
    const categories = await this.getMetricCategories(userId);
    const requiringAttention = await this.getMetricsRequiringAttention(userId);

    const latestSystolic = await this.getLatestMetric(
      userId,
      MetricType.BLOOD_PRESSURE_SYSTOLIC
    );
    const latestDiastolic = await this.getLatestMetric(
      userId,
      MetricType.BLOOD_PRESSURE_DIASTOLIC
    );

    return {
      totalMetrics: metrics.length,
      weightCount: categories.weight.length,
      bloodPressureCount: categories.bloodPressure.length,
      cholesterolCount: categories.cholesterol.length,
      heartRateCount: categories.heartRate.length,
      bmiCount: categories.bmi.length,
      requiringAttention: requiringAttention.length,
      latestWeight: await this.getLatestMetric(userId, MetricType.WEIGHT),
      latestBloodPressure: {
        systolic: latestSystolic,
        diastolic: latestDiastolic,
      },
    };
  }
}
