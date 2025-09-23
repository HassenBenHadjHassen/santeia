// LLM Service with fallback support (Hugging Face -> Ollama)
import OpenAI from "openai";
import { config } from "@/config/environment";
import { LLMRepository } from "@/repositories/LLMRepository";
import { UserRepository } from "@/repositories/UserRepository";
import { ServiceResponse } from "@/types";
import { MemoryService } from "@/services/MemoryService";

export interface LLMRequest {
  prompt: string;
  userId: string;
  conversationId?: string;
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  repetitionPenalty?: number;
}

export interface LLMResponse {
  text: string;
  tokens: number;
  duration: number;
  cost?: number;
  provider?: string;
}

export type LLMProvider = "huggingface" | "ollama";

export interface ProviderConfig {
  name: LLMProvider;
  baseURL: string;
  apiKey?: string;
  model: string;
  enabled: boolean;
}

export class LLMService {
  private readonly providers: ProviderConfig[];
  private readonly llmRepository: LLMRepository;
  private readonly userRepository: UserRepository;
  private readonly memoryService: MemoryService;
  private currentProvider: LLMProvider = "huggingface";

  constructor() {
    this.llmRepository = new LLMRepository();
    this.userRepository = new UserRepository();
    this.memoryService = new MemoryService();

    // Initialize providers in order of preference
    this.providers = [
      {
        name: "huggingface",
        baseURL: config.OPENAI_BASE_URL,
        apiKey: config.HUGGINGFACE_API_KEY,
        model: config.HUGGINGFACE_MODEL,
        enabled: true,
      },
      {
        name: "ollama",
        baseURL: config.OLLAMA_BASE_URL,
        model: config.OLLAMA_MODEL,
        enabled: config.OLLAMA_ENABLED,
      },
    ];
  }

  private getProvider(providerName: LLMProvider): ProviderConfig | undefined {
    return this.providers.find((p) => p.name === providerName && p.enabled);
  }

  private getNextProvider(): ProviderConfig | undefined {
    const currentIndex = this.providers.findIndex(
      (p) => p.name === this.currentProvider
    );
    for (let i = currentIndex + 1; i < this.providers.length; i++) {
      if (this.providers[i].enabled) {
        return this.providers[i];
      }
    }
    return undefined;
  }

  private createOpenAIClient(provider: ProviderConfig): OpenAI {
    return new OpenAI({
      apiKey: provider.apiKey || "dummy-key", // Ollama doesn't require API key
      baseURL: provider.baseURL,
    });
  }

  private async testProvider(provider: ProviderConfig): Promise<boolean> {
    try {
      const client = this.createOpenAIClient(provider);
      await client.chat.completions.create({
        model: provider.model,
        messages: [{ role: "user", content: "test" }],
        max_tokens: 1,
      });
      return true;
    } catch (error) {
      console.warn(`Provider ${provider.name} is not available:`, error);
      return false;
    }
  }

