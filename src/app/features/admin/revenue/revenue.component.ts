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
import { FormsModule } from '@angular/forms';
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

export interface RevDrillLine {
  id: string;
  desc: string;
  amount: string;
}

export interface RevZoneShare {
  name: string;
  share: string;
}

export interface RevDrillDetail {
  gross: string;
  commission: string;
  net: string;
  txnCount: number;
  avgTicket: string;
  momGrowth: string;
  lines: RevDrillLine[];
  zones: RevZoneShare[];
}

@Component({
  selector: 'app-revenue',
  standalone: true,
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './revenue.component.html',
  styleUrls: ['./revenue.component.css'],
})
export class RevenueComponent implements AfterViewInit {
  private readonly cs = inject(ChartService);
  private readonly palette = inject(CHART_PALETTE);
  readonly toast = inject(ToastService);

  @ViewChild('revChart') canvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('revSrcChart') canvas2!: ElementRef<HTMLCanvasElement>;

  readonly sourceFilter = signal<'all' | RevSource>('all');
  readonly searchQuery = signal('');

  readonly lastSync = signal('FY snapshot');
  readonly refreshOpen = signal(false);
  readonly exportOpen = signal(false);
  readonly boardPackOpen = signal(false);
  readonly refreshRunning = signal(false);
  readonly exportRunning = signal(false);
  readonly boardRunning = signal(false);
  readonly exportScope = signal<'filtered' | 'all'>('filtered');

  readonly drillOpen = signal(false);
  readonly drillRow = signal<RevLedgerRow | null>(null);

  readonly drillDetail = computed((): RevDrillDetail | null => {
    const r = this.drillRow();
    return r ? this.buildDrill(r) : null;
  });

  readonly exportLineOpen = signal(false);
  readonly exportLineRow = signal<RevLedgerRow | null>(null);
  readonly exportFormat = signal<'csv' | 'json'>('csv');
  readonly exportLineRunning = signal(false);

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

  openRefresh(): void {
    this.refreshOpen.set(true);
  }

  closeRefresh(): void {
    this.refreshOpen.set(false);
  }

  confirmRefresh(): void {
    this.refreshRunning.set(true);
    setTimeout(() => {
      this.lastSync.set('Just now');
      this.refreshRunning.set(false);
      this.closeRefresh();
      this.toast.show('Rates refreshed', '✨');
    }, 600);
  }

  openExport(): void {
    this.exportOpen.set(true);
  }

  closeExport(): void {
    this.exportOpen.set(false);
  }

  confirmExport(): void {
    this.exportRunning.set(true);
    setTimeout(() => {
      const data = this.exportScope() === 'filtered' ? this.filteredLedger() : [...this.ledgerRows];
      const header = 'id,label,source,period,amount,share';
      const lines = data.map((r) =>
        [r.id, `"${r.label}"`, r.source, r.period, r.amount, r.share].join(','),
      );
      const body = [header, ...lines].join('\n');
      const blob = new Blob([body], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'quickmaid_revenue_ledger.csv';
      a.click();
      URL.revokeObjectURL(url);
      this.exportRunning.set(false);
      this.closeExport();
      this.toast.show(`Finance export · ${data.length} lines`, '📥');
    }, 500);
  }

  openBoardPack(): void {
    this.boardPackOpen.set(true);
  }

  closeBoardPack(): void {
    this.boardPackOpen.set(false);
  }

  confirmBoardPack(): void {
    this.boardRunning.set(true);
    setTimeout(() => {
      const body = [
        'QuickMaid CFO Board Pack (demo)',
        'Generated: ' + new Date().toISOString(),
        '',
        'GMV this month: ₹4.28L',
        'Commission: ₹68,560',
        'Subscription: ₹2,40,000',
        'B2B: ₹85,000',
      ].join('\n');
      const blob = new Blob([body], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'quickmaid_cfo_pack.txt';
      a.click();
      URL.revokeObjectURL(url);
      this.boardRunning.set(false);
      this.closeBoardPack();
      this.toast.show('CFO pack downloaded', '📑');
    }, 600);
  }

  private buildDrill(r: RevLedgerRow): RevDrillDetail {
    const num = parseInt(r.amount.replace(/[^\d]/g, ''), 10) || 100000;
    const commission = Math.round(num * 0.12);
    const fmt = (n: number) => '₹' + n.toLocaleString('en-IN');
    return {
      gross: r.amount,
      commission: fmt(commission),
      net: fmt(num - commission),
      txnCount: Math.round(num / 350),
      avgTicket: '₹349',
      momGrowth: r.source === 'instant' ? '+6.2%' : r.source === 'subscription' ? '+4.1%' : '+2.8%',
      lines: [
        { id: `${r.id}-01`, desc: 'Recognized revenue', amount: r.amount },
        { id: `${r.id}-02`, desc: 'Platform commission (12%)', amount: fmt(commission) },
        { id: `${r.id}-03`, desc: 'Maid payouts (accrued)', amount: fmt(Math.round(num * 0.72)) },
        { id: `${r.id}-04`, desc: 'GST liability', amount: fmt(Math.round(num * 0.05)) },
      ],
      zones: [
        { name: 'Tatibandh', share: '32%' },
        { name: 'Civil Lines', share: '24%' },
        { name: 'Shankar Nagar', share: '18%' },
        { name: 'Pandri', share: '14%' },
        { name: 'Other', share: '12%' },
      ],
    };
  }

  openDrill(row: RevLedgerRow): void {
    this.drillRow.set(row);
    this.drillOpen.set(true);
  }

  closeDrill(): void {
    this.drillOpen.set(false);
  }

  openExportLine(row: RevLedgerRow): void {
    this.exportLineRow.set(row);
    this.exportFormat.set('csv');
    this.exportLineOpen.set(true);
  }

  closeExportLine(): void {
    this.exportLineOpen.set(false);
  }

  confirmExportLine(): void {
    const r = this.exportLineRow();
    if (!r) return;
    this.exportLineRunning.set(true);
    window.setTimeout(() => {
      const fmt = this.exportFormat();
      const body =
        fmt === 'json'
          ? JSON.stringify({ id: r.id, label: r.label, amount: r.amount, period: r.period, source: r.source }, null, 2)
          : `${r.id},${r.label},${r.amount},${r.period},${r.source}`;
      const blob = new Blob([body], { type: fmt === 'json' ? 'application/json' : 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${r.id}.${fmt}`;
      a.click();
      URL.revokeObjectURL(url);
      this.exportLineRunning.set(false);
      this.closeExportLine();
      this.toast.show(`Exported ${r.id}`, '📤');
    }, 500);
  }

  openAction(kind: string, row: RevLedgerRow): void {
    if (kind === 'drill') {
      this.openDrill(row);
      return;
    }
    if (kind === 'export') {
      this.openExportLine(row);
      return;
    }
  }
}
