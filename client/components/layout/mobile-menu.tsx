"use client";

import { useState } from "react";
import { Button } from "components/ui/button";
import { Heart, Menu, X, Plus } from "lucide-react";
import { Link } from "react-router";

export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);

  const navigation = [{ name: "New Chat", to: "/", icon: Plus }];

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={() => setIsOpen(true)}
      >
        <Menu className="h-6 w-6" />
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-64 bg-background border-r">
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center space-x-2">
                <Heart className="h-6 w-6 text-primary" />
                <span className="text-lg font-semibold">SantéAI</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-6 w-6" />
              </Button>
            </div>

            <nav className="p-4 space-y-2">
              <Button asChild className="w-full justify-start">
                <Link to="/" onClick={() => setIsOpen(false)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Start New Chat
                </Link>
              </Button>

              {navigation.map((item) => (
                <Button
                  key={item.name}
                  variant="ghost"
                  className="w-full justify-start"
                  asChild
                >
                  <Link to={item.to} onClick={() => setIsOpen(false)}>
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.name}
                  </Link>
                </Button>
              ))}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
