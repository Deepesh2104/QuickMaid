import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ToastService } from '@core/services/toast.service';

export interface ReportRow {
  name: string;
  cadence: string;
  owner: string;
  next: string;
}

@Component({
  selector: 'app-reports',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './reports.component.html',
})
export class ReportsComponent {
  readonly toast = inject(ToastService);

  readonly rows: readonly ReportRow[] = [
    { name: 'Daily bookings CSV', cadence: 'Daily 06:00', owner: 'Ops', next: 'Tomorrow' },
    { name: 'Revenue by zone', cadence: 'Weekly Mon', owner: 'Finance', next: 'Mon' },
    { name: 'Maid payout reconciliation', cadence: 'T+2', owner: 'Finance', next: 'May 16' },
    { name: 'NPS & CSAT rollup', cadence: 'Monthly', owner: 'CX', next: 'Jun 1' },
  ];

  runNow(): void {
    this.toast.show('Report job queued · Phase 3', '📊');
  }
}
