// MealController for handling meal related requests
import { Request, Response, NextFunction } from "express";
import { BaseController } from "./BaseController";
import { MealService } from "@/services/MealService";

export class MealController extends BaseController {
  private mealService: MealService;

  constructor() {
    super();
    this.mealService = new MealService();
  }

  public createMeal = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    await this.handleRequest(req, res, next, async () => {
      const requiredFields = ["name"];
      const missingFields = this.validateRequired(req, requiredFields);

      if (missingFields.length > 0) {
        this.sendError(
          res,
          `Missing required fields: ${missingFields.join(", ")}`,
          400
        );
        return;
      }

      const {
        name,
        description,
        carbohydrates,
        calories,
        protein,
        fat,
        fiber,
        sugar,
        timestamp,
      } = req.body;
      const userId = (req as any).user?.userId;

      if (!userId) {
        this.sendError(res, "User ID is required", 400);
        return;
      }

      if (
        carbohydrates !== undefined &&
        (carbohydrates < 0 || carbohydrates > 1000)
      ) {
        this.sendError(
          res,
          "Carbohydrates must be between 0 and 1000 grams",
          400
        );
        return;
      }

      if (calories !== undefined && (calories < 0 || calories > 10000)) {
        this.sendError(res, "Calories must be between 0 and 10000", 400);
        return;
      }

      const result = await this.mealService.createMeal(userId, {
        name,
        description,
        carbohydrates,
        calories,
        protein,
        fat,
        fiber,
        sugar,
        timestamp: timestamp ? new Date(timestamp) : undefined,
      });

      this.sendServiceResponse(res, result);
    });
  };

  public getMealById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    await this.handleRequest(req, res, next, async () => {
      const { id } = req.params;

      if (!id) {
        this.sendError(res, "Meal ID is required", 400);
        return;
      }

      const result = await this.mealService.getMealById(id);
      this.sendServiceResponse(res, result);
    });
  };

  public getMealsByUser = async (
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
        sortBy = "timestamp",
        sortOrder = "desc",
        startDate,
        endDate,
        mealType,
      } = req.query;

      const filters: any = {};
      if (startDate && endDate) {
        filters.timestamp = {
          gte: new Date(startDate as string),
          lte: new Date(endDate as string),
        };
      }

      const pagination = {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        sortBy: sortBy as string,
        sortOrder: sortOrder as "asc" | "desc",
      };

      const result = await this.mealService.getMealsByUser(
        userId,
        filters,
        pagination
      );
      this.sendServiceResponse(res, result);
    });
  };

  public getMealsByDateRange = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    await this.handleRequest(req, res, next, async () => {
      const userId = (req as any).user?.userId;
      const { startDate, endDate } = req.query;

      if (!userId) {
        this.sendError(res, "User ID is required", 400);
        return;
      }

      if (!startDate || !endDate) {
        this.sendError(res, "Start date and end date are required", 400);
        return;
      }

      const result = await this.mealService.getMealsByDateRange(
        userId,
        new Date(startDate as string),
        new Date(endDate as string)
      );
      this.sendServiceResponse(res, result);
    });
  };

  public getMealsByDay = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    await this.handleRequest(req, res, next, async () => {
      const userId = (req as any).user?.userId;
      const { date } = req.query;

      if (!userId) {
        this.sendError(res, "User ID is required", 400);
        return;
      }

      if (!date) {
        this.sendError(res, "Date is required", 400);
        return;
      }

      const result = await this.mealService.getMealsByDay(
        userId,
        new Date(date as string)
      );
      this.sendServiceResponse(res, result);
    });
  };

  public getMealsByWeek = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    await this.handleRequest(req, res, next, async () => {
      const userId = (req as any).user?.userId;
      const { startDate } = req.query;

      if (!userId) {
        this.sendError(res, "User ID is required", 400);
        return;
      }

      if (!startDate) {
        this.sendError(res, "Start date is required", 400);
        return;
      }

      const result = await this.mealService.getMealsByWeek(
        userId,
        new Date(startDate as string)
      );
      this.sendServiceResponse(res, result);
    });
  };

  public getMealsByMonth = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    await this.handleRequest(req, res, next, async () => {
      const userId = (req as any).user?.userId;
      const { year, month } = req.query;

      if (!userId) {
        this.sendError(res, "User ID is required", 400);
        return;
      }

      if (!year || !month) {
        this.sendError(res, "Year and month are required", 400);
        return;
      }

      const result = await this.mealService.getMealsByMonth(
        userId,
        parseInt(year as string),
        parseInt(month as string)
      );
      this.sendServiceResponse(res, result);
    });
  };

  public getMealsByType = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    await this.handleRequest(req, res, next, async () => {
      const userId = (req as any).user?.userId;
      const { mealType } = req.params;

      if (!userId) {
        this.sendError(res, "User ID is required", 400);
        return;
      }

      const validMealTypes = ["breakfast", "lunch", "dinner", "snack"];
      if (!validMealTypes.includes(mealType)) {
        this.sendError(
          res,
          "Invalid meal type. Must be one of: breakfast, lunch, dinner, snack",
          400
        );
        return;
      }

      const result = await this.mealService.getMealsByType(
        userId,
        mealType as any
      );
      this.sendServiceResponse(res, result);
    });
  };

  public getHighCarbMeals = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    await this.handleRequest(req, res, next, async () => {
      const userId = (req as any).user?.userId;
      const { threshold = 50 } = req.query;

      if (!userId) {
        this.sendError(res, "User ID is required", 400);
        return;
      }

      const result = await this.mealService.getHighCarbMeals(
        userId,
        parseInt(threshold as string)
      );
      this.sendServiceResponse(res, result);
    });
  };

  public getLowCarbMeals = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    await this.handleRequest(req, res, next, async () => {
      const userId = (req as any).user?.userId;
      const { threshold = 20 } = req.query;

      if (!userId) {
        this.sendError(res, "User ID is required", 400);
        return;
      }

      const result = await this.mealService.getLowCarbMeals(
        userId,
        parseInt(threshold as string)
      );
      this.sendServiceResponse(res, result);
    });
  };

  public searchMeals = async (
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

      const result = await this.mealService.searchMeals(
        userId,
        query as string
      );
      this.sendServiceResponse(res, result);
    });
  };

  public getTotalMacrosByDay = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    await this.handleRequest(req, res, next, async () => {
      const userId = (req as any).user?.userId;
      const { date } = req.query;

      if (!userId) {
        this.sendError(res, "User ID is required", 400);
        return;
      }

      if (!date) {
        this.sendError(res, "Date is required", 400);
        return;
      }

      const result = await this.mealService.getTotalMacrosByDay(
        userId,
        new Date(date as string)
      );
      this.sendServiceResponse(res, result);
    });
  };

  public getTotalMacrosByWeek = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    await this.handleRequest(req, res, next, async () => {
      const userId = (req as any).user?.userId;
      const { startDate } = req.query;

      if (!userId) {
        this.sendError(res, "User ID is required", 400);
        return;
      }

      if (!startDate) {
        this.sendError(res, "Start date is required", 400);
        return;
      }

      const result = await this.mealService.getTotalMacrosByWeek(
        userId,
        new Date(startDate as string)
      );
      this.sendServiceResponse(res, result);
    });
  };

  public getAverageMacrosByDay = async (
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

      const result = await this.mealService.getAverageMacrosByDay(
        userId,
        parseInt(days as string)
      );
      this.sendServiceResponse(res, result);
    });
  };

  public getMealFrequency = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    await this.handleRequest(req, res, next, async () => {
      const userId = (req as any).user?.userId;
      const { days = 30 } = req.query;

      if (!userId) {
        this.sendError(res, "User ID is required", 400);
        return;
      }

      const result = await this.mealService.getMealFrequency(
        userId,
        parseInt(days as string)
      );
      this.sendServiceResponse(res, result);
    });
  };

  public getRecentMeals = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    await this.handleRequest(req, res, next, async () => {
      const userId = (req as any).user?.userId;
      const { limit = 10 } = req.query;

      if (!userId) {
        this.sendError(res, "User ID is required", 400);
        return;
      }

      const result = await this.mealService.getRecentMeals(
        userId,
        parseInt(limit as string)
      );
      this.sendServiceResponse(res, result);
    });
  };

  public updateMeal = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    await this.handleRequest(req, res, next, async () => {
      const { id } = req.params;
      const {
        name,
        description,
        carbohydrates,
        calories,
        protein,
        fat,
        fiber,
        sugar,
        timestamp,
      } = req.body;

      if (!id) {
        this.sendError(res, "Meal ID is required", 400);
        return;
      }

      if (
        carbohydrates !== undefined &&
        (carbohydrates < 0 || carbohydrates > 1000)
      ) {
        this.sendError(
          res,
          "Carbohydrates must be between 0 and 1000 grams",
          400
        );
        return;
      }

      if (calories !== undefined && (calories < 0 || calories > 10000)) {
        this.sendError(res, "Calories must be between 0 and 10000", 400);
        return;
      }

      const result = await this.mealService.updateMeal(id, {
        name,
        description,
        carbohydrates,
        calories,
        protein,
        fat,
        fiber,
        sugar,
        timestamp: timestamp ? new Date(timestamp) : undefined,
      });
      this.sendServiceResponse(res, result);
    });
  };

  public deleteMeal = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    await this.handleRequest(req, res, next, async () => {
      const { id } = req.params;

      if (!id) {
        this.sendError(res, "Meal ID is required", 400);
        return;
      }

      const result = await this.mealService.deleteMeal(id);
      this.sendServiceResponse(res, result);
    });
  };

  public getMealInsights = async (
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

      const result = await this.mealService.getMealInsights(
        userId,
        parseInt(days as string)
      );
      this.sendServiceResponse(res, result);
    });
  };

  public getMealSuggestions = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    await this.handleRequest(req, res, next, async () => {
      const userId = (req as any).user?.userId;
      const { mealType, maxCarbs = 50 } = req.query;

      if (!userId) {
        this.sendError(res, "User ID is required", 400);
        return;
      }

      const validMealTypes = ["breakfast", "lunch", "dinner", "snack"];
      if (!mealType || !validMealTypes.includes(mealType as string)) {
        this.sendError(
          res,
          "Valid meal type is required (breakfast, lunch, dinner, snack)",
          400
        );
        return;
      }

      const result = await this.mealService.getMealSuggestions(
        userId,
        mealType as any,
        parseInt(maxCarbs as string)
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
