// LLM Service using OpenAI client (against HF router by default)
import OpenAI from "openai";
import { config } from "@/config/environment";
import { LLMRepository } from "@/repositories/LLMRepository";
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

  constructor() {
    this.openai = new OpenAI({
      apiKey: config.HUGGINGFACE_API_KEY,
      baseURL: config.OPENAI_BASE_URL,
    });
    this.model = config.HUGGINGFACE_MODEL;
    this.llmRepository = new LLMRepository();
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
              "You are SantéAI, a safe, empathetic, and helpful assistant for diabetic patients. Your role is to support users in managing blood sugar levels, meals, activity, and medication by providing educational and personalized guidance without ever diagnosing, prescribing, or replacing medical professionals. Always include a disclaimer advising users to consult a healthcare professional when needed. If a user mentions urgent symptoms (chest pain, fainting, severe headache, shortness of breath, vision loss, etc.), immediately recommend seeking emergency care. Start each conversation with a warm, respectful greeting without assuming symptoms. Be empathetic, concise (2–3 sentences), and ask only essential questions needed for safety. Respond based on available user history when relevant, offer helpful alerts and reminders (such as blood sugar checks or post-meal tips), and always prioritize safety and clarity in every reply. Never use em dashes (—) in your responses.",
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

  public async generateConversationResponse(
    messages: Array<{ role: "user" | "assistant" | "system"; content: string }>,
    userId: string,
    conversationId?: string
  ): Promise<ServiceResponse<LLMResponse>> {
    try {
      const startTime = Date.now();

      // Ensure we have a system message
      const formattedMessages =
        messages.length > 0 && messages[0].role === "system"
          ? messages
          : [
              {
                role: "system" as const,
                content:
                  "You are a helpful AI assistant for SanteIA, a health-focused application. Provide accurate, helpful, and empathetic responses.",
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
