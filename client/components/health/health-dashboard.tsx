import React, { useState, useEffect } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  Weight,
  Heart,
  Activity,
  Target,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";
import {
  HealthMetricService,
  type HealthMetric,
} from "../../lib/api/services/healthMetricService";
import {
  BloodSugarService,
  type BloodSugarReading,
} from "../../lib/api/services/bloodSugarService";
import { UserService } from "../../lib/api/services/userService";
import { ApiClient } from "../../lib/api/client";
import { authService } from "../../lib/auth";
import { useTranslation } from "react-i18next";
import type { RequestConfig } from "lib/api";

// Create API client and service instances
// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const defaultConfig: RequestConfig = {
  timeout: 15000,
  retries: 3,
  retryDelay: 1000,
};

// Create API client instance
const apiClient = new ApiClient(API_BASE_URL, defaultConfig);

const healthMetricService = new HealthMetricService(apiClient);
const bloodSugarService = new BloodSugarService(apiClient);
const userService = new UserService(apiClient);

// Types
interface UserProfile {
  dateOfBirth?: string;
  heightCm?: number;
  weightKg?: number;
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  heartRate?: number;
}

// Extended HealthMetric interface to handle both type formats
interface ExtendedHealthMetric {
  id: string;
  userId: string;
  type?: string;
  metricType?: string;
  value: string | number;
  unit: string;
  timestamp: Date;
  notes?: string;
  additionalData?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

interface MetricCardData {
  id: string;
  title: string;
  icon: React.ReactNode;
  value: string | number | null;
  unit: string;
  timestamp?: string;
  trend?: "up" | "down" | "stable";
  status?: string;
  color: string;
}

interface HealthDashboardProps {
  onMetricAdded: (metric: HealthMetric) => void;
}

export function HealthDashboard({ onMetricAdded }: HealthDashboardProps) {
  const { t } = useTranslation();

  // State management
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<
    "7d" | "30d" | "90d" | "1y"
  >("30d");
  const [selectedMetricType, setSelectedMetricType] = useState<string | null>(
    null
  );

  // Data state
  const [metrics, setMetrics] = useState<ExtendedHealthMetric[]>([]);
  const [bloodSugarReadings, setBloodSugarReadings] = useState<
    BloodSugarReading[]
  >([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [metricData, setMetricData] = useState<any[]>([]);

  // Form state
  const [formValue, setFormValue] = useState("");
  const [formUnit, setFormUnit] = useState("");
  const [formNotes, setFormNotes] = useState("");
  const [useNow, setUseNow] = useState(true);
  const [customDateTime, setCustomDateTime] = useState(
    new Date().toISOString().slice(0, 16)
  );
  const [bloodSugarType, setBloodSugarType] = useState("RANDOM");
  const [saving, setSaving] = useState(false);

  // Chart state
  const [hoveredPoint, setHoveredPoint] = useState<any>(null);

  // Load initial data
  useEffect(() => {
    loadAllData();
  }, [selectedPeriod]);

  // Load metric-specific data when metric type changes
  useEffect(() => {
    if (selectedMetricType) {
      loadMetricData(selectedMetricType);
      resetForm();
    }
  }, [selectedMetricType, selectedPeriod]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([loadMetrics(), loadBloodSugar(), loadUserProfile()]);
    } finally {
      setLoading(false);
    }
  };

  const loadMetrics = async () => {
    try {
      const token = authService.getToken();
      if (!token) return;

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
      }

      const response = await healthMetricService.getMetrics(
        { startDate, endDate },
        { sortBy: "timestamp", sortOrder: "desc" },
        token
      );

      if (response.success && response.data) {
        setMetrics(response.data);
      }
    } catch (error) {
      console.error("Error loading metrics:", error);
    }
  };

  const loadBloodSugar = async () => {
    try {
      const token = authService.getToken();
      if (!token) return;

      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - 30); // Always load last 30 days

      const response = await bloodSugarService.getReadings(
        { startDate, endDate },
        { sortBy: "timestamp", sortOrder: "desc" },
        token
      );

      if (response.success && response.data) {
        setBloodSugarReadings(response.data);
      }
    } catch (error) {
      console.error("Error loading blood sugar:", error);
    }
  };