  private async getUserContext(userId: string): Promise<string> {
    try {
      // Validate userId is not empty or null
      if (!userId || userId.trim() === "") {
        console.error("Invalid userId provided to getUserContext");
        return "";
      }

      const user = await this.userRepository.findById(userId);
      if (!user) {
        console.warn(`User not found for userId: ${userId}`);
        return "";
      }

      let context = `User Profile:\n`;
      context += `Name: ${user.name}\n`;

      if (user.diabetesType) {
        context += `Diabetes Type: ${user.diabetesType}\n`;
      }

      if (user.dateOfBirth) {
        context += `Date of Birth: ${user.dateOfBirth}\n`;
      }

      // Vitals and profile health fields
      if ((user as any).heightCm != null) {
        context += `Height: ${(user as any).heightCm} cm\n`;
      }
      if ((user as any).weightKg != null) {
        context += `Weight: ${(user as any).weightKg} kg\n`;
      }
      if (
        (user as any).heightCm != null &&
        (user as any).weightKg != null &&
        Number((user as any).heightCm) > 0
      ) {
        const hMeters = Number((user as any).heightCm) / 100;
        const bmi = Number((user as any).weightKg) / (hMeters * hMeters);
        context += `BMI (calculated): ${Math.round(bmi * 10) / 10}\n`;
      }
      if (
        (user as any).bloodPressureSystolic != null &&
        (user as any).bloodPressureDiastolic != null
      ) {
        context += `Blood Pressure: ${(user as any).bloodPressureSystolic}/${
          (user as any).bloodPressureDiastolic
        } mmHg\n`;
      }
      if ((user as any).heartRate != null) {
        context += `Resting Heart Rate: ${(user as any).heartRate} bpm\n`;
      }

      if (user.diagnosisDate) {
        context += `Diagnosis Date: ${user.diagnosisDate}\n`;
      }

      if (user.currentMedications && user.currentMedications.length > 0) {
        context += `Current Medications: ${user.currentMedications.join(
          ", "
        )}\n`;
      }

      if (user.bloodSugarTargets) {
        const targets = user.bloodSugarTargets as any;
        context += `Blood Sugar Targets:\n`;
        if (targets.fasting) {
          context += `- Fasting: ${targets.fasting} mg/dL\n`;
        }
        if (targets.beforeMeals) {
          context += `- Before Meals: ${targets.beforeMeals} mg/dL\n`;
        }
        if (targets.afterMeals) {
          context += `- After Meals: ${targets.afterMeals} mg/dL\n`;
        }
        if (targets.bedtime) {
          context += `- Bedtime: ${targets.bedtime} mg/dL\n`;
        }
      }

      if (user.activityLevel) {
        context += `Activity Level: ${user.activityLevel}\n`;
      }

      if (user.dietaryPreferences && user.dietaryPreferences.length > 0) {
        context += `Dietary Preferences: ${user.dietaryPreferences.join(
          ", "
        )}\n`;
      }

      if (user.emergencyContact) {
        const contact = user.emergencyContact as any;
        context += `Emergency Contact: ${contact.name} (${contact.relationship}) - ${contact.phone}\n`;
      }

      // Append recent health events (lightweight summary)
      try {
        const { MealService } = require("@/services/MealService");
        const {
          HealthMetricService,
        } = require("@/services/HealthMetricService");
        const {
          PhysicalActivityService,
        } = require("@/services/PhysicalActivityService");
        const { MedicationService } = require("@/services/MedicationService");
        const mealService = new MealService();
        const metricService = new HealthMetricService();
        const activityService = new PhysicalActivityService();
        const medicationService = new MedicationService();

        const { BloodSugarService } = require("@/services/BloodSugarService");
        const bloodSugarService = new BloodSugarService();

        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const now = new Date();

        const [
          recentMealsRes,
          recentMetricsRes,
          recentActivitiesRes,
          doseSummaryRes,
          bloodSugarRes,
        ] = await Promise.all([
          mealService.getRecentMeals(userId, 5),
          metricService.getMetricsByDateRange(userId, thirtyDaysAgo, now),
          activityService.getRecentActivities(userId, 3),
          medicationService.getDoseSummary(userId),
          bloodSugarService.getReadingsByUser(
            userId,
            {
              startDate: thirtyDaysAgo,
              endDate: now,
            },
            { sortBy: "timestamp", sortOrder: "desc", limit: 20 }
          ),
        ]);

        const lines: string[] = [];
        if (
          recentMealsRes.success &&
          recentMealsRes.data &&
          recentMealsRes.data.length > 0
        ) {
          const names = recentMealsRes.data
            .slice(0, 3)
            .map(
              (m: any) =>
                `${m.name} (${new Date(m.timestamp).toLocaleString()})`
            )
            .join(", ");
          lines.push(`Recent Meals: ${names}`);
        }

        // Process health metrics from last 30 days
        if (
          recentMetricsRes.success &&
          recentMetricsRes.data &&
          recentMetricsRes.data.length > 0
        ) {
          const metrics = recentMetricsRes.data;

          // Group metrics by type
          const metricsByType: { [key: string]: any[] } = {};
          metrics.forEach((metric: any) => {
            if (!metricsByType[metric.metricType]) {
              metricsByType[metric.metricType] = [];
            }
            metricsByType[metric.metricType].push(metric);
          });

          // Process each metric type with ALL individual readings
          Object.entries(metricsByType).forEach(([type, typeMetrics]) => {
            const sortedMetrics = typeMetrics.sort(
              (a, b) =>
                new Date(b.timestamp).getTime() -
                new Date(a.timestamp).getTime()
            );
            const count = sortedMetrics.length;

            switch (type) {
              case "WEIGHT":
                lines.push(`Weight Readings (${count} in last 30 days):`);
                sortedMetrics.forEach((metric: any) => {
                  const date = new Date(metric.timestamp);
                  lines.push(
                    `  ${Math.round(metric.value * 10) / 10} ${
                      metric.unit
                    } on ${date.toLocaleDateString()} at ${date.toLocaleTimeString()}`
                  );
                });
                break;
              case "BLOOD_PRESSURE_SYSTOLIC":
                const diastolicMetrics =
                  metricsByType["BLOOD_PRESSURE_DIASTOLIC"] || [];
                const bpPairs = sortedMetrics.map((sys: any) => {
                  const matchingDia = diastolicMetrics.find(
                    (dia: any) =>
                      Math.abs(
                        new Date(dia.timestamp).getTime() -
                          new Date(sys.timestamp).getTime()
                      ) < 60000
                  );
                  return {
                    systolic: sys.value,
                    diastolic: matchingDia?.value || 0,
                    timestamp: sys.timestamp,
                    date: new Date(sys.timestamp).toLocaleDateString(),
                  };
                });
                lines.push(
                  `Blood Pressure Readings (${bpPairs.length} in last 30 days):`
                );
                bpPairs.forEach((bp: any) => {
                  const date = new Date(bp.timestamp);
                  lines.push(
                    `  ${Math.round(bp.systolic)}/${Math.round(
                      bp.diastolic
                    )} mmHg on ${date.toLocaleDateString()} at ${date.toLocaleTimeString()}`
                  );
                });
                break;
              case "HEART_RATE":
                lines.push(`Heart Rate Readings (${count} in last 30 days):`);
                sortedMetrics.forEach((metric: any) => {
                  const date = new Date(metric.timestamp);
                  lines.push(
                    `  ${Math.round(metric.value)} ${
                      metric.unit
                    } on ${date.toLocaleDateString()} at ${date.toLocaleTimeString()}`
                  );
                });
                break;
              case "BMI":
                lines.push(`BMI Readings (${count} in last 30 days):`);
                sortedMetrics.forEach((metric: any) => {
                  const date = new Date(metric.timestamp);
                  lines.push(
                    `  ${Math.round(metric.value * 10) / 10} ${
                      metric.unit
                    } on ${date.toLocaleDateString()} at ${date.toLocaleTimeString()}`
                  );
                });
                break;
              case "CHOLESTEROL_TOTAL":
                lines.push(
                  `Total Cholesterol Readings (${count} in last 30 days):`
                );
                sortedMetrics.forEach((metric: any) => {
                  const date = new Date(metric.timestamp);
                  lines.push(
                    `  ${Math.round(metric.value)} ${
                      metric.unit
                    } on ${date.toLocaleDateString()} at ${date.toLocaleTimeString()}`
                  );
                });
                break;
              case "CHOLESTEROL_HDL":
                lines.push(
                  `HDL Cholesterol Readings (${count} in last 30 days):`
                );
                sortedMetrics.forEach((metric: any) => {
                  const date = new Date(metric.timestamp);
                  lines.push(
                    `  ${Math.round(metric.value)} ${
                      metric.unit
                    } on ${date.toLocaleDateString()} at ${date.toLocaleTimeString()}`
                  );
                });
                break;
              case "CHOLESTEROL_LDL":
                lines.push(
                  `LDL Cholesterol Readings (${count} in last 30 days):`
                );
                sortedMetrics.forEach((metric: any) => {
                  const date = new Date(metric.timestamp);
                  lines.push(
                    `  ${Math.round(metric.value)} ${
                      metric.unit
                    } on ${date.toLocaleDateString()} at ${date.toLocaleTimeString()}`
                  );
                });
                break;
              case "TRIGLYCERIDES":
                lines.push(
                  `Triglycerides Readings (${count} in last 30 days):`
                );
                sortedMetrics.forEach((metric: any) => {
                  const date = new Date(metric.timestamp);
                  lines.push(
                    `  ${Math.round(metric.value)} ${
                      metric.unit
                    } on ${date.toLocaleDateString()} at ${date.toLocaleTimeString()}`
                  );
                });
                break;
            }
          });
        }

        if (
          recentActivitiesRes.success &&
          recentActivitiesRes.data &&
          recentActivitiesRes.data.length > 0
        ) {
          const acts = recentActivitiesRes.data
            .slice(0, 3)
            .map(
              (a: any) =>
                `${a.activityType} ${a.duration}min (${new Date(
                  a.timestamp
                ).toLocaleString()})`
            )
            .join(", ");
          lines.push(`Recent Activities: ${acts}`);
        }

        if (doseSummaryRes.success && doseSummaryRes.data) {
          const recent = doseSummaryRes.data.recentDoses || [];
          if (recent.length > 0) {
            const short = recent
              .slice(0, 3)
              .map(
                (d: any) =>
                  `${d.dosage}${d.unit ? " " + d.unit : ""} (${new Date(
                    d.takenAt
                  ).toLocaleString()})`
              )
              .join(", ");
            lines.push(`Recent Medication Doses: ${short}`);
          }
        }

        if (
          bloodSugarRes.success &&
          bloodSugarRes.data &&
          bloodSugarRes.data.length > 0
        ) {
          const readings = bloodSugarRes.data;
          const typeLabels: { [key: string]: string } = {
            FASTING: "Fasting",
            BEFORE_MEAL: "Before Meals",
            AFTER_MEAL: "After Meals",
            BEDTIME: "Bedtime",
            RANDOM: "Random",
            POST_EXERCISE: "Post-Exercise",
          };

          // Group by reading type
          const readingsByType: { [key: string]: any[] } = {};
          readings.forEach((reading: any) => {
            if (!readingsByType[reading.readingType]) {
              readingsByType[reading.readingType] = [];
            }
            readingsByType[reading.readingType].push(reading);
          });

          // Add ALL individual readings by type
          Object.entries(readingsByType).forEach(([type, typeReadings]) => {
            const sortedReadings = typeReadings.sort(
              (a, b) =>
                new Date(b.timestamp).getTime() -
                new Date(a.timestamp).getTime()
            );

            lines.push(
              `Blood Sugar ${typeLabels[type] || type} (${
                typeReadings.length
              } readings in last 30 days):`
            );
            sortedReadings.forEach((reading: any) => {
              const date = new Date(reading.timestamp);
              lines.push(
                `  ${reading.value} ${
                  reading.unit
                } on ${date.toLocaleDateString()} at ${date.toLocaleTimeString()}`
              );
            });
          });
        }

        if (lines.length > 0) {
          context +=
            `\n\nRecent Health Events:\n` +
            lines.map((l) => `- ${l}`).join("\n");
        }
      } catch (inner) {
        // If enrichment fails, proceed with basic profile
      }

      // Add conversational memories for cross-chat persistence
      try {
        console.log(`🧠 [MEMORY] Retrieving memories for user ${userId}...`);
        const conversationalMemories =
          await this.memoryService.getConversationalMemories(userId, 15);
        console.log(
          `🧠 [MEMORY] Found ${conversationalMemories.length} memories:`,
          conversationalMemories
        );

        if (conversationalMemories.length > 0) {
          context += `\n\nPrevious Conversations Memory:\n`;
          context += conversationalMemories
            .map((memory) => `- ${memory}`)
            .join("\n");
          console.log(`✅ [MEMORY] Added memories to context`);
        } else {
          console.log(`ℹ️ [MEMORY] No memories found for this user`);
        }
      } catch (error) {
        console.warn(
          "❌ [MEMORY] Failed to retrieve conversational memories:",
          error
        );
      }

      return context;
    } catch (error) {
      console.error("Error getting user context:", error);
      return "";
    }
  }

