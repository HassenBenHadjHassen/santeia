import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Safely parses a date string and returns a valid Date object or fallback
 * @param dateString - The date string to parse
 * @param fallback - Fallback date if parsing fails (defaults to current date)
 * @returns A valid Date object
 */
export function safeParseDate(
  dateString: string | null | undefined,
  fallback?: Date
): Date {
  if (!dateString) {
    return fallback || new Date();
  }

  const parsed = new Date(dateString);

  // Check if the parsed date is valid
  if (isNaN(parsed.getTime())) {
    console.warn(`Invalid date string: ${dateString}, using fallback`);
    return fallback || new Date();
  }

  return parsed;
}
