import { cn } from "../../lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function LoadingSpinner({
  size = "md",
  className,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  return (
    <div
      className={cn(
        "animate-spin rounded-full border-2 border-muted border-t-primary",
        sizeClasses[size],
        className
      )}
    />
  );
}

interface LoadingSkeletonProps {
  className?: string;
  lines?: number;
}

export function LoadingSkeleton({
  className,
  lines = 3,
}: LoadingSkeletonProps) {
  // Use deterministic widths to avoid hydration mismatch
  const widths = ["85%", "70%", "90%", "65%", "80%", "75%", "95%", "60%"];

  return (
    <div className={cn("space-y-3", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-4 bg-muted rounded animate-pulse"
          style={{
            width: widths[i % widths.length],
          }}
        />
      ))}
    </div>
  );
}

interface PageLoadingProps {
  title?: string;
  description?: string;
  showSkeleton?: boolean;
  className?: string;
}

export function PageLoading({
  title = "Loading...",
  description,
  showSkeleton = true,
  className,
}: PageLoadingProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center min-h-[400px] p-8",
        className
      )}
    >
      <LoadingSpinner size="lg" className="mb-4" />
      <h2 className="text-xl font-semibold text-foreground mb-2">{title}</h2>
      {description && (
        <p className="text-muted-foreground text-center max-w-md">
          {description}
        </p>
      )}
      {showSkeleton && (
        <div className="w-full max-w-md mt-6">
          <LoadingSkeleton lines={4} />
        </div>
      )}
    </div>
  );
}

interface HydrateFallbackProps {
  title?: string;
  description?: string;
  showSkeleton?: boolean;
  className?: string;
}

export function HydrateFallback({
  title = "Loading...",
  description = "Please wait while we load your data",
  showSkeleton = true,
  className,
}: HydrateFallbackProps) {
  return (
    <div className={cn("min-h-screen bg-background", className)}>
      <div className="container mx-auto px-4 py-8">
        <PageLoading
          title={title}
          description={description}
          showSkeleton={showSkeleton}
        />
      </div>
    </div>
  );
}
