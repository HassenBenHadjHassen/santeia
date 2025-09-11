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
    }),

    update: Joi.object({
      email: Joi.string().email().optional(),
      name: Joi.string().min(2).max(50).optional(),
      role: Joi.string().valid("ADMIN", "USER", "MODERATOR").optional(),
      isActive: Joi.boolean().optional(),
      password: Joi.string().min(6).optional(),
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
};