  const loadUserProfile = async () => {
    try {
      const token = authService.getToken();
      if (!token) return;

      const response = await userService.me(token);
      if (response) {
        setUserProfile({
          dateOfBirth: response.dateOfBirth,
          heightCm: response.heightCm || undefined,
          weightKg: response.weightKg || undefined,
          bloodPressureSystolic: response.bloodPressureSystolic || undefined,
          bloodPressureDiastolic: response.bloodPressureDiastolic || undefined,
          heartRate: response.heartRate || undefined,
        });
      }
    } catch (error) {
      console.error("Error loading user profile:", error);
    }
  };

  const loadMetricData = async (metricType: string) => {
    try {
      const token = authService.getToken();
      if (!token) return;

      if (metricType === "blood_sugar") {
        const sortedBloodSugar = [...bloodSugarReadings].sort(
          (a, b) =>
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
        setMetricData(sortedBloodSugar);
        return;
      }

      if (metricType === "bmi") {
        // Generate BMI data from weight changes
        const bmiData = generateBMIData();
        setMetricData(bmiData);
        return;
      }

      // Filter metrics by type
      const typeMapping: { [key: string]: string[] } = {
        weight: ["weight"],
        heart_rate: ["heart_rate"],
        blood_pressure: ["blood_pressure"],
        cholesterol: ["cholesterol"],
      };

      const relevantTypes = typeMapping[metricType] || [];
      let filteredMetrics = metrics.filter((m) =>
        relevantTypes.includes(m.type || m.metricType?.toLowerCase() || "")
      );

      // Add onboarding data as initial data points if no database metrics exist
      if (filteredMetrics.length === 0 && userProfile) {
        // Use a reasonable date for onboarding data (e.g., 30 days ago or current date)
        const onboardingDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago

        if (metricType === "weight" && userProfile.weightKg) {
          filteredMetrics = [
            {
              id: "onboarding-weight",
              type: "weight" as const,
              value: userProfile.weightKg.toString(),
              unit: "kg",
              timestamp: onboardingDate,
              userId: "",
              createdAt: onboardingDate,
              updatedAt: onboardingDate,
            },
          ];
        } else if (metricType === "heart_rate" && userProfile.heartRate) {
          filteredMetrics = [
            {
              id: "onboarding-heart-rate",
              type: "heart_rate" as const,
              value: userProfile.heartRate.toString(),
              unit: "bpm",
              timestamp: onboardingDate,
              userId: "",
              createdAt: onboardingDate,
              updatedAt: onboardingDate,
            },
          ];
        }
      }

      if (metricType === "blood_pressure") {
        // Get separate systolic and diastolic readings
        const systolic = metrics.filter(
          (m) =>
            m.type === "blood_pressure" ||
            m.metricType === "BLOOD_PRESSURE_SYSTOLIC"
        );
        const diastolic = metrics.filter(
          (m) =>
            m.type === "blood_pressure" ||
            m.metricType === "BLOOD_PRESSURE_DIASTOLIC"
        );

        let combined = systolic.map((s) => {
          const d = diastolic.find(
            (d) =>
              Math.abs(
                new Date(d.timestamp).getTime() -
                  new Date(s.timestamp).getTime()
              ) < 60000
          );
          return {
            id: s.id,
            value: d ? `${s.value}/${d.value}` : `${s.value}/?`,
            unit: "mmHg",
            timestamp: s.timestamp,
            systolic: s.value,
            diastolic: d?.value,
          };
        });

        // Add onboarding blood pressure if no database readings exist
        if (
          combined.length === 0 &&
          userProfile?.bloodPressureSystolic &&
          userProfile?.bloodPressureDiastolic
        ) {
          const onboardingDate = new Date(
            userProfile.dateOfBirth || Date.now()
          );
          combined = [
            {
              id: "onboarding-bp",
              value: `${userProfile.bloodPressureSystolic}/${userProfile.bloodPressureDiastolic}`,
              unit: "mmHg",
              timestamp: onboardingDate,
              systolic: userProfile.bloodPressureSystolic.toString(),
              diastolic: userProfile.bloodPressureDiastolic.toString(),
            },
          ];
        }

        const sortedCombined = combined.sort(
          (a, b) =>
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
        setMetricData(sortedCombined);
      } else {
        const sortedMetrics = [...filteredMetrics].sort(
          (a, b) =>
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
        setMetricData(sortedMetrics);
      }
    } catch (error) {
      console.error("Error loading metric data:", error);
    }
  };

  const resetForm = () => {
    setFormValue("");
    setFormNotes("");
    setUseNow(true);
    setCustomDateTime(new Date().toISOString().slice(0, 16));

    // Set default units based on metric type
    switch (selectedMetricType) {
      case "weight":
        setFormUnit("kg");
        break;
      case "heart_rate":
        setFormUnit("bpm");
        break;
      case "blood_pressure":
        setFormUnit("mmHg");
        break;
      case "bmi":
        setFormUnit("kg/m²");
        break;
      case "blood_sugar":
        setFormUnit("mg/dL");
        setBloodSugarType("RANDOM");
        break;
      default:
        setFormUnit("");
    }
  };

  const saveMetric = async () => {
    try {
      const token = authService.getToken();
      if (!token || !formValue || !selectedMetricType) return;

      setSaving(true);
      const timestamp = useNow ? new Date() : new Date(customDateTime);

      if (selectedMetricType === "blood_sugar") {
        // Use blood sugar API
        const data = {
          value: Number(formValue),
          unit: formUnit as "mg/dL" | "mmol/L",
          readingType: bloodSugarType.toLowerCase() as
            | "fasting"
            | "before_meal"
            | "after_meal"
            | "bedtime"
            | "random",
          notes: formNotes || undefined,
          timestamp: timestamp,
        };

        const response = await bloodSugarService.createReading(data, token);
        if (response.success) {
          await loadBloodSugar();
          resetForm();
        }
      } else if (selectedMetricType === "blood_pressure") {
        // Handle blood pressure as two separate metrics
        const [systolic, diastolic] = formValue
          .split("/")
          .map((v) => Number(v.trim()));

        if (systolic && diastolic) {
          const systolicData = {
            metricType: "BLOOD_PRESSURE_SYSTOLIC",
            value: systolic,
            unit: "mmHg",
            notes: formNotes || undefined,
            timestamp: timestamp,
          };

          const diastolicData = {
            metricType: "BLOOD_PRESSURE_DIASTOLIC",
            value: diastolic,
            unit: "mmHg",
            notes: formNotes || undefined,
            timestamp: timestamp,
          };

          const [systolicRes, diastolicRes] = await Promise.all([
            healthMetricService.createMetric(systolicData as any, token),
            healthMetricService.createMetric(diastolicData as any, token),
          ]);

          if (systolicRes.success && diastolicRes.success) {
            await loadMetrics();
            resetForm();
          }
        }
      } else if (selectedMetricType === "bmi") {
        // BMI is automatic - show message instead of saving
        alert(
          "BMI is calculated automatically from your weight and height. Add weight measurements to update your BMI curve."
        );
        return;
      } else {
        // Handle other metrics
        const metricTypeMapping: { [key: string]: string } = {
          weight: "WEIGHT",
          heart_rate: "HEART_RATE",
        };

        const data = {
          metricType: metricTypeMapping[selectedMetricType],
          value: Number(formValue),
          unit: formUnit,
          notes: formNotes || undefined,
          timestamp: timestamp,
        };

        const response = await healthMetricService.createMetric(
          data as any,
          token
        );
        if (response.success) {
          await loadMetrics();
          resetForm();
          if (response.data) {
            onMetricAdded(response.data);
          }
        }
      }
    } catch (error) {
      console.error("Error saving metric:", error);
    } finally {
      setSaving(false);
    }
  };

  // Helper functions
  const getLatestMetric = (metricType: string) => {
    const dbMetric = metrics.find(
      (m) => m.type === metricType || m.metricType?.toLowerCase() === metricType
    );

    // If no database metric, use onboarding data as fallback
    if (!dbMetric && userProfile) {
      switch (metricType) {
        case "weight":
          if (userProfile.weightKg) {
            return {
              id: "onboarding-weight",
              type: "weight" as const,
              value: userProfile.weightKg.toString(),
              unit: "kg",
              timestamp: new Date(userProfile.dateOfBirth || Date.now()),
              userId: "",
              createdAt: new Date(),
              updatedAt: new Date(),
            };
          }
          break;
        case "height":
          if (userProfile.heightCm) {
            return {
              id: "onboarding-height",
              type: "height" as const,
              value: userProfile.heightCm.toString(),
              unit: "cm",
              timestamp: new Date(userProfile.dateOfBirth || Date.now()),
              userId: "",
              createdAt: new Date(),
              updatedAt: new Date(),
            };
          }
          break;
      }
    }

    return dbMetric;
  };

  const getLatestBloodPressure = () => {
    const systolic = metrics.find(
      (m) =>
        m.type === "blood_pressure" ||
        m.metricType === "BLOOD_PRESSURE_SYSTOLIC"
    );
    const diastolic = metrics.find(
      (m) =>
        m.type === "blood_pressure" ||
        m.metricType === "BLOOD_PRESSURE_DIASTOLIC"
    );

    if (systolic && diastolic) {
      return {
        value: `${systolic.value}/${diastolic.value}`,
        unit: "mmHg",
        timestamp: systolic.timestamp,
        systolic: systolic.value,
        diastolic: diastolic.value,
      };
    }

    // Use onboarding data as fallback
    if (
      !systolic &&
      !diastolic &&
      userProfile?.bloodPressureSystolic &&
      userProfile?.bloodPressureDiastolic
    ) {
      return {
        value: `${userProfile.bloodPressureSystolic}/${userProfile.bloodPressureDiastolic}`,
        unit: "mmHg",
        timestamp: new Date(userProfile.dateOfBirth || Date.now()),
        systolic: userProfile.bloodPressureSystolic.toString(),
        diastolic: userProfile.bloodPressureDiastolic.toString(),
      };
    }

    return null;
  };

  const calculateBMI = () => {
    const latestWeight = getLatestMetric("weight");
    const latestHeight = getLatestMetric("height");

    // Use height from database first, then fallback to user profile
    const height = latestHeight
      ? Number(latestHeight.value)
      : userProfile?.heightCm;

    if (latestWeight && height) {
      const heightM = height / 100;
      return Number(latestWeight.value) / (heightM * heightM);
    }
    return null;
  };

  // Generate BMI data points for the curve
  const generateBMIData = () => {
    const weightMetrics = metrics.filter(
      (m) => m.type === "weight" || m.metricType?.toLowerCase() === "weight"
    );
    const heightMetrics = metrics.filter(
      (m) => m.type === "height" || m.metricType?.toLowerCase() === "height"
    );

    // Get the latest height (use onboarding as fallback)
    let currentHeight =
      heightMetrics.length > 0
        ? Number(heightMetrics[0].value)
        : userProfile?.heightCm;

    if (!currentHeight) return [];

    const heightM = currentHeight / 100;

    // Create BMI points for each weight entry
    const bmiPoints = weightMetrics.map((weight) => {
      const bmi = Number(weight.value) / (heightM * heightM);
      return {
        id: `bmi-${weight.id}`,
        value: bmi.toFixed(1),
        unit: "kg/m²",
        timestamp: weight.timestamp,
        notes: `Calculated from weight: ${weight.value}kg`,
      };
    });

    // Add onboarding BMI if we have onboarding weight but no database weight
    if (bmiPoints.length === 0 && userProfile?.weightKg) {
      const onboardingBMI = userProfile.weightKg / (heightM * heightM);
      bmiPoints.push({
        id: "onboarding-bmi",
        value: onboardingBMI.toFixed(1),
        unit: "kg/m²",
        timestamp: new Date(userProfile.dateOfBirth || Date.now()),
        notes: `Calculated from onboarding weight: ${userProfile.weightKg}kg`,
      });
    }

    return bmiPoints.sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  };

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5)
      return {
        category: "Underweight",
        color: "text-blue-600 dark:text-blue-400",
      };
    if (bmi < 25)
      return {
        category: "Normal",
        color: "text-green-600 dark:text-green-400",
      };
    if (bmi < 30)
      return {
        category: "Overweight",
        color: "text-yellow-600 dark:text-yellow-400",
      };
    return { category: "Obese", color: "text-red-600 dark:text-red-400" };
  };

  const getBloodPressureCategory = (systolic: number, diastolic: number) => {
    if (systolic < 120 && diastolic < 80)
      return {
        category: "Normal",
        color: "text-green-600 dark:text-green-400",
      };
    if (systolic < 130 && diastolic < 80)
      return {
        category: "Elevated",
        color: "text-yellow-600 dark:text-yellow-400",
      };
    if (systolic < 140 || diastolic < 90)
      return {
        category: "High Stage 1",
        color: "text-orange-600 dark:text-orange-400",
      };
    return {
      category: "High Stage 2",
      color: "text-red-600 dark:text-red-400",
    };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Prepare metric cards data
  const metricCards: MetricCardData[] = [
    {
      id: "weight",
      title: t("healthDashboard.metricTypes.weight"),
      icon: <Weight className="h-5 w-5 text-blue-600 dark:text-blue-400" />,
      value: getLatestMetric("weight")?.value || null,
      unit: "kg",
      timestamp: getLatestMetric("weight")?.timestamp?.toString(),
      color: "blue",
    },
    {
      id: "blood_pressure",
      title: t("healthDashboard.metricTypes.blood_pressure"),
      icon: <Heart className="h-5 w-5 text-red-600 dark:text-red-400" />,
      value: getLatestBloodPressure()?.value || null,
      unit: "mmHg",
      timestamp: getLatestBloodPressure()?.timestamp?.toString(),
      status: getLatestBloodPressure()
        ? getBloodPressureCategory(
            Number(getLatestBloodPressure()!.systolic),
            Number(getLatestBloodPressure()!.diastolic)
          ).category
        : undefined,
      color: "red",
    },
    {
      id: "heart_rate",
      title: t("healthDashboard.metricTypes.heart_rate"),
      icon: <Activity className="h-5 w-5 text-green-600 dark:text-green-400" />,
      value: getLatestMetric("heart_rate")?.value || null,
      unit: "bpm",
      timestamp: getLatestMetric("heart_rate")?.timestamp?.toString(),
      color: "green",
    },
    {
      id: "bmi",
      title: t("healthDashboard.metricTypes.bmi"),
      icon: <Target className="h-5 w-5 text-purple-600 dark:text-purple-400" />,
      value: calculateBMI()?.toFixed(1) || null,
      unit: "kg/m²",
      status: calculateBMI()
        ? getBMICategory(calculateBMI()!).category
        : undefined,
      color: "purple",
    },
    {
      id: "blood_sugar",
      title: t("healthDashboard.metricTypes.blood_sugar"),
      icon: (
        <Activity className="h-5 w-5 text-orange-600 dark:text-orange-400" />
      ),
      value: bloodSugarReadings[0]?.value.toString() || null,
      unit: bloodSugarReadings[0]?.unit || "mg/dL",
      timestamp: bloodSugarReadings[0]?.timestamp?.toString(),
      color: "orange",
    },
  ];

  const renderChart = () => {
    if (!metricData.length) {
      return (
        <div className="flex items-center justify-center h-32 text-gray-500 dark:text-gray-400">
          No data available
        </div>
      );
    }

    const width = 600;
    const height = 120;
    const padding = 16;

    const values = metricData.map((d) => {
      if (selectedMetricType === "blood_pressure") {
        return d.systolic || 0;
      }
      return Number(d.value) || 0;
    });

    const minY = Math.min(...values);
    const maxY = Math.max(...values);
    const rangeY = maxY - minY || 1;

    const points = metricData.map((d, i) => {
      const x =
        padding +
        (i * (width - padding * 2)) / Math.max(metricData.length - 1, 1);
      const y =
        padding + (height - padding * 2) * (1 - (values[i] - minY) / rangeY);
      return { x, y, data: d };
    });

    const pathD = points
      .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
      .join(" ");

    return (
      <div className="relative">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-32">
          <path
            d={pathD}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-blue-600 dark:text-blue-400"
          />
          {points.map((point, i) => (
            <circle
              key={i}
              cx={point.x}
              cy={point.y}
              r="4"
              fill="currentColor"
              className="text-blue-600 dark:text-blue-400 cursor-pointer hover:r-6 transition-all"
              onMouseEnter={() => setHoveredPoint(point)}
              onMouseLeave={() => setHoveredPoint(null)}
            />
          ))}
        </svg>

        {hoveredPoint && (
          <div
            className="absolute bg-gray-900 dark:bg-gray-700 text-white text-xs rounded px-2 py-1 pointer-events-none z-10"
            style={{
              left: `${(hoveredPoint.x / width) * 100}%`,
              top: `${(hoveredPoint.y / height) * 100}%`,
              transform: "translate(-50%, -120%)",
            }}
          >
            <div className="font-semibold">
              {hoveredPoint.data.value} {hoveredPoint.data.unit || formUnit}
            </div>
            {selectedMetricType === "blood_sugar" && (
              <div className="text-blue-300 dark:text-blue-200 capitalize">
                {(hoveredPoint.data.readingType || "random")
                  .replace(/_/g, " ")
                  .toLowerCase()
                  .replace(/\b\w/g, (l: string) => l.toUpperCase())}
              </div>
            )}
            <div className="text-gray-300 dark:text-gray-400">
              {hoveredPoint.data.timestamp
                ? new Date(hoveredPoint.data.timestamp).toLocaleString()
                : ""}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderForm = () => {
    if (!selectedMetricType) return null;

    // Show informational message for BMI
    if (selectedMetricType === "bmi") {
      return (
        <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="text-center">
            <Target className="h-12 w-12 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
              {t("healthDashboard.bmiCalculatedAutomatically")}
            </h4>
            <p className="text-blue-800 dark:text-blue-200 mb-4">
              {t("healthDashboard.bmiDescription")}
            </p>
            {calculateBMI() && (
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-4">
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {calculateBMI()!.toFixed(1)} kg/m²
                </div>
                <div
                  className={`text-sm font-medium ${
                    getBMICategory(calculateBMI()!).color
                  }`}
                >
                  {getBMICategory(calculateBMI()!).category}
                </div>
              </div>
            )}
            <p className="text-sm text-blue-700 dark:text-blue-300">
              {t("healthDashboard.updateBmiCurve")}
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {/* Value Input */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {selectedMetricType === "blood_pressure"
                ? t("healthDashboard.bloodPressureValue")
                : t("healthDashboard.value")}
            </label>
            <input
              type={selectedMetricType === "blood_pressure" ? "text" : "number"}
              step="0.1"
              value={formValue}
              onChange={(e) => setFormValue(e.target.value)}
              placeholder={
                selectedMetricType === "blood_pressure"
                  ? "120/80"
                  : "Enter value"
              }
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t("healthDashboard.unit")}
            </label>
            {selectedMetricType === "blood_sugar" ? (
              <select
                value={formUnit}
                onChange={(e) => setFormUnit(e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              >
                <option value="mg/dL">mg/dL</option>
                <option value="mmol/L">mmol/L</option>
              </select>
            ) : (
              <input
                type="text"
                value={formUnit}
                onChange={(e) => setFormUnit(e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                readOnly
              />
            )}
          </div>
        </div>

        {/* Blood Sugar Reading Type */}
        {selectedMetricType === "blood_sugar" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t("healthDashboard.readingType")}
            </label>
            <select
              value={bloodSugarType}
              onChange={(e) => setBloodSugarType(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            >
              <option value="FASTING">
                {t("healthDashboard.bloodSugarTypes.FASTING")}
              </option>
              <option value="BEFORE_MEAL">
                {t("healthDashboard.bloodSugarTypes.BEFORE_MEAL")}
              </option>
              <option value="AFTER_MEAL">
                {t("healthDashboard.bloodSugarTypes.AFTER_MEAL")}
              </option>
              <option value="BEDTIME">
                {t("healthDashboard.bloodSugarTypes.BEDTIME")}
              </option>
              <option value="RANDOM">
                {t("healthDashboard.bloodSugarTypes.RANDOM")}
              </option>
              <option value="POST_EXERCISE">
                {t("healthDashboard.bloodSugarTypes.POST_EXERCISE")}
              </option>
            </select>
          </div>
        )}

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t("healthDashboard.notes")}
          </label>
          <textarea
            value={formNotes}
            onChange={(e) => setFormNotes(e.target.value)}
            rows={2}
            placeholder={t("healthDashboard.notesPlaceholder")}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
          />
        </div>

        {/* Date/Time */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t("healthDashboard.dateTime")}
          </label>
          <div className="space-y-2">
            <input
              type="datetime-local"
              value={customDateTime}
              onChange={(e) => setCustomDateTime(e.target.value)}
              disabled={useNow}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 disabled:bg-gray-100 dark:disabled:bg-gray-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            />
            <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <input
                type="checkbox"
                checked={useNow}
                onChange={(e) => setUseNow(e.target.checked)}
                className="rounded"
              />
              {t("healthDashboard.useCurrentTime")}
            </label>
          </div>
        </div>

        {/* Save Button - Hidden for BMI since it's automatic */}
        {selectedMetricType !== "bmi" && (
          <div className="flex justify-end">
            <Button
              onClick={saveMetric}
              disabled={saving || !formValue}
              className="min-w-24"
            >
              {saving ? t("healthDashboard.saving") : t("healthDashboard.save")}
            </Button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {t("healthDashboard.period")}
        </span>
        {(["7d", "30d", "90d", "1y"] as const).map((period) => (
          <Button
            key={period}
            variant={selectedPeriod === period ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedPeriod(period)}
            className="text-xs"
          >
            {t(`healthDashboard.periods.${period}`)}
          </Button>
        ))}
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {metricCards.map((card) => (
          <Card
            key={card.id}
            className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            onClick={() => setSelectedMetricType(card.id)}
          >
            <div className="flex items-center gap-2 mb-2">
              {card.icon}
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                {card.title}
              </h3>
            </div>

            {card.value ? (
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {card.value} {card.unit}
                </div>
                {card.timestamp && (
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {new Date(card.timestamp).toLocaleString()}
                  </div>
                )}
                {card.status && (
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {card.status}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-gray-500 dark:text-gray-400">
                {t("healthDashboard.noData")}
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">
            {t("healthDashboard.tabs.overview")}
          </TabsTrigger>
          <TabsTrigger value="insights">
            {t("healthDashboard.tabs.insights")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          {loading ? (
            <div className="text-center py-8 text-gray-600 dark:text-gray-400">
              {t("healthDashboard.loadingMetrics")}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Metrics */}
              <Card className="p-4">
                <h3 className="font-semibold mb-4 text-gray-900 dark:text-gray-100">
                  {t("healthDashboard.recentMetrics")}
                </h3>
                <div className="space-y-3">
                  {metrics.slice(0, 10).map((metric) => (
                    <div
                      key={metric.id}
                      className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700 last:border-0"
                    >
                      <div>
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                          {(metric.type || metric.metricType || "Unknown")
                            .replace(/_/g, " ")
                            .toLowerCase()
                            .replace(/\b\w/g, (l: string) => l.toUpperCase())}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {metric.timestamp
                            ? new Date(metric.timestamp).toLocaleString()
                            : ""}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-gray-900 dark:text-gray-100">
                          {metric.value} {metric.unit}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Blood Sugar Recent */}
              <Card className="p-4">
                <h3 className="font-semibold mb-4 text-gray-900 dark:text-gray-100">
                  {t("healthDashboard.recentBloodSugar")}
                </h3>
                <div className="space-y-3">
                  {bloodSugarReadings.slice(0, 5).map((reading) => (
                    <div
                      key={reading.id}
                      className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700 last:border-0"
                    >
                      <div>
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                          {reading.readingType
                            .replace(/_/g, " ")
                            .toLowerCase()
                            .replace(/\b\w/g, (l: string) => l.toUpperCase())}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {reading.timestamp
                            ? new Date(reading.timestamp).toLocaleString()
                            : ""}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-gray-900 dark:text-gray-100">
                          {reading.value} {reading.unit}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="insights">
          {selectedMetricType ? (
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 capitalize">
                  {t(`healthDashboard.metricTypes.${selectedMetricType}`)}{" "}
                  {t("healthDashboard.tabs.insights")}
                </h3>
                <Button
                  variant="outline"
                  onClick={() => setSelectedMetricType(null)}
                >
                  {t("healthDashboard.backToOverview")}
                </Button>
              </div>

              {/* Chart */}
              <div className="mb-6">
                <h4 className="font-medium mb-3 text-gray-900 dark:text-gray-100">
                  {t("healthDashboard.trend")}
                </h4>
                {renderChart()}
              </div>

              {/* Form */}
              <div>
                <h4 className="font-medium mb-3 text-gray-900 dark:text-gray-100">
                  {t("healthDashboard.addNewReading")}
                </h4>
                {renderForm()}
              </div>
            </Card>
          ) : (
            <Card className="p-8 text-center">
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-gray-100">
                {t("healthDashboard.insights")}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {t("healthDashboard.insightsDescription")}
              </p>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                {metricCards.map((card) => (
                  <div
                    key={card.id}
                    className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    onClick={() => setSelectedMetricType(card.id)}
                  >
                    <div className="flex justify-center mb-2">{card.icon}</div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      {card.title}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
