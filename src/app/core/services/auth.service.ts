import { Injectable, computed, signal } from '@angular/core';

const STORAGE_KEY = 'qm_session_v1';

export interface QmSession {
  readonly loginId: string;
  readonly displayName: string;
  readonly role: string;
  readonly at: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly session = signal<QmSession | null>(null);

  readonly isAuthenticated = computed(() => this.session() !== null);
  readonly displayName = computed(() => this.session()?.displayName ?? 'Guest');
  readonly roleLabel = computed(() => this.session()?.role ?? '—');
  readonly loginId = computed(() => this.session()?.loginId ?? '');

  constructor() {
    this.restore();
  }

  login(payload: { loginId: string; displayName: string; role: string }): void {
    const next: QmSession = {
      loginId: payload.loginId.trim(),
      displayName: payload.displayName.trim() || 'User',
      role: payload.role.trim() || 'Admin',
      at: Date.now(),
    };
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* ignore quota */
    }
    this.session.set(next);
  }

  logout(): void {
    sessionStorage.removeItem(STORAGE_KEY);
    this.session.set(null);
  }

  /** Only in-app `/admin` paths — blocks open redirects. */
  safeAdminReturnUrl(url: string | null): string | null {
    if (!url || url.length > 256) return null;
    if (url.includes('://') || url.startsWith('//')) return null;
    return /^\/admin(\/.*)?$/.test(url) ? url : null;
  }

  private restore(): void {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Partial<QmSession>;
      if (
        typeof parsed.loginId === 'string' &&
        typeof parsed.displayName === 'string' &&
        typeof parsed.role === 'string'
      ) {
        this.session.set({
          loginId: parsed.loginId,
          displayName: parsed.displayName,
          role: parsed.role,
          at: typeof parsed.at === 'number' ? parsed.at : Date.now(),
        });
      } else {
        sessionStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      sessionStorage.removeItem(STORAGE_KEY);
    }
  }
}
