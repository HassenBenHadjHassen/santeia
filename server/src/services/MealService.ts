// MealService for business logic
import { MealRepository } from "@/repositories/MealRepository";
import { Meal } from "@/models/Meal";
import { CreateMealRequest, ServiceResponse } from "@/types";

export class MealService {
  private mealRepository: MealRepository;

  constructor() {
    this.mealRepository = new MealRepository();
  }

  public async createMeal(
    userId: string,
    data: CreateMealRequest
  ): Promise<ServiceResponse<Meal>> {
    try {
      const meal = await this.mealRepository.create({
        userId,
        ...data,
      });

      return {
        success: true,
        data: meal,
        message: "Meal recorded successfully",
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create meal",
      };
    }
  }

  public async getMealById(id: string): Promise<ServiceResponse<Meal>> {
    try {
      const meal = await this.mealRepository.findById(id);

      if (!meal) {
        return {
          success: false,
          error: "Meal not found",
        };
      }

      return {
        success: true,
        data: meal,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to get meal",
      };
    }
  }

  public async getMealsByUser(
    userId: string,
    filters: any = {},
    pagination: any = {}
  ): Promise<ServiceResponse<Meal[]>> {
    try {
      const meals = await this.mealRepository.findByUserId(
        userId,
        filters,
        pagination
      );

      return {
        success: true,
        data: meals,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to get meals",
      };
    }
  }

