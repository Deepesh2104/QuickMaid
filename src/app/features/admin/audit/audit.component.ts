import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ToastService } from '@core/services/toast.service';

export interface AuditRow {
  at: string;
  actor: string;
  action: string;
  target: string;
}

@Component({
  selector: 'app-audit',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './audit.component.html',
})
export class AuditComponent {
  readonly toast = inject(ToastService);

  readonly rows: readonly AuditRow[] = [
    { at: '2026-05-14 09:12', actor: 'asha@quickmaid.in', action: 'settings.update', target: 'maintenance_mode=false' },
    { at: '2026-05-14 08:40', actor: 'rohit@quickmaid.in', action: 'booking.reassign', target: 'BK-10432' },
    { at: '2026-05-13 18:02', actor: 'system', action: 'payout.batch', target: 'batch #882' },
    { at: '2026-05-13 11:55', actor: 'neha@quickmaid.in', action: 'customer.export', target: 'masked CSV' },
  ];

  export(): void {
    this.toast.show('Export audit CSV · Phase 3', '📥');
  }
}
