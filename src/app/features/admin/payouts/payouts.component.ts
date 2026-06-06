import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
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
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './payouts.component.html',
  styleUrls: ['./payouts.component.css'],
})
export class PayoutsComponent {
  readonly toast = inject(ToastService);

  readonly statusFilter = signal<'all' | PayoutRowStatus>('all');
  readonly searchQuery = signal('');

  readonly reconcileOpen = signal(false);
  readonly batchOpen = signal(false);
  readonly notifyOpen = signal(false);
  readonly kycOpen = signal(false);
  readonly payOpen = signal(false);
  readonly reconcileRunning = signal(false);
  readonly batchRunning = signal(false);
  readonly notifyRunning = signal(false);
  readonly actionRunning = signal(false);
  readonly lastReconcile = signal('12 min ago');

  readonly actionRow = signal<PayoutRow | null>(null);

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
  readonly pendingPayCount = computed(() => this.rows.filter((r) => r.status === 'ready' || r.status === 'pending').length);
  readonly pendingTotal = computed(() => {
    const nums = this.rows
      .filter((r) => r.status === 'ready' || r.status === 'pending')
      .map((r) => parseInt(r.amount.replace(/[^\d]/g, ''), 10) || 0);
    const sum = nums.reduce((a, n) => a + n, 0);
    return `₹${sum.toLocaleString('en-IN')}`;
  });

  onSearch(ev: Event): void {
    this.searchQuery.set((ev.target as HTMLInputElement).value);
  }

  setFilter(f: 'all' | PayoutRowStatus): void {
    this.statusFilter.set(f);
  }

  openReconcile(): void {
    this.reconcileOpen.set(true);
  }

  closeReconcile(): void {
    this.reconcileOpen.set(false);
  }

  confirmReconcile(): void {
    this.reconcileRunning.set(true);
    setTimeout(() => {
      this.lastReconcile.set('Just now');
      this.reconcileRunning.set(false);
      this.closeReconcile();
      this.toast.show('Reconciled with ledger', '📒');
    }, 700);
  }

  openBatch(): void {
    this.batchOpen.set(true);
  }

  closeBatch(): void {
    this.batchOpen.set(false);
  }

  confirmBatch(): void {
    this.batchRunning.set(true);
    setTimeout(() => {
      this.batchRunning.set(false);
      this.closeBatch();
      this.toast.show(`Batch payout initiated · ${this.pendingPayCount()} workers`, '💸');
    }, 800);
  }

  openNotify(): void {
    this.notifyOpen.set(true);
  }

  closeNotify(): void {
    this.notifyOpen.set(false);
  }

  confirmNotify(): void {
    this.notifyRunning.set(true);
    setTimeout(() => {
      this.notifyRunning.set(false);
      this.closeNotify();
      this.toast.show('Slack #payouts pinged', '📣');
    }, 500);
  }

  openKyc(r: PayoutRow): void {
    this.actionRow.set(r);
    this.kycOpen.set(true);
  }

  closeKyc(): void {
    this.kycOpen.set(false);
  }

  confirmKyc(): void {
    const r = this.actionRow();
    if (!r) return;
    this.actionRunning.set(true);
    setTimeout(() => {
      this.actionRunning.set(false);
      this.closeKyc();
      this.toast.show(`KYC desk opened · ${r.name}`, '📎');
    }, 500);
  }

  openPay(r: PayoutRow): void {
    this.actionRow.set(r);
    this.payOpen.set(true);
  }

  closePay(): void {
    this.payOpen.set(false);
  }

  confirmPay(): void {
    const r = this.actionRow();
    if (!r) return;
    this.actionRunning.set(true);
    setTimeout(() => {
      this.actionRunning.set(false);
      this.closePay();
      this.toast.show(`${r.amount} queued for ${r.name}`, '✅');
    }, 500);
  }
}
