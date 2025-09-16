// MedicationDose repository for database operations
import { BaseRepository } from "./BaseRepository";
import { MedicationDose } from "@/models/MedicationDose";
import { MedicationDose as IMedicationDose } from "@/types";
import { PrismaClient } from "@prisma/client";

export class MedicationDoseRepository extends BaseRepository<MedicationDose> {
  public async create(data: Partial<IMedicationDose>): Promise<MedicationDose> {
    const dose = new MedicationDose(data);

    if (!dose.validate()) {
      throw new Error("Invalid medication dose data");
    }

    const created = await this.prisma.medicationDose.create({
      data: {
        medicationId: dose.medicationId,
        userId: dose.userId,
        dosage: dose.dosage,
        unit: dose.unit,
        takenAt: dose.takenAt,
        notes: dose.notes,
      },
    });

    return new MedicationDose({
      ...created,
      notes: created.notes === null ? undefined : created.notes,
    });
  }

  public async findById(id: string): Promise<MedicationDose | null> {
    const dose = await this.prisma.medicationDose.findUnique({
      where: { id },
    });

    return dose
      ? new MedicationDose({
          ...dose,
          notes: dose.notes === null ? undefined : dose.notes,
        })
      : null;
  }

  public async findAll(
    filters: any = {},
    pagination: any = {}
  ): Promise<MedicationDose[]> {
    const {
      page = 1,
      limit = 10,
      sortBy = "takenAt",
      sortOrder = "desc",
    } = pagination;
    const skip = (page - 1) * limit;

    const doses = await this.prisma.medicationDose.findMany({
      where: filters,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
    });

    return doses.map(
      (dose) =>
        new MedicationDose({
          ...dose,
          notes: dose.notes === null ? undefined : dose.notes,
        })
    );
  }

  public async update(
    id: string,
    data: Partial<IMedicationDose>
  ): Promise<MedicationDose | null> {
    const updated = await this.prisma.medicationDose.update({
      where: { id },
      data: {
        ...data,
      },
    });

    return new MedicationDose({
      ...updated,
      notes: updated.notes === null ? undefined : updated.notes,
    });
  }

  public async delete(id: string): Promise<boolean> {
    try {
      await this.prisma.medicationDose.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  // Specialized methods for medication doses
  public async findByUserId(
    userId: string,
    filters: any = {},
    pagination: any = {}
  ): Promise<MedicationDose[]> {
    return this.findAll({ userId, ...filters }, pagination);
  }

  public async findByMedicationId(
    medicationId: string,
    filters: any = {},
    pagination: any = {}
  ): Promise<MedicationDose[]> {
    return this.findAll({ medicationId, ...filters }, pagination);
  }

  public async findByDateRange(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<MedicationDose[]> {
    return this.findAll({
      userId,
      takenAt: {
        gte: startDate,
        lte: endDate,
      },
    });
  }

  public async getDosesByDay(
    userId: string,
    date: Date
  ): Promise<MedicationDose[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return this.findByDateRange(userId, startOfDay, endOfDay);
  }

  public async getDosesByWeek(
    userId: string,
    startDate: Date
  ): Promise<MedicationDose[]> {
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 7);

    return this.findByDateRange(userId, startDate, endDate);
  }

  public async getDosesByMonth(
    userId: string,
    year: number,
    month: number
  ): Promise<MedicationDose[]> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    return this.findByDateRange(userId, startDate, endDate);
  }

  public async getRecentDoses(
    userId: string,
    limit: number = 10
  ): Promise<MedicationDose[]> {
    return this.findAll(
      { userId },
      { limit, sortBy: "takenAt", sortOrder: "desc" }
    );
  }

  public async getDosesByMedication(
    userId: string,
    medicationId: string,
    limit: number = 50
  ): Promise<MedicationDose[]> {
    return this.findAll(
      { userId, medicationId },
      { limit, sortBy: "takenAt", sortOrder: "desc" }
    );
  }

  public async getTodayDoses(userId: string): Promise<MedicationDose[]> {
    const today = new Date();
    return this.getDosesByDay(userId, today);
  }

  public async getThisWeekDoses(userId: string): Promise<MedicationDose[]> {
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    return this.getDosesByWeek(userId, startOfWeek);
  }

  public async getThisMonthDoses(userId: string): Promise<MedicationDose[]> {
    const now = new Date();
    return this.getDosesByMonth(userId, now.getFullYear(), now.getMonth() + 1);
  }

  public async getDosesByTimeOfDay(
    userId: string,
    timeOfDay: "morning" | "afternoon" | "evening" | "night"
  ): Promise<MedicationDose[]> {
    const doses = await this.findByUserId(userId);
    return doses.filter((dose) => dose.getTimeOfDay() === timeOfDay);
  }

  public async getRecentDosesByMedication(
    userId: string,
    medicationId: string,
    days: number = 7
  ): Promise<MedicationDose[]> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return this.findAll(
      {
        userId,
        medicationId,
        takenAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      { sortBy: "takenAt", sortOrder: "desc" }
    );
  }

  public async getAdherenceStats(
    userId: string,
    medicationId: string,
    days: number = 30
  ): Promise<{
    totalExpectedDoses: number;
    totalTakenDoses: number;
    adherenceRate: number;
    missedDoses: number;
    averageDelayMinutes: number;
  }> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const doses = await this.findAll(
      {
        userId,
        medicationId,
        takenAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      { sortBy: "takenAt", sortOrder: "asc" }
    );

    // This is a simplified calculation
    // In a real implementation, you'd need to calculate expected doses based on medication frequency
    const totalTakenDoses = doses.length;
    const totalExpectedDoses = Math.max(totalTakenDoses, 1); // Placeholder
    const adherenceRate = (totalTakenDoses / totalExpectedDoses) * 100;
    const missedDoses = Math.max(0, totalExpectedDoses - totalTakenDoses);

    // Calculate average delay (simplified)
    const averageDelayMinutes =
      doses.length > 0
        ? doses.reduce(
            (sum, dose) => sum + Math.abs(dose.getTimeSinceTakenInMinutes()),
            0
          ) / doses.length
        : 0;

    return {
      totalExpectedDoses,
      totalTakenDoses,
      adherenceRate: Math.round(adherenceRate * 100) / 100,
      missedDoses,
      averageDelayMinutes: Math.round(averageDelayMinutes),
    };
  }

  public async getDoseFrequency(
    userId: string,
    days: number = 30
  ): Promise<{
    daily: number;
    weekly: number;
    monthly: number;
  }> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const doses = await this.findByDateRange(userId, startDate, endDate);

    const daily = doses.length / days;
    const weekly = doses.length / (days / 7);
    const monthly = doses.length;

    return {
      daily: Math.round(daily * 100) / 100,
      weekly: Math.round(weekly * 100) / 100,
      monthly,
    };
  }

