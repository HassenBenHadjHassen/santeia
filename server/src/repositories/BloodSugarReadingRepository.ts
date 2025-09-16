// BloodSugarReading repository for database operations
import { BaseRepository } from "./BaseRepository";
import { BloodSugarReading } from "@/models/BloodSugarReading";
import {
  BloodSugarReading as IBloodSugarReading,
  ReadingType,
  BloodSugarStats,
  HbA1cEstimate,
} from "@/types";
import { PrismaClient } from "@prisma/client";

export class BloodSugarReadingRepository extends BaseRepository<BloodSugarReading> {
  public async create(
    data: Partial<IBloodSugarReading>
  ): Promise<BloodSugarReading> {
    const reading = new BloodSugarReading(data);

    if (!reading.validate()) {
      throw new Error("Invalid blood sugar reading data");
    }

    const created = await this.prisma.bloodSugarReading.create({
      data: {
        userId: reading.userId,
        value: reading.value,
        unit: reading.unit,
        readingType: reading.readingType,
        notes: reading.notes,
        timestamp: reading.timestamp,
      },
    });

    return new BloodSugarReading({
      ...created,
      readingType: created.readingType as ReadingType,
      notes: created.notes === null ? undefined : created.notes,
    });
  }

  public async findById(id: string): Promise<BloodSugarReading | null> {
    const reading = await this.prisma.bloodSugarReading.findUnique({
      where: { id },
    });

    return reading
      ? new BloodSugarReading({
          ...reading,
          readingType: reading.readingType as ReadingType,
          notes: reading.notes === null ? undefined : reading.notes,
        })
      : null;
  }

  public async findAll(
    filters: any = {},
    pagination: any = {}
  ): Promise<BloodSugarReading[]> {
    const {
      page = 1,
      limit = 10,
      sortBy = "timestamp",
      sortOrder = "desc",
    } = pagination;
    const skip = (page - 1) * limit;

    const readings = await this.prisma.bloodSugarReading.findMany({
      where: filters,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
    });

    return readings.map(
      (reading) =>
        new BloodSugarReading({
          ...reading,
          readingType: reading.readingType as ReadingType,
          notes: reading.notes === null ? undefined : reading.notes,
        })
    );
  }

  public async update(
    id: string,
    data: Partial<IBloodSugarReading>
  ): Promise<BloodSugarReading | null> {
    const updated = await this.prisma.bloodSugarReading.update({
      where: { id },
      data: {
        ...data,
      },
    });

    return new BloodSugarReading({
      ...updated,
      readingType: updated.readingType as ReadingType,
      notes: updated.notes === null ? undefined : updated.notes,
    });
  }

  public async delete(id: string): Promise<boolean> {
    try {
      await this.prisma.bloodSugarReading.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  // Specialized methods for blood sugar readings
  public async findByUserId(
    userId: string,
    filters: any = {},
    pagination: any = {}
  ): Promise<BloodSugarReading[]> {
    return this.findAll({ userId, ...filters }, pagination);
  }

  public async findByReadingType(
    userId: string,
    readingType: ReadingType,
    pagination: any = {}
  ): Promise<BloodSugarReading[]> {
    return this.findAll({ userId, readingType }, pagination);
  }

  public async findByDateRange(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<BloodSugarReading[]> {
    return this.findAll({
      userId,
      timestamp: {
        gte: startDate,
        lte: endDate,
      },
    });
  }

  public async getLatestReading(
    userId: string
  ): Promise<BloodSugarReading | null> {
    const reading = await this.prisma.bloodSugarReading.findFirst({
      where: { userId },
      orderBy: { timestamp: "desc" },
    });

    return reading
      ? new BloodSugarReading({
          ...reading,
          readingType: reading.readingType as ReadingType,
          notes: reading.notes === null ? undefined : reading.notes,
        })
      : null;
  }

  public async getStats(
    userId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<BloodSugarStats> {
    const whereClause: any = { userId };

    if (startDate && endDate) {
      whereClause.timestamp = {
        gte: startDate,
        lte: endDate,
      };
    }

    const readings = await this.prisma.bloodSugarReading.findMany({
      where: whereClause,
      orderBy: { timestamp: "asc" },
    });

    if (readings.length === 0) {
      return {
        average: 0,
        min: 0,
        max: 0,
        count: 0,
        trend: "stable",
        inRange: 0,
      };
    }

    const values = readings.map((r) => r.value);
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
    if (secondHalfAvg > firstHalfAvg + 10) trend = "up";
    else if (secondHalfAvg < firstHalfAvg - 10) trend = "down";

    // Calculate in-range percentage (70-180 mg/dL)
    const inRangeCount = values.filter((val) => val >= 70 && val <= 180).length;
    const inRange = (inRangeCount / count) * 100;

    return {
      average: Math.round(average * 100) / 100,
      min,
      max,
      count,
      trend,
      inRange: Math.round(inRange * 100) / 100,
    };
  }

  public async estimateHbA1c(
    userId: string,
    months: number = 3
  ): Promise<HbA1cEstimate> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const readings = await this.findByDateRange(userId, startDate, endDate);

    if (readings.length < 10) {
      return {
        estimated: 0,
        confidence: "low",
        basedOnReadings: readings.length,
        timeRange: { from: startDate, to: endDate },
      };
    }

    // Convert all readings to mg/dL for consistency
    const valuesInMgDl = readings.map((reading) => {
      const bsReading = new BloodSugarReading(reading);
      return bsReading.unit === "mg/dL"
        ? bsReading.value
        : bsReading.convertToMgDl();
    });

    const averageGlucose =
      valuesInMgDl.reduce((sum, val) => sum + val, 0) / valuesInMgDl.length;

    // HbA1c estimation formula: (average glucose + 46.7) / 28.7
    const estimatedHbA1c = (averageGlucose + 46.7) / 28.7;

    let confidence: "low" | "medium" | "high" = "low";
    if (readings.length >= 30) confidence = "high";
    else if (readings.length >= 15) confidence = "medium";

    return {
      estimated: Math.round(estimatedHbA1c * 100) / 100,
      confidence,
      basedOnReadings: readings.length,
      timeRange: { from: startDate, to: endDate },
    };
  }

  public async getReadingsByDay(
    userId: string,
    date: Date
  ): Promise<BloodSugarReading[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return this.findByDateRange(userId, startOfDay, endOfDay);
  }

  public async getReadingsByWeek(
    userId: string,
    startDate: Date
  ): Promise<BloodSugarReading[]> {
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 7);

    return this.findByDateRange(userId, startDate, endDate);
  }

  public async getReadingsByMonth(
    userId: string,
    year: number,
    month: number
  ): Promise<BloodSugarReading[]> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    return this.findByDateRange(userId, startDate, endDate);
  }

  public async getHighReadings(
    userId: string,
    threshold: number = 180
  ): Promise<BloodSugarReading[]> {
    return this.findAll({
      userId,
      value: { gt: threshold },
    });
  }

  public async getLowReadings(
    userId: string,
    threshold: number = 70
  ): Promise<BloodSugarReading[]> {
    return this.findAll({
      userId,
      value: { lt: threshold },
    });
  }

  public async getInRangeReadings(
    userId: string,
    min: number = 70,
    max: number = 180
  ): Promise<BloodSugarReading[]> {
    return this.findAll({
      userId,
      value: { gte: min, lte: max },
    });
  }
}
