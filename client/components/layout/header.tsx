"use client";

import { useState, useEffect } from "react";
import { Button } from "components/ui/button";
import {
  Heart,
  User,
  ChevronDown,
  LogOut,
  UserCircle,
  Menu,
} from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router";
import { Avatar, AvatarFallback } from "components/ui/avatar";
import { useAuth } from "../../lib/auth-context";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "../ui/language-switcher";

interface HeaderProps {
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
  conversations?: Array<{ id: string; title: string; updatedAt?: string }>;
  activeId?: string | null;
  onSelect?: (conversationId: string) => void;
  onNew?: () => void;
  onDelete?: (conversationId: string) => void;
  isLoading?: boolean;
  showChatSidebar?: boolean;
  onMobileMenuToggle?: () => void;
}

export function Header({
  user,
  conversations,
  activeId,
  onSelect,
  onNew,
  onDelete,
  isLoading,
  showChatSidebar = false,
  onMobileMenuToggle,
}: HeaderProps) {
  const { user: authUser, logout } = useAuth();
  const { t } = useTranslation();
  const [theme, setTheme] = useState<"light" | "dark">(() =>
    typeof document !== "undefined" &&
    document.documentElement.classList.contains("dark")
      ? "dark"
      : (localStorage.getItem("theme") as "light" | "dark") || "light"
  );
  const navigate = useNavigate();
  const location = useLocation();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  // Get current page name for display
  const getPageName = () => {
    const path = location.pathname;
    switch (path) {
      case "/":
        return {
          name: t("navigation.dashboard"),
          description: t("dashboard.description"),
        };
      case "/diary":
        return {
          name: t("navigation.diary"),
          description: t("diary.description"),
        };
      case "/medications":
        return {
          name: t("navigation.medications"),
          description: t("medications.description"),
        };
      case "/chat":
        return {
          name: t("navigation.chat"),
          description: t("chat.description"),
        };
      case "/export":
        return {
          name: t("navigation.export"),
          description: t("export.description"),
        };
      case "/profile":
        return {
          name: t("navigation.profile"),
          description: t("profile.description"),
        };
      case "/onboarding":
        return {
          name: t("navigation.onboarding"),
          description: t("onboarding.description"),
        };
      default:
        return {
          name: t("app.name"),
          description: t("app.description"),
        };
    }
  };

  const currentPage = getPageName();

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (isProfileMenuOpen && !target.closest("[data-profile-menu]")) {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isProfileMenuOpen]);

  const handleProfileMenuToggle = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
  };

  const handleViewProfile = () => {
    setIsProfileMenuOpen(false);
    navigate("/profile");
  };

  const handleLogout = () => {
    setIsProfileMenuOpen(false);
    logout();
  };

  const currentUser = authUser || user;

  // Sync theme to html class & localStorage
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  return (
    <>
      <header className="sticky top-0 z-30 w-full border-b border-border/50 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center justify-between px-4 lg:px-6">
          {/* Left: Mobile Menu Button & SantéAI Logo */}
          <div className="flex items-center gap-3">
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={onMobileMenuToggle}
              data-mobile-sidebar-trigger
            >
              <Menu className="h-5 w-5" />
            </Button>

            {/* Logo */}
            <Link
              to="/"
              className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-accent/50 transition-colors"
            >
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Heart className="h-4 w-4 text-primary" />
              </div>
              <div className="hidden sm:block">
                <span className="text-lg font-bold">{t("app.name")}</span>
                <p className="text-xs text-muted-foreground -mt-1">
                  {t("app.tagline")}
                </p>
              </div>
            </Link>
          </div>

          {/* Center: Page Name - Hidden on mobile, visible on tablet+ */}
          <div className="hidden md:flex flex-1 justify-center">
            <div className="text-center">
              <h1 className="text-lg font-semibold text-foreground">
                {currentPage.name}
              </h1>
              <p className="text-xs text-muted-foreground">
                {currentPage.description}
              </p>
            </div>
          </div>

          {/* Right: Language + Theme + Profile */}
          <div className="flex items-center gap-2">
            {/* Language Switcher */}
            <LanguageSwitcher />

            {/* Theme Switcher */}
            <Button
              variant="ghost"
              size="icon"
              aria-label="Toggle theme"
              onClick={toggleTheme}
              className="rounded-lg hover:bg-accent/50 relative"
            >
              {/* Sun */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className={`h-5 w-5 text-yellow-500 transition-all duration-300 ${
                  theme === "dark"
                    ? "scale-0 rotate-90 opacity-0"
                    : "scale-100 opacity-100"
                }`}
              >
                <path d="M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12Zm0 4a1 1 0 0 1-1-1v-1a1 1 0 1 1 2 0v1a1 1 0 0 1-1 1Zm0-18a1 1 0 0 1-1-1V2a1 1 0 1 1 2 0v1a1 1 0 0 1-1 1Zm10 7h-1a1 1 0 1 1 0-2h1a1 1 0 1 1 0 2ZM3 12H2a1 1 0 1 1 0-2h1a1 1 0 1 1 0 2Zm15.07 7.07a1 1 0 0 1-1.41 1.41l-.71-.7a1 1 0 1 1 1.41-1.42l.71.71Zm-12.02 0 .71-.71a1 1 0 1 1 1.41 1.42l-.71.7a1 1 0 1 1-1.41-1.41ZM17.66 5.64a1 1 0 0 1 0 1.41l-.71.71a1 1 0 0 1-1.41-1.41l.71-.71a1 1 0 0 1 1.41 0ZM6.05 5.64l.71.71A1 1 0 1 1 5.35 7.77l-.71-.71A1 1 0 1 1 6.05 5.64Z" />
              </svg>
              {/* Moon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className={`absolute h-5 w-5 text-gray-500 transition-all duration-300 ${
                  theme === "dark"
                    ? "scale-100 opacity-100"
                    : "scale-0 -rotate-90 opacity-0"
                }`}
              >
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
              </svg>
            </Button>
            {currentUser ? (
              <div className="relative" data-profile-menu>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleProfileMenuToggle}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-accent/50"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
                      {currentUser.name ? (
                        currentUser.name.charAt(0).toUpperCase()
                      ) : (
                        <User className="h-4 w-4" />
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden sm:block text-left">
                    <span className="text-sm font-medium block">
                      {currentUser.name || "User"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {currentUser.email}
                    </span>
                  </div>
                  <ChevronDown className="h-4 w-4 hidden sm:block" />
                </Button>

                {isProfileMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-popover/95 border border-border/50 rounded-xl shadow-xl z-50 backdrop-blur-sm">
                    <div className="p-3">
                      <div className="px-3 py-2 border-b border-border/50 mb-2">
                        <p className="text-sm font-medium truncate">
                          {currentUser.name || "User"}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {currentUser.email}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleViewProfile}
                          className="w-full justify-start rounded-lg text-sm h-9"
                        >
                          <UserCircle className="h-4 w-4 mr-3" />
                          {t("auth.viewProfile")}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleLogout}
                          className="w-full justify-start rounded-lg text-sm h-9 text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <LogOut className="h-4 w-4 mr-3" />
                          {t("navigation.logout")}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  asChild
                  className="rounded-lg text-sm px-4 py-2"
                >
                  <Link to="/login">{t("navigation.login")}</Link>
                </Button>
                <Button asChild className="rounded-lg text-sm px-4 py-2">
                  <Link to="/signup">{t("navigation.signup")}</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
