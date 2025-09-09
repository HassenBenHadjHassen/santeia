// Security middleware
import { Request, Response, NextFunction } from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import cors from "cors";
import { config } from "@/config/environment";

// Rate limiting configuration
export const createRateLimit = (windowMs: number, max: number) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      error: "Too many requests from this IP, please try again later.",
      statusCode: 429,
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

// General rate limiter
export const generalRateLimit = createRateLimit(
  config.RATE_LIMIT_WINDOW_MS,
  config.RATE_LIMIT_MAX_REQUESTS
);

// Strict rate limiter for auth endpoints
export const authRateLimit = createRateLimit(15 * 60 * 1000, 5); // 5 requests per 15 minutes

// Helmet configuration for security headers
export const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false,
});

// CORS configuration
export const corsConfig = cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);

    const allowedOrigins = config.CORS_ORIGIN.split(",").map((o: string) =>
      o.trim()
    );

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
});

// Request sanitization middleware
export const sanitizeRequest = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Remove potentially dangerous characters from request body
  if (req.body && typeof req.body === "object") {
    sanitizeObject(req.body);
  }

  // Sanitize query parameters
  if (req.query && typeof req.query === "object") {
    sanitizeObject(req.query);
  }

  next();
};

// Recursively sanitize object properties
const sanitizeObject = (obj: any): void => {
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      if (typeof obj[key] === "string") {
        // Remove potentially dangerous characters
        obj[key] = obj[key]
          .replace(/[<>]/g, "")
          .replace(/javascript:/gi, "")
          .replace(/on\w+=/gi, "")
          .trim();
      } else if (typeof obj[key] === "object" && obj[key] !== null) {
        sanitizeObject(obj[key]);
      }
    }
  }
};

// Security headers middleware
export const securityHeaders = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Prevent clickjacking
  res.setHeader("X-Frame-Options", "DENY");

  // Prevent MIME type sniffing
  res.setHeader("X-Content-Type-Options", "nosniff");

  // Enable XSS protection
  res.setHeader("X-XSS-Protection", "1; mode=block");

  // Referrer policy
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");

  // Remove X-Powered-By header
  res.removeHeader("X-Powered-By");

  next();
};
