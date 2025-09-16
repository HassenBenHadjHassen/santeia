import { useState } from "react";
import { useAuth } from "../../lib/auth-context";
import { Button } from "components/ui/button";
import { Input } from "components/ui/input";
import { MainLayout } from "../../components/layout/main-layout";
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
  User,
  Mail,
  Calendar,
  Edit,
  Save,
  X,
  Activity,
  Pill,
  Target,
  Phone,
  Utensils,
  BookOpen,
  Bot,
  FileText,
  BarChart3,
} from "lucide-react";
import { useNavigate } from "react-router";

export function meta() {
  return [
    { title: "Profile - SantéAI" },
    { name: "description", content: "Manage your SantéAI profile" },
  ];
}

export default function Profile() {
  const { user, logout, updateProfile, error, clearError } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
  });

  const handleEdit = () => {
    setIsEditing(true);
    setSuccessMessage(null);
    clearError();
    setFormData({
      name: user?.name || "",
      email: user?.email || "",
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setSuccessMessage(null);
    clearError();
    setFormData({
      name: user?.name || "",
      email: user?.email || "",
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSuccessMessage(null);
    clearError();

    try {
      await updateProfile({
        name: formData.name,
        email: formData.email,
      });

      setSuccessMessage("Profile updated successfully!");
      setIsEditing(false);

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (error) {
      console.error("Error updating profile:", error);
      // Error is handled by the auth context
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const formatDiabetesType = (type: string) => {
    return (
      type.charAt(0).toUpperCase() + type.slice(1).replace(/([A-Z])/g, " $1")
    );
  };

  const formatActivityLevel = (level: string) => {
    return (
      level.charAt(0).toUpperCase() + level.slice(1).replace(/([A-Z])/g, " $1")
    );
  };

  return (
    <ProtectedRoute>
      {user && (
        <MainLayout
          user={{ name: user.name, email: user.email }}
          showChatFeatures={false}
          maxWidth="full"
          padding="lg"
          centered={false}
        >
          {/* Header */}
          <div className="mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Profile
              </h1>
              <p className="text-muted-foreground">
                Manage your account information and preferences
              </p>
            </div>
          </div>

          {/* Success/Error Messages */}
          {successMessage && (
            <div className="mb-6 p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
              <p className="text-sm text-green-800 dark:text-green-200 font-medium">
                {successMessage}
              </p>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-sm text-destructive font-medium">{error}</p>
            </div>
          )}

          <div className="space-y-6">
            {/* Personal Information */}
            <Card className="border-border/60">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">
                        Personal Information
                      </CardTitle>
                      <CardDescription className="mt-1">
                        Your basic account information
                      </CardDescription>
                    </div>
                  </div>
                  {!isEditing && (
                    <Button variant="outline" size="sm" onClick={handleEdit}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label
                        htmlFor="name"
                        className="text-sm font-medium text-foreground"
                      >
                        Full Name
                      </label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter your full name"
                        className="border-border/60 focus:border-primary"
                      />
                    </div>
                    <div className="space-y-2">
                      <label
                        htmlFor="email"
                        className="text-sm font-medium text-foreground"
                      >
                        Email Address
                      </label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Enter your email"
                        className="border-border/60 focus:border-primary"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleSave} disabled={isSaving}>
                        <Save className="h-4 w-4 mr-2" />
                        {isSaving ? "Saving..." : "Save Changes"}
                      </Button>
                      <Button variant="outline" onClick={handleCancel}>
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Name</p>
                        <p className="text-sm text-muted-foreground">
                          {user!.name}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Email</p>
                        <p className="text-sm text-muted-foreground">
                          {user!.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Member Since</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(user!.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Health Information */}
            <Card className="border-border/60">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Heart className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">
                        Health Information
                      </CardTitle>
                      <CardDescription className="mt-1">
                        Your diabetes management preferences and settings
                      </CardDescription>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate("/onboarding")}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Diabetes Type & Management */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-foreground">
                    Diabetes Profile
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">
                        Type of Diabetes
                      </label>
                      <div className="p-3 bg-accent/50 rounded-lg border border-border/60">
                        <p className="text-sm font-medium text-foreground">
                          {user!.diabetesType
                            ? formatDiabetesType(user!.diabetesType)
                            : "Not specified"}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">
                        Diagnosis Date
                      </label>
                      <div className="p-3 bg-accent/50 rounded-lg border border-border/60">
                        <p className="text-sm font-medium text-foreground">
                          {user!.diagnosisDate || "Not specified"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Blood Sugar Targets */}
                {user!.bloodSugarTargets && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-primary" />
                      <h4 className="text-lg font-semibold text-foreground">
                        Blood Sugar Targets
                      </h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">
                          Fasting (mg/dL)
                        </label>
                        <div className="p-3 bg-accent/50 rounded-lg border border-border/60">
                          <p className="text-sm font-medium text-foreground">
                            {user!.bloodSugarTargets.fasting || "Not set"}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">
                          Before Meals (mg/dL)
                        </label>
                        <div className="p-3 bg-accent/50 rounded-lg border border-border/60">
                          <p className="text-sm font-medium text-foreground">
                            {user!.bloodSugarTargets.beforeMeals || "Not set"}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">
                          After Meals (mg/dL)
                        </label>
                        <div className="p-3 bg-accent/50 rounded-lg border border-border/60">
                          <p className="text-sm font-medium text-foreground">
                            {user!.bloodSugarTargets.afterMeals || "Not set"}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">
                          Bedtime (mg/dL)
                        </label>
                        <div className="p-3 bg-accent/50 rounded-lg border border-border/60">
                          <p className="text-sm font-medium text-foreground">
                            {user!.bloodSugarTargets.bedtime || "Not set"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Activity Level */}
                {user!.activityLevel && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Activity className="h-5 w-5 text-primary" />
                      <h4 className="text-lg font-semibold text-foreground">
                        Activity Level
                      </h4>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">
                        Current Activity Level
                      </label>
                      <div className="p-3 bg-accent/50 rounded-lg border border-border/60">
                        <p className="text-sm font-medium text-foreground">
                          {formatActivityLevel(user!.activityLevel)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Medications */}
                {user!.currentMedications &&
                  user!.currentMedications.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Pill className="h-5 w-5 text-primary" />
                        <h4 className="text-lg font-semibold text-foreground">
                          Current Medications
                        </h4>
                      </div>
                      <div className="space-y-3">
                        {user!.currentMedications.map((medication, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-accent/50 rounded-lg border border-border/60"
                          >
                            <div className="flex items-center gap-3">
                              <Pill className="h-4 w-4 text-muted-foreground" />
                              <p className="font-medium">{medication}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Dietary Preferences */}
                {user!.dietaryPreferences &&
                  user!.dietaryPreferences.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Utensils className="h-5 w-5 text-primary" />
                        <h4 className="text-lg font-semibold text-foreground">
                          Dietary Preferences
                        </h4>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {user!.dietaryPreferences.map((preference, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full border border-primary/20"
                          >
                            {preference}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Emergency Contacts */}
                {user!.emergencyContact &&
                  (user!.emergencyContact.name ||
                    user!.emergencyContact.phone) && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Phone className="h-5 w-5 text-primary" />
                        <h4 className="text-lg font-semibold text-foreground">
                          Emergency Contact
                        </h4>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-accent/50 rounded-lg border border-border/60">
                          <div className="flex items-center gap-3">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="font-medium">
                                {user!.emergencyContact.name || "Not specified"}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {user!.emergencyContact.relationship ||
                                  "Emergency Contact"}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">
                              {user!.emergencyContact.phone || "Not specified"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                {/* No Health Data Message */}
                {!user!.diabetesType &&
                  !user!.bloodSugarTargets &&
                  !user!.currentMedications?.length &&
                  !user!.dietaryPreferences?.length &&
                  !user!.emergencyContact && (
                    <div className="text-center py-8">
                      <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        No Health Information
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        Complete your health profile to get personalized
                        recommendations
                      </p>
                      <Button onClick={() => navigate("/onboarding")}>
                        Complete Health Profile
                      </Button>
                    </div>
                  )}
              </CardContent>
            </Card>

            {/* Account Actions */}
            <Card className="border-border/60">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Account Actions</CardTitle>
                    <CardDescription className="mt-1">
                      Manage your account settings and data
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 border border-border/60 rounded-lg hover:bg-accent/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-md bg-secondary flex items-center justify-center">
                        <Heart className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <h4 className="font-medium">Export Data</h4>
                        <p className="text-sm text-muted-foreground">
                          Download your health data for your healthcare provider
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => navigate("/export")}
                    >
                      Export PDF
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-4 border border-border/60 rounded-lg hover:bg-accent/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-md bg-secondary flex items-center justify-center">
                        <User className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <h4 className="font-medium">Sign Out</h4>
                        <p className="text-sm text-muted-foreground">
                          Sign out of your account on this device
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" onClick={logout}>
                      Sign Out
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </MainLayout>
      )}
    </ProtectedRoute>
  );
}
