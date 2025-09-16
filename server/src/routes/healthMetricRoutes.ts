// Health metric routes
import { Router, Router as ExpressRouter } from "express";
import { HealthMetricController } from "@/controllers/HealthMetricController";
import { authenticateToken } from "@/middleware/auth";
import { generalRateLimit } from "@/middleware/security";
import { validateRequest, commonSchemas } from "@/middleware/validation";

const router: ExpressRouter = Router();
const healthMetricController = new HealthMetricController();

// Apply authentication and rate limiting to all routes
router.use(authenticateToken);
router.use(generalRateLimit);

// Health metric routes
router.post(
  "/",
  validateRequest({ body: commonSchemas.healthMetric.create }),
  healthMetricController.createMetric
);

router.get("/", healthMetricController.getMetricsByUser);
router.get("/:id", healthMetricController.getMetricById);
router.get("/type/:metricType", healthMetricController.getMetricsByType);
router.get("/latest/:metricType", healthMetricController.getLatestMetric);
router.get("/date-range", healthMetricController.getMetricsByDateRange);
router.get("/day", healthMetricController.getMetricsByDay);
router.get("/search", healthMetricController.searchMetrics);
router.put("/:id", healthMetricController.updateMetric);
router.delete("/:id", healthMetricController.deleteMetric);

// Specific metric types
router.get("/weight/history", healthMetricController.getWeightHistory);
router.get(
  "/blood-pressure/history",
  healthMetricController.getBloodPressureHistory
);
router.get(
  "/cholesterol/history",
  healthMetricController.getCholesterolHistory
);
router.get("/heart-rate/history", healthMetricController.getHeartRateHistory);
router.get("/bmi/trend", healthMetricController.getBMITrend);

// Statistics and analytics
router.get("/stats", healthMetricController.getMetricStats);
router.get(
  "/requiring-attention",
  healthMetricController.getMetricsRequiringAttention
);
router.get("/normal-range", healthMetricController.getNormalRangeMetrics);
router.get("/categories", healthMetricController.getMetricCategories);
router.get("/recent", healthMetricController.getRecentMetrics);
router.get("/summary", healthMetricController.getMetricSummary);

// Insights and targets
router.get("/insights", healthMetricController.getHealthInsights);
router.get("/targets", healthMetricController.getMetricTargets);

export default router;
