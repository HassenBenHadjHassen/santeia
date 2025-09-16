// Alert routes
import { Router, Router as ExpressRouter } from "express";
import { AlertController } from "@/controllers/AlertController";
import { authenticateToken } from "@/middleware/auth";
import { generalRateLimit } from "@/middleware/security";
import { validateRequest, commonSchemas } from "@/middleware/validation";

const router: ExpressRouter = Router();
const alertController = new AlertController();

// Apply authentication and rate limiting to all routes
router.use(authenticateToken);
router.use(generalRateLimit);

// Alert routes
router.post(
  "/",
  validateRequest({ body: commonSchemas.alert.createAlert }),
  alertController.createAlert
);

router.get("/", alertController.getAlertsByUser);
router.get("/:id", alertController.getAlertById);
router.get("/unread", alertController.getUnreadAlerts);
router.get("/read", alertController.getReadAlerts);
router.get("/type/:type", alertController.getAlertsByType);
router.get("/priority/:priority", alertController.getAlertsByPriority);
router.get("/urgent", alertController.getUrgentAlerts);
router.get("/high-priority", alertController.getHighPriorityAlerts);
router.get("/search", alertController.searchAlerts);
router.delete("/:id", alertController.deleteAlert);

// Specific alert types
router.get("/blood-sugar", alertController.getBloodSugarAlerts);
router.get("/medication", alertController.getMedicationAlerts);
router.get("/meal", alertController.getMealAlerts);
router.get("/exercise", alertController.getExerciseAlerts);
router.get("/appointment", alertController.getAppointmentAlerts);
router.get("/general-health", alertController.getGeneralHealthAlerts);

// Alert management
router.get("/recent", alertController.getRecentAlerts);
router.get("/stale", alertController.getStaleAlerts);
router.get("/escalated", alertController.getEscalatedAlerts);
router.patch("/:id/read", alertController.markAsRead);
router.patch("/:id/unread", alertController.markAsUnread);
router.patch("/mark-all-read", alertController.markAllAsRead);
router.patch("/mark-all-unread", alertController.markAllAsUnread);
router.delete("/read", alertController.deleteReadAlerts);
router.delete("/stale", alertController.deleteStaleAlerts);

// Analytics and insights
router.get("/counts", alertController.getAlertCounts);
router.get("/trends", alertController.getAlertTrends);
router.get("/summary", alertController.getAlertSummary);
router.get("/insights", alertController.getAlertInsights);

// Specialized alert creation
router.post(
  "/blood-sugar",
  validateRequest({ body: commonSchemas.alert.createBloodSugarAlert }),
  alertController.createBloodSugarAlert
);

router.post(
  "/medication-reminder",
  validateRequest({ body: commonSchemas.alert.createMedicationReminder }),
  alertController.createMedicationReminder
);

router.post(
  "/meal-reminder",
  validateRequest({ body: commonSchemas.alert.createReminder }),
  alertController.createMealReminder
);

export default router;
