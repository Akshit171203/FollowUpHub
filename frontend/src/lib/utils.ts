import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Validates that an ID is a valid non-empty string
 * Returns false for undefined, null, empty strings, or string literals like "undefined"/"null"
 */
export function isValidId(id: any): id is string {
  return (
    typeof id === 'string' &&
    id.trim().length > 0 &&
    id !== 'undefined' &&
    id !== 'null'
  );
}
