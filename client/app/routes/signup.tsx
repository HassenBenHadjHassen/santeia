import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { Button } from "components/ui/button";
import { Input } from "components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "components/ui/card";
import { Heart, Eye, EyeOff, Check, ArrowLeft } from "lucide-react";
import { useAuth } from "../../lib/auth-context";
import { useTranslation } from "react-i18next";

export function meta() {
  return [
    { title: "Sign Up - SantéAI" },
    { name: "description", content: "Create your SantéAI account" },
  ];
}

export default function Signup() {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const navigate = useNavigate();
  const { signup, error, clearError, isAuthenticated, isLoading } = useAuth();

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    clearError();
    setValidationErrors([]);

    // Client-side validation
    const errors: string[] = [];
    if (formData.password !== formData.confirmPassword) {
      errors.push(t("signup.validationErrors.passwordsDontMatch"));
    }
    if (!formData.agreeToTerms) {
      errors.push(t("signup.validationErrors.agreeToTerms"));
    }
    if (formData.password.length < 8) {
      errors.push(t("signup.validationErrors.passwordTooShort"));
    }

    if (errors.length > 0) {
      setValidationErrors(errors);
      setIsSubmitting(false);
      return;
    }

    try {
      await signup({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
      });
      navigate("/onboarding");
    } catch (err) {
      // Error is handled by the auth context
      console.error("Signup error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]:
        e.target.type === "checkbox" ? e.target.checked : e.target.value,
    }));
  };

  const passwordRequirements = [
    {
      text: t("signup.passwordRequirementsList.minLength"),
      met: formData.password.length >= 8,
    },
    {
      text: t("signup.passwordRequirementsList.uppercase"),
      met: /[A-Z]/.test(formData.password),
    },
    {
      text: t("signup.passwordRequirementsList.lowercase"),
      met: /[a-z]/.test(formData.password),
    },
    {
      text: t("signup.passwordRequirementsList.number"),
      met: /\d/.test(formData.password),
    },
  ];

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Heart className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {t("signup.createAccount")}
            </h1>
            <p className="text-muted-foreground text-lg">
              {t("signup.joinSanteAI")}
            </p>
          </div>
        </div>

        <div className="max-w-md mx-auto">
          <Card className="border-border/60 shadow-lg">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-xl">
                {t("signup.getStarted")}
              </CardTitle>
              <CardDescription>{t("signup.fillInformation")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {(error || validationErrors.length > 0) && (
                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                  {error && (
                    <p className="text-sm text-destructive font-medium">
                      {error}
                    </p>
                  )}
                  {validationErrors.map((err, index) => (
                    <p key={index} className="text-sm text-destructive">
                      {err}
                    </p>
                  ))}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label
                      htmlFor="firstName"
                      className="text-sm font-medium text-foreground"
                    >
                      {t("signup.firstName")}
                    </label>
                    <Input
                      id="firstName"
                      name="firstName"
                      placeholder={t("signup.firstNamePlaceholder")}
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                      className="border-border/60 focus:border-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <label
                      htmlFor="lastName"
                      className="text-sm font-medium text-foreground"
                    >
                      {t("signup.lastName")}
                    </label>
                    <Input
                      id="lastName"
                      name="lastName"
                      placeholder={t("signup.lastNamePlaceholder")}
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                      className="border-border/60 focus:border-primary"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="text-sm font-medium text-foreground"
                  >
                    {t("signup.emailAddress")}
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder={t("signup.emailPlaceholder")}
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="border-border/60 focus:border-primary"
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="password"
                    className="text-sm font-medium text-foreground"
                  >
                    {t("signup.password")}
                  </label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder={t("signup.createStrongPassword")}
                      value={formData.password}
                      onChange={handleChange}
                      required
                      className="border-border/60 focus:border-primary pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>

                  {formData.password && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground">
                        {t("signup.passwordRequirements")}
                      </p>
                      <div className="space-y-1">
                        {passwordRequirements.map((req, index) => (
                          <div
                            key={index}
                            className="flex items-center space-x-2 text-xs"
                          >
                            <Check
                              className={`h-3 w-3 ${
                                req.met
                                  ? "text-green-500"
                                  : "text-muted-foreground"
                              }`}
                            />
                            <span
                              className={
                                req.met
                                  ? "text-green-600 dark:text-green-400"
                                  : "text-muted-foreground"
                              }
                            >
                              {req.text}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="confirmPassword"
                    className="text-sm font-medium text-foreground"
                  >
                    {t("signup.confirmPassword")}
                  </label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder={t("signup.confirmPasswordPlaceholder")}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      className="border-border/60 focus:border-primary pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {formData.confirmPassword &&
                    formData.password !== formData.confirmPassword && (
                      <p className="text-xs text-destructive">
                        {t("signup.passwordsDontMatch")}
                      </p>
                    )}
                </div>

                <div className="flex items-start space-x-3">
                  <input
                    id="agreeToTerms"
                    name="agreeToTerms"
                    type="checkbox"
                    checked={formData.agreeToTerms}
                    onChange={handleChange}
                    className="mt-1 rounded border-border/60 focus:ring-primary focus:ring-2"
                    required
                  />
                  <label
                    htmlFor="agreeToTerms"
                    className="text-sm text-muted-foreground leading-relaxed"
                  >
                    {t("signup.agreeToTerms")}{" "}
                    <Link to="/terms" className="text-primary hover:underline">
                      {t("signup.termsOfService")}
                    </Link>{" "}
                    {t("signup.and")}{" "}
                    <Link
                      to="/privacy"
                      className="text-primary hover:underline"
                    >
                      {t("signup.privacyPolicy")}
                    </Link>
                  </label>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? t("signup.creatingAccount")
                    : t("signup.createAccount")}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  {t("signup.alreadyHaveAccount")}{" "}
                  <Link
                    to="/login"
                    className="text-primary hover:underline font-medium"
                  >
                    {t("signup.signIn")}
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
