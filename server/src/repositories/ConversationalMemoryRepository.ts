// Conversational Memory repository for managing persistent conversational facts
import { ConversationalMemory, MemoryType, Prisma } from "@prisma/client";
import { BaseRepository } from "./BaseRepository";

export interface CreateConversationalMemoryRequest {
  userId: string;
  factType: MemoryType;
  content: string;
  context?: string;
  relevanceScore?: number;
}

export class ConversationalMemoryRepository extends BaseRepository<ConversationalMemory> {
  public async findById(id: string): Promise<ConversationalMemory | null> {
    return this.handleDatabaseOperation(async () => {
      return await this.prisma.conversationalMemory.findUnique({
        where: { id },
      });
    });
  }

  public async findAll(
    filters?: Record<string, any>
  ): Promise<ConversationalMemory[]> {
    return this.handleDatabaseOperation(async () => {
      const where = this.buildWhereClause(filters || {});
      return await this.prisma.conversationalMemory.findMany({
        where,
        orderBy: { createdAt: "desc" },
      });
    });
  }

  public async delete(id: string): Promise<boolean> {
    return this.handleDatabaseOperation(async () => {
      const result = await this.prisma.conversationalMemory.delete({
        where: { id },
      });
      return !!result;
    });
  }

  public async create(
    data: CreateConversationalMemoryRequest
  ): Promise<ConversationalMemory> {
    return this.handleDatabaseOperation(async () => {
      // Check if similar memory already exists
      const existing = await this.prisma.conversationalMemory.findFirst({
        where: {
          userId: data.userId,
          factType: data.factType,
          content: {
            contains: data.content.substring(0, 20),
            mode: "insensitive",
          },
          isActive: true,
        },
      });

      // If similar memory exists, update it instead of creating duplicate
      if (existing) {
        return await this.prisma.conversationalMemory.update({
          where: { id: existing.id },
          data: {
            content: data.content,
            context: data.context,
            relevanceScore: data.relevanceScore || 1.0,
            updatedAt: new Date(),
          },
        });
      }

      // Create new memory
      return await this.prisma.conversationalMemory.create({
        data: {
          userId: data.userId,
          factType: data.factType,
          content: data.content,
          context: data.context,
          relevanceScore: data.relevanceScore || 1.0,
        },
      });
    });
  }

  public async findByUserId(
    userId: string,
    limit: number = 50,
    factTypes?: MemoryType[]
  ): Promise<ConversationalMemory[]> {
    return this.handleDatabaseOperation(async () => {
      const whereClause: any = {
        userId,
        isActive: true,
      };

      if (factTypes && factTypes.length > 0) {
        whereClause.factType = { in: factTypes };
      }

      return await this.prisma.conversationalMemory.findMany({
        where: whereClause,
        orderBy: [{ relevanceScore: "desc" }, { updatedAt: "desc" }],
        take: limit,
      });
    });
  }

  public async findRelevantMemories(
    userId: string,
    query?: string,
    limit: number = 20
  ): Promise<ConversationalMemory[]> {
    return this.handleDatabaseOperation(async () => {
      const whereClause: any = {
        userId,
        isActive: true,
      };

      // If query provided, search in content
      if (query && query.trim()) {
        const searchTerms = query
          .toLowerCase()
          .split(" ")
          .filter((term) => term.length > 2);
        if (searchTerms.length > 0) {
          whereClause.OR = searchTerms.map((term) => ({
            content: {
              contains: term,
              mode: "insensitive",
            },
          }));
        }
      }

      return await this.prisma.conversationalMemory.findMany({
        where: whereClause,
        orderBy: [{ relevanceScore: "desc" }, { updatedAt: "desc" }],
        take: limit,
      });
    });
  }

  public async update(
    id: string,
    data: Partial<ConversationalMemory>
  ): Promise<ConversationalMemory | null> {
    return this.handleDatabaseOperation(async () => {
      // Check if memory exists
      const memory = await this.prisma.conversationalMemory.findUnique({
        where: { id },
      });

      if (!memory) {
        return null;
      }

      return await this.prisma.conversationalMemory.update({
        where: { id },
        data: {
          ...data,
          updatedAt: new Date(),
        },
      });
    });
  }

  public async deactivateMemory(id: string, userId: string): Promise<boolean> {
    return this.handleDatabaseOperation(async () => {
      const result = await this.prisma.conversationalMemory.updateMany({
        where: { id, userId },
        data: { isActive: false },
      });
      return result.count > 0;
    });
  }

  public async deleteOldMemories(
    userId: string,
    olderThanDays: number = 180
  ): Promise<number> {
    return this.handleDatabaseOperation(async () => {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

      const result = await this.prisma.conversationalMemory.deleteMany({
        where: {
          userId,
          updatedAt: { lt: cutoffDate },
          relevanceScore: { lt: 0.5 }, // Only delete low relevance memories
        },
      });

      return result.count;
    });
  }

  public async getMemoryStats(userId: string): Promise<{
    totalMemories: number;
    memoryTypeBreakdown: Record<string, number>;
    avgRelevanceScore: number;
  }> {
    return this.handleDatabaseOperation(async () => {
      const memories = await this.prisma.conversationalMemory.findMany({
        where: { userId, isActive: true },
        select: { factType: true, relevanceScore: true },
      });

      const totalMemories = memories.length;
      const memoryTypeBreakdown: Record<string, number> = {};
      let totalRelevanceScore = 0;

      memories.forEach((memory) => {
        memoryTypeBreakdown[memory.factType] =
          (memoryTypeBreakdown[memory.factType] || 0) + 1;
        totalRelevanceScore += memory.relevanceScore || 1.0;
      });

      return {
        totalMemories,
        memoryTypeBreakdown,
        avgRelevanceScore:
          totalMemories > 0 ? totalRelevanceScore / totalMemories : 0,
      };
    });
  }

  protected buildSearchClause(searchTerm: string): any[] {
    return [
      { content: { contains: searchTerm, mode: "insensitive" } },
      { context: { contains: searchTerm, mode: "insensitive" } },
    ];
  }
}
