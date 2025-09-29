// Budget Douala - Utilitaire className merge
// I2.2 - Design System Basique

import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Combine et merge les classes CSS avec TailwindCSS
 * Utilise clsx pour la logique conditionnelle et twMerge pour éviter les conflits
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
