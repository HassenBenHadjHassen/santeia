"use client";

import type { ReactNode } from "react";
import { useState, useEffect } from "react";
import { UnifiedSidebar } from "./unified-sidebar";
import { Header } from "./header";
import { cn } from "lib/utils";

interface Conversation {
  id: string;
  title: string;
  updatedAt?: string;
}

interface MainLayoutProps {
  children: ReactNode;
  user?: { name: string; email: string };
  // Chat-specific props
  conversations?: Array<Conversation>;
  activeConversationId?: string | null;
  onSelectConversation?: (conversationId: string) => void;
  onNewConversation?: () => void;
  onDeleteConversation?: (conversationId: string) => void;
  isLoadingConversations?: boolean;
  // Layout options
  showChatFeatures?: boolean;
  className?: string;
  // Content container options
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "4xl" | "6xl" | "full";
  padding?: "none" | "sm" | "md" | "lg";
  centered?: boolean;
}

export function MainLayout({
  children,
  user,
  conversations = [],
  activeConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  isLoadingConversations = false,
  showChatFeatures = false,
  className,
  maxWidth = "full",
  padding = "md",
  centered = false,
}: MainLayoutProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Close mobile sidebar when screen size changes to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Close mobile sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (
        isMobileSidebarOpen &&
        !target.closest("[data-mobile-sidebar]") &&
        !target.closest("[data-mobile-sidebar-trigger]")
      ) {
        setIsMobileSidebarOpen(false);
      }
    };

    if (isMobileSidebarOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isMobileSidebarOpen]);

  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "4xl": "max-w-4xl",
    "6xl": "max-w-6xl",
    full: "max-w-full",
  };

  const paddingClasses = {
    none: "",
    sm: "px-2 sm:px-4",
    md: "px-4 sm:px-6 lg:px-8",
    lg: "px-6 sm:px-8 lg:px-12",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div
        data-mobile-sidebar
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-80 transform transition-transform duration-300 ease-in-out lg:hidden",
          isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="h-full bg-background border-r border-border/50 shadow-2xl">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-4 border-b border-border/50">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <span className="text-primary font-bold text-sm">S</span>
                </div>
                <span className="text-lg font-semibold">SantéAI</span>
              </div>
              <button
                onClick={() => setIsMobileSidebarOpen(false)}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <UnifiedSidebar
                conversations={conversations}
                activeConversationId={activeConversationId}
                onSelectConversation={(id) => {
                  onSelectConversation?.(id);
                  setIsMobileSidebarOpen(false);
                }}
                onNewConversation={() => {
                  onNewConversation?.();
                  setIsMobileSidebarOpen(false);
                }}
                onDeleteConversation={onDeleteConversation}
                isLoadingConversations={isLoadingConversations}
                showChatFeatures={showChatFeatures}
                className="px-4 py-4"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-screen">
        {/* Desktop Sidebar */}
        <div className="hidden lg:flex lg:w-80 lg:flex-col lg:border-r lg:border-border/50 lg:bg-background/80 lg:backdrop-blur-sm">
          <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto">
              <UnifiedSidebar
                conversations={conversations}
                activeConversationId={activeConversationId}
                onSelectConversation={onSelectConversation}
                onNewConversation={onNewConversation}
                onDeleteConversation={onDeleteConversation}
                isLoadingConversations={isLoadingConversations}
                showChatFeatures={showChatFeatures}
                className="px-4 py-6"
              />
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <Header
            user={user}
            conversations={conversations}
            activeId={activeConversationId}
            onSelect={onSelectConversation}
            onNew={onNewConversation}
            onDelete={onDeleteConversation}
            isLoading={isLoadingConversations}
            showChatSidebar={showChatFeatures}
            onMobileMenuToggle={() => setIsMobileSidebarOpen(true)}
          />

          {/* Content Container */}
          <main className="flex-1 overflow-y-auto">
            <div
              className={cn("h-full", centered && "flex flex-col", className)}
            >
              {centered ? (
                <div
                  className={cn(
                    "flex-1 w-full",
                    maxWidthClasses[maxWidth],
                    paddingClasses[padding],
                    "mx-auto"
                  )}
                >
                  <div className="mt-6">{children}</div>
                </div>
              ) : (
                <div className={cn("h-full", paddingClasses[padding])}>
                  <div className="mt-6">{children}</div>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
