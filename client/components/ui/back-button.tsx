"use client";

import { useNavigate } from "react-router";
import { Button } from "./button";
import { ArrowLeft } from "lucide-react";

interface BackButtonProps {
  className?: string;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  size?: "default" | "sm" | "lg" | "icon";
  children?: React.ReactNode;
}

export function BackButton({
  className,
  variant = "ghost",
  size = "sm",
  children = "Back",
}: BackButtonProps) {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleGoBack}
      className={`flex items-center gap-2 text-muted-foreground hover:text-foreground ${className}`}
    >
      <ArrowLeft className="h-4 w-4" />
      {children}
    </Button>
  );
}
