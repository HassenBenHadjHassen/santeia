import React, { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Card } from "../ui/card";
import { Plus, Heart, Weight, Activity } from "lucide-react";
import { healthMetricService } from "../../lib/api";

interface HealthMetricsEntryProps {
  onMetricAdded: (metric: any) => void;
}

export function HealthMetricsEntry({ onMetricAdded }: HealthMetricsEntryProps) {
  const [formData, setFormData] = useState({
    type: "weight",
    value: "",
    unit: "kg",
    timestamp: new Date().toISOString(),
    notes: "",
  });

  const [bloodPressure, setBloodPressure] = useState({
    systolic: "",
    diastolic: "",
    pulse: "",
  });

  const [cholesterol, setCholesterol] = useState({
    total: "",
    hdl: "",
    ldl: "",
    triglycerides: "",
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

  const handleBloodPressureChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setBloodPressure((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCholesterolChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCholesterol((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      let metricsToSubmit = [];

      if (formData.type === "blood_pressure") {
        if (bloodPressure.systolic && bloodPressure.diastolic) {
          metricsToSubmit.push({
            type: "blood_pressure",
            value: `${bloodPressure.systolic}/${bloodPressure.diastolic}`,
            unit: "mmHg",
            timestamp: formData.timestamp,
            notes: formData.notes,
            additionalData: {
              systolic: parseInt(bloodPressure.systolic),
              diastolic: parseInt(bloodPressure.diastolic),
              pulse: bloodPressure.pulse
                ? parseInt(bloodPressure.pulse)
                : undefined,
            },
          });
        }
      } else if (formData.type === "cholesterol") {
        if (cholesterol.total) {
          metricsToSubmit.push({
            type: "cholesterol",
            value: cholesterol.total,
            unit: "mg/dL",
            timestamp: formData.timestamp,
            notes: formData.notes,
            additionalData: {
              total: parseInt(cholesterol.total),
              hdl: cholesterol.hdl ? parseInt(cholesterol.hdl) : undefined,
              ldl: cholesterol.ldl ? parseInt(cholesterol.ldl) : undefined,
              triglycerides: cholesterol.triglycerides
                ? parseInt(cholesterol.triglycerides)
                : undefined,
            },
          });
        }
      } else {
        if (formData.value) {
          metricsToSubmit.push({
            type: formData.type,
            value: formData.value,
            unit: formData.unit,
            timestamp: formData.timestamp,
            notes: formData.notes,
          });
        }
      }

      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No authentication token found");
        return;
      }

      for (const metric of metricsToSubmit) {
        const metricData = {
          type: metric.type as any,
          value: metric.value,
          unit: metric.unit,
          timestamp: new Date(metric.timestamp),
          notes: metric.notes || undefined,
        };

        const response = await healthMetricService.createMetric(
          metricData,
          token
        );

        if (response.success && response.data) {
          onMetricAdded(response.data);
        } else {
          console.error("Error adding health metric:", response.error);
        }
      }

      // Reset form
      setFormData({
        type: "weight",
        value: "",
        unit: "kg",
        timestamp: new Date().toISOString(),
        notes: "",
      });
      setBloodPressure({ systolic: "", diastolic: "", pulse: "" });
      setCholesterol({ total: "", hdl: "", ldl: "", triglycerides: "" });
    } catch (error) {
      console.error("Error adding health metric:", error);
    }
  };

  const getUnitOptions = () => {
    switch (formData.type) {
      case "weight":
        return [
          { value: "kg", label: "kg" },
          { value: "lbs", label: "lbs" },
        ];
      case "height":
        return [
          { value: "cm", label: "cm" },
          { value: "ft", label: "ft" },
        ];
      case "bmi":
        return [{ value: "kg/m²", label: "kg/m²" }];
      case "temperature":
        return [
          { value: "°C", label: "°C" },
          { value: "°F", label: "°F" },
        ];
      case "heart_rate":
        return [{ value: "bpm", label: "bpm" }];
      case "blood_pressure":
        return [{ value: "mmHg", label: "mmHg" }];
      case "cholesterol":
        return [{ value: "mg/dL", label: "mg/dL" }];
      default:
        return [{ value: "", label: "Unit" }];
    }
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Add Health Metric</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Metric Type
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="weight">Weight</option>
              <option value="height">Height</option>
              <option value="bmi">BMI</option>
              <option value="temperature">Temperature</option>
              <option value="heart_rate">Heart Rate</option>
              <option value="blood_pressure">Blood Pressure</option>
              <option value="cholesterol">Cholesterol</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Date & Time
            </label>
            <Input
              name="timestamp"
              type="datetime-local"
              value={formData.timestamp.slice(0, 16)}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  timestamp: new Date(e.target.value).toISOString(),
                }))
              }
              required
            />
          </div>
        </div>

        {formData.type === "blood_pressure" ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Systolic (mmHg)
                </label>
                <Input
                  name="systolic"
                  type="number"
                  value={bloodPressure.systolic}
                  onChange={handleBloodPressureChange}
                  placeholder="120"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Diastolic (mmHg)
                </label>
                <Input
                  name="diastolic"
                  type="number"
                  value={bloodPressure.diastolic}
                  onChange={handleBloodPressureChange}
                  placeholder="80"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Pulse (bpm)
                </label>
                <Input
                  name="pulse"
                  type="number"
                  value={bloodPressure.pulse}
                  onChange={handleBloodPressureChange}
                  placeholder="72"
                />
              </div>
            </div>
          </div>
        ) : formData.type === "cholesterol" ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Total (mg/dL)
                </label>
                <Input
                  name="total"
                  type="number"
                  value={cholesterol.total}
                  onChange={handleCholesterolChange}
                  placeholder="200"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  HDL (mg/dL)
                </label>
                <Input
                  name="hdl"
                  type="number"
                  value={cholesterol.hdl}
                  onChange={handleCholesterolChange}
                  placeholder="60"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  LDL (mg/dL)
                </label>
                <Input
                  name="ldl"
                  type="number"
                  value={cholesterol.ldl}
                  onChange={handleCholesterolChange}
                  placeholder="100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Triglycerides (mg/dL)
                </label>
                <Input
                  name="triglycerides"
                  type="number"
                  value={cholesterol.triglycerides}
                  onChange={handleCholesterolChange}
                  placeholder="150"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Value</label>
              <Input
                name="value"
                type="number"
                value={formData.value}
                onChange={handleInputChange}
                placeholder="Enter value"
                required
                step={formData.type === "weight" ? "0.1" : "0.01"}
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
                {getUnitOptions().map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-1">Notes</label>
          <Textarea
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            placeholder="Any additional notes about this measurement..."
            rows={2}
          />
        </div>

        <Button type="submit" className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Add Metric
        </Button>
      </form>
    </Card>
  );
}
