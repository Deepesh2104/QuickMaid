import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, ViewChild, inject, signal } from '@angular/core';
import { Chart } from 'chart.js';
import { ChartService } from '@core/services/chart.service';
import { CHART_PALETTE, DAYS } from '@core/tokens/chart-palette.token';

type DateRange = '7d' | '30d' | '90d';

interface RangeData {
  labels: readonly string[];
  rev: readonly number[];
  book: readonly number[];
}

const RANGES: Readonly<Record<DateRange, RangeData>> = {
  '7d':  { labels: DAYS,                       rev: [48200, 52100, 38900, 61400, 55800, 72300, 65000], book: [182, 198, 154, 234, 212, 276, 247] },
  '30d': { labels: ['W1', 'W2', 'W3', 'W4'],   rev: [185000, 210000, 195000, 238500],                  book: [720, 810, 760, 947] },
  '90d': { labels: ['Jan', 'Feb', 'Mar'],      rev: [520000, 610000, 780000],                          book: [1920, 2340, 2980] },
};

@Component({
  selector: 'app-dashboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements AfterViewInit {
  private readonly cs = inject(ChartService);
  private readonly palette = inject(CHART_PALETTE);

  @ViewChild('mainChart') mainCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('donutChart') donutCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('heatChart') heatCanvas!: ElementRef<HTMLCanvasElement>;

  readonly range = signal<DateRange>('7d');
  private mainChart: Chart | null = null;

  ngAfterViewInit(): void {
    setTimeout(() => this.init(), 60);
  }

  private init(): void {
    const { OR, GR, BL, AM, OR_RGB } = this.palette;
    this.mainChart = this.cs.make(this.mainCanvas.nativeElement, {
      data: {
        labels: [...DAYS],
        datasets: [
          { type: 'bar',  label: 'Revenue (₹)', data: [48200, 52100, 38900, 61400, 55800, 72300, 65000], backgroundColor: `rgba(${OR_RGB},.12)`, borderColor: OR, borderWidth: 1.5, yAxisID: 'y',  borderRadius: 6 },
          { type: 'line', label: 'Bookings',    data: [182, 198, 154, 234, 212, 276, 247],               borderColor: GR, backgroundColor: 'rgba(28,140,82,.08)', tension: 0.4, fill: true, pointRadius: 3, pointBackgroundColor: GR, yAxisID: 'y1' },
        ],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        interaction: { mode: 'index' as const, intersect: false },
        plugins: { legend: { display: false } },
        scales: {
          y:  { grid: { color: 'rgba(0,0,0,.05)' }, ticks: { callback: (v: any) => '₹' + Math.round(v / 1000) + 'K' } },
          y1: { position: 'right' as const, grid: { display: false }, ticks: { color: GR } },
        },
      },
    } as any);

    this.cs.make(this.donutCanvas.nativeElement, {
      type: 'doughnut',
      data: {
        labels: ['Cleaning', 'Cooking', 'Bartan', 'Other'],
        datasets: [{ data: [42, 28, 18, 12], backgroundColor: [OR, 'rgba(28,140,82,.85)', BL, AM], borderWidth: 0, hoverOffset: 6 }],
      },
      options: { responsive: true, maintainAspectRatio: false, cutout: '72%', plugins: { legend: { display: false } } } as any,
    });

    this.cs.make(this.heatCanvas.nativeElement, {
      type: 'bar',
      data: {
        labels: ['6AM', '7AM', '8AM', '9AM', '10AM', '11AM', '12PM', '1PM', '2PM', '3PM', '4PM', '5PM', '6PM', '7PM'],
        datasets: [{
          data: [8, 22, 48, 72, 85, 76, 42, 38, 55, 68, 74, 65, 48, 32],
          backgroundColor: (ctx: any) => {
            const v = ctx.raw;
            return v > 70 ? OR : v > 50 ? `rgba(${OR_RGB},.5)` : `rgba(${OR_RGB},.22)`;
          },
          borderRadius: 5,
        }],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { x: { grid: { display: false } }, y: { grid: { color: 'rgba(0,0,0,.05)' } } },
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
    this.mainChart.update();
  }
}
