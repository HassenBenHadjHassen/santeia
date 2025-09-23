import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "components/ui/button";
import { Input } from "components/ui/input";
import { ProtectedRoute } from "../../components/auth/protected-route";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "components/ui/card";
import {
  Heart,
  ArrowRight,
  ArrowLeft,
  Check,
  Activity,
  Utensils,
  Pill,
  Target,
} from "lucide-react";
import { useAuth } from "../../lib/auth-context";
import { userService } from "../../lib/api";

export function meta() {
  return [
    { title: "Welcome to SantéAI - Onboarding" },
    {
      name: "description",
      content: "Set up your personalized diabetes management profile",
    },
  ];
}

interface OnboardingData {
  diabetesType: string;
  diagnosisDate: string;
  currentMedications: string[];
  bloodSugarTargets: {
    fasting: string;
    beforeMeals: string;
    afterMeals: string;
    bedtime: string;
  };
  // Optional profile health fields
  dateOfBirth?: string;
  heightCm?: number;
  weightKg?: number;
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  heartRate?: number;
  activityLevel: string;
  dietaryPreferences: string[];
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
}

const DIABETES_TYPES = [
  { value: "type1", label: "Type 1 Diabetes" },
  { value: "type2", label: "Type 2 Diabetes" },
  { value: "gestational", label: "Gestational Diabetes" },
  { value: "prediabetes", label: "Prediabetes" },
  { value: "other", label: "Other" },
];

const ACTIVITY_LEVELS = [
  { value: "sedentary", label: "Sedentary (little to no exercise)" },
  { value: "light", label: "Light activity (1-3 days/week)" },
  { value: "moderate", label: "Moderate activity (3-5 days/week)" },
  { value: "active", label: "Active (6-7 days/week)" },
  {
    value: "very-active",
    label: "Very active (twice daily or intense exercise)",
  },
];

const DIETARY_PREFERENCES = [
  "Low carb",
  "Mediterranean",
  "Vegetarian",
  "Vegan",
  "Gluten-free",
  "Dairy-free",
  "Keto",
  "Intermittent fasting",
];

