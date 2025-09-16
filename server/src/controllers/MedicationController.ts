// MedicationController for handling medication related requests
import { Request, Response, NextFunction } from "express";
import { BaseController } from "./BaseController";
import { MedicationService } from "@/services/MedicationService";

export class MedicationController extends BaseController {
  private medicationService: MedicationService;

  constructor() {
    super();
    this.medicationService = new MedicationService();
  }

  public createMedication = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    await this.handleRequest(req, res, next, async () => {
      const requiredFields = ["name", "type", "dosage", "unit", "frequency"];
      const missingFields = this.validateRequired(req, requiredFields);

      if (missingFields.length > 0) {
        this.sendError(
          res,
          `Missing required fields: ${missingFields.join(", ")}`,
          400
        );
        return;
      }

      const { name, type, dosage, unit, frequency, instructions } = req.body;
      const userId = (req as any).user?.userId;

      if (!userId) {
        this.sendError(res, "User ID is required", 400);
        return;
      }

      const validTypes = ["insulin", "oral", "other"];
      if (!validTypes.includes(type)) {
        this.sendError(res, "Type must be one of: insulin, oral, other", 400);
        return;
      }

      const result = await this.medicationService.createMedication(userId, {
        name,
        type,
        dosage,
        unit,
        frequency,
        instructions,
      });

      this.sendServiceResponse(res, result);
    });
  };

  public getMedicationById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    await this.handleRequest(req, res, next, async () => {
      const { id } = req.params;

      if (!id) {
        this.sendError(res, "Medication ID is required", 400);
        return;
      }

      const result = await this.medicationService.getMedicationById(id);
      this.sendServiceResponse(res, result);
    });
  };

  public getMedicationsByUser = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    await this.handleRequest(req, res, next, async () => {
      const userId = (req as any).user?.userId;

      if (!userId) {
        this.sendError(res, "User ID is required", 400);
        return;
      }

      const {
        page = 1,
        limit = 10,
        sortBy = "createdAt",
        sortOrder = "desc",
        type,
        isActive,
      } = req.query;

      const filters: any = {};
      if (type) filters.type = type;
      if (isActive !== undefined) filters.isActive = isActive === "true";

      const pagination = {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        sortBy: sortBy as string,
        sortOrder: sortOrder as "asc" | "desc",
      };

      const result = await this.medicationService.getMedicationsByUser(
        userId,
        filters,
        pagination
      );
      this.sendServiceResponse(res, result);
    });
  };

  public getActiveMedications = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    await this.handleRequest(req, res, next, async () => {
      const userId = (req as any).user?.userId;

      if (!userId) {
        this.sendError(res, "User ID is required", 400);
        return;
      }

      const result = await this.medicationService.getActiveMedications(userId);
      this.sendServiceResponse(res, result);
    });
  };

  public getInactiveMedications = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    await this.handleRequest(req, res, next, async () => {
      const userId = (req as any).user?.userId;

      if (!userId) {
        this.sendError(res, "User ID is required", 400);
        return;
      }

      const result = await this.medicationService.getInactiveMedications(
        userId
      );
      this.sendServiceResponse(res, result);
    });
  };

  public getMedicationsByType = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    await this.handleRequest(req, res, next, async () => {
      const userId = (req as any).user?.userId;
      const { type } = req.params;

      if (!userId) {
        this.sendError(res, "User ID is required", 400);
        return;
      }

      if (!type) {
        this.sendError(res, "Medication type is required", 400);
        return;
      }

      const result = await this.medicationService.getMedicationsByType(
        userId,
        type
      );
      this.sendServiceResponse(res, result);
    });
  };

  public getInsulinMedications = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    await this.handleRequest(req, res, next, async () => {
      const userId = (req as any).user?.userId;

      if (!userId) {
        this.sendError(res, "User ID is required", 400);
        return;
      }

      const result = await this.medicationService.getInsulinMedications(userId);
      this.sendServiceResponse(res, result);
    });
  };

  public getOralMedications = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    await this.handleRequest(req, res, next, async () => {
      const userId = (req as any).user?.userId;

      if (!userId) {
        this.sendError(res, "User ID is required", 400);
        return;
      }

      const result = await this.medicationService.getOralMedications(userId);
      this.sendServiceResponse(res, result);
    });
  };

  public searchMedications = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    await this.handleRequest(req, res, next, async () => {
      const userId = (req as any).user?.userId;
      const { query } = req.query;

      if (!userId) {
        this.sendError(res, "User ID is required", 400);
        return;
      }

      if (!query) {
        this.sendError(res, "Search query is required", 400);
        return;
      }

      const result = await this.medicationService.searchMedications(
        userId,
        query as string
      );
      this.sendServiceResponse(res, result);
    });
  };

  public getMedicationCount = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    await this.handleRequest(req, res, next, async () => {
      const userId = (req as any).user?.userId;

      if (!userId) {
        this.sendError(res, "User ID is required", 400);
        return;
      }

      const result = await this.medicationService.getMedicationCount(userId);
      this.sendServiceResponse(res, result);
    });
  };

  public getUpcomingDoses = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    await this.handleRequest(req, res, next, async () => {
      const userId = (req as any).user?.userId;
      const { hours = 24 } = req.query;

      if (!userId) {
        this.sendError(res, "User ID is required", 400);
        return;
      }

      const result = await this.medicationService.getUpcomingDoses(
        userId,
        parseInt(hours as string)
      );
      this.sendServiceResponse(res, result);
    });
  };

  public getOverdueDoses = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    await this.handleRequest(req, res, next, async () => {
      const userId = (req as any).user?.userId;

      if (!userId) {
        this.sendError(res, "User ID is required", 400);
        return;
      }

      const result = await this.medicationService.getOverdueDoses(userId);
      this.sendServiceResponse(res, result);
    });
  };

  public getMedicationSummary = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    await this.handleRequest(req, res, next, async () => {
      const userId = (req as any).user?.userId;

      if (!userId) {
        this.sendError(res, "User ID is required", 400);
        return;
      }

      const result = await this.medicationService.getMedicationSummary(userId);
      this.sendServiceResponse(res, result);
    });
  };

  public updateMedication = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    await this.handleRequest(req, res, next, async () => {
      const { id } = req.params;
      const { name, type, dosage, unit, frequency, instructions } = req.body;

      if (!id) {
        this.sendError(res, "Medication ID is required", 400);
        return;
      }

      if (type) {
        const validTypes = ["insulin", "oral", "other"];
        if (!validTypes.includes(type)) {
          this.sendError(res, "Type must be one of: insulin, oral, other", 400);
          return;
        }
      }

      const result = await this.medicationService.updateMedication(id, {
        name,
        type,
        dosage,
        unit,
        frequency,
        instructions,
      });
      this.sendServiceResponse(res, result);
    });
  };

  public deactivateMedication = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    await this.handleRequest(req, res, next, async () => {
      const { id } = req.params;

      if (!id) {
        this.sendError(res, "Medication ID is required", 400);
        return;
      }

      const result = await this.medicationService.deactivateMedication(id);
      this.sendServiceResponse(res, result);
    });
  };

  public activateMedication = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    await this.handleRequest(req, res, next, async () => {
      const { id } = req.params;

      if (!id) {
        this.sendError(res, "Medication ID is required", 400);
        return;
      }

      const result = await this.medicationService.activateMedication(id);
      this.sendServiceResponse(res, result);
    });
  };

  public deleteMedication = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    await this.handleRequest(req, res, next, async () => {
      const { id } = req.params;

      if (!id) {
        this.sendError(res, "Medication ID is required", 400);
        return;
      }

      const result = await this.medicationService.deleteMedication(id);
      this.sendServiceResponse(res, result);
    });
  };

  // Medication Dose Methods
  public recordDose = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    await this.handleRequest(req, res, next, async () => {
      const requiredFields = ["medicationId", "dosage", "unit"];
      const missingFields = this.validateRequired(req, requiredFields);

      if (missingFields.length > 0) {
        this.sendError(
          res,
          `Missing required fields: ${missingFields.join(", ")}`,
          400
        );
        return;
      }

      const { medicationId, dosage, unit, notes } = req.body;
      const userId = (req as any).user?.userId;

      if (!userId) {
        this.sendError(res, "User ID is required", 400);
        return;
      }

      const result = await this.medicationService.recordDose(
        medicationId,
        userId,
        dosage,
        unit,
        notes
      );

      this.sendServiceResponse(res, result);
    });
  };

  public getDosesByMedication = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    await this.handleRequest(req, res, next, async () => {
      const userId = (req as any).user?.userId;
      const { medicationId } = req.params;
      const { limit = 50 } = req.query;

      if (!userId) {
        this.sendError(res, "User ID is required", 400);
        return;
      }

      if (!medicationId) {
        this.sendError(res, "Medication ID is required", 400);
        return;
      }

      const result = await this.medicationService.getDosesByMedication(
        medicationId,
        userId,
        parseInt(limit as string)
      );
      this.sendServiceResponse(res, result);
    });
  };

  public getTodayDoses = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    await this.handleRequest(req, res, next, async () => {
      const userId = (req as any).user?.userId;

      if (!userId) {
        this.sendError(res, "User ID is required", 400);
        return;
      }

      const result = await this.medicationService.getTodayDoses(userId);
      this.sendServiceResponse(res, result);
    });
  };

  public getThisWeekDoses = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    await this.handleRequest(req, res, next, async () => {
      const userId = (req as any).user?.userId;

      if (!userId) {
        this.sendError(res, "User ID is required", 400);
        return;
      }

      const result = await this.medicationService.getThisWeekDoses(userId);
      this.sendServiceResponse(res, result);
    });
  };

  public getDoseAdherence = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    await this.handleRequest(req, res, next, async () => {
      const userId = (req as any).user?.userId;
      const { medicationId } = req.params;
      const { days = 30 } = req.query;

      if (!userId) {
        this.sendError(res, "User ID is required", 400);
        return;
      }

      if (!medicationId) {
        this.sendError(res, "Medication ID is required", 400);
        return;
      }

      const result = await this.medicationService.getDoseAdherence(
        userId,
        medicationId,
        parseInt(days as string)
      );
      this.sendServiceResponse(res, result);
    });
  };

  public getDoseSummary = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    await this.handleRequest(req, res, next, async () => {
      const userId = (req as any).user?.userId;

      if (!userId) {
        this.sendError(res, "User ID is required", 400);
        return;
      }

      const result = await this.medicationService.getDoseSummary(userId);
      this.sendServiceResponse(res, result);
    });
  };

  public getMedicationInsights = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    await this.handleRequest(req, res, next, async () => {
      const userId = (req as any).user?.userId;
      const { days = 7 } = req.query;

      if (!userId) {
        this.sendError(res, "User ID is required", 400);
        return;
      }

      const result = await this.medicationService.getMedicationInsights(
        userId,
        parseInt(days as string)
      );
      this.sendServiceResponse(res, result);
    });
  };

  public createMedicationReminder = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    await this.handleRequest(req, res, next, async () => {
      const requiredFields = ["medicationName", "dosage", "nextDoseTime"];
      const missingFields = this.validateRequired(req, requiredFields);

      if (missingFields.length > 0) {
        this.sendError(
          res,
          `Missing required fields: ${missingFields.join(", ")}`,
          400
        );
        return;
      }

      const { medicationName, dosage, nextDoseTime } = req.body;
      const userId = (req as any).user?.userId;

      if (!userId) {
        this.sendError(res, "User ID is required", 400);
        return;
      }

      const result = await this.medicationService.createMedicationReminder(
        userId,
        medicationName,
        dosage,
        new Date(nextDoseTime)
      );

      this.sendServiceResponse(res, result);
    });
  };

  // Abstract methods from BaseController (not used in this controller)
  public create = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    this.sendError(res, "Method not implemented", 501);
  };

  public findById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    this.sendError(res, "Method not implemented", 501);
  };

  public findAll = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    this.sendError(res, "Method not implemented", 501);
  };

  public update = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    this.sendError(res, "Method not implemented", 501);
  };

  public delete = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    this.sendError(res, "Method not implemented", 501);
  };
}