  public async getDosesByAdherenceScore(
    userId: string,
    medicationId: string,
    expectedTime?: Date
  ): Promise<{
    onTime: MedicationDose[];
    slightlyLate: MedicationDose[];
    veryLate: MedicationDose[];
    averageScore: number;
  }> {
    const doses = await this.getDosesByMedication(userId, medicationId);

    const onTime: MedicationDose[] = [];
    const slightlyLate: MedicationDose[] = [];
    const veryLate: MedicationDose[] = [];

    let totalScore = 0;

    doses.forEach((dose) => {
      const score = expectedTime ? dose.getAdherenceScore(expectedTime) : 100;
      totalScore += score;

      if (score >= 90) {
        onTime.push(dose);
      } else if (score >= 70) {
        slightlyLate.push(dose);
      } else {
        veryLate.push(dose);
      }
    });

    const averageScore = doses.length > 0 ? totalScore / doses.length : 0;

    return {
      onTime,
      slightlyLate,
      veryLate,
      averageScore: Math.round(averageScore * 100) / 100,
    };
  }

  public async getMissedDoses(
    userId: string,
    medicationId: string,
    days: number = 7
  ): Promise<
    Array<{
      expectedTime: Date;
      daysMissed: number;
      isOverdue: boolean;
    }>
  > {
    // This would require integration with medication scheduling
    // For now, return empty array as placeholder
    return [];
  }

  public async getDoseHistory(
    userId: string,
    medicationId: string,
    limit: number = 100
  ): Promise<MedicationDose[]> {
    return this.findAll(
      { userId, medicationId },
      { limit, sortBy: "takenAt", sortOrder: "desc" }
    );
  }

  public async searchDoses(
    userId: string,
    query: string
  ): Promise<MedicationDose[]> {
    return this.findAll({
      userId,
      OR: [
        { notes: { contains: query, mode: "insensitive" } },
        { dosage: { contains: query, mode: "insensitive" } },
      ],
    });
  }

  public async getDoseSummary(userId: string): Promise<{
    totalDoses: number;
    todayDoses: number;
    thisWeekDoses: number;
    thisMonthDoses: number;
    recentDoses: MedicationDose[];
    adherenceRate: number;
  }> {
    const [totalDoses, todayDoses, thisWeekDoses, thisMonthDoses, recentDoses] =
      await Promise.all([
        this.findByUserId(userId).then((doses) => doses.length),
        this.getTodayDoses(userId).then((doses) => doses.length),
        this.getThisWeekDoses(userId).then((doses) => doses.length),
        this.getThisMonthDoses(userId).then((doses) => doses.length),
        this.getRecentDoses(userId, 5),
      ]);

    // Simplified adherence rate calculation
    const adherenceRate = 85; // Placeholder

    return {
      totalDoses,
      todayDoses,
      thisWeekDoses,
      thisMonthDoses,
      recentDoses,
      adherenceRate,
    };
  }

  public async getDosesByMedicationType(
    userId: string,
    medicationType: string
  ): Promise<MedicationDose[]> {
    // This would require joining with medications table
    // For now, return empty array as placeholder
    return [];
  }

  public async getDosesRequiringAttention(
    userId: string
  ): Promise<MedicationDose[]> {
    const doses = await this.findByUserId(userId);
    return doses.filter((dose) => {
      // Doses that are overdue or have low adherence
      return dose.isRecent() && dose.getTimeSinceTakenInHours() > 2;
    });
  }
}