  public async getCurrentSystemMessage(userId: string): Promise<string> {
    // Reproduce the same system message construction used during responses
    const base =
      "You are SantéAI, a safe, empathetic, and helpful assistant for diabetic patients. Your job is to speak naturally, like a caring human, without using any formatting or technical structures. Do not use tables, bold text, lists, bullet points, numbered lines, or any other markdown. Never use em dashes. Never structure information in columns or rows. Always speak in simple, plain sentences as if you were talking to a person in real life. Keep replies short and warm (2 to 3 sentences unless absolutely necessary). Start each conversation with a kind greeting. If a user mentions symptoms, respond with empathy and clear, easy-to-follow suggestions. If the symptoms might be urgent (like chest pain, fainting, severe headache, vision loss, or trouble breathing), advise the user to seek emergency medical care immediately. Do not diagnose or prescribe. Always include a reminder to consult a doctor when appropriate. Focus on safety, clarity, and emotional support.";

    const userContext = await this.getUserContext(userId);
    if (!userContext) return base;
    return (
      base +
      `\n\nIMPORTANT: Use this user's health information to provide personalized advice:\n${userContext}\n\nWhen giving advice, consider their specific diabetes type, medications, blood sugar targets, and dietary preferences. Always tailor your responses to their individual health profile while maintaining safety and encouraging them to consult their healthcare provider.`
    );
  }

