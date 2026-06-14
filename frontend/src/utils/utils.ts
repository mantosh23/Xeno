import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * cn
 * 
 * @returns {any}
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
