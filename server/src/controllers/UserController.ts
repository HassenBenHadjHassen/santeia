// User controller implementation
import { Request, Response, NextFunction } from "express";
import { BaseController } from "./BaseController";
import { UserService } from "@/services/UserService";
import { User as IUser } from "@/types";

export class UserController extends BaseController {
  private userService: UserService;

  constructor() {
    super();
    this.userService = new UserService();
  }

  public create = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    await this.handleRequest(req, res, next, async () => {
      const requiredFields = ["email", "name"];
      const missingFields = this.validateRequired(req, requiredFields);

      if (missingFields.length > 0) {
        this.sendError(
          res,
          `Missing required fields: ${missingFields.join(", ")}`,
          400
        );
        return;
      }

      const userData: Partial<IUser> = {
        email: req.body.email,
        name: req.body.name,
        role: req.body.role || "user",
        isActive: req.body.isActive ?? true,
      };

      const result = await this.userService.create(userData);
      this.sendServiceResponse(res, result, 201);
    });
  };

  public findById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    await this.handleRequest(req, res, next, async () => {
      const { id } = req.params;

      if (!id) {
        this.sendError(res, "User ID is required", 400);
        return;
      }

      const result = await this.userService.findById(id);
      this.sendServiceResponse(res, result);
    });
  };

  public findAll = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    await this.handleRequest(req, res, next, async () => {
      const filters = {
        role: req.query.role as string,
        isActive: req.query.isActive
          ? req.query.isActive === "true"
          : undefined,
        search: req.query.search as string,
      };

      // Remove undefined values
      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== undefined)
      );

      const result = await this.userService.findAll(cleanFilters);
      this.sendServiceResponse(res, result);
    });
  };

  public update = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    await this.handleRequest(req, res, next, async () => {
      const { id } = req.params;

      if (!id) {
        this.sendError(res, "User ID is required", 400);
        return;
      }

      const updateData: Partial<IUser> = {
        ...(req.body.email && { email: req.body.email }),
        ...(req.body.name && { name: req.body.name }),
        ...(req.body.role && { role: req.body.role }),
        ...(req.body.isActive !== undefined && { isActive: req.body.isActive }),
      };

      const result = await this.userService.update(id, updateData);
      this.sendServiceResponse(res, result);
    });
  };

  public delete = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    await this.handleRequest(req, res, next, async () => {
      const { id } = req.params;

      if (!id) {
        this.sendError(res, "User ID is required", 400);
        return;
      }

      const result = await this.userService.delete(id);
      this.sendServiceResponse(res, result);
    });
  };
}
