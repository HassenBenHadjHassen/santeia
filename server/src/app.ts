// Express application setup
import express, { Express } from "express";
import compression from "compression";
import morgan from "morgan";
import { config } from "@/config/environment";
import {
  helmetConfig,
  corsConfig,
  sanitizeRequest,
  securityHeaders,
} from "@/middleware/security";
import { errorHandler, notFoundHandler } from "@/middleware/errorHandler";
import routes from "@/routes";

const app: Express = express();

// Trust proxy (for rate limiting behind reverse proxy)
app.set("trust proxy", 1);

// Security middleware
app.use(helmetConfig);
app.use(corsConfig);
app.use(securityHeaders);
app.use(sanitizeRequest);

// Compression middleware
app.use(compression());

// Logging middleware
if (config.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// API routes
app.use("/api", routes);

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Welcome to SanteIA API Server",
    version: "1.0.0",
    documentation: "/api",
    statusCode: 200,
  });
});

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

export default app;