  public async getMealsByDateRange(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<ServiceResponse<Meal[]>> {
    try {
      const meals = await this.mealRepository.findByDateRange(
        userId,
        startDate,
        endDate
      );

      return {
        success: true,
        data: meals,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to get meals by date range",
      };
    }
  }

  public async getMealsByDay(
    userId: string,
    date: Date
  ): Promise<ServiceResponse<Meal[]>> {
    try {
      const meals = await this.mealRepository.getMealsByDay(userId, date);

      return {
        success: true,
        data: meals,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to get daily meals",
      };
    }
  }

  public async getMealsByWeek(
    userId: string,
    startDate: Date
  ): Promise<ServiceResponse<Meal[]>> {
    try {
      const meals = await this.mealRepository.getMealsByWeek(userId, startDate);

      return {
        success: true,
        data: meals,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to get weekly meals",
      };
    }
  }

  public async getMealsByMonth(
    userId: string,
    year: number,
    month: number
  ): Promise<ServiceResponse<Meal[]>> {
    try {
      const meals = await this.mealRepository.getMealsByMonth(
        userId,
        year,
        month
      );

      return {
        success: true,
        data: meals,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to get monthly meals",
      };
    }
  }

  public async getMealsByType(
    userId: string,
    mealType: "breakfast" | "lunch" | "dinner" | "snack"
  ): Promise<ServiceResponse<Meal[]>> {
    try {
      const meals = await this.mealRepository.getMealsByType(userId, mealType);

      return {
        success: true,
        data: meals,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to get meals by type",
      };
    }
  }

  public async getHighCarbMeals(
    userId: string,
    threshold: number = 50
  ): Promise<ServiceResponse<Meal[]>> {
    try {
      const meals = await this.mealRepository.getHighCarbMeals(
        userId,
        threshold
      );

      return {
        success: true,
        data: meals,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to get high carb meals",
      };
    }
  }

  public async getLowCarbMeals(
    userId: string,
    threshold: number = 20
  ): Promise<ServiceResponse<Meal[]>> {
    try {
      const meals = await this.mealRepository.getLowCarbMeals(
        userId,
        threshold
      );

      return {
        success: true,
        data: meals,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to get low carb meals",
      };
    }
  }

  public async searchMeals(
    userId: string,
    query: string
  ): Promise<ServiceResponse<Meal[]>> {
    try {
      const meals = await this.mealRepository.searchMeals(userId, query);

      return {
        success: true,
        data: meals,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to search meals",
      };
    }
  }

  public async getTotalMacrosByDay(
    userId: string,
    date: Date
  ): Promise<
    ServiceResponse<{
      carbohydrates: number;
      calories: number;
      protein: number;
      fat: number;
      fiber: number;
      sugar: number;
    }>
  > {
    try {
      const macros = await this.mealRepository.getTotalMacrosByDay(
        userId,
        date
      );

      return {
        success: true,
        data: macros,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to get daily macro totals",
      };
    }
  }

  public async getTotalMacrosByWeek(
    userId: string,
    startDate: Date
  ): Promise<
    ServiceResponse<{
      carbohydrates: number;
      calories: number;
      protein: number;
      fat: number;
      fiber: number;
      sugar: number;
    }>
  > {
    try {
      const macros = await this.mealRepository.getTotalMacrosByWeek(
        userId,
        startDate
      );

      return {
        success: true,
        data: macros,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to get weekly macro totals",
      };
    }
  }

  public async getAverageMacrosByDay(
    userId: string,
    days: number = 7
  ): Promise<
    ServiceResponse<{
      carbohydrates: number;
      calories: number;
      protein: number;
      fat: number;
      fiber: number;
      sugar: number;
    }>
  > {
    try {
      const macros = await this.mealRepository.getAverageMacrosByDay(
        userId,
        days
      );

      return {
        success: true,
        data: macros,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to get average daily macros",
      };
    }
  }

  public async getMealFrequency(
    userId: string,
    days: number = 30
  ): Promise<
    ServiceResponse<{
      breakfast: number;
      lunch: number;
      dinner: number;
      snack: number;
    }>
  > {
    try {
      const frequency = await this.mealRepository.getMealFrequency(
        userId,
        days
      );

      return {
        success: true,
        data: frequency,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to get meal frequency",
      };
    }
  }

  public async getRecentMeals(
    userId: string,
    limit: number = 10
  ): Promise<ServiceResponse<Meal[]>> {
    try {
      const meals = await this.mealRepository.getRecentMeals(userId, limit);

      return {
        success: true,
        data: meals,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to get recent meals",
      };
    }
  }

  public async updateMeal(
    id: string,
    data: Partial<CreateMealRequest>
  ): Promise<ServiceResponse<Meal>> {
    try {
      const meal = await this.mealRepository.update(id, data);

      if (!meal) {
        return {
          success: false,
          error: "Meal not found",
        };
      }

      return {
        success: true,
        data: meal,
        message: "Meal updated successfully",
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to update meal",
      };
    }
  }

  public async deleteMeal(id: string): Promise<ServiceResponse<boolean>> {
    try {
      const success = await this.mealRepository.delete(id);

      if (!success) {
        return {
          success: false,
          error: "Failed to delete meal",
        };
      }

      return {
        success: true,
        data: true,
        message: "Meal deleted successfully",
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to delete meal",
      };
    }
  }

  public async getMealInsights(
    userId: string,
    days: number = 7
  ): Promise<
    ServiceResponse<{
      averageDailyCalories: number;
      averageDailyCarbs: number;
      averageDailyProtein: number;
      averageDailyFat: number;
      mealFrequency: {
        breakfast: number;
        lunch: number;
        dinner: number;
        snack: number;
      };
      highCarbMeals: number;
      lowCarbMeals: number;
      recommendations: string[];
    }>
  > {
    try {
      const [averageMacros, mealFrequency, highCarbMeals, lowCarbMeals] =
        await Promise.all([
          this.mealRepository.getAverageMacrosByDay(userId, days),
          this.mealRepository.getMealFrequency(userId, days),
          this.mealRepository
            .getHighCarbMeals(userId, 50)
            .then((meals) => meals.length),
          this.mealRepository
            .getLowCarbMeals(userId, 20)
            .then((meals) => meals.length),
        ]);

      const recommendations: string[] = [];

      if (averageMacros.calories < 1200) {
        recommendations.push(
          "Consider increasing your calorie intake to meet daily nutritional needs"
        );
      } else if (averageMacros.calories > 2500) {
        recommendations.push(
          "Consider reducing your calorie intake for better blood sugar management"
        );
      }

      if (averageMacros.carbohydrates > 200) {
        recommendations.push(
          "Consider reducing carbohydrate intake for better blood sugar control"
        );
      } else if (averageMacros.carbohydrates < 100) {
        recommendations.push(
          "Consider increasing healthy carbohydrate intake for balanced nutrition"
        );
      }

      if (averageMacros.protein < 50) {
        recommendations.push(
          "Consider increasing protein intake for better blood sugar stability"
        );
      }

      if (mealFrequency.breakfast < 5) {
        recommendations.push(
          "Consider eating breakfast more regularly for better blood sugar control"
        );
      }

      if (highCarbMeals > 10) {
        recommendations.push(
          "Consider reducing high-carb meals for better blood sugar management"
        );
      }

      return {
        success: true,
        data: {
          averageDailyCalories: averageMacros.calories,
          averageDailyCarbs: averageMacros.carbohydrates,
          averageDailyProtein: averageMacros.protein,
          averageDailyFat: averageMacros.fat,
          mealFrequency,
          highCarbMeals,
          lowCarbMeals,
          recommendations,
        },
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to get meal insights",
      };
    }
  }

  public async getMealSuggestions(
    userId: string,
    mealType: "breakfast" | "lunch" | "dinner" | "snack",
    maxCarbs: number = 50
  ): Promise<
    ServiceResponse<{
      suggestions: string[];
      carbTarget: number;
      proteinTarget: number;
    }>
  > {
    try {
      const suggestions: string[] = [];
      let carbTarget = 30;
      let proteinTarget = 15;

      switch (mealType) {
        case "breakfast":
          carbTarget = Math.min(maxCarbs, 30);
          proteinTarget = 15;
          suggestions.push(
            "Greek yogurt with berries and nuts",
            "Oatmeal with protein powder and fruit",
            "Eggs with whole grain toast",
            "Smoothie with protein powder and spinach"
          );
          break;
        case "lunch":
          carbTarget = Math.min(maxCarbs, 45);
          proteinTarget = 20;
          suggestions.push(
            "Grilled chicken salad with quinoa",
            "Turkey and vegetable wrap",
            "Salmon with roasted vegetables",
            "Lentil soup with whole grain bread"
          );
          break;
        case "dinner":
          carbTarget = Math.min(maxCarbs, 40);
          proteinTarget = 25;
          suggestions.push(
            "Baked fish with sweet potato",
            "Grilled chicken with roasted vegetables",
            "Turkey meatballs with zucchini noodles",
            "Stir-fried tofu with brown rice"
          );
          break;
        case "snack":
          carbTarget = Math.min(maxCarbs, 15);
          proteinTarget = 5;
          suggestions.push(
            "Apple slices with almond butter",
            "Greek yogurt with nuts",
            "Cheese and whole grain crackers",
            "Hard-boiled eggs"
          );
          break;
      }

      return {
        success: true,
        data: {
          suggestions,
          carbTarget,
          proteinTarget,
        },
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to get meal suggestions",
      };
    }
  }
}
