// LLM API Service
import { ApiClient } from "../client";
import type {
  LLMGenerateRequest,
  LLMGenerateResponse,
  ModelInfo,
  UsageStats,
  RecentRequest,
} from "../types";

export class LLMService {
  private apiClient: ApiClient;

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  // Generate text using LLM
  async generateText(
    request: LLMGenerateRequest,
    token?: string
  ): Promise<LLMGenerateResponse> {
    const response =
      await this.apiClient.authenticatedRequest<LLMGenerateResponse>(
        "/llm/generate",
        {
          method: "POST",
          data: request,
        },
        token
      );
    return response.data!;
  }

  // Get model information
  async getModelInfo(token?: string): Promise<ModelInfo> {
    const response = await this.apiClient.authenticatedRequest<ModelInfo>(
      "/llm/model-info",
      { method: "GET" },
      token
    );
    return response.data!;
  }

  // Get usage statistics for a user
  async getUsageStats(userId: string, token?: string): Promise<UsageStats> {
    const response = await this.apiClient.authenticatedRequest<UsageStats>(
      `/llm/usage-stats/${userId}`,
      { method: "GET" },
      token
    );
    return response.data!;
  }

  // Get recent requests for a user
  async getRecentRequests(
    userId: string,
    limit: number = 10,
    token?: string
  ): Promise<RecentRequest[]> {
    const response = await this.apiClient.authenticatedRequest<RecentRequest[]>(
      `/llm/recent-requests/${userId}?limit=${limit}`,
      { method: "GET" },
      token
    );
    return response.data!;
  }

  // Generate health advice
  async generateHealthAdvice(
    prompt: string,
    userId: string,
    conversationId?: string,
    token?: string
  ): Promise<LLMGenerateResponse> {
    return this.generateText(
      {
        prompt,
        conversationId,
        userId,
        temperature: 0.7,
        maxTokens: 1000,
        topP: 0.9,
      },
      token
    );
  }

  // Generate conversation response
  async generateConversationResponse(
    message: string,
    conversationId: string,
    userId: string,
    token?: string
  ): Promise<LLMGenerateResponse> {
    return this.generateText(
      {
        prompt: message,
        conversationId,
        userId,
        temperature: 0.8,
        maxTokens: 500,
        topP: 0.9,
      },
      token
    );
  }

  // Generate summary
  async generateSummary(
    text: string,
    userId: string,
    token?: string
  ): Promise<LLMGenerateResponse> {
    return this.generateText(
      {
        prompt: `Please provide a concise summary of the following text:\n\n${text}`,
        userId,
        temperature: 0.3,
        maxTokens: 200,
        topP: 0.9,
      },
      token
    );
  }
}
