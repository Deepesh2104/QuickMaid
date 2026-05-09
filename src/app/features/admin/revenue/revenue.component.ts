import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewChild,
  computed,
  inject,
  signal,
} from '@angular/core';
import { ChartService } from '@core/services/chart.service';
import { CHART_PALETTE, MONTHS } from '@core/tokens/chart-palette.token';
import { ToastService } from '@core/services/toast.service';

export type RevSource = 'instant' | 'subscription' | 'b2b' | 'addon';

export interface RevLedgerRow {
  id: string;
  label: string;
  source: RevSource;
  period: string;
  amount: string;
  share: string;
}

@Component({
  selector: 'app-revenue',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './revenue.component.html',
})
export class RevenueComponent implements AfterViewInit {
  private readonly cs = inject(ChartService);
  private readonly palette = inject(CHART_PALETTE);
  readonly toast = inject(ToastService);

  @ViewChild('revChart') canvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('revSrcChart') canvas2!: ElementRef<HTMLCanvasElement>;

  readonly sourceFilter = signal<'all' | RevSource>('all');
  readonly searchQuery = signal('');

  readonly ledgerRows: readonly RevLedgerRow[] = [
    { id: 'GL-9821', label: 'Instant · weekend surge', source: 'instant', period: 'May 2026', amount: '₹6,85,560', share: '28%' },
    { id: 'GL-9820', label: 'Monthly renewals batch', source: 'subscription', period: 'May 2026', amount: '₹2,40,000', share: '42%' },
    { id: 'GL-9814', label: 'B2B · office retainer', source: 'b2b', period: 'Apr 2026', amount: '₹85,000', share: '11%' },
    { id: 'GL-9809', label: 'Add-ons · deep clean upsell', source: 'addon', period: 'Apr 2026', amount: '₹24,200', share: '4%' },
    { id: 'GL-9801', label: 'Instant · weekday core', source: 'instant', period: 'Mar 2026', amount: '₹5,21,000', share: '35%' },
    { id: 'GL-9792', label: 'Subscription · annual prepay', source: 'subscription', period: 'Mar 2026', amount: '₹1,95,000', share: '31%' },
  ];

  readonly filteredLedger = computed(() => {
    const f = this.sourceFilter();
    const q = this.searchQuery().trim().toLowerCase();
    return this.ledgerRows.filter((r) => {
      if (f !== 'all' && r.source !== f) return false;
      if (!q) return true;
      return r.id.toLowerCase().includes(q) || r.label.toLowerCase().includes(q) || r.period.toLowerCase().includes(q);
    });
  });

  readonly ledgerCount = computed(() => this.filteredLedger().length);
  readonly ledgerTotal = this.ledgerRows.length;

  onSearch(ev: Event): void {
    this.searchQuery.set((ev.target as HTMLInputElement).value);
  }

  setSource(f: 'all' | RevSource): void {
    this.sourceFilter.set(f);
  }

  sourceLabel(s: RevSource): string {
    if (s === 'instant') return 'Instant';
    if (s === 'subscription') return 'Subscription';
    if (s === 'b2b') return 'B2B';
    return 'Add-on';
  }

  sourceBadgeClass(s: RevSource): string {
    if (s === 'instant') return 'badge-or';
    if (s === 'subscription') return 'badge-green';
    if (s === 'b2b') return 'badge-blue';
    return 'badge-gray';
  }

  ngAfterViewInit(): void {
    const { OR, GR, BL, AM, OR_RGB } = this.palette;
    setTimeout(() => {
      this.cs.make(this.canvas.nativeElement, {
        type: 'bar',
        data: {
          labels: [...MONTHS],
          datasets: [
            { label: 'Instant', data: [48000, 52000, 44000, 61000, 57000, 68560], backgroundColor: `rgba(${OR_RGB},.5)`, borderRadius: 6 },
            { label: 'Subscriptions', data: [140000, 158000, 162000, 195000, 215000, 240000], backgroundColor: 'rgba(28,140,82,.55)', borderRadius: 6 },
            { label: 'B2B', data: [28000, 32000, 38000, 52000, 68000, 85000], backgroundColor: 'rgba(29,78,216,.55)', borderRadius: 6 },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'top' as const, labels: { boxWidth: 10, font: { size: 10 }, usePointStyle: true } } },
          scales: {
            x: { stacked: true, grid: { display: false }, ticks: { font: { size: 10 } } },
            y: {
              stacked: true,
              grid: { color: 'rgba(19,17,14,.06)' },
              border: { display: false },
              ticks: { font: { size: 10 }, callback: (v: string | number) => '₹' + Math.round(Number(v) / 1000) + 'K' },
            },
          },
        },
      } as any);

      this.cs.make(this.canvas2.nativeElement, {
        type: 'doughnut',
        data: {
          labels: ['Monthly Plans', 'B2B Contracts', 'Instant', 'Annual', 'Add-ons'],
          datasets: [{ data: [56, 20, 16, 6, 2], backgroundColor: [GR, BL, OR, AM, 'rgba(168,85,247,.8)'], borderWidth: 0, hoverOffset: 6 }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '65%',
          plugins: { legend: { position: 'right' as const, labels: { boxWidth: 10, font: { size: 10 } } } },
        } as any,
      });
    }, 60);
  }
}
