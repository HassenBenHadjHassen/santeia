import React, { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Card } from "../ui/card";
import { Plus, Camera, Mic, Search } from "lucide-react";
import { mealService } from "../../lib/api";
import { authService } from "../../lib/auth";

interface MealEntryProps {
  onMealAdded: (meal: any) => void;
}

export function MealEntry({ onMealAdded }: MealEntryProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    calories: "",
    carbohydrates: "",
    proteins: "",
    fats: "",
    fiber: "",
    sugar: "",
    sodium: "",
    mealType: "breakfast",
    timestamp: new Date().toISOString(),
    notes: "",
  });

  const [isRecording, setIsRecording] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const token = authService.getToken();
      if (!token) {
        console.error("No authentication token found");
        return;
      }

      const mealData = {
        name: formData.name,
        description: formData.description || undefined,
        calories: formData.calories ? parseFloat(formData.calories) : undefined,
        carbohydrates: formData.carbohydrates
          ? parseFloat(formData.carbohydrates)
          : undefined,
        proteins: formData.proteins ? parseFloat(formData.proteins) : undefined,
        fats: formData.fats ? parseFloat(formData.fats) : undefined,
        fiber: formData.fiber ? parseFloat(formData.fiber) : undefined,
        sugar: formData.sugar ? parseFloat(formData.sugar) : undefined,
        sodium: formData.sodium ? parseFloat(formData.sodium) : undefined,
        mealType: formData.mealType as any,
        timestamp: new Date(formData.timestamp),
        notes: formData.notes || undefined,
      };

      const response = await mealService.createMeal(mealData, token);

      if (response.success && response.data) {
        onMealAdded(response.data);
        setFormData({
          name: "",
          description: "",
          calories: "",
          carbohydrates: "",
          proteins: "",
          fats: "",
          fiber: "",
          sugar: "",
          sodium: "",
          mealType: "breakfast",
          timestamp: new Date().toISOString(),
          notes: "",
        });
      } else {
        console.error("Error adding meal:", response.error);
      }
    } catch (error) {
      console.error("Error adding meal:", error);
    }
  };

  const startVoiceRecording = () => {
    if (isRecording) return;

    const recognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!recognition) {
      alert("Speech recognition not supported");
      return;
    }

    const speechRecognition = new recognition();
    speechRecognition.continuous = false;
    speechRecognition.interimResults = false;
    speechRecognition.lang = "en-US";

    speechRecognition.onstart = () => {
      setIsRecording(true);
    };

    speechRecognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setFormData((prev) => ({
        ...prev,
        description: prev.description + " " + transcript,
      }));
    };

    speechRecognition.onend = () => {
      setIsRecording(false);
    };

    speechRecognition.start();
  };

  const searchFoodDatabase = async () => {
    if (!formData.name.trim()) return;

    setIsSearching(true);
    try {
      // This would integrate with a food database API like USDA or Edamam
      // For now, we'll simulate a search
      console.log("Searching for:", formData.name);
      // In a real implementation, you'd call an API here
    } catch (error) {
      console.error("Error searching food database:", error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Add Meal Entry</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Meal Name</label>
            <div className="flex gap-2">
              <Input
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., Grilled Chicken Breast"
                required
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={searchFoodDatabase}
                disabled={isSearching}
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Meal Type</label>
            <select
              name="mealType"
              value={formData.mealType}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="breakfast">Breakfast</option>
              <option value="lunch">Lunch</option>
              <option value="dinner">Dinner</option>
              <option value="snack">Snack</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <div className="flex gap-2">
            <Textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe what you ate..."
              rows={3}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={startVoiceRecording}
              disabled={isRecording}
            >
              <Mic className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Calories</label>
            <Input
              name="calories"
              type="number"
              value={formData.calories}
              onChange={handleInputChange}
              placeholder="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Carbs (g)</label>
            <Input
              name="carbohydrates"
              type="number"
              value={formData.carbohydrates}
              onChange={handleInputChange}
              placeholder="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Protein (g)
            </label>
            <Input
              name="proteins"
              type="number"
              value={formData.proteins}
              onChange={handleInputChange}
              placeholder="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Fat (g)</label>
            <Input
              name="fats"
              type="number"
              value={formData.fats}
              onChange={handleInputChange}
              placeholder="0"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Fiber (g)</label>
            <Input
              name="fiber"
              type="number"
              value={formData.fiber}
              onChange={handleInputChange}
              placeholder="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Sugar (g)</label>
            <Input
              name="sugar"
              type="number"
              value={formData.sugar}
              onChange={handleInputChange}
              placeholder="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Sodium (mg)
            </label>
            <Input
              name="sodium"
              type="number"
              value={formData.sodium}
              onChange={handleInputChange}
              placeholder="0"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Notes</label>
          <Textarea
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            placeholder="Any additional notes about this meal..."
            rows={2}
          />
        </div>

        <div className="flex gap-2">
          <Button type="submit" className="flex-1">
            <Plus className="h-4 w-4 mr-2" />
            Add Meal
          </Button>
        </div>
      </form>
    </Card>
  );
}
