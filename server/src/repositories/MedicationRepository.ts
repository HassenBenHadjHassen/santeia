// Medication repository for database operations
import { BaseRepository } from "./BaseRepository";
import { Medication } from "@/models/Medication";
import { Medication as IMedication } from "@/types";
import { PrismaClient } from "@prisma/client";

export class MedicationRepository extends BaseRepository<Medication> {
  public async create(data: Partial<IMedication>): Promise<Medication> {
    const medication = new Medication(data);

    if (!medication.validate()) {
      throw new Error("Invalid medication data");
    }

    const created = await this.prisma.medication.create({
      data: {
        userId: medication.userId,
        name: medication.name,
        type: medication.type,
        dosage: medication.dosage,
        unit: medication.unit,
        frequency: medication.frequency,
        instructions: medication.instructions,
        isActive: medication.isActive,
      },
    });

    return new Medication({
      ...created,
      instructions:
        created.instructions === null ? undefined : created.instructions,
    });
  }

  public async findById(id: string): Promise<Medication | null> {
    const medication = await this.prisma.medication.findUnique({
      where: { id },
    });

    return medication
      ? new Medication({
          ...medication,
          instructions:
            medication.instructions === null
              ? undefined
              : medication.instructions,
        })
      : null;
  }

  public async findAll(
    filters: any = {},
    pagination: any = {}
  ): Promise<Medication[]> {
    const {
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = pagination;
    const skip = (page - 1) * limit;

    const medications = await this.prisma.medication.findMany({
      where: filters,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
    });

    return medications.map(
      (medication) =>
        new Medication({
          ...medication,
          instructions:
            medication.instructions === null
              ? undefined
              : medication.instructions,
        })
    );
  }

  public async update(
    id: string,
    data: Partial<IMedication>
  ): Promise<Medication | null> {
    const updated = await this.prisma.medication.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });

