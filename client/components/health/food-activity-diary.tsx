import React, { useState, useEffect } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { MealEntry } from "./meal-entry";
import { ActivityEntry } from "./activity-entry";
import { Calendar, Utensils, Activity, TrendingUp } from "lucide-react";
import { mealService, physicalActivityService } from "../../lib/api";
import { authService } from "../../lib/auth";

interface Meal {
  id: string;
  name: string;
  description?: string;
  calories?: number;
  carbohydrates?: number;
  proteins?: number;
  fats?: number;
  mealType: string;
  timestamp: string;
  notes?: string;
}

interface PhysicalActivity {
  id: string;
  name: string;
  description?: string;
  activityType: string;
  duration: number;
  intensity: string;
  caloriesBurned?: number;
  distance?: number;
  heartRate?: number;
  timestamp: string;
  notes?: string;
}

export function FoodActivityDiary() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [activities, setActivities] = useState<PhysicalActivity[]>([]);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadDiaryData();
  }, [selectedDate]);

  const loadDiaryData = async () => {
    setLoading(true);
    try {
      const token = authService.getToken();
      if (!token) {
        console.error("No authentication token found");
        return;
      }

      const selectedDateObj = new Date(selectedDate);
      const startOfDay = new Date(selectedDateObj);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(selectedDateObj);
      endOfDay.setHours(23, 59, 59, 999);

      // Load meals for selected date
      const mealsResponse = await mealService.getMeals(
        { startDate: startOfDay, endDate: endOfDay },
        { page: 1, limit: 100 },
        token
      );

      if (mealsResponse.success) {
        // Convert Date objects to strings for local state
        const mealsData = (mealsResponse.data || []).map((meal) => ({
          ...meal,
          timestamp:
            meal.timestamp instanceof Date
              ? meal.timestamp.toISOString()
              : meal.timestamp,
          createdAt:
            meal.createdAt instanceof Date
              ? meal.createdAt.toISOString()
              : meal.createdAt,
          updatedAt:
            meal.updatedAt instanceof Date
              ? meal.updatedAt.toISOString()
              : meal.updatedAt,
        }));
        setMeals(mealsData);
      } else {
        console.error("Error loading meals:", mealsResponse.error);
      }

      // Load activities for selected date
      const activitiesResponse = await physicalActivityService.getActivities(
        { startDate: startOfDay, endDate: endOfDay },
        { page: 1, limit: 100 },
        token
      );

      if (activitiesResponse.success) {
        // Convert Date objects to strings for local state
        const activitiesData = (activitiesResponse.data || []).map(
          (activity) => ({
            ...activity,
            timestamp:
              activity.timestamp instanceof Date
                ? activity.timestamp.toISOString()
                : activity.timestamp,
            createdAt:
              activity.createdAt instanceof Date
                ? activity.createdAt.toISOString()
                : activity.createdAt,
            updatedAt:
              activity.updatedAt instanceof Date
                ? activity.updatedAt.toISOString()
                : activity.updatedAt,
          })
        );
        setActivities(activitiesData);
      } else {
        console.error("Error loading activities:", activitiesResponse.error);
      }
    } catch (error) {
      console.error("Error loading diary data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMealAdded = (newMeal: Meal) => {
    setMeals((prev) => [newMeal, ...prev]);
  };

  const handleActivityAdded = (newActivity: PhysicalActivity) => {
    setActivities((prev) => [newActivity, ...prev]);
  };

  const calculateDailyTotals = () => {
    const totalCalories = meals.reduce(
      (sum, meal) => sum + (meal.calories || 0),
      0
    );
    const totalCarbs = meals.reduce(
      (sum, meal) => sum + (meal.carbohydrates || 0),
      0
    );
    const totalProteins = meals.reduce(
      (sum, meal) => sum + (meal.proteins || 0),
      0
    );
    const totalFats = meals.reduce((sum, meal) => sum + (meal.fats || 0), 0);
    const caloriesBurned = activities.reduce(
      (sum, activity) => sum + (activity.caloriesBurned || 0),
      0
    );
    const totalDuration = activities.reduce(
      (sum, activity) => sum + (activity.duration || 0),
      0
    );

    return {
      totalCalories,
      totalCarbs,
      totalProteins,
      totalFats,
      caloriesBurned,
      totalDuration,
      netCalories: totalCalories - caloriesBurned,
    };
  };

  const totals = calculateDailyTotals();

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const groupMealsByType = (meals: Meal[]) => {
    const grouped: { [key: string]: Meal[] } = {};
    meals.forEach((meal) => {
      if (!grouped[meal.mealType]) {
        grouped[meal.mealType] = [];
      }
      grouped[meal.mealType].push(meal);
    });
    return grouped;
  };

  const groupedMeals = groupMealsByType(meals);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Food & Activity Diary</h2>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="p-2 border border-gray-300 rounded-md"
          />
        </div>
      </div>

      {/* Daily Summary */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Daily Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {totals.totalCalories}
            </div>
            <div className="text-sm text-gray-600">Calories Consumed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {totals.caloriesBurned}
            </div>
            <div className="text-sm text-gray-600">Calories Burned</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {totals.netCalories}
            </div>
            <div className="text-sm text-gray-600">Net Calories</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {Math.round(totals.totalDuration)}
            </div>
            <div className="text-sm text-gray-600">Minutes Active</div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-lg font-semibold">{totals.totalCarbs}g</div>
            <div className="text-sm text-gray-600">Carbs</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold">{totals.totalProteins}g</div>
            <div className="text-sm text-gray-600">Protein</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold">{totals.totalFats}g</div>
            <div className="text-sm text-gray-600">Fat</div>
          </div>
        </div>
      </Card>

      <Tabs defaultValue="meals" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="meals" className="flex items-center gap-2">
            <Utensils className="h-4 w-4" />
            Meals
          </TabsTrigger>
          <TabsTrigger value="activities" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Activities
          </TabsTrigger>
        </TabsList>

        <TabsContent value="meals" className="space-y-4">
          <MealEntry onMealAdded={handleMealAdded} />

          {loading ? (
            <div className="text-center py-4">Loading meals...</div>
          ) : meals.length === 0 ? (
            <Card className="p-6 text-center text-gray-500">
              No meals recorded for this date
            </Card>
          ) : (
            <div className="space-y-4">
              {Object.entries(groupedMeals).map(([mealType, typeMeals]) => (
                <Card key={mealType} className="p-4">
                  <h4 className="font-semibold capitalize mb-2">{mealType}</h4>
                  <div className="space-y-2">
                    {typeMeals.map((meal) => (
                      <div
                        key={meal.id}
                        className="flex justify-between items-center p-2 bg-gray-50 rounded"
                      >
                        <div>
                          <div className="font-medium">{meal.name}</div>
                          <div className="text-sm text-gray-600">
                            {formatTime(meal.timestamp)}
                          </div>
                          {meal.description && (
                            <div className="text-sm text-gray-500">
                              {meal.description}
                            </div>
                          )}
                        </div>
                        <div className="text-right text-sm">
                          <div className="font-medium">{meal.calories} cal</div>
                          <div className="text-gray-600">
                            {meal.carbohydrates}g carbs, {meal.proteins}g
                            protein
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="activities" className="space-y-4">
          <ActivityEntry onActivityAdded={handleActivityAdded} />

          {loading ? (
            <div className="text-center py-4">Loading activities...</div>
          ) : activities.length === 0 ? (
            <Card className="p-6 text-center text-gray-500">
              No activities recorded for this date
            </Card>
          ) : (
            <div className="space-y-4">
              {activities.map((activity) => (
                <Card key={activity.id} className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-semibold">{activity.name}</div>
                      <div className="text-sm text-gray-600">
                        {formatTime(activity.timestamp)}
                      </div>
                      <div className="text-sm text-gray-500 capitalize">
                        {activity.activityType} • {activity.intensity} intensity
                      </div>
                      {activity.description && (
                        <div className="text-sm text-gray-500 mt-1">
                          {activity.description}
                        </div>
                      )}
                    </div>
                    <div className="text-right text-sm">
                      <div className="font-medium">{activity.duration} min</div>
                      <div className="text-gray-600">
                        {activity.caloriesBurned} cal
                      </div>
                      {activity.distance && (
                        <div className="text-gray-600">
                          {activity.distance} mi
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
