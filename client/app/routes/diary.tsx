import { FoodActivityDiary } from "../../components/health/food-activity-diary";
import { MainLayout } from "../../components/layout/main-layout";
import { useAuth } from "../../lib/auth-context";
import { ProtectedRoute } from "../../components/auth/protected-route";

export function meta() {
  return [
    { title: "Health Diary - SantéAI" },
    { name: "description", content: "Log meals, activities, and symptoms" },
  ];
}

export default function Diary() {
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
              Health Diary
            </h1>
            <p className="text-muted-foreground">
              Log meals, activities, and symptoms
            </p>
          </div>
        </div>

        <FoodActivityDiary />
      </MainLayout>
    </ProtectedRoute>
  );
}
