import React, { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Card } from "../ui/card";
import { Plus, Clock, Zap } from "lucide-react";
import { physicalActivityService } from "../../lib/api";

interface ActivityEntryProps {
  onActivityAdded: (activity: any) => void;
}

export function ActivityEntry({ onActivityAdded }: ActivityEntryProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    activityType: "cardio",
    duration: "",
    intensity: "moderate",
    caloriesBurned: "",
    distance: "",
    heartRate: "",
    timestamp: new Date().toISOString(),
    notes: "",
  });

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
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No authentication token found");
        return;
      }

      const activityData = {
        name: formData.name,
        description: formData.description || undefined,
        activityType: formData.activityType as any,
        duration: parseFloat(formData.duration) || 0,
        intensity: formData.intensity as any,
        caloriesBurned: formData.caloriesBurned
          ? parseFloat(formData.caloriesBurned)
          : undefined,
        distance: formData.distance ? parseFloat(formData.distance) : undefined,
        heartRate: formData.heartRate
          ? parseFloat(formData.heartRate)
          : undefined,
        timestamp: new Date(formData.timestamp),
        notes: formData.notes || undefined,
      };

      const response = await physicalActivityService.createActivity(
        activityData,
        token
      );

      if (response.success && response.data) {
        onActivityAdded(response.data);
        setFormData({
          name: "",
          description: "",
          activityType: "cardio",
          duration: "",
          intensity: "moderate",
          caloriesBurned: "",
          distance: "",
          heartRate: "",
          timestamp: new Date().toISOString(),
          notes: "",
        });
      } else {
        console.error("Error adding activity:", response.error);
      }
    } catch (error) {
      console.error("Error adding activity:", error);
    }
  };

  const calculateCalories = () => {
    // Simple calorie calculation based on activity type and duration
    // This is a basic estimation - in a real app, you'd use more sophisticated formulas
    const duration = parseFloat(formData.duration) || 0;
    const intensity = formData.intensity;

    let caloriesPerMinute = 0;
    switch (formData.activityType) {
      case "cardio":
        caloriesPerMinute =
          intensity === "low" ? 5 : intensity === "moderate" ? 8 : 12;
        break;
      case "strength":
        caloriesPerMinute =
          intensity === "low" ? 3 : intensity === "moderate" ? 5 : 8;
        break;
      case "flexibility":
        caloriesPerMinute =
          intensity === "low" ? 2 : intensity === "moderate" ? 3 : 4;
        break;
      case "sports":
        caloriesPerMinute =
          intensity === "low" ? 6 : intensity === "moderate" ? 10 : 15;
        break;
      default:
        caloriesPerMinute = 5;
    }

    const estimatedCalories = Math.round(duration * caloriesPerMinute);
    setFormData((prev) => ({
      ...prev,
      caloriesBurned: estimatedCalories.toString(),
    }));
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Add Physical Activity</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Activity Name
            </label>
            <Input
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="e.g., Morning Jog"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Activity Type
            </label>
            <select
              name="activityType"
              value={formData.activityType}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="cardio">Cardio</option>
              <option value="strength">Strength Training</option>
              <option value="flexibility">Flexibility</option>
              <option value="sports">Sports</option>
              <option value="walking">Walking</option>
              <option value="cycling">Cycling</option>
              <option value="swimming">Swimming</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <Textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Describe your activity..."
            rows={3}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Duration (minutes)
            </label>
            <Input
              name="duration"
              type="number"
              value={formData.duration}
              onChange={handleInputChange}
              placeholder="30"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Intensity</label>
            <select
              name="intensity"
              value={formData.intensity}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="low">Low</option>
              <option value="moderate">Moderate</option>
              <option value="high">High</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Distance (miles)
            </label>
            <Input
              name="distance"
              type="number"
              value={formData.distance}
              onChange={handleInputChange}
              placeholder="0"
              step="0.1"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Calories Burned
            </label>
            <div className="flex gap-2">
              <Input
                name="caloriesBurned"
                type="number"
                value={formData.caloriesBurned}
                onChange={handleInputChange}
                placeholder="0"
              />
              <Button
                type="button"
                variant="outline"
                onClick={calculateCalories}
                disabled={!formData.duration || !formData.activityType}
              >
                <Zap className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Heart Rate (bpm)
            </label>
            <Input
              name="heartRate"
              type="number"
              value={formData.heartRate}
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
            placeholder="How did you feel during this activity?"
            rows={2}
          />
        </div>

        <Button type="submit" className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Add Activity
        </Button>
      </form>
    </Card>
  );
}