    return new Medication({
      ...updated,
      instructions:
        updated.instructions === null ? undefined : updated.instructions,
    });
  }

  public async delete(id: string): Promise<boolean> {
    try {
      await this.prisma.medication.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  // Specialized methods for medications
  public async findByUserId(
    userId: string,
    filters: any = {},
    pagination: any = {}
  ): Promise<Medication[]> {
    return this.findAll({ userId, ...filters }, pagination);
  }

  public async getActiveMedications(userId: string): Promise<Medication[]> {
    return this.findAll({ userId, isActive: true });
  }

  public async getInactiveMedications(userId: string): Promise<Medication[]> {
    return this.findAll({ userId, isActive: false });
  }

  public async getMedicationsByType(
    userId: string,
    type: string
  ): Promise<Medication[]> {
    return this.findAll({
      userId,
      type: { equals: type, mode: "insensitive" },
    });
  }

  public async getInsulinMedications(userId: string): Promise<Medication[]> {
    return this.findAll({
      userId,
      type: { equals: "insulin", mode: "insensitive" },
    });
  }

  public async getOralMedications(userId: string): Promise<Medication[]> {
    return this.findAll({
      userId,
      type: { equals: "oral", mode: "insensitive" },
    });
  }

  public async getMedicationsByName(
    userId: string,
    name: string
  ): Promise<Medication[]> {
    return this.findAll({
      userId,
      name: { contains: name, mode: "insensitive" },
    });
  }

  public async getHighFrequencyMedications(
    userId: string
  ): Promise<Medication[]> {
    const medications = await this.findByUserId(userId);
    return medications.filter((medication) => medication.isHighFrequency());
  }

  public async getMedicationsRequiringMealTiming(
    userId: string
  ): Promise<Medication[]> {
    const medications = await this.findByUserId(userId);
    return medications.filter((medication) => medication.requiresMealTiming());
  }

  public async searchMedications(
    userId: string,
    query: string
  ): Promise<Medication[]> {
    return this.findAll({
      userId,
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { type: { contains: query, mode: "insensitive" } },
        { instructions: { contains: query, mode: "insensitive" } },
      ],
    });
  }

  public async getMedicationCount(userId: string): Promise<{
    total: number;
    active: number;
    inactive: number;
    insulin: number;
    oral: number;
    other: number;
  }> {
    const medications = await this.findByUserId(userId);

    return {
      total: medications.length,
      active: medications.filter((m) => m.isActive).length,
      inactive: medications.filter((m) => !m.isActive).length,
      insulin: medications.filter((m) => m.isInsulin()).length,
      oral: medications.filter((m) => m.isOral()).length,
      other: medications.filter((m) => !m.isInsulin() && !m.isOral()).length,
    };
  }

  public async getMedicationFrequencyDistribution(userId: string): Promise<{
    onceDaily: number;
    twiceDaily: number;
    threeTimesDaily: number;
    fourTimesDaily: number;
    asNeeded: number;
  }> {
    const medications = await this.findByUserId(userId);

    const distribution = {
      onceDaily: 0,
      twiceDaily: 0,
      threeTimesDaily: 0,
      fourTimesDaily: 0,
      asNeeded: 0,
    };

    medications.forEach((medication) => {
      const frequency = medication.frequency.toLowerCase();
      if (frequency.includes("once") || frequency === "daily") {
        distribution.onceDaily++;
      } else if (frequency.includes("twice")) {
        distribution.twiceDaily++;
      } else if (frequency.includes("three")) {
        distribution.threeTimesDaily++;
      } else if (frequency.includes("four")) {
        distribution.fourTimesDaily++;
      } else if (frequency.includes("needed") || frequency === "prn") {
        distribution.asNeeded++;
      }
    });

    return distribution;
  }

  public async getUpcomingDoses(
    userId: string,
    hours: number = 24
  ): Promise<
    Array<{
      medication: Medication;
      nextDoseTime: Date;
      isOverdue: boolean;
    }>
  > {
    const activeMedications = await this.getActiveMedications(userId);
    const now = new Date();
    const futureTime = new Date(now.getTime() + hours * 60 * 60 * 1000);

    return activeMedications
      .map((medication) => {
        const nextDoseTime = medication.getNextDoseTime();
        if (!nextDoseTime) return null;

        return {
          medication,
          nextDoseTime,
          isOverdue: nextDoseTime < now,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null)
      .sort((a, b) => a.nextDoseTime.getTime() - b.nextDoseTime.getTime());
  }

  public async getOverdueDoses(userId: string): Promise<
    Array<{
      medication: Medication;
      nextDoseTime: Date;
      hoursOverdue: number;
    }>
  > {
    const upcomingDoses = await this.getUpcomingDoses(userId, 24);
    const now = new Date();

    return upcomingDoses
      .filter((dose) => dose.isOverdue)
      .map((dose) => ({
        medication: dose.medication,
        nextDoseTime: dose.nextDoseTime,
        hoursOverdue: Math.floor(
          (now.getTime() - dose.nextDoseTime.getTime()) / (1000 * 60 * 60)
        ),
      }));
  }

  public async getMedicationAdherence(
    userId: string,
    days: number = 7
  ): Promise<
    {
      medicationId: string;
      medicationName: string;
      expectedDoses: number;
      takenDoses: number;
      adherenceRate: number;
    }[]
  > {
    // This would require integration with MedicationDoseRepository
    // For now, return empty array as placeholder
    return [];
  }

  public async getMedicationInteractions(userId: string): Promise<
    Array<{
      medication1: Medication;
      medication2: Medication;
      severity: "minor" | "moderate" | "major";
      description: string;
    }>
  > {
    // This would require integration with a drug interaction database
    // For now, return empty array as placeholder
    return [];
  }

  public async getStorageInstructions(userId: string): Promise<
    Array<{
      medication: Medication;
      instructions: string;
    }>
  > {
    const medications = await this.findByUserId(userId);

    return medications.map((medication) => ({
      medication,
      instructions: medication.getStorageInstructions(),
    }));
  }

  public async getMedicationHistory(
    userId: string,
    limit: number = 50
  ): Promise<Medication[]> {
    return this.findAll(
      { userId },
      { limit, sortBy: "createdAt", sortOrder: "desc" }
    );
  }

  public async deactivateMedication(id: string): Promise<Medication | null> {
    return this.update(id, { isActive: false });
  }

  public async activateMedication(id: string): Promise<Medication | null> {
    return this.update(id, { isActive: true });
  }

  public async getMedicationSummary(userId: string): Promise<{
    totalMedications: number;
    activeMedications: number;
    insulinCount: number;
    oralCount: number;
    highFrequencyCount: number;
    mealTimingRequired: number;
    nextDoseIn: Date | null;
  }> {
    const medications = await this.findByUserId(userId);
    const activeMedications = medications.filter((m) => m.isActive);
    const upcomingDoses = await this.getUpcomingDoses(userId, 24);

    return {
      totalMedications: medications.length,
      activeMedications: activeMedications.length,
      insulinCount: medications.filter((m) => m.isInsulin()).length,
      oralCount: medications.filter((m) => m.isOral()).length,
      highFrequencyCount: medications.filter((m) => m.isHighFrequency()).length,
      mealTimingRequired: medications.filter((m) => m.requiresMealTiming())
        .length,
      nextDoseIn:
        upcomingDoses.length > 0 ? upcomingDoses[0].nextDoseTime : null,
    };
  }
}