  public async generateText(
    request: LLMRequest
  ): Promise<ServiceResponse<LLMResponse>> {
    const startTime = Date.now();
    let lastError: Error | null = null;

    // Try each provider in order
    for (const provider of this.providers) {
      if (!provider.enabled) continue;

      try {
        console.log(`Attempting to use provider: ${provider.name}`);

        const client = this.createOpenAIClient(provider);

        // Call OpenAI-compatible chat completions
        const completion = await client.chat.completions.create({
          model: provider.model,
          messages: [
            {
              role: "system",
              content:
                "You are SantéAI, a safe, empathetic, and helpful assistant for diabetic patients. Your job is to speak naturally, like a caring human, without using any formatting or technical structures. Do not use tables, bold text, lists, bullet points, numbered lines, or any other markdown. Never use em dashes. Never structure information in columns or rows. Always speak in simple, plain sentences as if you were talking to a person in real life. Keep replies short and warm (2 to 3 sentences unless absolutely necessary). Start each conversation with a kind greeting. If a user mentions symptoms, respond with empathy and clear, easy-to-follow suggestions. If the symptoms might be urgent (like chest pain, fainting, severe headache, vision loss, or trouble breathing), advise the user to seek emergency medical care immediately. Do not diagnose or prescribe. Always include a reminder to consult a doctor when appropriate. Focus on safety, clarity, and emotional support.",
            },
            { role: "user", content: request.prompt },
          ],
          temperature: request.temperature ?? 0.7,
          top_p: request.topP ?? 0.9,
          max_tokens: request.maxTokens ?? 512,
        });

        const duration = Date.now() - startTime;
        const generatedText = completion.choices?.[0]?.message?.content || "";

        // Calculate approximate token count (rough estimation)
        const tokens = Math.ceil(generatedText.length / 4);

        // Calculate cost (approximate for Llama 3.1 405B)
        const cost = this.calculateCost(tokens);

        const llmResponse: LLMResponse = {
          text: generatedText.trim(),
          tokens,
          duration,
          cost,
          provider: provider.name,
        };

        // Update current provider on success
        this.currentProvider = provider.name;

        // Log the request to database
        await this.llmRepository.create({
          model: provider.model,
          prompt: request.prompt,
          response: generatedText,
          tokens,
          cost,
          duration,
          userId: request.userId,
        });

        console.log(`Successfully used provider: ${provider.name}`);
        return {
          success: true,
          data: llmResponse,
        };
      } catch (error) {
        console.warn(`Provider ${provider.name} failed:`, error);
        lastError = error as Error;
        continue; // Try next provider
      }
    }

    // All providers failed
    console.error("All LLM providers failed:", lastError);
    return {
      success: false,
      error: `Failed to generate text with any provider. Last error: ${lastError?.message}`,
    };
  }

