"use client";

import { cn } from "lib/utils";
import { Heart, Plus } from "lucide-react";
import { Button } from "components/ui/button";
import { ScrollArea } from "components/ui/scroll-area";
import { Link, useLocation } from "react-router";

interface SidebarProps {
  className?: string;
}

const navigation = [{ name: "New Chat", to: "/", icon: Plus }];

export function Sidebar({ className }: SidebarProps) {
  const pathname = useLocation();

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
          <Button asChild className="w-full justify-start rounded-full">
            <Link to="/">
              <Plus className="mr-2 h-4 w-4" />
              Start New Chat
            </Link>
          </Button>
        </div>

        <ScrollArea className="px-3">
          <div className="space-y-1">
            {navigation.map((item) => {
              const isActive = pathname.pathname === item.to;
              return (
                <Button
                  key={item.name}
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start rounded-xl",
                    isActive && "bg-secondary border border-border/60"
                  )}
                  asChild
                >
                  <Link to={item.to}>
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.name}
                  </Link>
                </Button>
              );
            })}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
