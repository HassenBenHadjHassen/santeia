// Conversation service for managing chat conversations
import { ConversationRepository } from "@/repositories/ConversationRepository";
import { ServiceResponse } from "@/types";
import { LLMService } from "./LLMService";

export interface CreateConversationRequest {
  title: string;
  userId: string;
}

export interface SendMessageRequest {
  content: string;
  conversationId: string;
  userId: string;
}

export interface ConversationWithMessages {
  id: string;
  title: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  messages: Array<{
    id: string;
    content: string;
    role: "USER" | "ASSISTANT" | "SYSTEM";
    createdAt: Date;
  }>;
}

export class ConversationService {
  private llmService: LLMService;
  private conversationRepository: ConversationRepository;

  constructor() {
    this.llmService = new LLMService();
    this.conversationRepository = new ConversationRepository();
  }

  public async createConversation(
    data: CreateConversationRequest
  ): Promise<ServiceResponse<ConversationWithMessages>> {
    try {
      const conversation = await this.conversationRepository.create(data);

      // Get the conversation with messages
      const conversationWithMessages =
        await this.conversationRepository.findByIdWithMessages(conversation.id);

      return {
        success: true,
        data: conversationWithMessages as ConversationWithMessages,
        message: "Conversation created successfully",
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to create conversation: ${error}`,
      };
    }
  }

  public async getConversation(
    id: string,
    userId: string
  ): Promise<ServiceResponse<ConversationWithMessages>> {
    try {
      const conversation = await this.conversationRepository.findByUserAndId(
        id,
        userId
      );

      if (!conversation) {
        return {
          success: false,
          error: "Conversation not found",
        };
      }

      return {
        success: true,
        data: conversation as ConversationWithMessages,
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to get conversation: ${error}`,
      };
    }
  }

  public async getUserConversations(
    userId: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<ServiceResponse<ConversationWithMessages[]>> {
    try {
      const conversations = await this.conversationRepository.findByUserId(
        userId,
        limit,
        offset
      );

      return {
        success: true,
        data: conversations as ConversationWithMessages[],
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to get conversations: ${error}`,
      };
    }
  }

  public async sendMessage(
    data: SendMessageRequest
  ): Promise<ServiceResponse<{ message: any; response: any }>> {
    try {
      // Get the conversation
      const conversation = await this.conversationRepository.findByUserAndId(
        data.conversationId,
        data.userId
      );

      if (!conversation) {
        return {
          success: false,
          error: "Conversation not found",
        };
      }

      // Create user message
      const userMessage = await this.conversationRepository.createMessage({
        content: data.content,
        role: "USER",
        conversationId: data.conversationId,
        userId: data.userId,
      });

      // Prepare messages for LLM
      const messages = conversation.messages.map((msg) => ({
        role: msg.role.toLowerCase() as "user" | "assistant" | "system",
        content: msg.content,
      }));

      // Add the new user message
      messages.push({
        role: "user",
        content: data.content,
      });

      // Generate AI response
      const llmResponse = await this.llmService.generateConversationResponse(
        messages,
        data.userId,
        data.conversationId
      );

      if (!llmResponse.success || !llmResponse.data) {
        return {
          success: false,
          error: llmResponse.error || "Failed to generate AI response",
        };
      }

      // Create assistant message
      const assistantMessage = await this.conversationRepository.createMessage({
        content: llmResponse.data.text,
        role: "ASSISTANT",
        conversationId: data.conversationId,
        userId: data.userId,
      });

      // Update conversation timestamp
      await this.conversationRepository.updateConversationTimestamp(
        data.conversationId
      );

      return {
        success: true,
        data: {
          message: userMessage,
          response: assistantMessage,
        },
        message: "Message sent and response generated successfully",
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to send message: ${error}`,
      };
    }
  }

  public async deleteConversation(
    id: string,
    userId: string
  ): Promise<ServiceResponse<boolean>> {
    try {
      // Check if conversation exists and belongs to user
      const conversation = await this.conversationRepository.findByUserAndId(
        id,
        userId
      );

      if (!conversation) {
        return {
          success: false,
          error: "Conversation not found",
        };
      }

      // Delete conversation (messages will be deleted due to cascade)
      await this.conversationRepository.delete(id);

      return {
        success: true,
        data: true,
        message: "Conversation deleted successfully",
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to delete conversation: ${error}`,
      };
    }
  }
}
