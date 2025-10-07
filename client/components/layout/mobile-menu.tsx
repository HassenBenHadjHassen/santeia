"use client";

import { useState } from "react";
import { Button } from "components/ui/button";
import {
  Heart,
  Menu,
  X,
  Plus,
  MessageSquare,
  Trash2,
  User,
  Home,
  BookOpen,
  Pill,
  BarChart3,
  FileText,
  Bot,
  Calendar,
} from "lucide-react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";

interface MobileMenuProps {
  conversations?: Array<{ id: string; title: string; updatedAt?: string }>;
  activeId?: string | null;
  onSelect?: (conversationId: string) => void;
  onNew?: () => void;
  onDelete?: (conversationId: string) => void;
  isLoading?: boolean;
}

export function MobileMenu({
  conversations = [],
  activeId,
  onSelect,
  onNew,
  onDelete,
  isLoading,
}: MobileMenuProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (conversationId: string) => {
    onSelect?.(conversationId);
    setIsOpen(false);
  };

  const handleNew = () => {
    onNew?.();
    setIsOpen(false);
  };

  const handleDelete = (conversationId: string) => {
    onDelete?.(conversationId);
    setIsOpen(false);
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={() => setIsOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-72 sm:w-80 bg-background border-r shadow-xl">
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center space-x-2">
                <Heart className="h-6 w-6 text-primary" />
                <span className="text-lg font-semibold">
                  {t("mobileMenu.appName")}
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-6 w-6" />
              </Button>
            </div>

            <div className="flex flex-col h-full">
              {/* Main Navigation */}
              <div className="p-3 border-b">
                <div className="space-y-1">
                  <Button
                    asChild
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => setIsOpen(false)}
                  >
                    <Link to="/">
                      <Home className="mr-2 h-4 w-4" />
                      {t("mobileMenu.navigation.dashboard")}
                    </Link>
                  </Button>
                  {/* <Button
                    asChild
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => setIsOpen(false)}
                  >
                    <Link to="/diary">
                      <BookOpen className="mr-2 h-4 w-4" />
                      Health Diary
                    </Link>
                  </Button> */}
                  {/* <Button
                    asChild
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => setIsOpen(false)}
                  >
                    <Link to="/medications">
                      <Pill className="mr-2 h-4 w-4" />
                      Medications
                    </Link>
                  </Button> */}
                  <Button
                    asChild
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => setIsOpen(false)}
                  >
                    <Link to="/chat">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      {t("mobileMenu.navigation.chat")}
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => setIsOpen(false)}
                  >
                    <Link to="/export">
                      <FileText className="mr-2 h-4 w-4" />
                      {t("mobileMenu.navigation.export")}
                    </Link>
                  </Button>
                </div>
              </div>

              {/* New Chat Button - Only show if conversations are provided */}
              {conversations && (
                <div className="p-3 border-b">
                  <Button
                    onClick={handleNew}
                    className="w-full justify-start rounded-full"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    {t("sidebar.chat.startNewChat")}
                  </Button>
                </div>
              )}

              {/* Conversations List - Only show if conversations are provided */}
              {conversations && (
                <div className="flex-1 overflow-y-auto">
                  <div className="px-3 py-2 text-xs text-muted-foreground">
                    {t("sidebar.chat.recentConversations")}
                  </div>
                  <div className="px-3 space-y-1">
                    {isLoading ? (
                      <div className="text-xs text-muted-foreground p-2">
                        {t("sidebar.chat.loading")}
                      </div>
                    ) : conversations.length === 0 ? (
                      <div className="text-xs text-muted-foreground p-2">
                        {t("sidebar.chat.noConversations")}
                      </div>
                    ) : (
                      conversations.map((c) => (
                        <div
                          key={c.id}
                          className={`w-full flex items-center justify-between rounded-xl px-3 py-2 cursor-pointer hover:bg-accent ${
                            c.id === activeId &&
                            "bg-secondary border border-border/60"
                          }`}
                          onClick={() => handleSelect(c.id)}
                        >
                          <div className="flex items-center gap-2 min-w-0 pr-2">
                            <MessageSquare className="h-4 w-4 flex-shrink-0" />
                            <span className="truncate text-sm">
                              {c.title ||
                                t("sidebar.chat.untitledConversation")}
                            </span>
                          </div>
                          {onDelete && (
                            <button
                              type="button"
                              className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-background flex-shrink-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(c.id);
                              }}
                              aria-label={t("sidebar.chat.deleteConversation")}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Profile Link */}
              <div className="p-3 border-t">
                <Button
                  asChild
                  variant="outline"
                  className="w-full justify-start rounded-full"
                >
                  <Link to="/profile" onClick={() => setIsOpen(false)}>
                    <User className="mr-2 h-4 w-4" />
                    {t("mobileMenu.navigation.profile")}
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
