"use client";

import { Button } from "components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "components/ui/dropdown-menu";
import { MobileMenu } from "./mobile-menu";
import { Heart, Settings, LogOut, User } from "lucide-react";
import { Link } from "react-router";

interface HeaderProps {
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
}

export function Header({ user }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/60 backdrop-blur-md supports-[backdrop-filter]:bg-background/40">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="flex items-center gap-2 rounded-full px-3 py-1.5 hover:bg-accent transition"
          >
            <Heart className="h-6 w-6 text-primary" />
            <span className="text-base font-semibold tracking-tight">
              SantéAI
            </span>
          </Link>
          <MobileMenu />
        </div>

        <nav className="hidden md:flex items-center gap-2 rounded-full bg-secondary/60 p-1">
          <Link
            to="/chat"
            className="px-3 py-1.5 text-sm font-medium rounded-full transition-colors hover:bg-background"
          >
            Chat
          </Link>
          <Link
            to="/dashboard"
            className="px-3 py-1.5 text-sm font-medium rounded-full transition-colors hover:bg-background"
          >
            Dashboard
          </Link>
          <Link
            to="/insights"
            className="px-3 py-1.5 text-sm font-medium rounded-full transition-colors hover:bg-background"
          >
            Insights
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-9 w-9 rounded-full border border-border/60 bg-background/40 backdrop-blur"
                >
                  <Avatar className="h-9 w-9">
                    <AvatarImage
                      src={user.avatar || "/placeholder.svg"}
                      alt={user.name}
                    />
                    <AvatarFallback>
                      {user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user.name}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/settings" className="flex items-center">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" asChild className="rounded-full">
                <Link to="/login">Log in</Link>
              </Button>
              <Button asChild className="rounded-full">
                <Link to="/signup">Sign up</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
