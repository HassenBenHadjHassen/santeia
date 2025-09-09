// Conversation API Service
import { ApiClient } from "../client";
import type {
  Conversation,
  Message,
  CreateConversationRequest,
  SendMessageRequest,
  SendMessageResponse,
  ConversationFilters,
  PaginationParams,
  PaginatedResponse,
} from "../types";

export class ConversationService {
  private apiClient: ApiClient;

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  // Conversation CRUD operations
  async createConversation(
    conversationData: CreateConversationRequest,
    token: string
  ): Promise<Conversation> {
    const response = await this.apiClient.authenticatedRequest<Conversation>(
      "/conversations",
      {
        method: "POST",
        body: JSON.stringify({
          title: conversationData.title,
        }),
      },
      token
    );
    return response.data!;
  }

  async getConversationById(id: string, token: string): Promise<Conversation> {
    const response = await this.apiClient.authenticatedRequest<Conversation>(
      `/conversations/${id}`,
      { method: "GET" },
      token
    );
    return response.data!;
  }

  async getAllConversations(
    filters?: ConversationFilters,
    pagination?: PaginationParams,
    token?: string
  ): Promise<PaginatedResponse<Conversation>> {
    const params = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString());
        }
      });
    }

    if (pagination) {
      Object.entries(pagination).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString());
        }
      });
    }

    const queryString = params.toString();
    const endpoint = `/conversations${queryString ? `?${queryString}` : ""}`;

    const response = await this.apiClient.authenticatedRequest<
      PaginatedResponse<Conversation>
    >(endpoint, { method: "GET" }, token);
    return response.data!;
  }

  async updateConversation(
    id: string,
    conversationData: Partial<Conversation>,
    token: string
  ): Promise<Conversation> {
    const response = await this.apiClient.authenticatedRequest<Conversation>(
      `/conversations/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(conversationData),
      },
      token
    );
    return response.data!;
  }

  async deleteConversation(id: string, token: string): Promise<void> {
    await this.apiClient.authenticatedRequest(
      `/conversations/${id}`,
      { method: "DELETE" },
      token
    );
  }

  // Message operations
  async sendMessage(
    messageData: SendMessageRequest,
    token: string
  ): Promise<SendMessageResponse> {
    const response =
      await this.apiClient.authenticatedRequest<SendMessageResponse>(
        `/conversations/${messageData.conversationId}/messages`,
        {
          method: "POST",
          body: JSON.stringify({
            content: messageData.content,
            conversationId: messageData.conversationId,
          }),
        },
        token
      );
    return response.data!;
  }

  // Get user's conversations
  async getUserConversations(
    userId: string,
    pagination?: PaginationParams,
    token?: string
  ): Promise<PaginatedResponse<Conversation>> {
    return this.getAllConversations({ userId }, pagination, token);
  }

  // Search conversations
  async searchConversations(
    searchTerm: string,
    pagination?: PaginationParams,
    token?: string
  ): Promise<PaginatedResponse<Conversation>> {
    return this.getAllConversations({ search: searchTerm }, pagination, token);
  }
}
