import React, { useState, useEffect } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { HealthMetricsEntry } from "./health-metrics-entry";
import { healthMetricService } from "../../lib/api";
import {
  Heart,
  Weight,
  Activity,
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  Target,
} from "lucide-react";

interface HealthMetric {
  id: string;
  type: string;
  value: string;
  unit: string;
  timestamp: Date;
  notes?: string;
  additionalData?: any;
}

interface HealthDashboardProps {
  onMetricAdded: (metric: HealthMetric) => void;
}

export function HealthDashboard({ onMetricAdded }: HealthDashboardProps) {
  const [metrics, setMetrics] = useState<HealthMetric[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("7d");

  useEffect(() => {
    loadMetrics();
  }, [selectedPeriod]);

  const loadMetrics = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No authentication token found");
        return;
      }

      // Calculate date range based on selected period
      const endDate = new Date();
      const startDate = new Date();

      switch (selectedPeriod) {
        case "7d":
          startDate.setDate(endDate.getDate() - 7);
          break;
        case "30d":
          startDate.setDate(endDate.getDate() - 30);
          break;
        case "90d":
          startDate.setDate(endDate.getDate() - 90);
          break;
        case "1y":
          startDate.setFullYear(endDate.getFullYear() - 1);
          break;
        default:
          startDate.setDate(endDate.getDate() - 7);
      }

      const response = await healthMetricService.getMetrics(
        {
          startDate,
          endDate,
        },
        {},
        token
      );

      if (response.success && response.data) {
        setMetrics(response.data);
      } else {
        console.error("Error loading health metrics:", response.error);
      }
    } catch (error) {
      console.error("Error loading health metrics:", error);
    } finally {
      setLoading(false);
    }
  };

  const getLatestMetric = (type: string) => {
    const typeMetrics = metrics.filter((m) => m.type === type);
    return typeMetrics.length > 0 ? typeMetrics[0] : null;
  };

  const getTrend = (type: string) => {
    const typeMetrics = metrics.filter((m) => m.type === type).slice(0, 2);
    if (typeMetrics.length < 2) return "stable";

    const current = parseFloat(typeMetrics[0].value);
    const previous = parseFloat(typeMetrics[1].value);

    if (current > previous) return "up";
    if (current < previous) return "down";
    return "stable";
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-red-500" />;
      case "down":
        return <TrendingDown className="h-4 w-4 text-green-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "up":
        return "text-red-500";
      case "down":
        return "text-green-500";
      default:
        return "text-gray-500";
    }
  };

  const formatDate = (timestamp: Date) => {
    return timestamp.toLocaleDateString();
  };

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { category: "Underweight", color: "text-blue-600" };
    if (bmi < 25) return { category: "Normal", color: "text-green-600" };
    if (bmi < 30) return { category: "Overweight", color: "text-yellow-600" };
    return { category: "Obese", color: "text-red-600" };
  };

  const getBloodPressureCategory = (systolic: number, diastolic: number) => {
    if (systolic < 120 && diastolic < 80)
      return { category: "Normal", color: "text-green-600" };
    if (systolic < 130 && diastolic < 80)
      return { category: "Elevated", color: "text-yellow-600" };
    if (systolic < 140 || diastolic < 90)
      return { category: "High Stage 1", color: "text-orange-600" };
    return { category: "High Stage 2", color: "text-red-600" };
  };

  const latestWeight = getLatestMetric("weight");
  const latestHeight = getLatestMetric("height");
  const latestBloodPressure = getLatestMetric("blood_pressure");
  const latestCholesterol = getLatestMetric("cholesterol");
  const latestHeartRate = getLatestMetric("heart_rate");

  // Calculate BMI if we have both weight and height
  let bmi = null;
  if (latestWeight && latestHeight) {
    const weightKg =
      latestWeight.unit === "lbs"
        ? parseFloat(latestWeight.value) * 0.453592
        : parseFloat(latestWeight.value);
    const heightM =
      latestHeight.unit === "ft"
        ? parseFloat(latestHeight.value) * 0.3048
        : parseFloat(latestHeight.value) / 100;
    bmi = weightKg / (heightM * heightM);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Health Dashboard</h2>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="p-2 border border-gray-300 rounded-md"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Weight className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold">Weight</h3>
          </div>
          {latestWeight ? (
            <div>
              <div className="text-2xl font-bold">
                {latestWeight.value} {latestWeight.unit}
              </div>
              <div className="text-sm text-gray-600">
                {formatDate(latestWeight.timestamp)}
              </div>
              <div className="flex items-center gap-1 mt-1">
                {getTrendIcon(getTrend("weight"))}
                <span
                  className={`text-sm ${getTrendColor(getTrend("weight"))}`}
                >
                  {getTrend("weight") === "up"
                    ? "Increased"
                    : getTrend("weight") === "down"
                    ? "Decreased"
                    : "Stable"}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-gray-500">No data</div>
          )}
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Heart className="h-5 w-5 text-red-600" />
            <h3 className="font-semibold">Blood Pressure</h3>
          </div>
          {latestBloodPressure ? (
            <div>
              <div className="text-2xl font-bold">
                {latestBloodPressure.value} mmHg
              </div>
              <div className="text-sm text-gray-600">
                {formatDate(latestBloodPressure.timestamp)}
              </div>
              {latestBloodPressure.additionalData && (
                <div className="text-sm text-gray-500">
                  {
                    getBloodPressureCategory(
                      latestBloodPressure.additionalData.systolic,
                      latestBloodPressure.additionalData.diastolic
                    ).category
                  }
                </div>
              )}
            </div>
          ) : (
            <div className="text-gray-500">No data</div>
          )}
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="h-5 w-5 text-green-600" />
            <h3 className="font-semibold">Heart Rate</h3>
          </div>
          {latestHeartRate ? (
            <div>
              <div className="text-2xl font-bold">
                {latestHeartRate.value} bpm
              </div>
              <div className="text-sm text-gray-600">
                {formatDate(latestHeartRate.timestamp)}
              </div>
              <div className="flex items-center gap-1 mt-1">
                {getTrendIcon(getTrend("heart_rate"))}
                <span
                  className={`text-sm ${getTrendColor(getTrend("heart_rate"))}`}
                >
                  {getTrend("heart_rate") === "up"
                    ? "Increased"
                    : getTrend("heart_rate") === "down"
                    ? "Decreased"
                    : "Stable"}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-gray-500">No data</div>
          )}
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Target className="h-5 w-5 text-purple-600" />
            <h3 className="font-semibold">BMI</h3>
          </div>
          {bmi ? (
            <div>
              <div className="text-2xl font-bold">{bmi.toFixed(1)}</div>
              <div className={`text-sm ${getBMICategory(bmi).color}`}>
                {getBMICategory(bmi).category}
              </div>
            </div>
          ) : (
            <div className="text-gray-500">Need weight & height</div>
          )}
        </Card>
      </div>

      {/* Cholesterol Overview */}
      {latestCholesterol && (
        <Card className="p-4">
          <h3 className="font-semibold mb-3">Cholesterol Levels</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-lg font-bold">
                {latestCholesterol.value} mg/dL
              </div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
            {latestCholesterol.additionalData?.hdl && (
              <div className="text-center">
                <div className="text-lg font-bold">
                  {latestCholesterol.additionalData.hdl} mg/dL
                </div>
                <div className="text-sm text-gray-600">HDL</div>
              </div>
            )}
            {latestCholesterol.additionalData?.ldl && (
              <div className="text-center">
                <div className="text-lg font-bold">
                  {latestCholesterol.additionalData.ldl} mg/dL
                </div>
                <div className="text-sm text-gray-600">LDL</div>
              </div>
            )}
            {latestCholesterol.additionalData?.triglycerides && (
              <div className="text-center">
                <div className="text-lg font-bold">
                  {latestCholesterol.additionalData.triglycerides} mg/dL
                </div>
                <div className="text-sm text-gray-600">Triglycerides</div>
              </div>
            )}
          </div>
          <div className="text-sm text-gray-500 mt-2">
            {formatDate(latestCholesterol.timestamp)}
          </div>
        </Card>
      )}

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="add">Add Metric</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          {loading ? (
            <div className="text-center py-4">Loading metrics...</div>
          ) : metrics.length === 0 ? (
            <Card className="p-6 text-center text-gray-500">
              No health metrics recorded yet
            </Card>
          ) : (
            <div className="space-y-4">
              {Object.entries(
                metrics.reduce((acc, metric) => {
                  if (!acc[metric.type]) acc[metric.type] = [];
                  acc[metric.type].push(metric);
                  return acc;
                }, {} as Record<string, HealthMetric[]>)
              ).map(([type, typeMetrics]) => (
                <Card key={type} className="p-4">
                  <h4 className="font-semibold capitalize mb-3">
                    {type.replace("_", " ")}
                  </h4>
                  <div className="space-y-2">
                    {typeMetrics.slice(0, 5).map((metric) => (
                      <div
                        key={metric.id}
                        className="flex justify-between items-center p-2 bg-gray-50 rounded"
                      >
                        <div>
                          <div className="font-medium">
                            {metric.value} {metric.unit}
                          </div>
                          <div className="text-sm text-gray-600">
                            {formatDate(metric.timestamp)}
                          </div>
                        </div>
                        {metric.notes && (
                          <div className="text-sm text-gray-500 max-w-xs truncate">
                            {metric.notes}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="add">
          <HealthMetricsEntry onMetricAdded={onMetricAdded} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
