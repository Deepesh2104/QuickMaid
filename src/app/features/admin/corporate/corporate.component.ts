import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ToastService } from '@core/services/toast.service';

export interface CorporateRow {
  company: string;
  seats: number;
  mrr: string;
  status: 'active' | 'trial' | 'negotiating';
}

@Component({
  selector: 'app-corporate',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './corporate.component.html',
})
export class CorporateComponent {
  readonly toast = inject(ToastService);

  readonly rows: readonly CorporateRow[] = [
    { company: 'Raipur Infra Pvt Ltd', seats: 48, mrr: '₹2.1L', status: 'active' },
    { company: 'CG Medical College Hostel', seats: 120, mrr: '₹3.8L', status: 'trial' },
    { company: 'Steel Plant Township', seats: 0, mrr: '—', status: 'negotiating' },
  ];

  addAccount(): void {
    this.toast.show('B2B account wizard · Phase 3', '🏢');
  }
}
