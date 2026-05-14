import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ToastService } from '@core/services/toast.service';

export interface AlertRow {
  id: string;
  severity: 'info' | 'warn' | 'crit';
  title: string;
  at: string;
  read: boolean;
}

@Component({
  selector: 'app-notifications',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './notifications.component.html',
})
export class NotificationsComponent {
  readonly toast = inject(ToastService);

  readonly rows = signal<readonly AlertRow[]>([
    { id: '1', severity: 'crit', title: 'Payout batch #882 failed gateway timeout', at: '12 min ago', read: false },
    { id: '2', severity: 'warn', title: 'SLA breach · 4 bookings > 45m wait', at: '28 min ago', read: false },
    { id: '3', severity: 'info', title: 'New corporate account pending KYC', at: '1 hr ago', read: true },
  ]);

  markAllRead(): void {
    this.rows.update((list) => list.map((r) => ({ ...r, read: true })));
    this.toast.show('All marked read', '✅');
  }
}
