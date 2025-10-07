import { PDFExport } from "../../components/health/pdf-export";
import { useAuth } from "../../lib/auth-context";
import { MainLayout } from "../../components/layout/main-layout";
import { FileText, Brain, AlertTriangle, Target } from "lucide-react";
import { ProtectedRoute } from "../../components/auth/protected-route";
import { useTranslation } from "react-i18next";

export function meta() {
  return [
    { title: "Export Health Report - SantéAI" },
    { name: "description", content: "Export your health data as a PDF report" },
  ];
}

export default function Export() {
  const { t } = useTranslation();
  const { user } = useAuth();

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
                {t("export.title")}
              </h1>
              <p className="text-muted-foreground">{t("export.description")}</p>
            </div>
          </div>

          {/* Features Overview */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-foreground mb-4">
              {t("export.whatsIncluded")}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <FileText className="h-5 w-5 text-blue-600" />
                <div>
                  <h3 className="font-medium text-sm">
                    {t("export.features.healthData.title")}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {t("export.features.healthData.description")}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <Brain className="h-5 w-5 text-green-600" />
                <div>
                  <h3 className="font-medium text-sm">
                    {t("export.features.aiSummary.title")}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {t("export.features.aiSummary.description")}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                <div>
                  <h3 className="font-medium text-sm">
                    {t("export.features.alertsInsights.title")}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {t("export.features.alertsInsights.description")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <PDFExport userId={user.id} />
        </MainLayout>
      )}
    </ProtectedRoute>
  );
}
