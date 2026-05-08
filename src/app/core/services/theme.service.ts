import { Injectable, computed, inject, signal } from '@angular/core';
import { DEFAULT_THEME_ID, ThemePreset, THEME_PRESETS } from '../models/theme.model';
import { ToastService } from './toast.service';

const STORAGE_KEY = 'quickmaid-theme-v2';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly toast = inject(ToastService);
  private readonly _current = signal<string>(this.loadInitial());

  readonly presets = THEME_PRESETS;
  readonly current = this._current.asReadonly();
  readonly currentPreset = computed<ThemePreset>(
    () => this.presets.find((p) => p.id === this._current()) ?? this.presets[0],
  );

  constructor() {
    this.applyTheme(this._current());
  }

  setTheme(id: string): void {
    const preset = this.presets.find((p) => p.id === id);
    if (!preset) return;
    this._current.set(id);
    this.applyTheme(id);
    this.persist(id);
    this.toast.show(`Theme: ${preset.name}`, '🎨');
  }

  private loadInitial(): string {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && THEME_PRESETS.some((p) => p.id === stored)) return stored;
    } catch {
      /* storage unavailable — fall through */
    }
    return DEFAULT_THEME_ID;
  }

  private persist(id: string): void {
    try {
      localStorage.setItem(STORAGE_KEY, id);
    } catch {
      /* storage unavailable — ignore */
    }
  }

  private applyTheme(id: string): void {
    if (typeof document === 'undefined') return;
    const body = document.body;
    this.presets.forEach((p) => body.classList.remove('theme-' + p.id));
    body.classList.add('theme-' + id);
  }
}