const COMMON_MEDICATIONS = [
  "Metformin",
  "Insulin (long-acting)",
  "Insulin (short-acting)",
  "Sulfonylureas",
  "DPP-4 inhibitors",
  "GLP-1 receptor agonists",
  "SGLT2 inhibitors",
  "Thiazolidinediones",
  "Alpha-glucosidase inhibitors",
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { user, isAuthenticated, refreshUser } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<OnboardingData>({
    diabetesType: "",
    diagnosisDate: "",
    currentMedications: [],
    bloodSugarTargets: {
      fasting: "",
      beforeMeals: "",
      afterMeals: "",
      bedtime: "",
    },
    dateOfBirth: "",
    heightCm: undefined,
    weightKg: undefined,
    bloodPressureSystolic: undefined,
    bloodPressureDiastolic: undefined,
    heartRate: undefined,
    activityLevel: "",
    dietaryPreferences: [],
    emergencyContact: {
      name: "",
      phone: "",
      relationship: "",
    },
  });

  const steps = [
    {
      title: "Welcome to SantéAI",
      description: "Let's set up your personalized diabetes management profile",
      icon: Heart,
    },
    {
      title: "Vitals & Personal Info",
      description: "Add your height, weight, blood pressure, and DOB",
      icon: Heart,
    },
    {
      title: "Diabetes Information",
      description: "Tell us about your diabetes type and diagnosis",
      icon: Target,
    },
    {
      title: "Medications & Treatment",
      description: "What medications are you currently taking?",
      icon: Pill,
    },
    {
      title: "Blood Sugar Targets",
      description: "Set your personalized blood sugar goals",
      icon: Activity,
    },
    {
      title: "Lifestyle & Diet",
      description:
        "Help us understand your activity level and dietary preferences",
      icon: Utensils,
    },
    {
      title: "Emergency Contact",
      description: "Add an emergency contact for safety",
      icon: Heart,
    },
    {
      title: "Complete Setup",
      description: "Review your information and start your journey",
      icon: Check,
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete onboarding
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    setIsSaving(true);
    setError(null);

    try {
      await userService.saveOnboarding(formData);

      // Refresh user data to get updated onboarding information
      if (isAuthenticated) {
        await refreshUser();
      }

      navigate("/");
    } catch (error) {
      console.error("Error completing onboarding:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to save onboarding data";
      setError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: keyof OnboardingData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNestedInputChange = (
    parentField: keyof OnboardingData,
    childField: string,
    value: any
  ) => {
    setFormData((prev) => ({
      ...prev,
      [parentField]: {
        ...(prev[parentField] as any),
        [childField]: value,
      },
    }));
  };

  const toggleArrayItem = (field: keyof OnboardingData, value: string) => {
    setFormData((prev) => {
      const currentArray = prev[field] as string[];
      return {
        ...prev,
        [field]: currentArray.includes(value)
          ? currentArray.filter((item) => item !== value)
          : [...currentArray, value],
      };
    });
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="text-center space-y-6">
            <div className="mx-auto w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
              <Heart className="h-12 w-12 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-4">Welcome to SantéAI!</h2>
              <p className="text-muted-foreground mb-6">
                Your personal health assistant for diabetes management. We'll
                help you track your blood sugar, manage medications, and make
                informed health decisions.
              </p>
              <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Important:</strong> SantéAI provides educational
                  guidance and support. Always consult with your healthcare
                  provider for medical advice and treatment decisions.
                </p>
              </div>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="dateOfBirth"
                  className="block text-sm font-medium mb-2"
                >
                  Date of Birth (optional)
                </label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth || ""}
                  onChange={(e) =>
                    handleInputChange("dateOfBirth", e.target.value)
                  }
                />
              </div>
              <div>
                <label
                  htmlFor="heightCm"
                  className="block text-sm font-medium mb-2"
                >
                  Height (cm)
                </label>
                <Input
                  id="heightCm"
                  type="number"
                  placeholder="e.g., 175"
                  value={formData.heightCm ?? ""}
                  onChange={(e) =>
                    handleInputChange(
                      "heightCm",
                      e.target.value === "" ? undefined : Number(e.target.value)
                    )
                  }
                />
              </div>
              <div>
                <label
                  htmlFor="weightKg"
                  className="block text-sm font-medium mb-2"
                >
                  Weight (kg)
                </label>
                <Input
                  id="weightKg"
                  type="number"
                  placeholder="e.g., 70"
                  value={formData.weightKg ?? ""}
                  onChange={(e) =>
                    handleInputChange(
                      "weightKg",
                      e.target.value === "" ? undefined : Number(e.target.value)
                    )
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="bpSys"
                    className="block text-sm font-medium mb-2"
                  >
                    BP Systolic (mmHg)
                  </label>
                  <Input
                    id="bpSys"
                    type="number"
                    placeholder="e.g., 120"
                    value={formData.bloodPressureSystolic ?? ""}
                    onChange={(e) =>
                      handleInputChange(
                        "bloodPressureSystolic",
                        e.target.value === ""
                          ? undefined
                          : Number(e.target.value)
                      )
                    }
                  />
                </div>
                <div>
                  <label
                    htmlFor="bpDia"
                    className="block text-sm font-medium mb-2"
                  >
                    BP Diastolic (mmHg)
                  </label>
                  <Input
                    id="bpDia"
                    type="number"
                    placeholder="e.g., 80"
                    value={formData.bloodPressureDiastolic ?? ""}
                    onChange={(e) =>
                      handleInputChange(
                        "bloodPressureDiastolic",
                        e.target.value === ""
                          ? undefined
                          : Number(e.target.value)
                      )
                    }
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="heartRate"
                  className="block text-sm font-medium mb-2"
                >
                  Resting Heart Rate (bpm)
                </label>
                <Input
                  id="heartRate"
                  type="number"
                  placeholder="e.g., 70"
                  value={formData.heartRate ?? ""}
                  onChange={(e) =>
                    handleInputChange(
                      "heartRate",
                      e.target.value === "" ? undefined : Number(e.target.value)
                    )
                  }
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">
                What type of diabetes do you have?
              </h3>
              <div className="grid gap-3">
                {DIABETES_TYPES.map((type) => (
                  <label
                    key={type.value}
                    className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                      formData.diabetesType === type.value
                        ? "border-primary bg-primary/5"
                        : "border-border hover:bg-accent"
                    }`}
                  >
                    <input
                      type="radio"
                      name="diabetesType"
                      value={type.value}
                      checked={formData.diabetesType === type.value}
                      onChange={(e) =>
                        handleInputChange("diabetesType", e.target.value)
                      }
                      className="mr-3"
                    />
                    <span>{type.label}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label
                htmlFor="diagnosisDate"
                className="block text-sm font-medium mb-2"
              >
                When were you diagnosed? (optional)
              </label>
              <Input
                id="diagnosisDate"
                type="date"
                value={formData.diagnosisDate}
                onChange={(e) =>
                  handleInputChange("diagnosisDate", e.target.value)
                }
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">
                Current Medications
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Select all medications you're currently taking (you can add more
                later)
              </p>
              <div className="grid grid-cols-2 gap-3">
                {COMMON_MEDICATIONS.map((medication) => (
                  <label
                    key={medication}
                    className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                      formData.currentMedications.includes(medication)
                        ? "border-primary bg-primary/5"
                        : "border-border hover:bg-accent"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.currentMedications.includes(medication)}
                      onChange={() =>
                        toggleArrayItem("currentMedications", medication)
                      }
                      className="mr-3"
                    />
                    <span className="text-sm">{medication}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">
                Blood Sugar Targets
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Set your personalized blood sugar goals (mg/dL). These can be
                adjusted later.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="fasting"
                    className="block text-sm font-medium mb-2"
                  >
                    Fasting (morning)
                  </label>
                  <Input
                    id="fasting"
                    type="number"
                    placeholder="80-130"
                    value={formData.bloodSugarTargets.fasting}
                    onChange={(e) =>
                      handleNestedInputChange(
                        "bloodSugarTargets",
                        "fasting",
                        e.target.value
                      )
                    }
                  />
                </div>
                <div>
                  <label
                    htmlFor="beforeMeals"
                    className="block text-sm font-medium mb-2"
                  >
                    Before Meals
                  </label>
                  <Input
                    id="beforeMeals"
                    type="number"
                    placeholder="80-130"
                    value={formData.bloodSugarTargets.beforeMeals}
                    onChange={(e) =>
                      handleNestedInputChange(
                        "bloodSugarTargets",
                        "beforeMeals",
                        e.target.value
                      )
                    }
                  />
                </div>
                <div>
                  <label
                    htmlFor="afterMeals"
                    className="block text-sm font-medium mb-2"
                  >
                    After Meals (2 hours)
                  </label>
                  <Input
                    id="afterMeals"
                    type="number"
                    placeholder="<180"
                    value={formData.bloodSugarTargets.afterMeals}
                    onChange={(e) =>
                      handleNestedInputChange(
                        "bloodSugarTargets",
                        "afterMeals",
                        e.target.value
                      )
                    }
                  />
                </div>
                <div>
                  <label
                    htmlFor="bedtime"
                    className="block text-sm font-medium mb-2"
                  >
                    Bedtime
                  </label>
                  <Input
                    id="bedtime"
                    type="number"
                    placeholder="100-140"
                    value={formData.bloodSugarTargets.bedtime}
                    onChange={(e) =>
                      handleNestedInputChange(
                        "bloodSugarTargets",
                        "bedtime",
                        e.target.value
                      )
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Activity Level</h3>
              <div className="space-y-3">
                {ACTIVITY_LEVELS.map((level) => (
                  <label
                    key={level.value}
                    className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                      formData.activityLevel === level.value
                        ? "border-primary bg-primary/5"
                        : "border-border hover:bg-accent"
                    }`}
                  >
                    <input
                      type="radio"
                      name="activityLevel"
                      value={level.value}
                      checked={formData.activityLevel === level.value}
                      onChange={(e) =>
                        handleInputChange("activityLevel", e.target.value)
                      }
                      className="mr-3"
                    />
                    <span>{level.label}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">
                Dietary Preferences
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Select any dietary preferences or restrictions you follow
              </p>
              <div className="grid grid-cols-2 gap-3">
                {DIETARY_PREFERENCES.map((preference) => (
                  <label
                    key={preference}
                    className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                      formData.dietaryPreferences.includes(preference)
                        ? "border-primary bg-primary/5"
                        : "border-border hover:bg-accent"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.dietaryPreferences.includes(preference)}
                      onChange={() =>
                        toggleArrayItem("dietaryPreferences", preference)
                      }
                      className="mr-3"
                    />
                    <span className="text-sm">{preference}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Emergency Contact</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Add an emergency contact for safety alerts and notifications
              </p>
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="contactName"
                    className="block text-sm font-medium mb-2"
                  >
                    Full Name
                  </label>
                  <Input
                    id="contactName"
                    placeholder="Enter full name"
                    value={formData.emergencyContact.name}
                    onChange={(e) =>
                      handleNestedInputChange(
                        "emergencyContact",
                        "name",
                        e.target.value
                      )
                    }
                  />
                </div>
                <div>
                  <label
                    htmlFor="contactPhone"
                    className="block text-sm font-medium mb-2"
                  >
                    Phone Number
                  </label>
                  <Input
                    id="contactPhone"
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    value={formData.emergencyContact.phone}
                    onChange={(e) =>
                      handleNestedInputChange(
                        "emergencyContact",
                        "phone",
                        e.target.value
                      )
                    }
                  />
                </div>
                <div>
                  <label
                    htmlFor="contactRelationship"
                    className="block text-sm font-medium mb-2"
                  >
                    Relationship
                  </label>
                  <Input
                    id="contactRelationship"
                    placeholder="e.g., Spouse, Parent, Sibling, Friend"
                    value={formData.emergencyContact.relationship}
                    onChange={(e) =>
                      handleNestedInputChange(
                        "emergencyContact",
                        "relationship",
                        e.target.value
                      )
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 7:
        return (
          <div className="text-center space-y-6">
            <div className="mx-auto w-24 h-24 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
              <Check className="h-12 w-12 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-4">Setup Complete!</h2>
              <p className="text-muted-foreground mb-6">
                Your personalized diabetes management profile is ready. You can
                always update these settings in your profile later.
              </p>
              <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg text-left">
                <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                  What's Next?
                </h4>
                <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                  <li>• Start tracking your blood sugar levels</li>
                  <li>• Log your meals and activities</li>
                  <li>• Set medication reminders</li>
                  <li>• Chat with SantéAI for personalized advice</li>
                </ul>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return true;
      case 1:
        return true; // vitals optional
      case 2:
        return formData.diabetesType !== "";
      case 3:
        return true; // Medications are optional
      case 4:
        return true; // Blood sugar targets are optional
      case 5:
        return formData.activityLevel !== "";
      case 6:
        return true; // Emergency contact is optional
      case 7:
        return true;
      default:
        return false;
    }
  };

  return (
    <ProtectedRoute requireOnboarding={false}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-8">
        <div className="container mx-auto px-4 max-w-2xl">
          {/* Header with back button */}
          <div className="mb-6">
            <div className="flex items-center gap-4 mb-4"></div>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Heart className="h-6 w-6 text-primary" />
                  <CardTitle>SantéAI Setup</CardTitle>
                </div>
                <span className="text-sm text-muted-foreground">
                  Step {currentStep + 1} of {steps.length}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${((currentStep + 1) / steps.length) * 100}%`,
                  }}
                />
              </div>
            </CardHeader>
            <CardContent>
              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-800 dark:text-red-200">
                    {error}
                  </p>
                </div>
              )}

              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-2">
                  {steps[currentStep].title}
                </h2>
                <p className="text-muted-foreground">
                  {steps[currentStep].description}
                </p>
              </div>

              {renderStepContent()}

              <div className="flex justify-between mt-8">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentStep === 0}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>
                <Button
                  onClick={handleNext}
                  disabled={!canProceed() || isSaving}
                >
                  {isSaving
                    ? "Saving..."
                    : currentStep === steps.length - 1
                    ? "Complete Setup"
                    : "Next"}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}
