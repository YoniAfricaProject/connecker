// RALY GROUP — © 2022-2025. All rights reserved.
import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatPrice(price: number, currency = 'XOF'): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(price);
}

export function formatSurface(surface: number): string {
  return `${surface.toLocaleString('fr-FR')} m²`;
}
