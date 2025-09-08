"use client";

import { Button } from "components/ui/button";
import { MobileMenu } from "./mobile-menu";
import { Heart } from "lucide-react";
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
            to="/"
            className="px-3 py-1.5 text-sm font-medium rounded-full transition-colors hover:bg-background"
          >
            Chat
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <></>
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
