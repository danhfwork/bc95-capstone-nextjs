import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getDisplayInitial(displayName: string, fallback = "U"): string {
  return (
    Array.from(displayName.trim())[0]?.toLocaleUpperCase("vi-VN") ?? fallback
  );
}
