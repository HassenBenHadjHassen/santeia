import { useState, useEffect } from "react";
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
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "../../components/ui/language-switcher";
import { authService } from "../../lib/auth";

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
  { value: "type1", label: "onboarding.diabetesTypes.type1" },
  { value: "type2", label: "onboarding.diabetesTypes.type2" },
  { value: "gestational", label: "onboarding.diabetesTypes.gestational" },
  { value: "prediabetes", label: "onboarding.diabetesTypes.prediabetes" },
  { value: "other", label: "onboarding.diabetesTypes.other" },
];

const ACTIVITY_LEVELS = [
  { value: "sedentary", label: "onboarding.activityLevels.sedentary" },
  { value: "light", label: "onboarding.activityLevels.light" },
  { value: "moderate", label: "onboarding.activityLevels.moderate" },
  { value: "active", label: "onboarding.activityLevels.active" },
  {
    value: "very-active",
    label: "onboarding.activityLevels.veryActive",
  },
];

const DIETARY_PREFERENCES = [
  "onboarding.dietaryOptions.lowCarb",
  "onboarding.dietaryOptions.mediterranean",
  "onboarding.dietaryOptions.vegetarian",
  "onboarding.dietaryOptions.vegan",
  "onboarding.dietaryOptions.glutenFree",
  "onboarding.dietaryOptions.dairyFree",
  "onboarding.dietaryOptions.keto",
  "onboarding.dietaryOptions.intermittentFasting",
];

const COMMON_MEDICATIONS = [
  "onboarding.medications.metformin",
  "onboarding.medications.insulinLongActing",
  "onboarding.medications.insulinShortActing",
  "onboarding.medications.sulfonylureas",
  "onboarding.medications.dpp4Inhibitors",
  "onboarding.medications.glp1ReceptorAgonists",
  "onboarding.medications.sglt2Inhibitors",
  "onboarding.medications.thiazolidinediones",
  "onboarding.medications.alphaGlucosidaseInhibitors",
];

