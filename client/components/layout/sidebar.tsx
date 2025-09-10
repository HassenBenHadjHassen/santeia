"use client";

import { cn } from "lib/utils";
import { Heart, Plus, MessageSquare, Trash2 } from "lucide-react";
import { Button } from "components/ui/button";
import { ScrollArea } from "components/ui/scroll-area";

interface SidebarProps {
  className?: string;
  conversations: Array<{ id: string; title: string; updatedAt?: string }>;
  activeId?: string | null;
  onSelect: (conversationId: string) => void;
  onNew: () => void;
  isLoading?: boolean;
  onDelete?: (conversationId: string) => void;
}

export function Sidebar({
  className,
  conversations,
  activeId,
  onSelect,
  onNew,
  isLoading,
  onDelete,
}: SidebarProps) {
  return (
    <div className={cn("pb-12", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="flex items-center gap-2 mb-3">
            <Heart className="h-5 w-5 text-primary" />
            <span className="text-base font-semibold tracking-tight">
              SantéAI
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            Your personal health assistant
          </p>
        </div>

        <div className="px-3">
          <Button onClick={onNew} className="w-full justify-start rounded-full">
            <Plus className="mr-2 h-4 w-4" />
            Start New Chat
          </Button>
        </div>

        <div className="px-3 pt-2 text-xs text-muted-foreground">
          Recent conversations
        </div>
        <ScrollArea className="px-3">
          <div className="space-y-1 py-1">
            {isLoading ? (
              <div className="text-xs text-muted-foreground p-2">Loading…</div>
            ) : conversations.length === 0 ? (
              <div className="text-xs text-muted-foreground p-2">
                No conversations yet
              </div>
            ) : (
              conversations.map((c) => (
                <div
                  key={c.id}
                  className={cn(
                    "w-full flex items-center justify-between rounded-xl px-3 py-2 cursor-pointer hover:bg-accent",
                    c.id === activeId && "bg-secondary border border-border/60"
                  )}
                  onClick={() => {
                    if (c.id !== activeId) onSelect(c.id);
                  }}
                >
                  <div className="flex items-center gap-2 min-w-0 pr-2">
                    <MessageSquare className="h-4 w-4" />
                    <span className="truncate">
                      {c.title || "Untitled conversation"}
                    </span>
                  </div>
                  {onDelete && (
                    <button
                      type="button"
                      className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-background"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(c.id);
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
      </div>
    </div>
  );
}
