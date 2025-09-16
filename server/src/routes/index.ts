// Main routes index
import { Router, Router as ExpressRouter } from "express";
import userRoutes from "./userRoutes";
import llmRoutes from "./llmRoutes";
import conversationRoutes from "./conversationRoutes";
import bloodSugarRoutes from "./bloodSugarRoutes";
import mealRoutes from "./mealRoutes";
import physicalActivityRoutes from "./physicalActivityRoutes";
import medicationRoutes from "./medicationRoutes";
import healthMetricRoutes from "./healthMetricRoutes";
import alertRoutes from "./alertRoutes";

const router: ExpressRouter = Router();

// Health check endpoint
router.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
    statusCode: 200,
  });
});

// API routes
router.use("/users", userRoutes);
router.use("/conversations", conversationRoutes);
router.use("/llm", llmRoutes);
router.use("/blood-sugar", bloodSugarRoutes);
router.use("/meals", mealRoutes);
router.use("/physical-activities", physicalActivityRoutes);
router.use("/medications", medicationRoutes);
router.use("/health-metrics", healthMetricRoutes);
router.use("/alerts", alertRoutes);

// API info endpoint
router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "SanteIA API Server",
    version: "1.0.0",
    endpoints: {
      health: "/api/health",
      users: "/api/users",
      conversations: "/api/conversations",
      llm: "/api/llm",
      bloodSugar: "/api/blood-sugar",
      meals: "/api/meals",
      physicalActivities: "/api/physical-activities",
      medications: "/api/medications",
      healthMetrics: "/api/health-metrics",
      alerts: "/api/alerts",
    },
    statusCode: 200,
  });
});

export default router;