export default function Onboarding() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, isAuthenticated, refreshUser } = useAuth();

  // Check if onboarding is already completed
  useEffect(() => {
    console.log({ user });
    if (isAuthenticated && user?.onboardingCompleted) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, user?.onboardingCompleted, navigate]);
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
      title: t("onboarding.welcomeTitle"),
      description: t("onboarding.welcomeDescription"),
      icon: Heart,
    },
    {
      title: t("onboarding.vitalsPersonalInfo"),
      description: t("onboarding.vitalsPersonalInfoDesc"),
      icon: Heart,
    },
    {
      title: t("onboarding.diabetesInformation"),
      description: t("onboarding.diabetesInformationDesc"),
      icon: Target,
    },
    {
      title: t("onboarding.medicationsTreatment"),
      description: t("onboarding.medicationsTreatmentDesc"),
      icon: Pill,
    },
    {
      title: t("onboarding.bloodSugarTargets"),
      description: t("onboarding.bloodSugarTargetsDesc"),
      icon: Activity,
    },
    {
      title: t("onboarding.lifestyleDiet"),
      description: t("onboarding.lifestyleDietDesc"),
      icon: Utensils,
    },
    {
      title: t("onboarding.emergencyContact"),
      description: t("onboarding.emergencyContactDesc"),
      icon: Heart,
    },
    {
      title: t("onboarding.completeSetup"),
      description: t("onboarding.completeSetupDesc"),
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
        // Wait for user state to be updated
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Double-check that onboarding is completed
        const token = authService.getToken();
        if (token) {
          const updatedUser = await userService.me(token);
          if (updatedUser.onboardingCompleted) {
            // Force a full page reload to ensure clean state
            window.location.href = "/";
            return;
          }
        }
      }

      // Fallback navigation
      navigate("/", { replace: true });
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
              <h2 className="text-2xl font-bold mb-4">
                {t("onboarding.welcomeTitle")}
              </h2>
              <p className="text-muted-foreground mb-6">
                {t("onboarding.welcomeDescription")}
              </p>
              <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>{t("onboarding.importantNote")}</strong>
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
                  {t("onboarding.dateOfBirthOptional")}
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
                  {t("onboarding.heightCm")}
                </label>
                <Input
                  id="heightCm"
                  type="number"
                  placeholder={t("onboarding.heightPlaceholder")}
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
                {t("onboarding.whatTypeOfDiabetes")}
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
                    <span>{t(type.label)}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label
                htmlFor="diagnosisDate"
                className="block text-sm font-medium mb-2"
              >
                {t("onboarding.whenDiagnosedOptional")}
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
                {t("onboarding.currentMedications")}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {t("onboarding.selectMedicationsDesc")}
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
                    <span className="text-sm">{t(medication)}</span>
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
                {t("onboarding.bloodSugarTargets")}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {t("onboarding.setBloodSugarGoals")}
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="fasting"
                    className="block text-sm font-medium mb-2"
                  >
                    {t("onboarding.fastingMorning")}
                  </label>
                  <Input
                    id="fasting"
                    type="number"
                    placeholder={t("onboarding.fastingPlaceholder")}
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
                    {t("onboarding.beforeMeals")}
                  </label>
                  <Input
                    id="beforeMeals"
                    type="number"
                    placeholder={t("onboarding.beforeMealsPlaceholder")}
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
                    {t("onboarding.afterMeals2Hours")}
                  </label>
                  <Input
                    id="afterMeals"
                    type="number"
                    placeholder={t("onboarding.afterMealsPlaceholder")}
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
                    {t("onboarding.bedtime")}
                  </label>
                  <Input
                    id="bedtime"
                    type="number"
                    placeholder={t("onboarding.bedtimePlaceholder")}
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
              <h3 className="text-lg font-semibold mb-2">
                {t("onboarding.activityLevel")}
              </h3>
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
                    <span>{t(level.label)}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">
                {t("onboarding.dietaryPreferences")}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {t("onboarding.dietaryPreferencesDesc")}
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
                    <span className="text-sm">{t(preference)}</span>
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
              <h3 className="text-lg font-semibold mb-2">
                {t("onboarding.emergencyContact")}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {t("onboarding.emergencyContactDesc")}
              </p>
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="contactName"
                    className="block text-sm font-medium mb-2"
                  >
                    {t("onboarding.fullName")}
                  </label>
                  <Input
                    id="contactName"
                    placeholder={t("onboarding.enterFullName")}
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
                    {t("onboarding.phoneNumber")}
                  </label>
                  <Input
                    id="contactPhone"
                    type="tel"
                    placeholder={t("onboarding.phonePlaceholder")}
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
                    {t("onboarding.relationship")}
                  </label>
                  <Input
                    id="contactRelationship"
                    placeholder={t("onboarding.relationshipPlaceholder")}
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
              <h2 className="text-2xl font-bold mb-4">
                {t("onboarding.setupComplete")}
              </h2>
              <p className="text-muted-foreground mb-6">
                {t("onboarding.setupCompleteDesc")}
              </p>
              <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg text-left">
                <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                  {t("onboarding.whatsNext")}
                </h4>
                <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                  {(
                    t("onboarding.whatsNextItems", {
                      returnObjects: true,
                    }) as string[]
                  ).map((item: string, index: number) => (
                    <li key={index}>• {item}</li>
                  ))}
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
          {/* Header with language switcher */}
          <div className="mb-6">
            <div className="flex items-center justify-end gap-4 mb-4">
              <LanguageSwitcher />
            </div>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Heart className="h-6 w-6 text-primary" />
                  <CardTitle>{t("onboarding.setupTitle")}</CardTitle>
                </div>
                <span className="text-sm text-muted-foreground">
                  {t("onboarding.stepOf", {
                    current: currentStep + 1,
                    total: steps.length,
                  })}
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
                  {t("onboarding.previous")}
                </Button>
                <Button
                  onClick={handleNext}
                  disabled={!canProceed() || isSaving}
                >
                  {isSaving
                    ? t("onboarding.saving")
                    : currentStep === steps.length - 1
                    ? t("onboarding.completeSetup")
                    : t("onboarding.next")}
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
