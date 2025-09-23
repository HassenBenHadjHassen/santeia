// Request validation middleware
import { Request, Response, NextFunction } from "express";
import Joi from "joi";
import { ApiResponse } from "@/types";

export const validateRequest = (schema: {
  body?: Joi.ObjectSchema;
  params?: Joi.ObjectSchema;
  query?: Joi.ObjectSchema;
}) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const errors: string[] = [];

    // Validate request body
    if (schema.body) {
      const { error } = schema.body.validate(req.body);
      if (error) {
        errors.push(
          `Body: ${error.details.map((detail) => detail.message).join(", ")}`
        );
      }
    }

    // Validate request params
    if (schema.params) {
      const { error } = schema.params.validate(req.params);
      if (error) {
        errors.push(
          `Params: ${error.details.map((detail) => detail.message).join(", ")}`
        );
      }
    }

    // Validate request query
    if (schema.query) {
      const { error } = schema.query.validate(req.query);
      if (error) {
        errors.push(
          `Query: ${error.details.map((detail) => detail.message).join(", ")}`
        );
      }
    }

    if (errors.length > 0) {
      const response: ApiResponse = {
        success: false,
        error: `Validation failed: ${errors.join("; ")}`,
        statusCode: 400,
      };
      res.status(400).json(response);
      return;
    }

    next();
  };
};

