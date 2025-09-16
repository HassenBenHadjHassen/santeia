import React, { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Card } from "../ui/card";
import { Plus, Clock, AlertCircle } from "lucide-react";
import { medicationService } from "../../lib/api";

interface MedicationEntryProps {
  onMedicationAdded: (medication: any) => void;
}

export function MedicationEntry({ onMedicationAdded }: MedicationEntryProps) {
  const [formData, setFormData] = useState({
    name: "",
    type: "oral",
    dosage: "",
    unit: "mg",
    frequency: "daily",
    timesPerDay: "1",
    specificTimes: [] as string[],
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
    instructions: "",
    sideEffects: "",
    notes: "",
  });

  const [reminderSettings, setReminderSettings] = useState({
    enabled: false,
    times: [] as string[],
    beforeMeal: false,
    afterMeal: false,
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

  const handleReminderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setReminderSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const addTimeSlot = () => {
    setFormData((prev) => ({
      ...prev,
      specificTimes: [...prev.specificTimes, "09:00"],
    }));
  };

  const updateTimeSlot = (index: number, time: string) => {
    setFormData((prev) => ({
      ...prev,
      specificTimes: prev.specificTimes.map((t, i) => (i === index ? time : t)),
    }));
  };

  const removeTimeSlot = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      specificTimes: prev.specificTimes.filter((_, i) => i !== index),
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

      const medicationData = {
        name: formData.name,
        type: formData.type as any,
        dosage: formData.dosage,
        unit: formData.unit as any,
        frequency: formData.frequency as any,
        timesPerDay: formData.timesPerDay
          ? parseInt(formData.timesPerDay)
          : undefined,
        specificTimes:
          formData.specificTimes.length > 0
            ? formData.specificTimes
            : undefined,
        startDate: new Date(formData.startDate),
        endDate: formData.endDate ? new Date(formData.endDate) : undefined,
        instructions: formData.instructions || undefined,
        sideEffects: formData.sideEffects || undefined,
        notes: formData.notes || undefined,
      };

      const response = await medicationService.createMedication(
        medicationData,
        token
      );

      if (response.success && response.data) {
        onMedicationAdded(response.data);
        setFormData({
          name: "",
          type: "oral",
          dosage: "",
          unit: "mg",
          frequency: "daily",
          timesPerDay: "1",
          specificTimes: [],
          startDate: new Date().toISOString().split("T")[0],
          endDate: "",
          instructions: "",
          sideEffects: "",
          notes: "",
        });
        setReminderSettings({
          enabled: false,
          times: [],
          beforeMeal: false,
          afterMeal: false,
        });
      } else {
        console.error("Error adding medication:", response.error);
      }
    } catch (error) {
      console.error("Error adding medication:", error);
    }
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Add Medication</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Medication Name
            </label>
            <Input
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="e.g., Metformin"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Type</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="oral">Oral</option>
              <option value="injection">Injection</option>
              <option value="inhaler">Inhaler</option>
              <option value="topical">Topical</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Dosage</label>
            <Input
              name="dosage"
              value={formData.dosage}
              onChange={handleInputChange}
              placeholder="500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Unit</label>
            <select
              name="unit"
              value={formData.unit}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="mg">mg</option>
              <option value="g">g</option>
              <option value="ml">ml</option>
              <option value="units">units</option>
              <option value="pills">pills</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Frequency</label>
            <select
              name="frequency"
              value={formData.frequency}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="as_needed">As Needed</option>
            </select>
          </div>
        </div>

        {formData.frequency === "daily" && (
          <div>
            <label className="block text-sm font-medium mb-1">
              Times per Day
            </label>
            <div className="flex items-center gap-2">
              <Input
                name="timesPerDay"
                type="number"
                value={formData.timesPerDay}
                onChange={handleInputChange}
                min="1"
                max="6"
                className="w-20"
              />
              <span className="text-sm text-gray-600">times</span>
            </div>
          </div>
        )}

        {formData.frequency === "daily" &&
          parseInt(formData.timesPerDay) > 0 && (
            <div>
              <label className="block text-sm font-medium mb-1">
                Specific Times
              </label>
              <div className="space-y-2">
                {Array.from(
                  { length: parseInt(formData.timesPerDay) },
                  (_, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Input
                        type="time"
                        value={formData.specificTimes[i] || "09:00"}
                        onChange={(e) => updateTimeSlot(i, e.target.value)}
                        className="w-32"
                      />
                      <span className="text-sm text-gray-600">
                        {i === 0
                          ? "Morning"
                          : i === 1
                          ? "Afternoon"
                          : i === 2
                          ? "Evening"
                          : `Time ${i + 1}`}
                      </span>
                    </div>
                  )
                )}
              </div>
            </div>
          )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Start Date</label>
            <Input
              name="startDate"
              type="date"
              value={formData.startDate}
              onChange={handleInputChange}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              End Date (Optional)
            </label>
            <Input
              name="endDate"
              type="date"
              value={formData.endDate}
              onChange={handleInputChange}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Instructions</label>
          <Textarea
            name="instructions"
            value={formData.instructions}
            onChange={handleInputChange}
            placeholder="Take with food, avoid alcohol, etc."
            rows={3}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Side Effects</label>
          <Textarea
            name="sideEffects"
            value={formData.sideEffects}
            onChange={handleInputChange}
            placeholder="Nausea, dizziness, etc."
            rows={2}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Notes</label>
          <Textarea
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            placeholder="Additional notes about this medication..."
            rows={2}
          />
        </div>

        {/* Reminder Settings */}
        <Card className="p-4 bg-blue-50">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="h-4 w-4 text-blue-600" />
            <h4 className="font-medium text-blue-900">Reminder Settings</h4>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="enabled"
                checked={reminderSettings.enabled}
                onChange={handleReminderChange}
                className="rounded"
              />
              <label className="text-sm">
                Enable reminders for this medication
              </label>
            </div>

            {reminderSettings.enabled && (
              <div className="space-y-2">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="beforeMeal"
                      checked={reminderSettings.beforeMeal}
                      onChange={handleReminderChange}
                      className="rounded"
                    />
                    <label className="text-sm">Before meals</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="afterMeal"
                      checked={reminderSettings.afterMeal}
                      onChange={handleReminderChange}
                      className="rounded"
                    />
                    <label className="text-sm">After meals</label>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>

        <Button type="submit" className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Add Medication
        </Button>
      </form>
    </Card>
  );
}
