// Meal repository for database operations
import { BaseRepository } from "./BaseRepository";
import { Meal } from "@/models/Meal";
import { Meal as IMeal } from "@/types";
import { PrismaClient } from "@prisma/client";

export class MealRepository extends BaseRepository<Meal> {
  public async create(data: Partial<IMeal>): Promise<Meal> {
    const meal = new Meal(data);

    if (!meal.validate()) {
      throw new Error("Invalid meal data");
    }

    const created = await this.prisma.meal.create({
      data: {
        userId: meal.userId,
        name: meal.name,
        description: meal.description,
        carbohydrates: meal.carbohydrates,
        calories: meal.calories,
        protein: meal.protein,
        fat: meal.fat,
        fiber: meal.fiber,
        sugar: meal.sugar,
        timestamp: meal.timestamp,
      },
    });

    return new Meal(created);
  }

  public async findById(id: string): Promise<Meal | null> {
    const meal = await this.prisma.meal.findUnique({
      where: { id },
    });

    return meal ? new Meal(meal) : null;
  }

  public async findAll(
    filters: any = {},
    pagination: any = {}
  ): Promise<Meal[]> {
    const {
      page = 1,
      limit = 10,
      sortBy = "timestamp",
      sortOrder = "desc",
    } = pagination;
    const skip = (page - 1) * limit;

    const meals = await this.prisma.meal.findMany({
      where: filters,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
    });

    return meals.map((meal) => new Meal(meal));
  }

  public async update(id: string, data: Partial<IMeal>): Promise<Meal | null> {
    const updated = await this.prisma.meal.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });

    return new Meal(updated);
  }

  public async delete(id: string): Promise<boolean> {
    try {
      await this.prisma.meal.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  // Specialized methods for meals
  public async findByUserId(
    userId: string,
    filters: any = {},
    pagination: any = {}
  ): Promise<Meal[]> {
    return this.findAll({ userId, ...filters }, pagination);
  }

  public async findByDateRange(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Meal[]> {
    return this.findAll({
      userId,
      timestamp: {
        gte: startDate,
        lte: endDate,
      },
    });
  }

  public async getMealsByDay(userId: string, date: Date): Promise<Meal[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return this.findByDateRange(userId, startOfDay, endOfDay);
  }

  public async getMealsByWeek(
    userId: string,
    startDate: Date
  ): Promise<Meal[]> {
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 7);

    return this.findByDateRange(userId, startDate, endDate);
  }

  public async getMealsByMonth(
    userId: string,
    year: number,
    month: number
  ): Promise<Meal[]> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    return this.findByDateRange(userId, startDate, endDate);
  }

  public async getMealsByType(
    userId: string,
    mealType: "breakfast" | "lunch" | "dinner" | "snack"
  ): Promise<Meal[]> {
    const meals = await this.findByUserId(userId);
    return meals.filter((meal) => meal.getMealType() === mealType);
  }

  public async getHighCarbMeals(
    userId: string,
    threshold: number = 50
  ): Promise<Meal[]> {
    return this.findAll({
      userId,
      carbohydrates: { gt: threshold },
    });
  }

  public async getLowCarbMeals(
    userId: string,
    threshold: number = 20
  ): Promise<Meal[]> {
    return this.findAll({
      userId,
      carbohydrates: { lt: threshold },
    });
  }

  public async getMealsByName(userId: string, name: string): Promise<Meal[]> {
    return this.findAll({
      userId,
      name: { contains: name, mode: "insensitive" },
    });
  }

  public async getTotalMacrosByDay(
    userId: string,
    date: Date
  ): Promise<{
    carbohydrates: number;
    calories: number;
    protein: number;
    fat: number;
    fiber: number;
    sugar: number;
  }> {
    const meals = await this.getMealsByDay(userId, date);

    return meals.reduce(
      (totals, meal) => {
        const macros = meal.getTotalMacros();
        return {
          carbohydrates: totals.carbohydrates + macros.carbohydrates,
          calories: totals.calories + macros.calories,
          protein: totals.protein + macros.protein,
          fat: totals.fat + macros.fat,
          fiber: totals.fiber + macros.fiber,
          sugar: totals.sugar + macros.sugar,
        };
      },
      { carbohydrates: 0, calories: 0, protein: 0, fat: 0, fiber: 0, sugar: 0 }
    );
  }

  public async getTotalMacrosByWeek(
    userId: string,
    startDate: Date
  ): Promise<{
    carbohydrates: number;
    calories: number;
    protein: number;
    fat: number;
    fiber: number;
    sugar: number;
  }> {
    const meals = await this.getMealsByWeek(userId, startDate);

    return meals.reduce(
      (totals, meal) => {
        const macros = meal.getTotalMacros();
        return {
          carbohydrates: totals.carbohydrates + macros.carbohydrates,
          calories: totals.calories + macros.calories,
          protein: totals.protein + macros.protein,
          fat: totals.fat + macros.fat,
          fiber: totals.fiber + macros.fiber,
          sugar: totals.sugar + macros.sugar,
        };
      },
      { carbohydrates: 0, calories: 0, protein: 0, fat: 0, fiber: 0, sugar: 0 }
    );
  }

  public async getAverageMacrosByDay(
    userId: string,
    days: number = 7
  ): Promise<{
    carbohydrates: number;
    calories: number;
    protein: number;
    fat: number;
    fiber: number;
    sugar: number;
  }> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const meals = await this.findByDateRange(userId, startDate, endDate);

    const totals = meals.reduce(
      (totals, meal) => {
        const macros = meal.getTotalMacros();
        return {
          carbohydrates: totals.carbohydrates + macros.carbohydrates,
          calories: totals.calories + macros.calories,
          protein: totals.protein + macros.protein,
          fat: totals.fat + macros.fat,
          fiber: totals.fiber + macros.fiber,
          sugar: totals.sugar + macros.sugar,
        };
      },
      { carbohydrates: 0, calories: 0, protein: 0, fat: 0, fiber: 0, sugar: 0 }
    );

    const mealCount = meals.length;
    if (mealCount === 0) {
      return {
        carbohydrates: 0,
        calories: 0,
        protein: 0,
        fat: 0,
        fiber: 0,
        sugar: 0,
      };
    }

    return {
      carbohydrates: Math.round((totals.carbohydrates / mealCount) * 100) / 100,
      calories: Math.round((totals.calories / mealCount) * 100) / 100,
      protein: Math.round((totals.protein / mealCount) * 100) / 100,
      fat: Math.round((totals.fat / mealCount) * 100) / 100,
      fiber: Math.round((totals.fiber / mealCount) * 100) / 100,
      sugar: Math.round((totals.sugar / mealCount) * 100) / 100,
    };
  }

  public async getRecentMeals(
    userId: string,
    limit: number = 10
  ): Promise<Meal[]> {
    return this.findAll(
      { userId },
      { limit, sortBy: "timestamp", sortOrder: "desc" }
    );
  }

  public async searchMeals(userId: string, query: string): Promise<Meal[]> {
    return this.findAll({
      userId,
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
      ],
    });
  }

  public async getMealFrequency(
    userId: string,
    days: number = 30
  ): Promise<{
    breakfast: number;
    lunch: number;
    dinner: number;
    snack: number;
  }> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const meals = await this.findByDateRange(userId, startDate, endDate);

    const frequency = { breakfast: 0, lunch: 0, dinner: 0, snack: 0 };

    meals.forEach((meal) => {
      const mealType = meal.getMealType();
      frequency[mealType]++;
    });

    return frequency;
  }
}