// Common validation schemas
export const commonSchemas = {
  id: Joi.object({
    id: Joi.string().required().min(1),
  }),

  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sortBy: Joi.string().optional(),
    sortOrder: Joi.string().valid("asc", "desc").default("asc"),
  }),

  user: {
    create: Joi.object({
      email: Joi.string().email().required(),
      name: Joi.string().min(2).max(50).required(),
      role: Joi.string().valid("ADMIN", "USER", "MODERATOR").default("USER"),
      isActive: Joi.boolean().default(true),
      password: Joi.string().min(6).optional(),
      dateOfBirth: Joi.string().optional().allow(""),
      heightCm: Joi.number().positive().optional(),
      weightKg: Joi.number().positive().optional(),
      bloodPressureSystolic: Joi.number().integer().min(50).max(300).optional(),
      bloodPressureDiastolic: Joi.number()
        .integer()
        .min(30)
        .max(200)
        .optional(),
      heartRate: Joi.number().integer().min(20).max(250).optional(),
    }),

    update: Joi.object({
      email: Joi.string().email().optional(),
      name: Joi.string().min(2).max(50).optional(),
      role: Joi.string().valid("ADMIN", "USER", "MODERATOR").optional(),
      isActive: Joi.boolean().optional(),
      password: Joi.string().min(6).optional(),
      dateOfBirth: Joi.string().optional().allow(""),
      heightCm: Joi.number().positive().optional().allow(null),
      weightKg: Joi.number().positive().optional().allow(null),
      bloodPressureSystolic: Joi.number()
        .integer()
        .min(50)
        .max(300)
        .optional()
        .allow(null),
      bloodPressureDiastolic: Joi.number()
        .integer()
        .min(30)
        .max(200)
        .optional()
        .allow(null),
      heartRate: Joi.number().integer().min(20).max(250).optional().allow(null),
    }),
  },

  conversation: {
    create: Joi.object({
      title: Joi.string().min(1).max(100).required(),
    }),

    sendMessage: Joi.object({
      content: Joi.string().min(1).max(4000).required(),
      conversationId: Joi.string().required(),
    }),
  },

  llm: {
    generate: Joi.object({
      prompt: Joi.string().min(1).max(4000).required(),
      userId: Joi.string().required(),
      conversationId: Joi.string().optional(),
      maxTokens: Joi.number().integer().min(1).max(2048).optional(),
      temperature: Joi.number().min(0).max(2).optional(),
      topP: Joi.number().min(0).max(1).optional(),
      repetitionPenalty: Joi.number().min(0).max(2).optional(),
    }),
  },

  onboarding: {
    save: Joi.object({
      onboardingData: Joi.object({
        diabetesType: Joi.string()
          .valid("type1", "type2", "gestational", "prediabetes", "other")
          .required(),
        diagnosisDate: Joi.string().optional().allow(""),
        currentMedications: Joi.array().items(Joi.string()).default([]),
        bloodSugarTargets: Joi.object({
          fasting: Joi.string().optional().allow(""),
          beforeMeals: Joi.string().optional().allow(""),
          afterMeals: Joi.string().optional().allow(""),
          bedtime: Joi.string().optional().allow(""),
        }).required(),
        // Optional profile health fields collected during onboarding
        dateOfBirth: Joi.string().optional().allow(""),
        heightCm: Joi.number().positive().optional(),
        weightKg: Joi.number().positive().optional(),
        bloodPressureSystolic: Joi.number()
          .integer()
          .min(50)
          .max(300)
          .optional(),
        bloodPressureDiastolic: Joi.number()
          .integer()
          .min(30)
          .max(200)
          .optional(),
        heartRate: Joi.number().integer().min(20).max(250).optional(),
        activityLevel: Joi.string()
          .valid("sedentary", "light", "moderate", "active", "very-active")
          .required(),
        dietaryPreferences: Joi.array().items(Joi.string()).default([]),
        emergencyContact: Joi.object({
          name: Joi.string().optional().allow(""),
          phone: Joi.string().optional().allow(""),
          relationship: Joi.string().optional().allow(""),
        }).required(),
      }).required(),
    }),
  },

  bloodSugar: {
    createReading: Joi.object({
      value: Joi.number().positive().required(),
      unit: Joi.string().valid("mg/dL", "mmol/L").required(),
      readingType: Joi.string()
        .valid("fasting", "before_meal", "after_meal", "bedtime", "random")
        .required(),
      notes: Joi.string().max(500).optional(),
      timestamp: Joi.date().optional(),
    }),
  },

  meal: {
    create: Joi.object({
      name: Joi.string().min(1).max(100).required(),
      description: Joi.string().max(500).optional(),
      calories: Joi.number().min(0).optional(),
      carbohydrates: Joi.number().min(0).optional(),
      proteins: Joi.number().min(0).optional(),
      fats: Joi.number().min(0).optional(),
      fiber: Joi.number().min(0).optional(),
      sugar: Joi.number().min(0).optional(),
      sodium: Joi.number().min(0).optional(),
      mealType: Joi.string()
        .valid("breakfast", "lunch", "dinner", "snack")
        .required(),
      timestamp: Joi.date().optional(),
      notes: Joi.string().max(500).optional(),
    }),
  },

  physicalActivity: {
    create: Joi.object({
      name: Joi.string().min(1).max(100).required(),
      description: Joi.string().max(500).optional(),
      activityType: Joi.string()
        .valid(
          "cardio",
          "strength",
          "flexibility",
          "sports",
          "walking",
          "cycling",
          "swimming",
          "other"
        )
        .required(),
      duration: Joi.number().positive().required(),
      intensity: Joi.string().valid("low", "moderate", "high").required(),
      caloriesBurned: Joi.number().min(0).optional(),
      distance: Joi.number().min(0).optional(),
      heartRate: Joi.number().min(0).optional(),
      timestamp: Joi.date().optional(),
      notes: Joi.string().max(500).optional(),
    }),
  },

  medication: {
    create: Joi.object({
      name: Joi.string().min(1).max(100).required(),
      type: Joi.string()
        .valid("oral", "injection", "inhaler", "topical", "other")
        .required(),
      dosage: Joi.string().min(1).max(50).required(),
      unit: Joi.string().valid("mg", "g", "ml", "units", "pills").required(),
      frequency: Joi.string()
        .valid("daily", "weekly", "monthly", "as_needed")
        .required(),
      timesPerDay: Joi.number().integer().min(1).max(6).optional(),
      specificTimes: Joi.array()
        .items(Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/))
        .optional(),
      startDate: Joi.date().required(),
      endDate: Joi.date().optional(),
      instructions: Joi.string().max(1000).optional(),
      sideEffects: Joi.string().max(1000).optional(),
      notes: Joi.string().max(500).optional(),
    }),

    recordDose: Joi.object({
      medicationId: Joi.string().required(),
      dosage: Joi.string().min(1).max(50).required(),
      unit: Joi.string().valid("mg", "g", "ml", "units", "pills").required(),
      takenAt: Joi.date().optional(),
      notes: Joi.string().max(500).optional(),
    }),

    createReminder: Joi.object({
      medicationId: Joi.string().required(),
      reminderTime: Joi.string()
        .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .required(),
      message: Joi.string().min(1).max(200).optional(),
      isActive: Joi.boolean().default(true),
    }),
  },

  healthMetric: {
    create: Joi.object({
      type: Joi.string()
        .valid(
          "weight",
          "height",
          "bmi",
          "temperature",
          "heart_rate",
          "blood_pressure",
          "cholesterol"
        )
        .optional(),
      metricType: Joi.string()
        .valid(
          "WEIGHT",
          "BLOOD_PRESSURE_SYSTOLIC",
          "BLOOD_PRESSURE_DIASTOLIC",
          "CHOLESTEROL_TOTAL",
          "CHOLESTEROL_HDL",
          "CHOLESTEROL_LDL",
          "TRIGLYCERIDES",
          "HEART_RATE",
          "BMI"
        )
        .optional(),
      value: Joi.alternatives().try(Joi.string(), Joi.number()).required(),
      unit: Joi.string().required(),
      timestamp: Joi.date().optional(),
      notes: Joi.string().max(500).optional(),
      additionalData: Joi.object().optional(),
    }).or("type", "metricType"), // At least one of type or metricType is required
  },

  alert: {
    createAlert: Joi.object({
      type: Joi.string()
        .valid(
          "BLOOD_SUGAR_LOW",
          "BLOOD_SUGAR_HIGH",
          "MEDICATION_REMINDER",
          "MEAL_REMINDER",
          "EXERCISE_REMINDER",
          "APPOINTMENT_REMINDER",
          "GENERAL_HEALTH"
        )
        .required(),
      title: Joi.string().min(1).max(100).required(),
      message: Joi.string().min(1).max(1000).required(),
      priority: Joi.string()
        .valid("low", "medium", "high", "urgent")
        .default("medium"),
      data: Joi.object().optional(),
    }),

    createBloodSugarAlert: Joi.object({
      isHigh: Joi.boolean().required(),
      value: Joi.number().min(0).max(1000).required(),
      targetRange: Joi.object({
        min: Joi.number().required(),
        max: Joi.number().required(),
      }).required(),
    }),

    createMedicationReminder: Joi.object({
      medicationName: Joi.string().min(1).max(100).required(),
      dosage: Joi.string().min(1).max(50).required(),
      nextDoseTime: Joi.date().required(),
    }),

    createReminder: Joi.object({
      mealType: Joi.string().min(1).max(50).required(),
      message: Joi.string().min(1).max(500).required(),
    }),
  },
};
