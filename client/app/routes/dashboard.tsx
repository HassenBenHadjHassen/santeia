import { HealthDashboard } from "../../components/health/health-dashboard";
import { MainLayout } from "../../components/layout/main-layout";
import { useAuth } from "../../lib/auth-context";
import { ProtectedRoute } from "../../components/auth/protected-route";
import { authService } from "../../lib/auth";
import { useTranslation } from "react-i18next";
import type { Route } from "./+types/dashboard";

export function meta() {
  return [
    { title: "Dashboard - SantéAI" },
    {
      name: "description",
      content: "Overview of your health data and metrics",
    },
  ];
}

export async function clientLoader() {
  // Pre-load user health data for better UX
  const token = authService.getToken();
  if (!token) {
    return { healthData: null };
  }

  try {
    // You can add health data pre-loading here
    // For now, we'll just return a placeholder
    return { healthData: null };
  } catch (error) {
    console.error("Failed to pre-load health data:", error);
    return { healthData: null };
  }
}

// Mark the clientLoader to run during hydration
clientLoader.hydrate = true;

export default function Dashboard({ loaderData }: Route.ComponentProps) {
  const { user } = useAuth();
  const { t } = useTranslation();

  const handleMetricAdded = (metric: any) => {
    // This could trigger a refresh of the dashboard
    console.log("New metric added:", metric);
  };

  return (
    <ProtectedRoute>
      <MainLayout
        user={user ? { name: user.name, email: user.email } : undefined}
        showChatFeatures={false}
        maxWidth="full"
        padding="lg"
        centered={false}
      >
        {/* Header */}
        <div className="mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {t("dashboard.title")}
            </h1>
            <p className="text-muted-foreground">
              {t("dashboard.description")}
            </p>
          </div>
        </div>

        <HealthDashboard onMetricAdded={handleMetricAdded} />
      </MainLayout>
    </ProtectedRoute>
  );
}
