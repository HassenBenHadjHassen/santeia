// LLM Service using OpenAI client (against HF router by default)
import OpenAI from "openai";
import { config } from "@/config/environment";
import { LLMRepository } from "@/repositories/LLMRepository";
import { UserRepository } from "@/repositories/UserRepository";
import { ServiceResponse } from "@/types";

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
}

export class LLMService {
  private readonly openai: OpenAI;
  private model: string;
  private llmRepository: LLMRepository;
  private userRepository: UserRepository;

  constructor() {
    this.openai = new OpenAI({
      apiKey: config.HUGGINGFACE_API_KEY,
      baseURL: config.OPENAI_BASE_URL,
    });
    this.model = config.HUGGINGFACE_MODEL;
    this.llmRepository = new LLMRepository();
    this.userRepository = new UserRepository();
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

      return context;
    } catch (error) {
      console.error("Error getting user context:", error);
      return "";
    }
  }

  public async generateText(
    request: LLMRequest
  ): Promise<ServiceResponse<LLMResponse>> {
    try {
      const startTime = Date.now();

      // Call OpenAI-compatible chat completions
      const completion = await this.openai.chat.completions.create({
        model: this.model,
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
      };

      // Log the request to database
      await this.llmRepository.create({
        model: this.model,
        prompt: request.prompt,
        response: generatedText,
        tokens,
        cost,
        duration,
        userId: request.userId,
      });

      return {
        success: true,
        data: llmResponse,
      };
    } catch (error) {
      console.error("LLM generation error:", error);
      return {
        success: false,
        error: `Failed to generate text: ${error}`,
      };
    }
  }

  public async generateConversationTitle(
    messages: Array<{ role: "user" | "assistant" | "system"; content: string }>,
    userId: string
  ): Promise<ServiceResponse<string>> {
    try {
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
      const response = await this.openai.chat.completions.create({
        model: this.model,
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

      return {
        success: true,
        data: cleanTitle,
        message: "Title generated successfully",
      };
    } catch (error) {
      console.error("Title generation error:", error);
      return {
        success: false,
        error: `Failed to generate title: ${error}`,
      };
    }
  }

  public async generateConversationResponse(
    messages: Array<{ role: "user" | "assistant" | "system"; content: string }>,
    userId: string,
    conversationId?: string
  ): Promise<ServiceResponse<LLMResponse>> {
    try {
      const startTime = Date.now();

      // Get user context for personalized responses
      const userContext = await this.getUserContext(userId);

      // Create personalized system message
      let systemMessage =
        "You are SantéAI, a safe, empathetic, and helpful assistant for diabetic patients. Your job is to speak naturally, like a caring human, without using any formatting or technical structures. Do not use tables, bold text, lists, bullet points, numbered lines, or any other markdown. Never use em dashes. Never structure information in columns or rows. Always speak in simple, plain sentences as if you were talking to a person in real life. Keep replies short and warm (2 to 3 sentences unless absolutely necessary). Start each conversation with a kind greeting. If a user mentions symptoms, respond with empathy and clear, easy-to-follow suggestions. If the symptoms might be urgent (like chest pain, fainting, severe headache, vision loss, or trouble breathing), advise the user to seek emergency medical care immediately. Do not diagnose or prescribe. Always include a reminder to consult a doctor when appropriate. Focus on safety, clarity, and emotional support.";

      if (userContext) {
        systemMessage += `\n\nIMPORTANT: Use this user's health information to provide personalized advice:\n${userContext}\n\nWhen giving advice, consider their specific diabetes type, medications, blood sugar targets, and dietary preferences. Always tailor your responses to their individual health profile while maintaining safety and encouraging them to consult their healthcare provider.`;
      }

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
      const completion = await this.openai.chat.completions.create({
        model: this.model,
        messages: formattedMessages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        temperature: 0.7,
        top_p: 0.9,
        max_tokens: 256,
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
      };

      // Log the request to database
      const promptText = formattedMessages
        .map((msg) => `${msg.role}: ${msg.content}`)
        .join("\n");
      await this.llmRepository.create({
        model: this.model,
        prompt: promptText,
        response: generatedText,
        tokens,
        cost,
        duration,
        userId,
      });

      return {
        success: true,
        data: llmResponse,
      };
    } catch (error) {
      console.error("LLM conversation error:", error);
      return {
        success: false,
        error: `Failed to generate conversation response: ${error}`,
      };
    }
  }

  public async *generateConversationResponseStream(
    messages: Array<{ role: "user" | "assistant" | "system"; content: string }>,
    userId: string,
    conversationId?: string
  ): AsyncGenerator<{ text: string; done: boolean }, void, unknown> {
    try {
      const startTime = Date.now();

      // Get user context for personalized responses
      const userContext = await this.getUserContext(userId);

      // Create personalized system message
      let systemMessage =
        "You are SantéAI, a safe, empathetic, and helpful assistant for diabetic patients. Your job is to speak naturally, like a caring human, without using any formatting or technical structures. Do not use tables, bold text, lists, bullet points, numbered lines, or any other markdown. Never use em dashes. Never structure information in columns or rows. Always speak in simple, plain sentences as if you were talking to a person in real life. Keep replies short and warm (2 to 3 sentences unless absolutely necessary). Start each conversation with a kind greeting. If a user mentions symptoms, respond with empathy and clear, easy-to-follow suggestions. If the symptoms might be urgent (like chest pain, fainting, severe headache, vision loss, or trouble breathing), advise the user to seek emergency medical care immediately. Do not diagnose or prescribe. Always include a reminder to consult a doctor when appropriate. Focus on safety, clarity, and emotional support.";

      if (userContext) {
        systemMessage += `\n\nIMPORTANT: Use this user's health information to provide personalized advice:\n${userContext}\n\nWhen giving advice, consider their specific diabetes type, medications, blood sugar targets, and dietary preferences. Always tailor your responses to their individual health profile while maintaining safety and encouraging them to consult their healthcare provider.`;
      }

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
      const stream = await this.openai.chat.completions.create({
        model: this.model,
        messages: formattedMessages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        temperature: 0.7,
        top_p: 0.9,
        max_tokens: 256,
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

      // Log the complete request to database
      const duration = Date.now() - startTime;
      const tokens = Math.ceil(fullText.length / 4);
      const cost = this.calculateCost(tokens);

      const promptText = formattedMessages
        .map((msg) => `${msg.role}: ${msg.content}`)
        .join("\n");
      await this.llmRepository.create({
        model: this.model,
        prompt: promptText,
        response: fullText,
        tokens,
        cost,
        duration,
        userId,
      });

      yield { text: "", done: true };
    } catch (error) {
      console.error("LLM streaming error:", error);
      throw error;
    }
  }

  public async getModelInfo(): Promise<ServiceResponse<any>> {
    try {
      // Return static model information since modelInfo is not available
      return {
        success: true,
        data: {
          id: this.model,
          name: this.model,
          description: "Meta Llama 3.1 405B Instruct model for text generation",
          provider: "Hugging Face",
          capabilities: ["text-generation", "conversational-ai"],
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
}
