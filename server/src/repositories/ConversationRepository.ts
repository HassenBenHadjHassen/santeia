// Conversation repository for conversation database operations
import { Conversation, Message, Prisma } from "@prisma/client";
import { BaseRepository } from "./BaseRepository";

export interface ConversationWithMessages extends Conversation {
  messages: Message[];
}

export class ConversationRepository extends BaseRepository<Conversation> {
  public async create(data: Partial<Conversation>): Promise<Conversation> {
    return this.handleDatabaseOperation(async () => {
      return await this.prisma.conversation.create({
        data: {
          title: data.title!,
          userId: data.userId!,
        },
      });
    });
  }

  public async findById(id: string): Promise<Conversation | null> {
    return this.handleDatabaseOperation(async () => {
      return await this.prisma.conversation.findUnique({
        where: { id },
      });
    });
  }

  public async findByIdWithMessages(
    id: string
  ): Promise<ConversationWithMessages | null> {
    return this.handleDatabaseOperation(async () => {
      return await this.prisma.conversation.findUnique({
        where: { id },
        include: {
          messages: {
            orderBy: { createdAt: "asc" },
          },
        },
      });
    });
  }

  public async findByUserAndId(
    id: string,
    userId: string
  ): Promise<ConversationWithMessages | null> {
    return this.handleDatabaseOperation(async () => {
      return await this.prisma.conversation.findFirst({
        where: {
          id,
          userId,
        },
        include: {
          messages: {
            orderBy: { createdAt: "asc" },
          },
        },
      });
    });
  }

  public async findAll(filters?: Record<string, any>): Promise<Conversation[]> {
    return this.handleDatabaseOperation(async () => {
      const where = filters ? this.buildWhereClause(filters) : {};

      return await this.prisma.conversation.findMany({
        where,
        orderBy: { updatedAt: "desc" },
      });
    });
  }

  public async findByUserId(
    userId: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<ConversationWithMessages[]> {
    return this.handleDatabaseOperation(async () => {
      return await this.prisma.conversation.findMany({
        where: { userId },
        include: {
          messages: {
            orderBy: { createdAt: "asc" },
            take: 1, // Only get the first message for preview
          },
        },
        orderBy: { updatedAt: "desc" },
        take: limit,
        skip: offset,
      });
    });
  }

  public async update(
    id: string,
    data: Partial<Conversation>
  ): Promise<Conversation> {
    return this.handleDatabaseOperation(async () => {
      return await this.prisma.conversation.update({
        where: { id },
        data: {
          ...data,
          updatedAt: new Date(),
        },
      });
    });
  }

  public async delete(id: string): Promise<boolean> {
    return this.handleDatabaseOperation(async () => {
      await this.prisma.conversation.delete({
        where: { id },
      });
      return true;
    });
  }

  public async createMessage(data: {
    content: string;
    role: "USER" | "ASSISTANT" | "SYSTEM";
    conversationId: string;
    userId: string;
  }): Promise<Message> {
    return this.handleDatabaseOperation(async () => {
      return await this.prisma.message.create({
        data: {
          content: data.content,
          role: data.role,
          conversationId: data.conversationId,
          userId: data.userId,
        },
      });
    });
  }

  public async getMessagesByConversationId(
    conversationId: string,
    limit?: number,
    offset?: number
  ): Promise<Message[]> {
    return this.handleDatabaseOperation(async () => {
      return await this.prisma.message.findMany({
        where: { conversationId },
        orderBy: { createdAt: "asc" },
        ...(limit && { take: limit }),
        ...(offset && { skip: offset }),
      });
    });
  }

  public async updateConversationTimestamp(id: string): Promise<void> {
    return this.handleDatabaseOperation(async () => {
      await this.prisma.conversation.update({
        where: { id },
        data: { updatedAt: new Date() },
      });
    });
  }

  public async getConversationCount(userId: string): Promise<number> {
    return this.handleDatabaseOperation(async () => {
      return await this.prisma.conversation.count({
        where: { userId },
      });
    });
  }

  protected buildSearchClause(searchTerm: string): any[] {
    return [{ title: { contains: searchTerm, mode: "insensitive" } }];
  }
}
