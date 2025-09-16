// MedicationService for business logic
import { MedicationRepository } from "@/repositories/MedicationRepository";
import { MedicationDoseRepository } from "@/repositories/MedicationDoseRepository";
import { AlertRepository } from "@/repositories/AlertRepository";
import { Medication } from "@/models/Medication";
import { MedicationDose } from "@/models/MedicationDose";
import { CreateMedicationRequest, ServiceResponse } from "@/types";

export class MedicationService {
  private medicationRepository: MedicationRepository;
  private doseRepository: MedicationDoseRepository;
  private alertRepository: AlertRepository;

  constructor() {
    this.medicationRepository = new MedicationRepository();
    this.doseRepository = new MedicationDoseRepository();
    this.alertRepository = new AlertRepository();
  }

  public async createMedication(
    userId: string,
    data: CreateMedicationRequest
  ): Promise<ServiceResponse<Medication>> {
    try {
      const medication = await this.medicationRepository.create({
        userId,
        ...data,
      });

      return {
        success: true,
        data: medication,
        message: "Medication added successfully",
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to create medication",
      };
    }
  }

  public async getMedicationById(
    id: string
  ): Promise<ServiceResponse<Medication>> {
    try {
      const medication = await this.medicationRepository.findById(id);

      if (!medication) {
        return {
          success: false,
          error: "Medication not found",
        };
      }

      return {
        success: true,
        data: medication,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to get medication",
      };
    }
  }

  public async getMedicationsByUser(
    userId: string,
    filters: any = {},
    pagination: any = {}
  ): Promise<ServiceResponse<Medication[]>> {
    try {
      const medications = await this.medicationRepository.findByUserId(
        userId,
        filters,
        pagination
      );

      return {
        success: true,
        data: medications,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to get medications",
      };
    }
  }

  public async getActiveMedications(
    userId: string
  ): Promise<ServiceResponse<Medication[]>> {
    try {
      const medications = await this.medicationRepository.getActiveMedications(
        userId
      );

      return {
        success: true,
        data: medications,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to get active medications",
      };
    }
  }

  public async getInactiveMedications(
    userId: string
  ): Promise<ServiceResponse<Medication[]>> {
    try {
      const medications =
        await this.medicationRepository.getInactiveMedications(userId);

      return {
        success: true,
        data: medications,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to get inactive medications",
      };
    }
  }

  public async getMedicationsByType(
    userId: string,
    type: string
  ): Promise<ServiceResponse<Medication[]>> {
    try {
      const medications = await this.medicationRepository.getMedicationsByType(
        userId,
        type
      );

      return {
        success: true,
        data: medications,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to get medications by type",
      };
    }
  }

  public async getInsulinMedications(
    userId: string
  ): Promise<ServiceResponse<Medication[]>> {
    try {
      const medications = await this.medicationRepository.getInsulinMedications(
        userId
      );

      return {
        success: true,
        data: medications,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to get insulin medications",
      };
    }
  }

  public async getOralMedications(
    userId: string
  ): Promise<ServiceResponse<Medication[]>> {
    try {
      const medications = await this.medicationRepository.getOralMedications(
        userId
      );

      return {
        success: true,
        data: medications,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to get oral medications",
      };
    }
  }

  public async searchMedications(
    userId: string,
    query: string
  ): Promise<ServiceResponse<Medication[]>> {
    try {
      const medications = await this.medicationRepository.searchMedications(
        userId,
        query
      );

      return {
        success: true,
        data: medications,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to search medications",
      };
    }
  }

  public async getMedicationCount(userId: string): Promise<
    ServiceResponse<{
      total: number;
      active: number;
      inactive: number;
      insulin: number;
      oral: number;
      other: number;
    }>
  > {
    try {
      const count = await this.medicationRepository.getMedicationCount(userId);

      return {
        success: true,
        data: count,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to get medication count",
      };
    }
  }

  public async getUpcomingDoses(
    userId: string,
    hours: number = 24
  ): Promise<
    ServiceResponse<
      Array<{
        medication: Medication;
        nextDoseTime: Date;
        isOverdue: boolean;
      }>
    >
  > {
    try {
      const doses = await this.medicationRepository.getUpcomingDoses(
        userId,
        hours
      );

      return {
        success: true,
        data: doses,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to get upcoming doses",
      };
    }
  }

  public async getOverdueDoses(userId: string): Promise<
    ServiceResponse<
      Array<{
        medication: Medication;
        nextDoseTime: Date;
        hoursOverdue: number;
      }>
    >
  > {
    try {
      const doses = await this.medicationRepository.getOverdueDoses(userId);

      return {
        success: true,
        data: doses,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to get overdue doses",
      };
    }
  }

  public async getMedicationSummary(userId: string): Promise<
    ServiceResponse<{
      totalMedications: number;
      activeMedications: number;
      insulinCount: number;
      oralCount: number;
      highFrequencyCount: number;
      mealTimingRequired: number;
      nextDoseIn: Date | null;
    }>
  > {
    try {
      const summary = await this.medicationRepository.getMedicationSummary(
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
            : "Failed to get medication summary",
      };
    }
  }

  public async updateMedication(
    id: string,
    data: Partial<CreateMedicationRequest>
  ): Promise<ServiceResponse<Medication>> {
    try {
      const medication = await this.medicationRepository.update(id, data);

      if (!medication) {
        return {
          success: false,
          error: "Medication not found",
        };
      }

      return {
        success: true,
        data: medication,
        message: "Medication updated successfully",
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to update medication",
      };
    }
  }

