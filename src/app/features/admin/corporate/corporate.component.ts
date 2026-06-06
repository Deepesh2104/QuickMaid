import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToastService } from '@core/services/toast.service';

export interface CorporateRow {
  id: string;
  company: string;
  seats: number;
  mrr: string;
  status: 'active' | 'trial' | 'negotiating';
  gstin: string;
  erpId: string;
}

@Component({
  selector: 'app-corporate',
  standalone: true,
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './corporate.component.html',
  styleUrls: ['./corporate.component.css'],
})
export class CorporateComponent {
  readonly toast = inject(ToastService);

  readonly rows = signal<CorporateRow[]>([
    { id: 'CORP-01', company: 'Raipur Infra Pvt Ltd', seats: 48, mrr: '₹2.1L', status: 'active', gstin: '22AAAAA0000A1Z5', erpId: 'ERP-8841' },
    { id: 'CORP-02', company: 'CG Medical College Hostel', seats: 120, mrr: '₹3.8L', status: 'trial', gstin: '22BBBBB0000B1Z5', erpId: 'ERP-8842' },
    { id: 'CORP-03', company: 'Steel Plant Township', seats: 0, mrr: '—', status: 'negotiating', gstin: '—', erpId: '—' },
  ]);

  readonly erpWebhook = signal('https://api.quickmaid.in/hooks/erp/invoice');
  readonly erpApiKey = signal('erp_demo_key_••••');
  readonly erpSyncEnabled = signal(true);
  readonly lastErpSync = signal('Today · 09:42 AM');

  readonly accountOpen = signal(false);
  readonly formCompany = signal('');
  readonly formSeats = signal('10');
  readonly formGstin = signal('');
  readonly formContact = signal('');
  readonly formSaving = signal(false);

  openAccount(): void {
    this.formCompany.set('');
    this.formSeats.set('10');
    this.formGstin.set('');
    this.formContact.set('');
    this.accountOpen.set(true);
  }

  closeAccount(): void {
    this.accountOpen.set(false);
  }

  saveAccount(): void {
    const company = this.formCompany().trim();
    if (!company) {
      this.toast.show('Company name required', '⚠️');
      return;
    }
    this.formSaving.set(true);
    setTimeout(() => {
      const id = 'CORP-' + String(this.rows().length + 1).padStart(2, '0');
      this.rows.update((arr) => [
        ...arr,
        {
          id,
          company,
          seats: parseInt(this.formSeats(), 10) || 0,
          mrr: '—',
          status: 'negotiating',
          gstin: this.formGstin() || '—',
          erpId: '—',
        },
      ]);
      this.formSaving.set(false);
      this.accountOpen.set(false);
      this.toast.show('B2B account created (demo)', '🏢');
    }, 500);
  }

  readonly erpSyncOpen = signal(false);
  readonly erpSyncRunning = signal(false);

  openErpSync(): void {
    this.erpSyncOpen.set(true);
  }

  closeErpSync(): void {
    this.erpSyncOpen.set(false);
  }

  confirmErpSync(): void {
    this.erpSyncRunning.set(true);
    setTimeout(() => {
      this.lastErpSync.set('Just now');
      this.erpSyncRunning.set(false);
      this.closeErpSync();
      this.toast.show('ERP sync triggered (demo)', '🔄');
    }, 700);
  }

  toggleErpSync(): void {
    this.erpSyncEnabled.update((v) => !v);
  }

  readonly detailOpen = signal(false);
  readonly detailRow = signal<CorporateRow | null>(null);
  readonly invoiceOpen = signal(false);
  readonly invoiceRow = signal<CorporateRow | null>(null);
  readonly invoiceRunning = signal(false);

  openDetail(row: CorporateRow): void {
    this.detailRow.set(row);
    this.detailOpen.set(true);
  }

  closeDetail(): void {
    this.detailOpen.set(false);
  }

  openInvoice(row: CorporateRow): void {
    this.invoiceRow.set(row);
    this.invoiceOpen.set(true);
  }

  closeInvoice(): void {
    this.invoiceOpen.set(false);
  }

  confirmInvoice(): void {
    const r = this.invoiceRow();
    if (!r) return;
    this.invoiceRunning.set(true);
    window.setTimeout(() => {
      this.invoiceRunning.set(false);
      this.closeInvoice();
      this.toast.show(`Invoice pushed to ERP · ${r.company}`, '📄');
    }, 650);
  }
}
