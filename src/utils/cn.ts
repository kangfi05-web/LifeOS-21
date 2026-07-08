// Utility function for conditional class names (CN)
// Similar to shadcn's cn utility

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Alternative for array-based conditional classes
export function classNames(
  ...classes: (string | undefined | null | false | Record<string, boolean>)[]
): string {
  const result: string[] = [];

  for (const item of classes) {
    if (!item) continue;

    if (typeof item === 'string') {
      result.push(item);
    } else if (typeof item === 'object') {
      for (const [key, value] of Object.entries(item)) {
        if (value) {
          result.push(key);
        }
      }
    }
  }

  return result.join(' ');
}
