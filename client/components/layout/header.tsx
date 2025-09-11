"use client";

import { useState, useEffect } from "react";
import { Button } from "components/ui/button";
import { MobileMenu } from "./mobile-menu";
import { Heart, User, ChevronDown, LogOut, UserCircle } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { Avatar, AvatarFallback } from "components/ui/avatar";
import { useAuth } from "../../lib/auth-context";

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
}

export function Header({
  user,
  conversations,
  activeId,
  onSelect,
  onNew,
  onDelete,
  isLoading,
}: HeaderProps) {
  const { user: authUser, logout } = useAuth();
  const navigate = useNavigate();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

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

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/60 backdrop-blur-md supports-[backdrop-filter]:bg-background/40">
      <div className="container flex h-14 sm:h-16 items-center justify-between px-3 sm:px-4">
        {/* Left: SantéAI Logo & Mobile Menu */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            to="/"
            className="flex items-center gap-1.5 sm:gap-2 rounded-full px-2 sm:px-3 py-1.5 hover:bg-accent transition"
          >
            <Heart className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            <span className="text-sm sm:text-base font-semibold tracking-tight">
              SantéAI
            </span>
          </Link>
          <MobileMenu
            conversations={conversations}
            activeId={activeId}
            onSelect={onSelect}
            onNew={onNew}
            onDelete={onDelete}
            isLoading={isLoading}
          />
        </div>

        {/* Center: Page Name - Hidden on mobile, visible on tablet+ */}
        <div className="hidden md:flex flex-1 justify-center">
          <div className="text-center">
            <h1 className="text-lg font-semibold text-foreground">Chat</h1>
            <p className="text-xs text-muted-foreground">
              Ask me anything about your health
            </p>
          </div>
        </div>

        {/* Right: Profile Menu or Auth Buttons */}
        <div className="flex items-center gap-1 sm:gap-2">
          {currentUser ? (
            <div className="relative" data-profile-menu>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleProfileMenuToggle}
                className="flex items-center gap-1 sm:gap-2 rounded-full px-2 sm:px-3"
              >
                <Avatar className="h-6 w-6 sm:h-7 sm:w-7">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    {currentUser.name ? (
                      currentUser.name.charAt(0).toUpperCase()
                    ) : (
                      <User className="h-3 w-3" />
                    )}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden lg:inline text-sm font-medium">
                  {currentUser.name || "User"}
                </span>
                <ChevronDown className="h-3 w-3 hidden sm:block" />
              </Button>

              {isProfileMenuOpen && (
                <div
                  className="absolute right-0 top-full mt-2 w-44 sm:w-48 bg-background border border-border rounded-lg shadow-lg z-50 bg-black"
                >
                  <div className="p-2">
                    <div className="px-3 py-2 border-b border-border">
                      <p className="text-sm font-medium truncate">
                        {currentUser.name || "User"}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {currentUser.email}
                      </p>
                    </div>
                    <div className="py-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleViewProfile}
                        className="w-full justify-start rounded-md text-sm"
                      >
                        <UserCircle className="h-4 w-4 mr-2" />
                        View Profile
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleLogout}
                        className="w-full justify-start rounded-md text-sm text-destructive hover:text-destructive"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1 sm:gap-2">
              <Button
                variant="ghost"
                asChild
                className="rounded-full text-sm px-2 sm:px-3"
              >
                <Link to="/login">Log in</Link>
              </Button>
              <Button asChild className="rounded-full text-sm px-2 sm:px-3">
                <Link to="/signup">Sign up</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
