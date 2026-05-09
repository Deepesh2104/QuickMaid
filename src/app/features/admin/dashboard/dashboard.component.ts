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
import { Chart } from 'chart.js';
import { ChartService } from '@core/services/chart.service';
import { ToastService } from '@core/services/toast.service';
import { CHART_PALETTE, DAYS } from '@core/tokens/chart-palette.token';

type DateRange = '7d' | '30d' | '90d';

interface RangeData {
  labels: readonly string[];
  rev: readonly number[];
  book: readonly number[];
}

const RANGES: Readonly<Record<DateRange, RangeData>> = {
  '7d': { labels: DAYS, rev: [48200, 52100, 38900, 61400, 55800, 72300, 65000], book: [182, 198, 154, 234, 212, 276, 247] },
  '30d': { labels: ['W1', 'W2', 'W3', 'W4'], rev: [185000, 210000, 195000, 238500], book: [720, 810, 760, 947] },
  '90d': { labels: ['Jan', 'Feb', 'Mar'], rev: [520000, 610000, 780000], book: [1920, 2340, 2980] },
};

function bizMarginSeries(r: DateRange): { labels: readonly string[]; gmvK: number[]; commK: number[] } {
  const d = RANGES[r];
  return {
    labels: d.labels,
    gmvK: d.rev.map((v) => Math.round((v / 1000) * 10) / 10),
    commK: d.rev.map((v) => Math.round((v * 0.16 / 1000) * 10) / 10),
  };
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements AfterViewInit {
  /** Demo intraday shape for demand-signal spark strip */
  readonly demandSpark = [32, 40, 52, 68, 92, 96, 88, 72, 58, 62, 48, 36] as const;

  private readonly cs = inject(ChartService);
  private readonly palette = inject(CHART_PALETTE);
  private readonly toast = inject(ToastService);

  @ViewChild('mainChart') mainCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('donutChart') donutCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('miniLineChart') miniLineCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('miniHBarChart') miniHBarCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('heatChart') heatCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('compareChart') compareCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('payMixChart') payMixCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('cohortChart') cohortCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('csatChart') csatCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('qualityChart') qualityCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('zoneGmvChart') zoneGmvCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('demandPolarChart') demandPolarCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('bizMarginChart') bizMarginCanvas!: ElementRef<HTMLCanvasElement>;

  readonly range = signal<DateRange>('7d');
  private mainChart: Chart | null = null;
  private bizMarginChart: Chart | null = null;

  readonly todayLabel = computed(() =>
    new Intl.DateTimeFormat('en-IN', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date()),
  );

  readonly rangeLabel = computed(() => {
    const r = this.range();
    if (r === '7d') return 'Last 7 days';
    if (r === '30d') return 'Last 30 days';
    return 'Last 3 months';
  });

  /** Business pulse tiles — demo ratios derived from same GMV series as main chart */
  readonly bizPulse = computed(() => {
    const r = this.range();
    const d = RANGES[r];
    const gmv = d.rev.reduce((a, b) => a + b, 0);
    const bookings = d.book.reduce((a, b) => a + b, 0);
    const inr = (n: number) =>
      new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
    const commission = Math.round(gmv * 0.16);
    const refunds = Math.round(gmv * 0.006);
    const netAfter = Math.round(gmv * 0.655 - refunds);
    const payouts = Math.round(gmv * 0.27);
    const subs = Math.min(999, Math.round(220 + bookings / 5));
    const mrr = Math.round(subs * 2690);
    const b2b = Math.round(gmv * 0.013);
    const periodLbl = r === '7d' ? 'Week window' : r === '30d' ? 'Month window' : 'Quarter window';
    const quotesHint = r === '7d' ? '3 quotes · closing' : r === '30d' ? '4 quotes · closing' : '6 quotes · 2 won';
    const commHint = r === '7d' ? '↑ 9.2% vs target' : r === '30d' ? '↑ 6.1% vs target' : '↑ 11% vs target';
    return {
      netAfter: inr(netAfter),
      netSub: `${periodLbl} · after refunds`,
      commission: inr(commission),
      commissionSub: `${commHint} · 16% take rate`,
      refunds: inr(refunds),
      refundsSub: `${((refunds / gmv) * 100).toFixed(1)}% of GMV`,
      payouts: inr(payouts),
      payoutsSub: 'Maids · T+2 cycle',
      subs: String(subs),
      subsSub: `MRR est. ${inr(mrr)}`,
      b2b: inr(b2b),
      b2bSub: quotesHint,
    };
  });

  ngAfterViewInit(): void {
    setTimeout(() => this.init(), 60);
  }

  private init(): void {
    const { OR, GR, BL, AM, OR_RGB } = this.palette;
    const cream = '#FAF8F5';

    this.mainChart = this.cs.make(this.mainCanvas.nativeElement, {
      data: {
        labels: [...DAYS],
        datasets: [
          {
            type: 'bar',
            label: 'Revenue (₹)',
            data: [48200, 52100, 38900, 61400, 55800, 72300, 65000],
            backgroundColor: (context: { chart: { ctx: CanvasRenderingContext2D; chartArea?: { top: number; bottom: number } } }) => {
              const { ctx: c, chartArea } = context.chart;
              if (!chartArea) return `rgba(${OR_RGB},.15)`;
              const g = c.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
              g.addColorStop(0, `rgba(${OR_RGB},.1)`);
              g.addColorStop(1, `rgba(${OR_RGB},.22)`);
              return g;
            },
            borderColor: `rgba(${OR_RGB},.35)`,
            borderWidth: 1,
            yAxisID: 'y',
            borderRadius: { topLeft: 10, topRight: 10, bottomLeft: 4, bottomRight: 4 },
            maxBarThickness: 28,
          },
          {
            type: 'line',
            label: 'Bookings',
            data: [182, 198, 154, 234, 212, 276, 247],
            borderColor: GR,
            backgroundColor: (context: { chart: { ctx: CanvasRenderingContext2D; chartArea?: { top: number; bottom: number } } }) => {
              const { ctx: c, chartArea } = context.chart;
              if (!chartArea) return 'rgba(28,140,82,.08)';
              const g = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
              g.addColorStop(0, 'rgba(28, 140, 82, 0.22)');
              g.addColorStop(0.4, 'rgba(28, 140, 82, 0.07)');
              g.addColorStop(1, 'rgba(28, 140, 82, 0)');
              return g;
            },
            tension: 0.36,
            cubicInterpolationMode: 'monotone',
            fill: true,
            pointRadius: 4,
            pointHoverRadius: 7,
            pointBackgroundColor: '#fff',
            pointBorderColor: GR,
            pointBorderWidth: 2,
            borderWidth: 2.5,
            yAxisID: 'y1',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index' as const, intersect: false },
        plugins: { legend: { display: false } },
        scales: {
          y: {
            border: { display: false },
            grid: { color: 'rgba(19,17,14,.055)', drawTicks: false },
            ticks: {
              callback: (v: string | number) => '₹' + Math.round(Number(v) / 1000) + 'K',
              font: { size: 11, weight: '500' },
              padding: 8,
            },
          },
          y1: {
            position: 'right' as const,
            border: { display: false },
            grid: { display: false },
            ticks: { color: GR, font: { size: 11, weight: '600' }, padding: 8 },
          },
          x: {
            border: { display: false },
            grid: { display: false },
            ticks: { font: { size: 11, weight: '500' }, padding: 6 },
          },
        },
      },
    } as any);

    this.cs.make(this.donutCanvas.nativeElement, {
      type: 'doughnut',
      data: {
        labels: ['Cleaning', 'Cooking', 'Bartan', 'Other'],
        datasets: [
          {
            data: [42, 28, 18, 12],
            backgroundColor: [OR, '#169454', BL, AM],
            borderColor: cream,
            borderWidth: 2,
            hoverOffset: 6,
            spacing: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '62%',
        plugins: { legend: { display: false }, tooltip: { cornerRadius: 8, padding: 10 } },
      } as any,
    });

    this.cs.make(this.miniLineCanvas.nativeElement, {
      type: 'line',
      data: {
        labels: [...DAYS],
        datasets: [
          {
            label: 'Take rate',
            data: [17.8, 18.1, 17.9, 18.4, 18.2, 18.6, 18.3],
            borderColor: GR,
            backgroundColor: 'rgba(28,140,82,.12)',
            fill: true,
            tension: 0.35,
            pointRadius: 2,
            pointHoverRadius: 4,
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: {
            border: { display: false },
            grid: { display: false },
            ticks: { maxRotation: 0, autoSkip: true, font: { size: 9 } },
          },
          y: {
            border: { display: false },
            grid: { color: 'rgba(19,17,14,.06)' },
            ticks: {
              font: { size: 9 },
              callback: (v: string | number) => Number(v).toFixed(0) + '%',
            },
          },
        },
      },
    } as any);

    this.cs.make(this.miniHBarCanvas.nativeElement, {
      type: 'bar',
      data: {
        labels: ['App', 'WhatsApp', 'Call'],
        datasets: [
          {
            data: [54, 32, 14],
            backgroundColor: [`rgba(${OR_RGB},.85)`, BL, AM],
            borderRadius: 6,
            barThickness: 12,
          },
        ],
      },
      options: {
        indexAxis: 'y' as const,
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: {
            border: { display: false },
            grid: { color: 'rgba(19,17,14,.05)' },
            ticks: { font: { size: 9 }, callback: (v: string | number) => v + '%' },
            max: 100,
          },
          y: { border: { display: false }, grid: { display: false }, ticks: { font: { size: 10 } } },
        },
      },
    } as any);

    this.cs.make(this.heatCanvas.nativeElement, {
      type: 'bar',
      data: {
        labels: ['6AM', '7AM', '8AM', '9AM', '10AM', '11AM', '12PM', '1PM', '2PM', '3PM', '4PM', '5PM', '6PM', '7PM'],
        datasets: [
          {
            data: [8, 22, 48, 72, 85, 76, 42, 38, 55, 68, 74, 65, 48, 32],
            backgroundColor: (ctx: { raw: number }) => {
              const v = ctx.raw;
              return v > 70 ? OR : v > 50 ? `rgba(${OR_RGB},.58)` : `rgba(${OR_RGB},.28)`;
            },
            borderRadius: { topLeft: 8, topRight: 8, bottomLeft: 3, bottomRight: 3 },
            maxBarThickness: 20,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { border: { display: false }, grid: { display: false }, ticks: { font: { size: 10 } } },
          y: {
            border: { display: false },
            grid: { color: 'rgba(19,17,14,.055)', drawTicks: false },
            ticks: { font: { size: 10 } },
          },
        },
      },
    } as any);

    this.initDeepAnalyticsCharts();
    this.initBusinessPulseChart();
  }

  /** GMV vs commission — business P&L view (₹K) */
  private initBusinessPulseChart(): void {
    const { OR, GR, OR_RGB } = this.palette;
    const s = bizMarginSeries(this.range());
    this.bizMarginChart = this.cs.make(this.bizMarginCanvas.nativeElement, {
      type: 'line',
      data: {
        labels: [...s.labels],
        datasets: [
          {
            label: 'GMV (₹K)',
            data: [...s.gmvK],
            borderColor: OR,
            backgroundColor: `rgba(${OR_RGB},.1)`,
            fill: true,
            tension: 0.35,
            yAxisID: 'y',
            borderWidth: 2.5,
            pointRadius: 3,
          },
          {
            label: 'Commission (₹K)',
            data: [...s.commK],
            borderColor: GR,
            backgroundColor: 'rgba(28,140,82,.08)',
            fill: true,
            tension: 0.35,
            yAxisID: 'y1',
            borderWidth: 2,
            pointRadius: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index' as const, intersect: false },
        plugins: {
          legend: {
            display: true,
            position: 'top' as const,
            labels: { boxWidth: 10, font: { size: 10 }, usePointStyle: true },
          },
        },
        scales: {
          x: { border: { display: false }, grid: { display: false }, ticks: { font: { size: 10 } } },
          y: {
            position: 'left' as const,
            border: { display: false },
            grid: { color: 'rgba(19,17,14,.06)' },
            ticks: { font: { size: 10 }, callback: (v: string | number) => '₹' + v + 'K' },
          },
          y1: {
            position: 'right' as const,
            border: { display: false },
            grid: { display: false },
            ticks: { font: { size: 10 }, color: GR, callback: (v: string | number) => '₹' + v + 'K' },
          },
        },
      },
    } as any);
  }

  private updateBizMarginChartData(r: DateRange): void {
    if (!this.bizMarginChart) return;
    const s = bizMarginSeries(r);
    this.bizMarginChart.data.labels = [...s.labels];
    (this.bizMarginChart.data.datasets[0].data as number[]) = [...s.gmvK];
    (this.bizMarginChart.data.datasets[1].data as number[]) = [...s.commK];
    this.bizMarginChart.update('active');
  }

  private initDeepAnalyticsCharts(): void {
    const { OR, GR, BL, AM, OR_RGB, PU } = this.palette;
    const cream = '#FAF8F5';
    const axisSoft = { grid: { color: 'rgba(19,17,14,.06)' }, border: { display: false } };

    this.cs.make(this.compareCanvas.nativeElement, {
      type: 'bar',
      data: {
        labels: [...DAYS],
        datasets: [
          {
            label: 'This week',
            data: [182, 198, 154, 234, 212, 276, 247],
            backgroundColor: `rgba(${OR_RGB},.78)`,
            borderRadius: 6,
            maxBarThickness: 16,
          },
          {
            label: 'Last week',
            data: [168, 175, 160, 210, 198, 250, 230],
            backgroundColor: 'rgba(19,17,14,.16)',
            borderRadius: 6,
            maxBarThickness: 16,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: true, position: 'top' as const, labels: { boxWidth: 10, font: { size: 10 }, usePointStyle: true } },
        },
        scales: {
          x: { ...axisSoft, ticks: { font: { size: 10 } }, stacked: false },
          y: {
            ...axisSoft,
            ticks: { font: { size: 10 } },
            stacked: false,
          },
        },
      },
    } as any);

    this.cs.make(this.payMixCanvas.nativeElement, {
      type: 'doughnut',
      data: {
        labels: ['UPI', 'Cash', 'Card / net', 'Wallet'],
        datasets: [
          {
            data: [62, 18, 12, 8],
            backgroundColor: [`rgba(${OR_RGB},.9)`, GR, BL, PU],
            borderColor: cream,
            borderWidth: 2,
            hoverOffset: 5,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '54%',
        plugins: {
          legend: { position: 'right' as const, labels: { boxWidth: 8, font: { size: 9 }, padding: 8 } },
        },
      },
    } as any);

    this.cs.make(this.cohortCanvas.nativeElement, {
      type: 'bar',
      data: {
        labels: [...DAYS],
        datasets: [
          {
            label: 'New',
            data: [22, 28, 19, 35, 30, 40, 36],
            backgroundColor: BL,
            stack: 'c',
            borderRadius: { topLeft: 4, topRight: 4, bottomLeft: 0, bottomRight: 0 },
            maxBarThickness: 22,
          },
          {
            label: 'Repeat',
            data: [160, 170, 135, 199, 182, 236, 211],
            backgroundColor: GR,
            stack: 'c',
            borderRadius: { topLeft: 0, topRight: 0, bottomLeft: 4, bottomRight: 4 },
            maxBarThickness: 22,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: true, position: 'top' as const, labels: { boxWidth: 10, font: { size: 9 } } },
        },
        scales: {
          x: { stacked: true, ...axisSoft, ticks: { font: { size: 9 } } },
          y: { stacked: true, ...axisSoft, ticks: { font: { size: 9 } } },
        },
      },
    } as any);

    this.cs.make(this.csatCanvas.nativeElement, {
      type: 'line',
      data: {
        labels: [...DAYS],
        datasets: [
          {
            label: 'CSAT',
            data: [4.65, 4.7, 4.68, 4.72, 4.7, 4.74, 4.72],
            borderColor: AM,
            backgroundColor: 'rgba(245, 158, 11,.12)',
            fill: true,
            tension: 0.35,
            pointRadius: 3,
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { ...axisSoft, ticks: { font: { size: 9 } } },
          y: {
            ...axisSoft,
            min: 4.5,
            max: 4.85,
            ticks: { font: { size: 9 }, callback: (v: string | number) => Number(v).toFixed(2) },
          },
        },
      },
    } as any);

    this.cs.make(this.qualityCanvas.nativeElement, {
      type: 'bar',
      data: {
        labels: [...DAYS],
        datasets: [
          {
            label: 'No-show',
            data: [3, 2, 4, 1, 2, 3, 2],
            backgroundColor: '#EF4444',
            borderRadius: 4,
            maxBarThickness: 10,
          },
          {
            label: 'Cancel',
            data: [8, 6, 7, 9, 5, 8, 7],
            backgroundColor: `rgba(${OR_RGB},.65)`,
            borderRadius: 4,
            maxBarThickness: 10,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: true, position: 'top' as const, labels: { boxWidth: 10, font: { size: 9 } } },
        },
        scales: {
          x: { ...axisSoft, ticks: { font: { size: 9 } } },
          y: { ...axisSoft, ticks: { font: { size: 9 }, stepSize: 2 } },
        },
      },
    } as any);

    this.cs.make(this.zoneGmvCanvas.nativeElement, {
      type: 'bar',
      data: {
        labels: ['Tatibandh', 'Civil Ln.', 'Shankar Ng.', 'Pandri'],
        datasets: [
          {
            label: 'GMV (₹K)',
            data: [148, 112, 86, 52],
            backgroundColor: [
              `rgba(${OR_RGB},.85)`,
              `rgba(${OR_RGB},.55)`,
              `rgba(${OR_RGB},.38)`,
              `rgba(${OR_RGB},.22)`,
            ],
            borderRadius: 8,
            barThickness: 18,
          },
        ],
      },
      options: {
        indexAxis: 'y' as const,
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: {
            ...axisSoft,
            ticks: { font: { size: 10 }, callback: (v: string | number) => '₹' + v + 'K' },
          },
          y: { ...axisSoft, ticks: { font: { size: 10 } } },
        },
      },
    } as any);

    this.cs.make(this.demandPolarCanvas.nativeElement, {
      type: 'polarArea',
      data: {
        labels: ['Tatibandh', 'Civil Ln.', 'Shankar', 'Pandri', 'Outskirts'],
        datasets: [
          {
            data: [88, 72, 58, 42, 38],
            backgroundColor: [
              `rgba(${OR_RGB},.55)`,
              `rgba(${OR_RGB},.4)`,
              'rgba(28,140,82,.45)',
              'rgba(59,130,246,.4)',
              'rgba(124,58,237,.35)',
            ],
            borderWidth: 1,
            borderColor: cream,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'right' as const, labels: { boxWidth: 8, font: { size: 9 }, padding: 6 } },
        },
        scales: {
          r: {
            grid: { color: 'rgba(19,17,14,.07)' },
            ticks: { display: false, backdropColor: 'transparent' },
            pointLabels: { font: { size: 10 } },
          },
        },
      },
    } as any);
  }

  setRange(r: DateRange): void {
    this.range.set(r);
    const d = RANGES[r];
    if (this.mainChart) {
      this.mainChart.data.labels = [...d.labels];
      this.mainChart.data.datasets[0].data = [...d.rev];
      this.mainChart.data.datasets[1].data = [...d.book];
      this.mainChart.update('active');
    }
    this.updateBizMarginChartData(r);
  }

  exportSnapshot(): void {
    this.toast.show('CSV export queued (demo) — Reports → Downloads', '📥');
  }

  refreshBoard(): void {
    this.toast.show('Dashboard metrics refreshed', '✨');
  }

  openCapacityView(): void {
    this.toast.show('Capacity planner (demo) — tie to Ops → Zones', '📅');
  }
}
