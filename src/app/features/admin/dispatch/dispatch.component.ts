import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ToastService } from '@core/services/toast.service';

export interface DispatchSlot {
  time: string;
  open: number;
  assigned: number;
  risk: 'ok' | 'watch' | 'hot';
}

@Component({
  selector: 'app-dispatch',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dispatch.component.html',
})
export class DispatchComponent {
  readonly toast = inject(ToastService);

  readonly slots: readonly DispatchSlot[] = [
    { time: '08:00–10:00', open: 4, assigned: 18, risk: 'ok' },
    { time: '10:00–12:00', open: 9, assigned: 22, risk: 'watch' },
    { time: '12:00–14:00', open: 2, assigned: 14, risk: 'ok' },
    { time: '16:00–18:00', open: 14, assigned: 11, risk: 'hot' },
    { time: '18:00–20:00', open: 7, assigned: 19, risk: 'watch' },
  ];

  rebalance(): void {
    this.toast.show('Auto-rebalance (demo)', '🎯');
  }
}
