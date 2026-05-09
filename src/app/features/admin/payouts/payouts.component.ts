import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ToastService } from '@core/services/toast.service';

export type PayoutAv = 'or' | 'bl' | 'gr';
export type PayoutRowStatus = 'pending' | 'held' | 'ready';

export interface PayoutRow {
  id: string;
  name: string;
  init: string;
  av: PayoutAv;
  bookings: number;
  amount: string;
  lastPaid: string;
  upi: string;
  status: PayoutRowStatus;
  riskNote?: string;
}

@Component({
  selector: 'app-payouts',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './payouts.component.html',
})
export class PayoutsComponent {
  readonly toast = inject(ToastService);

  readonly statusFilter = signal<'all' | PayoutRowStatus>('all');
  readonly searchQuery = signal('');

  readonly rows: readonly PayoutRow[] = [
    { id: 'PW-01', name: 'Savita Devi', init: 'S', av: 'or', bookings: 22, amount: '₹5,500', lastPaid: 'Mar 31', upi: 'savita@upi', status: 'ready' },
    { id: 'PW-02', name: 'Priya Yadav', init: 'P', av: 'gr', bookings: 19, amount: '₹4,750', lastPaid: 'Mar 31', upi: 'priya@upi', status: 'ready' },
    { id: 'PW-03', name: 'Rekha Singh', init: 'R', av: 'bl', bookings: 17, amount: '₹4,250', lastPaid: 'Mar 31', upi: 'rekha@upi', status: 'pending' },
    { id: 'PW-04', name: 'Mina K.', init: 'M', av: 'gr', bookings: 14, amount: '₹3,900', lastPaid: 'Mar 28', upi: 'mina@upi', status: 'held', riskNote: 'KYC doc pending' },
    { id: 'PW-05', name: 'Anita S.', init: 'A', av: 'or', bookings: 11, amount: '₹2,800', lastPaid: 'Mar 25', upi: 'anita@upi', status: 'pending' },
    { id: 'PW-06', name: 'Kavita R.', init: 'K', av: 'bl', bookings: 9, amount: '₹2,100', lastPaid: 'Mar 22', upi: 'kavita@upi', status: 'held', riskNote: 'UPI name mismatch' },
  ];

  readonly filteredRows = computed(() => {
    const f = this.statusFilter();
    const q = this.searchQuery().trim().toLowerCase();
    return this.rows.filter((r) => {
      if (f !== 'all' && r.status !== f) return false;
      if (!q) return true;
      return (
        r.id.toLowerCase().includes(q) ||
        r.name.toLowerCase().includes(q) ||
        r.upi.toLowerCase().includes(q)
      );
    });
  });

  readonly filteredCount = computed(() => this.filteredRows().length);
  readonly totalRows = this.rows.length;

  onSearch(ev: Event): void {
    this.searchQuery.set((ev.target as HTMLInputElement).value);
  }

  setFilter(f: 'all' | PayoutRowStatus): void {
    this.statusFilter.set(f);
  }

  payRow(r: PayoutRow): void {
    this.toast.show(`${r.amount} queued for ${r.name}`, '✅');
  }
}
