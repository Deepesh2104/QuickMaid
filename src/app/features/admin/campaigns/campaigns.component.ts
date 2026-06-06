import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
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
}
