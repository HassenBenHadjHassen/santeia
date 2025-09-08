// Environment configuration and validation
import dotenv from "dotenv";
import Joi from "joi";

// Load environment variables
dotenv.config();

// Environment validation schema
const envSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid("development", "production", "test")
    .default("development"),
  PORT: Joi.number().default(3000),
  HOST: Joi.string().default("localhost"),

  // Database configuration
  DATABASE_URL: Joi.string().required(),

  // Hugging Face configuration
  HUGGINGFACE_API_KEY: Joi.string().required(),
  HUGGINGFACE_MODEL: Joi.string().default("meta-llama/Llama-3.1-405B-Instruct"),

  // OpenAI-compatible configuration (e.g., HF router)
  OPENAI_API_KEY: Joi.string().optional(),
  OPENAI_BASE_URL: Joi.string().default("https://router.huggingface.co/v1"),
  OPENAI_MODEL: Joi.string().default("HuggingFaceH4/zephyr-7b-beta"),

  // JWT configuration
  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRES_IN: Joi.string().default("24h"),

  // CORS configuration
  CORS_ORIGIN: Joi.string().default("http://localhost:3000"),

  // Rate limiting
  RATE_LIMIT_WINDOW_MS: Joi.number().default(900000), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: Joi.number().default(100),
}).unknown();

// Validate environment variables
const { error, value: envVars } = envSchema.validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

// Export configuration object
export const config = {
  NODE_ENV: envVars.NODE_ENV,
  PORT: envVars.PORT,
  HOST: envVars.HOST,

  // Database
  DATABASE_URL: envVars.DATABASE_URL,

  // Hugging Face
  HUGGINGFACE_API_KEY: envVars.HUGGINGFACE_API_KEY,
  HUGGINGFACE_MODEL: envVars.HUGGINGFACE_MODEL,

  // OpenAI-compatible
  OPENAI_BASE_URL: envVars.OPENAI_BASE_URL,

  // JWT
  JWT_SECRET: envVars.JWT_SECRET,
  JWT_EXPIRES_IN: envVars.JWT_EXPIRES_IN,

  // CORS
  CORS_ORIGIN: envVars.CORS_ORIGIN,

  // Rate limiting
  RATE_LIMIT_WINDOW_MS: envVars.RATE_LIMIT_WINDOW_MS,
  RATE_LIMIT_MAX_REQUESTS: envVars.RATE_LIMIT_MAX_REQUESTS,
} as const;
