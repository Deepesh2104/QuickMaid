import { InjectionToken } from '@angular/core';

export interface ChartPalette {
  readonly OR: string;
  readonly OR_RGB: string;
  readonly GR: string;
  readonly BL: string;
  readonly AM: string;
  readonly RE: string;
  readonly PU: string;
}

function readVar(name: string, fallback: string): string {
  if (typeof document === 'undefined') return fallback;
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}

export const CHART_PALETTE = new InjectionToken<ChartPalette>('CHART_PALETTE', {
  providedIn: 'root',
  factory: () =>
    ({
      get OR() { return readVar('--primary', '#FF5C1A'); },
      get OR_RGB() { return readVar('--primary-rgb', '255,92,26'); },
      GR: '#1C8C52',
      BL: '#1D4ED8',
      AM: '#B45309',
      RE: '#EF4444',
      PU: '#9333EA',
    }) as ChartPalette,
});

export const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;
export const MONTHS = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'] as const;
