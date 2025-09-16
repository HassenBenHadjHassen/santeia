import { MedicationManagement } from "../../components/health/medication-management";
import { MainLayout } from "../../components/layout/main-layout";
import { useAuth } from "../../lib/auth-context";
import { ProtectedRoute } from "../../components/auth/protected-route";

export function meta() {
  return [
    { title: "Medications - SantéAI" },
    { name: "description", content: "Manage your medications and dosages" },
  ];
}

export default function Medications() {
  const { user } = useAuth();

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
              Medications
            </h1>
            <p className="text-muted-foreground">
              Manage your medications and dosages
            </p>
          </div>
        </div>

        <MedicationManagement />
      </MainLayout>
    </ProtectedRoute>
  );
}
