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
  ): Promise<Conversation[]> {
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

    const response = await this.apiClient.authenticatedRequest<Conversation[]>(
      endpoint,
      { method: "GET" },
      token
    );
    return response.data || [];
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

  async sendMessageStream(
    conversationId: string,
    content: string,
    onChunk: (text: string) => void,
    onMessage: (message: Message) => void,
    onError: (error: string) => void,
    onComplete: () => void,
    token: string
  ): Promise<void> {
    if (!token) {
      onError("No authentication token found");
      return;
    }

    try {
      const response = await fetch(
        `${this.apiClient.getBaseURL()}/conversations/${conversationId}/messages/stream`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ content, conversationId }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("No response body reader available");
      }

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));

              switch (data.type) {
                case "ai_chunk":
                  if (data.text) {
                    onChunk(data.text);
                  }
                  break;
                case "ai_message":
                  if (data.message) {
                    onMessage(data.message);
                  }
                  break;
                case "user_message":
                  if (data.message) {
                    onMessage(data.message);
                  }
                  break;
                case "error":
                  onError(data.error || "Unknown error");
                  break;
                case "done":
                  onComplete();
                  return;
              }
            } catch (e) {
              console.error("Error parsing SSE data:", e);
            }
          }
        }
      }
    } catch (error) {
      onError(error instanceof Error ? error.message : "Unknown error");
    }
  }

  // Get user's conversations
  async getUserConversations(
    userId: string,
    pagination?: PaginationParams,
    token?: string
  ): Promise<Conversation[]> {
    return this.getAllConversations({ userId }, pagination, token);
  }

  // Search conversations
  async searchConversations(
    searchTerm: string,
    pagination?: PaginationParams,
    token?: string
  ): Promise<Conversation[]> {
    return this.getAllConversations({ search: searchTerm }, pagination, token);
  }

  async generateTitle(
    conversationId: string,
    token: string
  ): Promise<{ title: string }> {
    const response = await this.apiClient.authenticatedRequest<{
      title: string;
    }>(
      `/conversations/${conversationId}/generate-title`,
      { method: "POST" },
      token
    );
    return response.data!;
  }
}
