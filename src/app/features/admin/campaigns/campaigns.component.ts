import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppStateService } from '@core/services/app-state.service';
import { ToastService } from '@core/services/toast.service';

export interface CampaignRow {
  id: string;
  code: string;
  channel: string;
  discount: string;
  maxRedemptions: number;
  used: number;
  status: 'live' | 'draft' | 'ended';
}

@Component({
  selector: 'app-campaigns',
  standalone: true,
  imports: [FormsModule, DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './campaigns.component.html',
  styleUrls: ['./campaigns.component.css'],
})
export class CampaignsComponent {
  readonly toast = inject(ToastService);
  readonly appState = inject(AppStateService);

  readonly waitlist = this.appState.waitlist;
  readonly waitlistCount = this.appState.waitlistCount;

  readonly rows = signal<CampaignRow[]>([
    { id: 'c1', code: 'MONSOON15', channel: 'WhatsApp', discount: '15%', maxRedemptions: 500, used: 142, status: 'live' },
    { id: 'c2', code: 'REFER100', channel: 'App', discount: '₹100', maxRedemptions: 1000, used: 388, status: 'live' },
    { id: 'c3', code: 'B2BTRIAL', channel: 'Sales', discount: '1st month free', maxRedemptions: 50, used: 0, status: 'draft' },
  ]);

  readonly createOpen = signal(false);
  readonly formCode = signal('');
  readonly formChannel = signal('WhatsApp');
  readonly formDiscountType = signal<'percent' | 'flat'>('percent');
  readonly formDiscountValue = signal('15');
  readonly formMaxRedemptions = signal('500');
  readonly formStatus = signal<'live' | 'draft'>('draft');
  readonly formSaving = signal(false);

  readonly liveCount = computed(
    () => this.rows().filter((r) => r.status === 'live').length,
  );

  openCreate(): void {
    this.formCode.set('');
    this.formChannel.set('WhatsApp');
    this.formDiscountType.set('percent');
    this.formDiscountValue.set('15');
    this.formMaxRedemptions.set('500');
    this.formStatus.set('draft');
    this.createOpen.set(true);
  }

  closeCreate(): void {
    this.createOpen.set(false);
  }

  saveCampaign(): void {
    const code = this.formCode().trim().toUpperCase();
    if (!code) {
      this.toast.show('Coupon code required', '⚠️');
      return;
    }
    if (this.rows().some((r) => r.code === code)) {
      this.toast.show('Code already exists', '⚠️');
      return;
    }
    const discount =
      this.formDiscountType() === 'percent'
        ? this.formDiscountValue() + '%'
        : '₹' + this.formDiscountValue();
    const max = parseInt(this.formMaxRedemptions(), 10) || 100;
    this.formSaving.set(true);
    setTimeout(() => {
      this.rows.update((arr) => [
        {
          id: 'c' + Date.now(),
          code,
          channel: this.formChannel(),
          discount,
          maxRedemptions: max,
          used: 0,
          status: this.formStatus(),
        },
        ...arr,
      ]);
      this.formSaving.set(false);
      this.createOpen.set(false);
      this.toast.show(`Campaign ${code} created`, '✨');
    }, 500);
  }

  endCampaign(id: string): void {
    this.rows.update((arr) =>
      arr.map((r) => (r.id === id ? { ...r, status: 'ended' as const } : r)),
    );
    this.toast.show('Campaign ended', '⏹️');
  }

  readonly detailOpen = signal(false);
  readonly detailRow = signal<CampaignRow | null>(null);

  openDetail(row: CampaignRow): void {
    this.detailRow.set(row);
    this.detailOpen.set(true);
  }

  closeDetail(): void {
    this.detailOpen.set(false);
  }

  readonly notifyOpen = signal(false);
  readonly notifyRow = signal<{ city: string; email: string } | null>(null);
  readonly notifyRunning = signal(false);

  formatWaitlistAt(iso: string): string {
    try {
      return new Intl.DateTimeFormat('en-IN', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date(iso));
    } catch {
      return iso;
    }
  }

  openNotify(city: string, email: string): void {
    this.notifyRow.set({ city, email });
    this.notifyOpen.set(true);
  }

  closeNotify(): void {
    this.notifyOpen.set(false);
  }

  confirmNotify(): void {
    const row = this.notifyRow();
    if (!row) return;
    this.notifyRunning.set(true);
    window.setTimeout(() => {
      this.notifyRunning.set(false);
      this.notifyOpen.set(false);
      this.appState.logAudit('waitlist.notify', `${row.city} · ${row.email}`, 'admin');
      this.toast.show(`Launch email queued · ${row.email}`, '✉️');
    }, 550);
  }

  removeWaitlist(city: string, email: string): void {
    this.appState.removeWaitlistEntry(email, city);
    this.appState.logAudit('waitlist.remove', `${city} · ${email}`, 'admin');
    this.toast.show('Removed from waitlist', '🗑️');
  }

  exportWaitlist(): void {
    const rows = this.waitlist();
    if (!rows.length) {
      this.toast.show('Waitlist empty', 'ℹ️');
      return;
    }
    const header = 'city,email,subscribed_at';
    const lines = rows.map((w) => [w.city, w.email, w.at].join(','));
    const body = [header, ...lines].join('\n');
    const blob = new Blob([body], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'quickmaid_waitlist.csv';
    a.click();
    URL.revokeObjectURL(url);
    this.toast.show(`Waitlist CSV · ${rows.length} rows`, '📥');
  }
}
