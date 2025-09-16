# API Services Usage Guide

This guide shows how to use all the available API services in the SanteIA application.

## Importing Services

```typescript
import {
  api,
  bloodSugarService,
  mealService,
  physicalActivityService,
  medicationService,
  healthMetricService,
  alertService,
} from "lib/api";
```

## Authentication

All services require a JWT token for authentication. Get the token from your auth context:

```typescript
import { useAuth } from "lib/auth-context";

const { user } = useAuth();
const token = authService.getToken(); // or however you get your token
```

## Blood Sugar Service

Track blood sugar readings with comprehensive filtering and statistics.

```typescript
// Create a blood sugar reading
const reading = await bloodSugarService.createReading(
  {
    value: 120,
    unit: "mg/dL",
    readingType: "fasting",
    notes: "Before breakfast",
  },
  token
);

// Get readings with filters
const readings = await bloodSugarService.getReadings(
  {
    readingType: "fasting",
    startDate: new Date("2024-01-01"),
    endDate: new Date("2024-01-31"),
  },
  { page: 1, limit: 10 },
  token
);

// Get statistics
const stats = await bloodSugarService.getStatistics(
  {
    startDate: new Date("2024-01-01"),
    endDate: new Date("2024-01-31"),
  },
  token
);
```

## Meal Service

Track meals and nutritional information.

```typescript
// Create a meal
const meal = await mealService.createMeal(
  {
    name: "Grilled Chicken Salad",
    mealType: "lunch",
    calories: 350,
    carbohydrates: 25,
    proteins: 30,
    fats: 15,
    timestamp: new Date(),
  },
  token
);

// Get meals by type
const breakfasts = await mealService.getMeals(
  {
    mealType: "breakfast",
    startDate: new Date("2024-01-01"),
  },
  { page: 1, limit: 20 },
  token
);

// Get meal statistics
const mealStats = await mealService.getStatistics(
  {
    startDate: new Date("2024-01-01"),
    endDate: new Date("2024-01-31"),
  },
  token
);
```

## Physical Activity Service

Track physical activities and exercise.

```typescript
// Log a workout
const activity = await physicalActivityService.createActivity(
  {
    name: "Morning Run",
    activityType: "cardio",
    duration: 30,
    intensity: "moderate",
    caloriesBurned: 300,
    distance: 5.2,
  },
  token
);

// Get activities by type
const cardioActivities = await physicalActivityService.getActivities(
  {
    activityType: "cardio",
    startDate: new Date("2024-01-01"),
  },
  { page: 1, limit: 10 },
  token
);

// Get activity statistics
const activityStats = await physicalActivityService.getStatistics(
  {
    startDate: new Date("2024-01-01"),
    endDate: new Date("2024-01-31"),
  },
  token
);
```

## Medication Service

Manage medications and track doses.

```typescript
// Add a medication
const medication = await medicationService.createMedication(
  {
    name: "Metformin",
    type: "oral",
    dosage: "500",
    unit: "mg",
    frequency: "daily",
    timesPerDay: 2,
    specificTimes: ["08:00", "20:00"],
    startDate: new Date(),
  },
  token
);

// Log a dose
const dose = await medicationService.logDose(
  {
    medicationId: medication.data.id,
    dosage: "500",
    unit: "mg",
    takenAt: new Date(),
  },
  token
);

// Get medications
const medications = await medicationService.getMedications(
  {
    isActive: true,
  },
  { page: 1, limit: 10 },
  token
);

// Get medication statistics
const medStats = await medicationService.getStatistics({}, token);
```

## Health Metrics Service

Track various health metrics like weight, blood pressure, etc.

```typescript
// Record weight
const weight = await healthMetricService.createMetric(
  {
    type: "weight",
    value: "70.5",
    unit: "kg",
    timestamp: new Date(),
  },
  token
);

// Record blood pressure
const bp = await healthMetricService.createMetric(
  {
    type: "blood_pressure",
    value: "120/80",
    unit: "mmHg",
    additionalData: { systolic: 120, diastolic: 80 },
  },
  token
);

// Get metrics by type
const weightHistory = await healthMetricService.getMetricsByType(
  "weight",
  { startDate: new Date("2024-01-01") },
  { page: 1, limit: 30 },
  token
);

// Get latest metrics
const latestMetrics = await healthMetricService.getLatestMetrics(
  ["weight", "blood_pressure"],
  token
);
```

## Alert Service

Manage health alerts and reminders.

```typescript
// Create a general alert
const alert = await alertService.createAlert(
  {
    type: "GENERAL_HEALTH",
    title: "Check Blood Sugar",
    message: "Time to check your blood sugar levels",
    priority: "medium",
  },
  token
);

// Create a blood sugar alert
const bsAlert = await alertService.createBloodSugarAlert(
  {
    isHigh: true,
    value: 180,
    targetRange: { min: 80, max: 120 },
  },
  token
);

// Get unread alerts
const unreadAlerts = await alertService.getUnreadAlerts(token);

// Mark alert as read
await alertService.markAsRead(alert.data.id, token);

// Get alert statistics
const alertStats = await alertService.getAlertCounts(token);
```

## Using the Main API Class

You can also use the main `api` class which provides access to all services:

```typescript
// Using the main API class
const bloodSugarReadings = await api.bloodSugar.getReadings({}, {}, token);
const meals = await api.meals.getMeals({}, {}, token);
const activities = await api.physicalActivities.getActivities({}, {}, token);
const medications = await api.medications.getMedications({}, {}, token);
const healthMetrics = await api.healthMetrics.getMetrics({}, {}, token);
const alerts = await api.alerts.getAlerts({}, {}, token);
```

## Error Handling

All services return a `ServiceResponse<T>` which includes success status and error information:

```typescript
const result = await bloodSugarService.createReading(data, token);

if (result.success) {
  console.log("Reading created:", result.data);
} else {
  console.error("Error:", result.error);
}
```

## Pagination

Most list endpoints support pagination:

```typescript
const pagination = {
  page: 1,
  limit: 10,
  sortBy: "createdAt",
  sortOrder: "desc" as const,
};

const readings = await bloodSugarService.getReadings({}, pagination, token);
```

## Filtering

Most services support various filters:

```typescript
// Blood sugar filters
const filters = {
  readingType: "fasting",
  startDate: new Date("2024-01-01"),
  endDate: new Date("2024-01-31"),
  minValue: 80,
  maxValue: 120,
};

// Meal filters
const mealFilters = {
  mealType: "breakfast",
  startDate: new Date("2024-01-01"),
  minCalories: 200,
};

// Activity filters
const activityFilters = {
  activityType: "cardio",
  intensity: "moderate",
  startDate: new Date("2024-01-01"),
};
```

This comprehensive API service structure allows you to easily integrate all health tracking features into your components without manually handling API calls.
