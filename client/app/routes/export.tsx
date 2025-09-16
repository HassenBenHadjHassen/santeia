import { PDFExport } from "../../components/health/pdf-export";
import { useAuth } from "../../lib/auth-context";
import { MainLayout } from "../../components/layout/main-layout";
import { FileText } from "lucide-react";
import { ProtectedRoute } from "../../components/auth/protected-route";

export function meta() {
  return [
    { title: "Export Health Report - SantéAI" },
    { name: "description", content: "Export your health data as a PDF report" },
  ];
}

export default function Export() {
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
                Export Health Report
              </h1>
              <p className="text-muted-foreground">
                Generate a comprehensive PDF report of your health data for your
                healthcare provider
              </p>
            </div>
          </div>

          <PDFExport userId={user.id} />
        </MainLayout>
      )}
    </ProtectedRoute>
  );
}