  public async deactivateMedication(
    id: string
  ): Promise<ServiceResponse<Medication>> {
    try {
      const medication = await this.medicationRepository.deactivateMedication(
        id
      );

      if (!medication) {
        return {
          success: false,
          error: "Medication not found",
        };
      }

      return {
        success: true,
        data: medication,
        message: "Medication deactivated successfully",
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to deactivate medication",
      };
    }
  }

  public async activateMedication(
    id: string
  ): Promise<ServiceResponse<Medication>> {
    try {
      const medication = await this.medicationRepository.activateMedication(id);

      if (!medication) {
        return {
          success: false,
          error: "Medication not found",
        };
      }

      return {
        success: true,
        data: medication,
        message: "Medication activated successfully",
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to activate medication",
      };
    }
  }

  public async deleteMedication(id: string): Promise<ServiceResponse<boolean>> {
    try {
      const success = await this.medicationRepository.delete(id);

      if (!success) {
        return {
          success: false,
          error: "Failed to delete medication",
        };
      }

      return {
        success: true,
        data: true,
        message: "Medication deleted successfully",
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to delete medication",
      };
    }
  }

  // Medication Dose Methods
  public async recordDose(
    medicationId: string,
    userId: string,
    dosage: string,
    unit: string,
    notes?: string
  ): Promise<ServiceResponse<MedicationDose>> {
    try {
      const dose = await this.doseRepository.create({
        medicationId,
        userId,
        dosage,
        unit,
        takenAt: new Date(),
        notes,
      });

      return {
        success: true,
        data: dose,
        message: "Medication dose recorded successfully",
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to record medication dose",
      };
    }
  }

  public async getDosesByMedication(
    medicationId: string,
    userId: string,
    limit: number = 50
  ): Promise<ServiceResponse<MedicationDose[]>> {
    try {
      const doses = await this.doseRepository.getDosesByMedication(
        userId,
        medicationId,
        limit
      );

      return {
        success: true,
        data: doses,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to get medication doses",
      };
    }
  }

  public async getTodayDoses(
    userId: string
  ): Promise<ServiceResponse<MedicationDose[]>> {
    try {
      const doses = await this.doseRepository.getTodayDoses(userId);

      return {
        success: true,
        data: doses,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to get today's doses",
      };
    }
  }

  public async getThisWeekDoses(
    userId: string
  ): Promise<ServiceResponse<MedicationDose[]>> {
    try {
      const doses = await this.doseRepository.getThisWeekDoses(userId);

      return {
        success: true,
        data: doses,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to get this week's doses",
      };
    }
  }

  public async getDoseAdherence(
    userId: string,
    medicationId: string,
    days: number = 30
  ): Promise<
    ServiceResponse<{
      totalExpectedDoses: number;
      totalTakenDoses: number;
      adherenceRate: number;
      missedDoses: number;
      averageDelayMinutes: number;
    }>
  > {
    try {
      const adherence = await this.doseRepository.getAdherenceStats(
        userId,
        medicationId,
        days
      );

      return {
        success: true,
        data: adherence,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to get dose adherence",
      };
    }
  }

  public async getDoseSummary(userId: string): Promise<
    ServiceResponse<{
      totalDoses: number;
      todayDoses: number;
      thisWeekDoses: number;
      thisMonthDoses: number;
      recentDoses: MedicationDose[];
      adherenceRate: number;
    }>
  > {
    try {
      const summary = await this.doseRepository.getDoseSummary(userId);

      return {
        success: true,
        data: summary,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to get dose summary",
      };
    }
  }

  public async getMedicationInsights(
    userId: string,
    days: number = 7
  ): Promise<
    ServiceResponse<{
      totalMedications: number;
      activeMedications: number;
      adherenceRate: number;
      upcomingDoses: number;
      overdueDoses: number;
      recommendations: string[];
    }>
  > {
    try {
      const [medicationSummary, upcomingDoses, overdueDoses, doseSummary] =
        await Promise.all([
          this.medicationRepository.getMedicationSummary(userId),
          this.medicationRepository.getUpcomingDoses(userId, 24),
          this.medicationRepository.getOverdueDoses(userId),
          this.doseRepository.getDoseSummary(userId),
        ]);

      const recommendations: string[] = [];

      if (overdueDoses.length > 0) {
        recommendations.push(
          `You have ${overdueDoses.length} overdue medication doses. Please take them as soon as possible.`
        );
      }

      if (upcomingDoses.length > 0) {
        recommendations.push(
          `You have ${upcomingDoses.length} upcoming medication doses in the next 24 hours.`
        );
      }

      if (doseSummary.adherenceRate < 80) {
        recommendations.push(
          "Consider setting up medication reminders to improve adherence."
        );
      }

      if (medicationSummary.mealTimingRequired > 0) {
        recommendations.push(
          "Remember to take your medications with meals as directed."
        );
      }

      if (medicationSummary.highFrequencyCount > 0) {
        recommendations.push(
          "You have several high-frequency medications. Consider using a pill organizer."
        );
      }

      return {
        success: true,
        data: {
          totalMedications: medicationSummary.totalMedications,
          activeMedications: medicationSummary.activeMedications,
          adherenceRate: doseSummary.adherenceRate,
          upcomingDoses: upcomingDoses.length,
          overdueDoses: overdueDoses.length,
          recommendations,
        },
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to get medication insights",
      };
    }
  }

  public async createMedicationReminder(
    userId: string,
    medicationName: string,
    dosage: string,
    nextDoseTime: Date
  ): Promise<ServiceResponse<void>> {
    try {
      await this.alertRepository.createMedicationReminder(
        userId,
        medicationName,
        dosage,
        nextDoseTime
      );

      return {
        success: true,
        message: "Medication reminder created successfully",
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to create medication reminder",
      };
    }
  }
}
