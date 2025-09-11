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
        await this.conversationRepository.findByIdWithMessages(
          conversation.id,
          data.userId
        );

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
      // Validate userId
      if (!data.userId || data.userId.trim() === "") {
        return {
          success: false,
          error: "Invalid user ID",
        };
      }

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

      // Auto-generate title if conversation has enough messages and still has default title
      const updatedConversation =
        await this.conversationRepository.findByUserAndId(
          data.conversationId,
          data.userId
        );

      if (
        updatedConversation &&
        updatedConversation.messages.length >= 4 &&
        (updatedConversation.title === "New Chat" ||
          updatedConversation.title === "Untitled conversation")
      ) {
        // Generate title asynchronously (don't wait for it)
        this.generateAndUpdateTitle(data.conversationId, data.userId)
          .then((titleResult) => {
            if (titleResult.success) {
              console.log(
                `Auto-generated title for conversation ${data.conversationId}: ${titleResult.data?.title}`
              );
            }
          })
          .catch((error) => {
            console.error(
              `Failed to auto-generate title for conversation ${data.conversationId}:`,
              error
            );
          });
      }

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

  public async sendMessageStream(
    data: SendMessageRequest,
    res: any
  ): Promise<void> {
    try {
      // Validate userId
      if (!data.userId || data.userId.trim() === "") {
        res.status(400).json({
          success: false,
          error: "Invalid user ID",
          statusCode: 400,
        });
        return;
      }

      // Get the conversation
      const conversation = await this.conversationRepository.findByUserAndId(
        data.conversationId,
        data.userId
      );

      if (!conversation) {
        res.status(404).json({
          success: false,
          error: "Conversation not found",
          statusCode: 404,
        });
        return;
      }

      // Create user message
      const userMessage = await this.conversationRepository.createMessage({
        content: data.content,
        role: "USER",
        conversationId: data.conversationId,
        userId: data.userId,
      });

      // Send user message info to client
      res.write(
        `data: ${JSON.stringify({
          type: "user_message",
          message: {
            id: userMessage.id,
            content: userMessage.content,
            role: userMessage.role,
            timestamp: userMessage.createdAt,
          },
        })}\n\n`
      );

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

      // Stream AI response
      let fullResponse = "";
      let hasStreamed = false;

      for await (const chunk of this.llmService.generateConversationResponseStream(
        messages,
        data.userId,
        data.conversationId
      )) {
        if (chunk.text) {
          fullResponse += chunk.text;
          hasStreamed = true;
          res.write(
            `data: ${JSON.stringify({
              type: "ai_chunk",
              text: chunk.text,
              done: chunk.done,
            })}\n\n`
          );
        }

        if (chunk.done) {
          // Create assistant message
          const assistantMessage =
            await this.conversationRepository.createMessage({
              content: fullResponse,
              role: "ASSISTANT",
              conversationId: data.conversationId,
              userId: data.userId,
            });

          // Update conversation timestamp
          await this.conversationRepository.updateConversationTimestamp(
            data.conversationId
          );

          // Only send final message if we didn't stream anything (fallback)
          if (!hasStreamed) {
            res.write(
              `data: ${JSON.stringify({
                type: "ai_message",
                message: {
                  id: assistantMessage.id,
                  content: assistantMessage.content,
                  role: assistantMessage.role,
                  timestamp: assistantMessage.createdAt,
                },
              })}\n\n`
            );
          }

          // Auto-generate title if conversation has enough messages and still has default title
          const updatedConversation =
            await this.conversationRepository.findByUserAndId(
              data.conversationId,
              data.userId
            );

          if (
            updatedConversation &&
            updatedConversation.messages.length >= 4 &&
            (updatedConversation.title === "New Chat" ||
              updatedConversation.title === "Untitled conversation")
          ) {
            // Generate title asynchronously (don't wait for it)
            this.generateAndUpdateTitle(data.conversationId, data.userId)
              .then((titleResult) => {
                if (titleResult.success) {
                  console.log(
                    `Auto-generated title for conversation ${data.conversationId}: ${titleResult.data?.title}`
                  );
                }
              })
              .catch((error) => {
                console.error(
                  `Failed to auto-generate title for conversation ${data.conversationId}:`,
                  error
                );
              });
          }

          res.write(`data: ${JSON.stringify({ type: "done" })}\n\n`);
          res.end();
          break;
        }
      }
    } catch (error) {
      console.error("Streaming error:", error);
      res.write(
        `data: ${JSON.stringify({
          type: "error",
          error: "Failed to generate response",
        })}\n\n`
      );
      res.end();
    }
  }

  public async generateAndUpdateTitle(
    conversationId: string,
    userId: string
  ): Promise<ServiceResponse<{ title: string }>> {
    try {
      // Get the conversation with messages
      const conversation = await this.conversationRepository.findByUserAndId(
        conversationId,
        userId
      );

      if (!conversation) {
        return {
          success: false,
          error: "Conversation not found",
        };
      }

      // Only generate title if conversation has enough messages (2+ exchanges)
      if (conversation.messages.length < 2) {
        return {
          success: false,
          error: "Not enough messages to generate title",
        };
      }

      // Prepare messages for title generation
      const messages = conversation.messages.map((msg) => ({
        role: msg.role.toLowerCase() as "user" | "assistant" | "system",
        content: msg.content,
      }));

      // Generate title using LLM service
      const titleResult = await this.llmService.generateConversationTitle(
        messages,
        userId
      );

      if (!titleResult.success) {
        return {
          success: false,
          error: titleResult.error || "Failed to generate title",
        };
      }

      const newTitle = titleResult.data!;

      // Update conversation title
      const updatedConversation = await this.conversationRepository.update(
        conversationId,
        { title: newTitle },
        userId
      );

      if (!updatedConversation) {
        return {
          success: false,
          error: "Failed to update conversation title",
        };
      }

      return {
        success: true,
        data: { title: newTitle },
        message: "Conversation title updated successfully",
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to generate and update title: ${error}`,
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
        // Idempotent delete: treat as success if it's already gone
        return {
          success: true,
          data: true,
          message: "Conversation already deleted",
        };
      }

      // Delete conversation (messages will be deleted due to cascade)
      await this.conversationRepository.delete(id, userId);

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
