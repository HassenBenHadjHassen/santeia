// User repository for user database operations
import { User as PrismaUser, Prisma } from "@prisma/client";
import { User } from "@/types";
import { BaseRepository } from "./BaseRepository";
import bcrypt from "bcryptjs";

export class UserRepository extends BaseRepository<PrismaUser> {
  public async create(data: Partial<User>): Promise<User> {
    return this.handleDatabaseOperation(async () => {
      // Hash password if provided
      let hashedPassword: string | undefined;
      if (data.password) {
        hashedPassword = await bcrypt.hash(data.password, 12);
      }

      const prismaUser = await this.prisma.user.create({
        data: {
          email: data.email!,
          name: data.name!,
          role: data.role || "USER",
          isActive: data.isActive ?? true,
          password: hashedPassword,
          onboardingCompleted: data.onboardingCompleted ?? false,
          dateOfBirth: (data as any).dateOfBirth,
          heightCm: (data as any).heightCm as any,
          weightKg: (data as any).weightKg as any,
          bloodPressureSystolic: (data as any).bloodPressureSystolic as any,
          bloodPressureDiastolic: (data as any).bloodPressureDiastolic as any,
          heartRate: (data as any).heartRate as any,
          diabetesType: data.diabetesType,
          diagnosisDate: data.diagnosisDate,
          currentMedications: data.currentMedications,
          bloodSugarTargets: data.bloodSugarTargets,
          activityLevel: data.activityLevel,
          dietaryPreferences: data.dietaryPreferences,
          emergencyContact: data.emergencyContact,
        },
      });

      return prismaUser as User;
    });
  }

  public async findById(id: string): Promise<User | null> {
    return this.handleDatabaseOperation(async () => {
      const prismaUser = await this.prisma.user.findUnique({
        where: { id },
      });
      return prismaUser as User | null;
    });
  }

  public async findByEmail(email: string): Promise<User | null> {
    return this.handleDatabaseOperation(async () => {
      const prismaUser = await this.prisma.user.findUnique({
        where: { email },
      });
      return prismaUser as User | null;
    });
  }

  public async findAll(filters?: Record<string, any>): Promise<User[]> {
    return this.handleDatabaseOperation(async () => {
      const where = filters ? this.buildWhereClause(filters) : {};

      const prismaUsers = await this.prisma.user.findMany({
        where,
        orderBy: { createdAt: "desc" },
      });
      return prismaUsers as User[];
    });
  }

  public async update(id: string, data: Partial<User>): Promise<User> {
    return this.handleDatabaseOperation(async () => {
      // Hash password if provided
      let updateData: any = { ...data };
      if (data.password) {
        updateData.password = await bcrypt.hash(data.password, 12);
      }
      // Ensure new profile health fields pass through
      if ((data as any).heightCm !== undefined)
        updateData.heightCm = (data as any).heightCm;
      if ((data as any).weightKg !== undefined)
        updateData.weightKg = (data as any).weightKg;
      if ((data as any).bloodPressureSystolic !== undefined)
        updateData.bloodPressureSystolic = (data as any).bloodPressureSystolic;
      if ((data as any).bloodPressureDiastolic !== undefined)
        updateData.bloodPressureDiastolic = (
          data as any
        ).bloodPressureDiastolic;
      if ((data as any).heartRate !== undefined)
        updateData.heartRate = (data as any).heartRate;

      const prismaUser = await this.prisma.user.update({
        where: { id },
        data: updateData,
      });
      return prismaUser as User;
    });
  }

  public async delete(id: string): Promise<boolean> {
    return this.handleDatabaseOperation(async () => {
      await this.prisma.user.delete({
        where: { id },
      });
      return true;
    });
  }

  public async validatePassword(
    email: string,
    password: string
  ): Promise<User | null> {
    return this.handleDatabaseOperation(async () => {
      const user = await this.findByEmail(email);

      if (!user || !user.password) {
        return null;
      }

      const isValid = await bcrypt.compare(password, user.password);
      return isValid ? user : null;
    });
  }

  public async checkEmailExists(
    email: string,
    excludeId?: string
  ): Promise<boolean> {
    return this.handleDatabaseOperation(async () => {
      const user = await this.prisma.user.findFirst({
        where: {
          email,
          ...(excludeId && { id: { not: excludeId } }),
        },
      });
      return !!user;
    });
  }

  public async getUsersWithPagination(
    page: number = 1,
    limit: number = 10,
    filters?: Record<string, any>
  ): Promise<{ users: User[]; total: number }> {
    return this.handleDatabaseOperation(async () => {
      const where = filters ? this.buildWhereClause(filters) : {};
      const pagination = this.buildPaginationOptions(page, limit);

      const [prismaUsers, total] = await Promise.all([
        this.prisma.user.findMany({
          where,
          ...pagination,
          orderBy: { createdAt: "desc" },
        }),
        this.prisma.user.count({ where }),
      ]);

      return { users: prismaUsers as User[], total };
    });
  }

  protected buildSearchClause(searchTerm: string): any[] {
    return [
      { name: { contains: searchTerm, mode: "insensitive" } },
      { email: { contains: searchTerm, mode: "insensitive" } },
    ];
  }
}