  public async generateConversationTitle(
    messages: Array<{ role: "user" | "assistant" | "system"; content: string }>,
    userId: string
  ): Promise<ServiceResponse<string>> {
    let lastError: Error | null = null;

    // Try each provider in order
    for (const provider of this.providers) {
      if (!provider.enabled) continue;

      try {
        console.log(
          `Attempting to generate title with provider: ${provider.name}`
        );

        const client = this.createOpenAIClient(provider);

        // Get user context if needed
        const userContext = await this.getUserContext(userId);

        // Instruction prompt tailored for OSS models
        const systemMessage = `
  You are a title generator bot. Your only task is to return a short, clean title (max 40 characters) for a conversation based on recent messages. 
  Do not include explanations, quotes, or prefixes. Only return the title itself.
  Examples: "Blood Sugar Help", "Exercise Tips", "Medication Side Effects"
  `;

        // Use the last few messages for better relevance
        const titleMessages = [
          {
            role: "system" as const,
            content: systemMessage.trim(),
          },
          ...messages.slice(-4),
        ];

        // Call the OSS GPT model
        const response = await client.chat.completions.create({
          model: provider.model,
          messages: titleMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          temperature: 0.2,
          top_p: 0.7,
          max_tokens: 16,
        });

        const rawTitle =
          response.choices[0]?.message?.content?.trim() || "New Chat";

        // Clean up response: remove quotes and generic prefixes
        let cleanTitle = rawTitle
          .trim()
          .replace(/^["']|["']$/g, "") // remove surrounding quotes
          .replace(/^(title|analysis|generate|conversation)[\s:.-]*/i, "") // remove common bad prefixes
          .replace(/^the user says[^.]*[.]\s*/i, "") // remove GPT echoes
          .trim();

        // Truncate if too long
        if (cleanTitle.length > 50) {
          cleanTitle = cleanTitle.substring(0, 47) + "...";
        }

        console.log(
          "🧠 Raw model response:",
          JSON.stringify(response.choices[0]?.message?.content, null, 2)
        );

        // If it's bad or looks like analysis output, fall back
        const isBadTitle =
          cleanTitle.length < 3 ||
          /analysis|user says|generate|conversation|system message|error/i.test(
            cleanTitle
          ) ||
          !/[a-z]/i.test(cleanTitle); // avoids titles with only punctuation

        if (isBadTitle) {
          cleanTitle = "Health Discussion";
        }

        console.log(
          `Successfully generated title with provider: ${provider.name}`
        );
        return {
          success: true,
          data: cleanTitle,
          message: "Title generated successfully",
        };
      } catch (error) {
        console.warn(
          `Provider ${provider.name} failed for title generation:`,
          error
        );
        lastError = error as Error;
        continue; // Try next provider
      }
    }

    // All providers failed
    console.error("All providers failed for title generation:", lastError);
    return {
      success: false,
      error: `Failed to generate title with any provider. Last error: ${lastError?.message}`,
    };
  }

  public async generateConversationResponse(
    messages: Array<{ role: "user" | "assistant" | "system"; content: string }>,
    userId: string,
    conversationId?: string
  ): Promise<ServiceResponse<LLMResponse>> {
    const startTime = Date.now();
    let lastError: Error | null = null;

    // Try each provider in order
    for (const provider of this.providers) {
      if (!provider.enabled) continue;

      try {
        console.log(
          `Attempting to generate conversation response with provider: ${provider.name}`
        );

        const client = this.createOpenAIClient(provider);

        // Get user context for personalized responses
        const userContext = await this.getUserContext(userId);

        // Extract session memory from recent conversation messages
        let sessionMemory = "";
        try {
          // Get the last few user messages (up to 3) to build better context
          const recentUserMessages = messages
            .filter((m) => m.role === "user")
            .slice(-3);

          const memoryParts: string[] = [];
          for (const msg of recentUserMessages) {
            const summary = this.memoryService.summarizeFromUtterance(
              msg.content
            );
            if (summary) {
              memoryParts.push(summary);
            }
          }

          if (memoryParts.length > 0) {
            sessionMemory = memoryParts.join("; ");
          }
        } catch (error) {
          console.warn("Failed to extract session memory:", error);
        }

        // Create personalized system message
        let systemMessage =
          "You are SantéAI, a safe, empathetic, and helpful assistant for diabetic patients. Your job is to speak naturally, like a caring human, without using any formatting or technical structures. Do not use tables, bold text, lists, bullet points, numbered lines, or any other markdown. Never use em dashes. Never structure information in columns or rows. Always speak in simple, plain sentences as if you were talking to a person in real life. Keep replies short and warm (2 to 3 sentences unless absolutely necessary). Start each conversation with a kind greeting. If a user mentions symptoms, respond with empathy and clear, easy-to-follow suggestions. If the symptoms might be urgent (like chest pain, fainting, severe headache, vision loss, or trouble breathing), advise the user to seek emergency medical care immediately. Do not diagnose or prescribe. Always include a reminder to consult a doctor when appropriate. Focus on safety, clarity, and emotional support.";

        if (userContext) {
          systemMessage += `\n\nIMPORTANT: Use this user's health information to provide personalized advice:\n${userContext}\n\nWhen giving advice, consider their specific diabetes type, medications, blood sugar targets, and dietary preferences. Always tailor your responses to their individual health profile while maintaining safety and encouraging them to consult their healthcare provider.`;
        }
        if (sessionMemory) {
          systemMessage += `\n\nSession Memory (from recent messages):\n${sessionMemory}`;
        }

        // Add instruction to use conversation history
        systemMessage += `\n\nIMPORTANT: Pay attention to the conversation history below. When users ask about previous topics (like "what did I eat?" or "what did I tell you?"), refer to the earlier messages in this conversation to provide accurate responses.`;

        // Ensure we have a system message
        const formattedMessages =
          messages.length > 0 && messages[0].role === "system"
            ? messages
            : [
                {
                  role: "system" as const,
                  content: systemMessage,
                },
                ...messages,
              ];

        // Call OpenAI-compatible chat completions
        const completion = await client.chat.completions.create({
          model: provider.model,
          messages: formattedMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          temperature: 0.7,
          top_p: 0.9,
          max_tokens: 512,
        });

        const duration = Date.now() - startTime;
        const generatedText = completion.choices?.[0]?.message?.content || "";
        const tokens = Math.ceil(generatedText.length / 4);
        const cost = this.calculateCost(tokens);

        const llmResponse: LLMResponse = {
          text: generatedText.trim(),
          tokens,
          duration,
          cost,
          provider: provider.name,
        };

        // Update current provider on success
        this.currentProvider = provider.name;

        // Log the request to database
        const promptText = formattedMessages
          .map((msg) => `${msg.role}: ${msg.content}`)
          .join("\n");
        await this.llmRepository.create({
          model: provider.model,
          prompt: promptText,
          response: generatedText,
          tokens,
          cost,
          duration,
          userId,
        });

        console.log(
          `Successfully generated conversation response with provider: ${provider.name}`
        );
        return {
          success: true,
          data: llmResponse,
        };
      } catch (error) {
        console.warn(
          `Provider ${provider.name} failed for conversation response:`,
          error
        );
        lastError = error as Error;
        continue; // Try next provider
      }
    }

    // All providers failed
    console.error("All providers failed for conversation response:", lastError);
    return {
      success: false,
      error: `Failed to generate conversation response with any provider. Last error: ${lastError?.message}`,
    };
  }

  public async *generateConversationResponseStream(
    messages: Array<{ role: "user" | "assistant" | "system"; content: string }>,
    userId: string,
    conversationId?: string
  ): AsyncGenerator<{ text: string; done: boolean }, void, unknown> {
    const startTime = Date.now();
    let lastError: Error | null = null;

    // Try each provider in order
    for (const provider of this.providers) {
      if (!provider.enabled) continue;

      try {
        console.log(
          `Attempting to stream conversation response with provider: ${provider.name}`
        );

        const client = this.createOpenAIClient(provider);

        // Get user context for personalized responses
        const userContext = await this.getUserContext(userId);

        // Extract session memory from recent conversation messages
        let sessionMemory = "";
        try {
          // Get the last few user messages (up to 3) to build better context
          const recentUserMessages = messages
            .filter((m) => m.role === "user")
            .slice(-3);

          const memoryParts: string[] = [];
          for (const msg of recentUserMessages) {
            const summary = this.memoryService.summarizeFromUtterance(
              msg.content
            );
            if (summary) {
              memoryParts.push(summary);
            }
          }

          if (memoryParts.length > 0) {
            sessionMemory = memoryParts.join("; ");
          }
        } catch (error) {
          console.warn("Failed to extract session memory:", error);
        }

        // Create personalized system message
        let systemMessage =
          "You are SantéAI, a safe, empathetic, and helpful assistant for diabetic patients. Your job is to speak naturally, like a caring human, without using any formatting or technical structures. Do not use tables, bold text, lists, bullet points, numbered lines, or any other markdown. Never use em dashes. Never structure information in columns or rows. Always speak in simple, plain sentences as if you were talking to a person in real life. Keep replies short and warm (2 to 3 sentences unless absolutely necessary). Start each conversation with a kind greeting. If a user mentions symptoms, respond with empathy and clear, easy-to-follow suggestions. If the symptoms might be urgent (like chest pain, fainting, severe headache, vision loss, or trouble breathing), advise the user to seek emergency medical care immediately. Do not diagnose or prescribe. Always include a reminder to consult a doctor when appropriate. Focus on safety, clarity, and emotional support.";

        if (userContext) {
          systemMessage += `\n\nIMPORTANT: Use this user's health information to provide personalized advice:\n${userContext}\n\nWhen giving advice, consider their specific diabetes type, medications, blood sugar targets, and dietary preferences. Always tailor your responses to their individual health profile while maintaining safety and encouraging them to consult their healthcare provider.`;
        }
        if (sessionMemory) {
          systemMessage += `\n\nSession Memory (from recent messages):\n${sessionMemory}`;
        }

        // Add instruction to use conversation history
        systemMessage += `\n\nIMPORTANT: Pay attention to the conversation history below. When users ask about previous topics (like "what did I eat?" or "what did I tell you?"), refer to the earlier messages in this conversation to provide accurate responses.`;

        // Ensure we have a system message
        const formattedMessages =
          messages.length > 0 && messages[0].role === "system"
            ? messages
            : [
                {
                  role: "system" as const,
                  content: systemMessage,
                },
                ...messages,
              ];

        // Call OpenAI-compatible chat completions with streaming
        const stream = await client.chat.completions.create({
          model: provider.model,
          messages: formattedMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          temperature: 0.7,
          top_p: 0.9,
          max_tokens: 512,
          stream: true,
        });

        let fullText = "";
        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content || "";
          if (content) {
            fullText += content;
            yield { text: content, done: false };
          }
        }

        // Update current provider on success
        this.currentProvider = provider.name;

        // Log the complete request to database
        const duration = Date.now() - startTime;
        const tokens = Math.ceil(fullText.length / 4);
        const cost = this.calculateCost(tokens);

        const promptText = formattedMessages
          .map((msg) => `${msg.role}: ${msg.content}`)
          .join("\n");
        await this.llmRepository.create({
          model: provider.model,
          prompt: promptText,
          response: fullText,
          tokens,
          cost,
          duration,
          userId,
        });

        console.log(
          `Successfully streamed conversation response with provider: ${provider.name}`
        );
        yield { text: "", done: true };
        return; // Success, exit the generator
      } catch (error) {
        console.warn(`Provider ${provider.name} failed for streaming:`, error);
        lastError = error as Error;
        continue; // Try next provider
      }
    }

    // All providers failed
    console.error("All providers failed for streaming:", lastError);
    throw new Error(
      `Failed to generate streaming response with any provider. Last error: ${lastError?.message}`
    );
  }

  public async getModelInfo(): Promise<ServiceResponse<any>> {
    try {
      const currentProvider = this.getProvider(this.currentProvider);
      if (!currentProvider) {
        return {
          success: false,
          error: "No active provider available",
        };
      }

      return {
        success: true,
        data: {
          id: currentProvider.model,
          name: currentProvider.model,
          description: `Text generation model via ${currentProvider.name}`,
          provider: currentProvider.name,
          capabilities: ["text-generation", "conversational-ai"],
          baseURL: currentProvider.baseURL,
          enabled: currentProvider.enabled,
        },
      };
    } catch (error) {
      console.error("Model info error:", error);
      return {
        success: false,
        error: `Failed to get model information: ${error}`,
      };
    }
  }

  private calculateCost(tokens: number): number {
    // Approximate cost calculation for Llama 3.1 405B
    // This is a rough estimate - actual costs may vary
    const costPerToken = 0.0001; // $0.0001 per token (example rate)
    return tokens * costPerToken;
  }

  public async getUsageStats(userId: string): Promise<ServiceResponse<any>> {
    try {
      const stats = await this.llmRepository.getUsageStats(userId);

      return {
        success: true,
        data: stats,
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to get usage stats: ${error}`,
      };
    }
  }

  public async getRecentRequests(
    userId: string,
    limit: number = 10
  ): Promise<ServiceResponse<any[]>> {
    try {
      const requests = await this.llmRepository.getRecentRequests(
        userId,
        limit
      );

      return {
        success: true,
        data: requests,
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to get recent requests: ${error}`,
      };
    }
  }

  public async getProviderStatus(): Promise<ServiceResponse<any>> {
    try {
      const status = await Promise.all(
        this.providers.map(async (provider) => {
          const isAvailable = await this.testProvider(provider);
          return {
            name: provider.name,
            enabled: provider.enabled,
            available: isAvailable,
            baseURL: provider.baseURL,
            model: provider.model,
          };
        })
      );

      return {
        success: true,
        data: {
          providers: status,
          currentProvider: this.currentProvider,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to get provider status: ${error}`,
      };
    }
  }

  public async switchProvider(
    providerName: LLMProvider
  ): Promise<ServiceResponse<boolean>> {
    try {
      const provider = this.getProvider(providerName);
      if (!provider) {
        return {
          success: false,
          error: `Provider ${providerName} not found or not enabled`,
        };
      }

      const isAvailable = await this.testProvider(provider);
      if (!isAvailable) {
        return {
          success: false,
          error: `Provider ${providerName} is not available`,
        };
      }

      this.currentProvider = providerName;
      console.log(`Switched to provider: ${providerName}`);

      return {
        success: true,
        data: true,
        message: `Successfully switched to ${providerName}`,
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to switch provider: ${error}`,
      };
    }
  }
}
