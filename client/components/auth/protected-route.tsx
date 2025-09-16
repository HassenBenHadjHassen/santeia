// Protected route component that requires authentication
import { type ReactNode, useEffect } from "react";
import { useAuth } from "../../lib/auth-context";
import { useNavigate, useLocation } from "react-router";

interface ProtectedRouteProps {
  children: ReactNode;
  fallback?: ReactNode;
  requireOnboarding?: boolean;
}

export function ProtectedRoute({
  children,
  fallback,
  requireOnboarding = true,
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect to login when not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/login", { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  // Redirect to onboarding if user is authenticated but hasn't completed onboarding
  useEffect(() => {
    if (
      !isLoading &&
      isAuthenticated &&
      user &&
      requireOnboarding &&
      !user.onboardingCompleted &&
      location.pathname !== "/onboarding"
    ) {
      navigate("/onboarding", { replace: true });
    }
  }, [
    isAuthenticated,
    isLoading,
    user,
    requireOnboarding,
    navigate,
    location.pathname,
  ]);

  // Show loading state only while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, show fallback while redirecting
  if (!isAuthenticated) {
    return (
      fallback || (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Redirecting to login...</p>
          </div>
        </div>
      )
    );
  }

  return <>{children}</>;
}
