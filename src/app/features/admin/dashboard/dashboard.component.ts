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

  readonly range = signal<DateRange>('7d');
  private mainChart: Chart | null = null;

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
  }

  setRange(r: DateRange): void {
    this.range.set(r);
    const d = RANGES[r];
    if (!this.mainChart) return;
    this.mainChart.data.labels = [...d.labels];
    this.mainChart.data.datasets[0].data = [...d.rev];
    this.mainChart.data.datasets[1].data = [...d.book];
    this.mainChart.update('active');
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
