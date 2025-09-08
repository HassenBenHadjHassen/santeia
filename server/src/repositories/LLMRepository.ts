// LLM repository for LLM request logging and management
import { LLMRequest, Prisma } from "@prisma/client";
import { BaseRepository } from "./BaseRepository";

export class LLMRepository extends BaseRepository<LLMRequest> {
  public async create(data: Partial<LLMRequest>): Promise<LLMRequest> {
    return this.handleDatabaseOperation(async () => {
      return await this.prisma.lLMRequest.create({
        data: {
          model: data.model!,
          prompt: data.prompt!,
          response: data.response,
          tokens: data.tokens,
          cost: data.cost,
          duration: data.duration,
          userId: data.userId!,
        },
      });
    });
  }

  public async findById(id: string): Promise<LLMRequest | null> {
    return this.handleDatabaseOperation(async () => {
      return await this.prisma.lLMRequest.findUnique({
        where: { id },
      });
    });
  }

  public async findAll(filters?: Record<string, any>): Promise<LLMRequest[]> {
    return this.handleDatabaseOperation(async () => {
      const where = filters ? this.buildWhereClause(filters) : {};

      return await this.prisma.lLMRequest.findMany({
        where,
        orderBy: { createdAt: "desc" },
      });
    });
  }

  public async findByUserId(
    userId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<LLMRequest[]> {
    return this.handleDatabaseOperation(async () => {
      return await this.prisma.lLMRequest.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      });
    });
  }

  public async update(
    id: string,
    data: Partial<LLMRequest>
  ): Promise<LLMRequest> {
    return this.handleDatabaseOperation(async () => {
      return await this.prisma.lLMRequest.update({
        where: { id },
        data,
      });
    });
  }

  public async delete(id: string): Promise<boolean> {
    return this.handleDatabaseOperation(async () => {
      await this.prisma.lLMRequest.delete({
        where: { id },
      });
      return true;
    });
  }

  public async getUsageStats(userId: string): Promise<{
    totalRequests: number;
    totalTokens: number;
    totalCost: number;
    averageDuration: number;
  }> {
    return this.handleDatabaseOperation(async () => {
      const stats = await this.prisma.lLMRequest.aggregate({
        where: { userId },
        _count: { id: true },
        _sum: {
          tokens: true,
          cost: true,
          duration: true,
        },
        _avg: {
          duration: true,
        },
      });

      return {
        totalRequests: stats._count.id,
        totalTokens: stats._sum.tokens || 0,
        totalCost: stats._sum.cost || 0,
        averageDuration: stats._avg.duration || 0,
      };
    });
  }

  public async getModelUsageStats(model: string): Promise<{
    totalRequests: number;
    totalTokens: number;
    totalCost: number;
    averageDuration: number;
  }> {
    return this.handleDatabaseOperation(async () => {
      const stats = await this.prisma.lLMRequest.aggregate({
        where: { model },
        _count: { id: true },
        _sum: {
          tokens: true,
          cost: true,
          duration: true,
        },
        _avg: {
          duration: true,
        },
      });

      return {
        totalRequests: stats._count.id,
        totalTokens: stats._sum.tokens || 0,
        totalCost: stats._sum.cost || 0,
        averageDuration: stats._avg.duration || 0,
      };
    });
  }

  public async getRecentRequests(
    userId: string,
    limit: number = 10
  ): Promise<LLMRequest[]> {
    return this.handleDatabaseOperation(async () => {
      return await this.prisma.lLMRequest.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: limit,
      });
    });
  }

  public async deleteOldRequests(olderThanDays: number = 30): Promise<number> {
    return this.handleDatabaseOperation(async () => {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

      const result = await this.prisma.lLMRequest.deleteMany({
        where: {
          createdAt: {
            lt: cutoffDate,
          },
        },
      });

      return result.count;
    });
  }

  protected buildSearchClause(searchTerm: string): any[] {
    return [
      { prompt: { contains: searchTerm, mode: "insensitive" } },
      { response: { contains: searchTerm, mode: "insensitive" } },
      { model: { contains: searchTerm, mode: "insensitive" } },
    ];
  }
}
