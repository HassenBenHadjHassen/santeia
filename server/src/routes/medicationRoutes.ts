// Medication routes
import { Router, Router as ExpressRouter } from "express";
import { MedicationController } from "@/controllers/MedicationController";
import { authenticateToken } from "@/middleware/auth";
import { generalRateLimit } from "@/middleware/security";
import { validateRequest, commonSchemas } from "@/middleware/validation";

const router: ExpressRouter = Router();
const medicationController = new MedicationController();

// Apply authentication and rate limiting to all routes
router.use(authenticateToken);
router.use(generalRateLimit);

// Medication routes
router.post(
  "/",
  validateRequest({ body: commonSchemas.medication.create }),
  medicationController.createMedication
);

router.get("/", medicationController.getMedicationsByUser);
router.get("/:id", medicationController.getMedicationById);
router.get("/active", medicationController.getActiveMedications);
router.get("/inactive", medicationController.getInactiveMedications);
router.get("/type/:type", medicationController.getMedicationsByType);
router.get("/insulin", medicationController.getInsulinMedications);
router.get("/oral", medicationController.getOralMedications);
router.get("/search", medicationController.searchMedications);
router.put("/:id", medicationController.updateMedication);
router.delete("/:id", medicationController.deleteMedication);

// Medication status
router.patch("/:id/activate", medicationController.activateMedication);
router.patch("/:id/deactivate", medicationController.deactivateMedication);

// Medication counts and summary
router.get("/count", medicationController.getMedicationCount);
router.get("/summary", medicationController.getMedicationSummary);
router.get("/upcoming-doses", medicationController.getUpcomingDoses);
router.get("/overdue-doses", medicationController.getOverdueDoses);

// Medication dose routes
router.post(
  "/doses",
  validateRequest({ body: commonSchemas.medication.recordDose }),
  medicationController.recordDose
);

router.get(
  "/doses/medication/:medicationId",
  medicationController.getDosesByMedication
);
router.get("/doses/today", medicationController.getTodayDoses);
router.get("/doses/week", medicationController.getThisWeekDoses);
router.get(
  "/doses/adherence/:medicationId",
  medicationController.getDoseAdherence
);
router.get("/doses/summary", medicationController.getDoseSummary);

// Insights and reminders
router.get("/insights", medicationController.getMedicationInsights);
router.post(
  "/reminders",
  validateRequest({ body: commonSchemas.medication.createReminder }),
  medicationController.createMedicationReminder
);

export default router;
