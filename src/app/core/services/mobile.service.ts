import { DestroyRef, Injectable, inject, signal } from '@angular/core';

const MOBILE_BREAKPOINT_PX = 1024;

@Injectable({ providedIn: 'root' })
export class MobileService {
  private readonly _isMobile = signal<boolean>(this.detect());
  readonly isMobile = this._isMobile.asReadonly();

  constructor() {
    if (typeof window === 'undefined') return;
    const handler = () => this._isMobile.set(this.detect());
    window.addEventListener('resize', handler);
    inject(DestroyRef).onDestroy(() => window.removeEventListener('resize', handler));
  }

  private detect(): boolean {
    if (typeof window === 'undefined') return false;
    return (window.innerWidth || document.documentElement.clientWidth) < MOBILE_BREAKPOINT_PX;
  }
}
