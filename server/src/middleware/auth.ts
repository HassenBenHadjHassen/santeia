// JWT Authentication middleware
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "@/config/environment";
import { ApiResponse } from "@/types";

interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

export const authenticateToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    const response: ApiResponse = {
      success: false,
      error: "Access token required",
      statusCode: 401,
    };
    res.status(401).json(response);
    return;
  }

  jwt.verify(token, config.JWT_SECRET, (err, decoded) => {
    if (err) {
      const response: ApiResponse = {
        success: false,
        error: "Invalid or expired token",
        statusCode: 403,
      };
      res.status(403).json(response);
      return;
    }

    req.user = decoded as { userId: string; email: string; role: string };
    next();
  });
};

export const requireRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      const response: ApiResponse = {
        success: false,
        error: "Authentication required",
        statusCode: 401,
      };
      res.status(401).json(response);
      return;
    }

    if (!roles.includes(req.user.role)) {
      const response: ApiResponse = {
        success: false,
        error: "Insufficient permissions",
        statusCode: 403,
      };
      res.status(403).json(response);
      return;
    }

    next();
  };
};
