import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, ViewChild, computed, inject, signal } from '@angular/core';
import { ChartService } from '@core/services/chart.service';
import { CHART_PALETTE } from '@core/tokens/chart-palette.token';
import { ToastService } from '@core/services/toast.service';

export type ZoneHealth = 'optimal' | 'good' | 'needs' | 'under' | 'critical';

export interface ZoneRow {
  name: string;
  demand: number;
  supply: number;
  coveragePct: number;
  eta: string;
  health: ZoneHealth;
}

@Component({
  selector: 'app-zones',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './zones.component.html',
})
export class ZonesComponent implements AfterViewInit {
  private readonly cs = inject(ChartService);
  private readonly palette = inject(CHART_PALETTE);
  readonly toast = inject(ToastService);

  @ViewChild('zoneChart') canvas!: ElementRef<HTMLCanvasElement>;

  readonly healthFilter = signal<'all' | ZoneHealth>('all');
  readonly searchQuery = signal('');

  readonly rows: readonly ZoneRow[] = [
    { name: 'Tatibandh', demand: 88, supply: 34, coveragePct: 97, eta: '12 min', health: 'optimal' },
    { name: 'Civil Lines', demand: 65, supply: 28, coveragePct: 91, eta: '18 min', health: 'good' },
    { name: 'Shankar Nagar', demand: 54, supply: 21, coveragePct: 78, eta: '24 min', health: 'needs' },
    { name: 'Pandri', demand: 32, supply: 12, coveragePct: 58, eta: '35 min', health: 'under' },
    { name: 'Telibandha', demand: 28, supply: 9, coveragePct: 51, eta: '41 min', health: 'critical' },
    { name: 'Mana', demand: 41, supply: 19, coveragePct: 72, eta: '27 min', health: 'needs' },
  ];

  readonly filteredZones = computed(() => {
    const f = this.healthFilter();
    const q = this.searchQuery().trim().toLowerCase();
    return this.rows.filter((z) => {
      if (f !== 'all' && z.health !== f) return false;
      if (!q) return true;
      return z.name.toLowerCase().includes(q);
    });
  });

  readonly zoneCount = computed(() => this.filteredZones().length);
  readonly zoneTotal = this.rows.length;

  readonly avgCoverage = computed(() => {
    const zs = this.rows;
    const n = zs.reduce((a, z) => a + z.coveragePct, 0) / zs.length;
    return Math.round(n);
  });

  onSearch(ev: Event): void {
    this.searchQuery.set((ev.target as HTMLInputElement).value);
  }

  setHealth(h: 'all' | ZoneHealth): void {
    this.healthFilter.set(h);
  }

  covColor(pct: number): string {
    if (pct >= 90) return 'var(--g)';
    if (pct >= 70) return '#B45309';
    return '#EF4444';
  }

  ngAfterViewInit(): void {
    const { OR_RGB } = this.palette;
    setTimeout(() => {
      this.cs.make(this.canvas.nativeElement, {
        type: 'bar',
        data: {
          labels: this.rows.map((z) => z.name),
          datasets: [
            { label: 'Demand (bookings)', data: this.rows.map((z) => z.demand), backgroundColor: `rgba(${OR_RGB},.75)`, borderRadius: 6, maxBarThickness: 28 },
            { label: 'Supply (maids)', data: this.rows.map((z) => z.supply), backgroundColor: 'rgba(29,78,216,.65)', borderRadius: 6, maxBarThickness: 28 },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'top' as const, labels: { boxWidth: 10, font: { size: 10 }, usePointStyle: true } } },
          scales: {
            x: { grid: { display: false }, ticks: { font: { size: 10 } } },
            y: { grid: { color: 'rgba(19,17,14,.06)' }, border: { display: false }, ticks: { font: { size: 10 } } },
          },
        },
      });
    }, 60);
  }
}
