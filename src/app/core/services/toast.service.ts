import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import { ToastState, TOAST_DEFAULT_ICON, TOAST_DURATION_MS } from '../models/toast.model';

@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly _state = signal<ToastState>({ msg: '', icon: TOAST_DEFAULT_ICON, show: false });
  private timer: ReturnType<typeof setTimeout> | null = null;

  readonly state = this._state.asReadonly();

  constructor() {
    inject(DestroyRef).onDestroy(() => this.clearTimer());
  }

  show(msg: string, icon: string = TOAST_DEFAULT_ICON): void {
    this._state.set({ msg, icon, show: true });
    this.clearTimer();
    this.timer = setTimeout(
      () => this._state.update((s) => ({ ...s, show: false })),
      TOAST_DURATION_MS,
    );
  }

  private clearTimer(): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }
}
