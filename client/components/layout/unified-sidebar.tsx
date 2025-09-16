"use client";

import { Link, useLocation } from "react-router";
import { cn } from "lib/utils";
import { Button } from "components/ui/button";
import { ScrollArea } from "components/ui/scroll-area";
import {
  Home,
  BookOpen,
  Pill,
  FileText,
  MessageSquare,
  Plus,
  Trash2,
  Heart,
} from "lucide-react";

const navigationItems = [
  {
    name: "Dashboard",
    href: "/",
    icon: Home,
    description: "Overview of your health data",
  },
  {
    name: "Health Diary",
    href: "/diary",
    icon: BookOpen,
    description: "Log meals, activities, and symptoms",
  },
  {
    name: "Medications",
    href: "/medications",
    icon: Pill,
    description: "Manage your medications",
  },
  {
    name: "Chat",
    href: "/chat",
    icon: MessageSquare,
    description: "Chat with your health assistant",
  },
  {
    name: "Export Data",
    href: "/export",
    icon: FileText,
    description: "Download your health reports",
  },
];

interface Conversation {
  id: string;
  title: string;
  updatedAt?: string;
}

interface UnifiedSidebarProps {
  className?: string;
  // Chat-specific props
  conversations?: Array<Conversation>;
  activeConversationId?: string | null;
  onSelectConversation?: (conversationId: string) => void;
  onNewConversation?: () => void;
  onDeleteConversation?: (conversationId: string) => void;
  isLoadingConversations?: boolean;
  // General props
  showChatFeatures?: boolean;
}

export function UnifiedSidebar({
  className,
  conversations = [],
  activeConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  isLoadingConversations = false,
  showChatFeatures = false,
}: UnifiedSidebarProps) {
  const location = useLocation();
  const currentPath = location.pathname;
  const isChatPage = currentPath === "/chat";

  return (
    <div className={cn("pb-12 h-full flex flex-col", className)}>
      <div className="space-y-4 py-4 flex-1 flex flex-col">
        {/* Main Navigation */}
        <div className="px-3 space-y-1">
          {navigationItems.map((item) => {
            const isActive = currentPath === item.href;
            const Icon = item.icon;

            return (
              <Button
                key={item.name}
                asChild
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start h-auto p-3",
                  isActive && "bg-secondary border border-border/60"
                )}
              >
                <Link to={item.href}>
                  <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                  <div className="flex flex-col items-start text-left">
                    <span className="text-sm font-medium">{item.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {item.description}
                    </span>
                  </div>
                </Link>
              </Button>
            );
          })}
        </div>

        {/* Chat-specific features - only show on chat page or when explicitly enabled */}
        {(isChatPage || showChatFeatures) && (
          <>
            <div className="px-3 space-y-2">
              <Button
                onClick={onNewConversation}
                className="w-full justify-start rounded-full"
                disabled={!onNewConversation}
              >
                <Plus className="mr-2 h-4 w-4" />
                Start New Chat
              </Button>
            </div>

            <div className="px-3 pt-2 text-xs text-muted-foreground">
              Recent conversations
            </div>
            <ScrollArea className="px-3 flex-1">
              <div className="space-y-1 py-1">
                {isLoadingConversations ? (
                  <div className="text-xs text-muted-foreground p-2">
                    Loading…
                  </div>
                ) : conversations.length === 0 ? (
                  <div className="text-xs text-muted-foreground p-2">
                    No conversations yet
                  </div>
                ) : (
                  conversations.map((c) => (
                    <div
                      key={c.id}
                      className={cn(
                        "w-full flex items-center justify-between rounded-xl px-3 py-2 cursor-pointer hover:bg-accent transition-colors",
                        c.id === activeConversationId &&
                          "bg-secondary border border-border/60"
                      )}
                      onClick={() => {
                        if (
                          c.id !== activeConversationId &&
                          onSelectConversation
                        ) {
                          onSelectConversation(c.id);
                        }
                      }}
                    >
                      <div className="flex items-center gap-2 min-w-0 pr-2">
                        <MessageSquare className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate text-sm whitespace-pre-wrap">
                          {c.title || "Untitled conversation"}
                        </span>
                      </div>
                      {onDeleteConversation && (
                        <button
                          type="button"
                          className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-background flex-shrink-0 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteConversation(c.id);
                          }}
                          aria-label="Delete conversation"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </>
        )}
      </div>
    </div>
  );
}
