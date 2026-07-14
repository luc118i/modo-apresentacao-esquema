import { clsx, type ClassValue } from "clsx";

/** Junta classes condicionais de forma legível. */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}
