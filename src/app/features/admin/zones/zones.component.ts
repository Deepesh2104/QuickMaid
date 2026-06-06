import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, ViewChild, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
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

export interface ZoneDetail {
  radius: string;
  activeMaids: number;
  avgRating: number;
  surgeActive: boolean;
  peakHours: string;
  topServices: string[];
  maids: { name: string; jobs: number; rating: number }[];
  notes: string;
}

@Component({
  selector: 'app-zones',
  standalone: true,
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './zones.component.html',
  styleUrls: ['./zones.component.css'],
})
export class ZonesComponent implements AfterViewInit {
  private readonly cs = inject(ChartService);
  private readonly palette = inject(CHART_PALETTE);
  readonly toast = inject(ToastService);

  @ViewChild('zoneChart') canvas!: ElementRef<HTMLCanvasElement>;

  readonly healthFilter = signal<'all' | ZoneHealth>('all');
  readonly searchQuery = signal('');

  readonly recalcOpen = signal(false);
  readonly addZoneOpen = signal(false);
  readonly policyOpen = signal(false);
  readonly detailOpen = signal(false);
  readonly detailRow = signal<ZoneRow | null>(null);

  readonly detailInfo = computed((): ZoneDetail | null => {
    const z = this.detailRow();
    return z ? this.buildDetail(z) : null;
  });

  readonly actionOpen = signal(false);
  readonly recalcRunning = signal(false);
  readonly addRunning = signal(false);
  readonly actionRunning = signal(false);
  readonly lastRecalc = signal('demo');

  readonly formZoneName = signal('');
  readonly formZoneRadius = signal('3');
  readonly actionKind = signal('');
  readonly actionRow = signal<ZoneRow | null>(null);

  readonly surgePct = signal(15);
  readonly surgeDuration = signal('4');
  readonly surgeNotify = signal(true);
  readonly assignCount = signal(2);
  readonly assignSource = signal('Pandri');

  readonly sourceZones = computed(() => this.rows.filter((z) => z.health === 'optimal' || z.health === 'good').map((z) => z.name));

  readonly actionTitle = computed(() => {
    const titles: Record<string, string> = {
      surge: 'Surge pricing',
      assign: 'Pull maids',
    };
    return titles[this.actionKind()] ?? 'Confirm';
  });

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

  openRecalc(): void {
    this.recalcOpen.set(true);
  }

  closeRecalc(): void {
    this.recalcOpen.set(false);
  }

  confirmRecalc(): void {
    this.recalcRunning.set(true);
    setTimeout(() => {
      this.lastRecalc.set('Just now');
      this.recalcRunning.set(false);
      this.closeRecalc();
      this.toast.show('Coverage recalculated', '📡');
    }, 700);
  }

  openAddZone(): void {
    this.formZoneName.set('');
    this.formZoneRadius.set('3');
    this.addZoneOpen.set(true);
  }

  closeAddZone(): void {
    this.addZoneOpen.set(false);
  }

  confirmAddZone(): void {
    const name = this.formZoneName().trim();
    if (!name) {
      this.toast.show('Zone name required', '⚠️');
      return;
    }
    this.addRunning.set(true);
    setTimeout(() => {
      this.addRunning.set(false);
      this.closeAddZone();
      this.toast.show(`New zone created · ${name}`, '🗺️');
    }, 600);
  }

  openPolicy(): void {
    this.policyOpen.set(true);
  }

  closePolicy(): void {
    this.policyOpen.set(false);
  }

  healthBadgeClass(h: ZoneHealth): string {
    if (h === 'optimal' || h === 'good') return 'badge badge-green';
    if (h === 'needs') return 'badge badge-amber';
    return 'badge badge-red';
  }

  healthLabel(h: ZoneHealth): string {
    const labels: Record<ZoneHealth, string> = {
      optimal: 'Optimal',
      good: 'Good',
      needs: 'Needs maids',
      under: 'Under-served',
      critical: 'Critical',
    };
    return labels[h];
  }

  private buildDetail(z: ZoneRow): ZoneDetail {
    const names = ['Savita D.', 'Priya Y.', 'Rekha M.', 'Mina K.', 'Kavita R.'];
    const n = z.name.length;
    return {
      radius: `${2 + (n % 3)} km`,
      activeMaids: z.supply,
      avgRating: 4.3 + (z.coveragePct % 10) / 20,
      surgeActive: z.health === 'critical' || z.health === 'under',
      peakHours: '8–11 AM · 5–8 PM',
      topServices: ['Cleaning', 'Cooking', z.demand > 50 ? 'Deep clean' : 'Utensils'],
      maids: names.slice(0, Math.min(3, z.supply % 4 + 1)).map((name, i) => ({
        name,
        jobs: 2 + i,
        rating: 4.5 + i * 0.1,
      })),
      notes:
        z.health === 'critical'
          ? 'Auto-surge +15% active · hiring SMS batch queued.'
          : z.health === 'optimal'
            ? 'Gold tier buffer · maintain 3-maid spare capacity.'
            : `ETA SLA ${z.eta} · monitor 4–7 PM window.`,
    };
  }

  openDetail(row: ZoneRow): void {
    this.detailRow.set(row);
    this.detailOpen.set(true);
  }

  closeDetail(): void {
    this.detailOpen.set(false);
  }

  openAction(kind: string, row: ZoneRow): void {
    this.actionKind.set(kind);
    this.actionRow.set(row);
    this.surgePct.set(row.health === 'critical' ? 20 : 15);
    this.surgeDuration.set('4');
    this.surgeNotify.set(true);
    this.assignCount.set(row.health === 'critical' ? 4 : 2);
    this.assignSource.set(this.sourceZones()[0] ?? 'Pandri');
    this.actionOpen.set(true);
  }

  closeAction(): void {
    this.actionOpen.set(false);
  }

  confirmAction(): void {
    const z = this.actionRow();
    const kind = this.actionKind();
    if (!z) return;
    this.actionRunning.set(true);
    window.setTimeout(() => {
      const msg =
        kind === 'surge'
          ? `Surge +${this.surgePct()}% · ${z.name}`
          : `Pull ${this.assignCount()} maids from ${this.assignSource()}`;
      const icon = kind === 'surge' ? '⚡' : '👷';
      this.actionRunning.set(false);
      this.closeAction();
      this.toast.show(msg, icon);
    }, 600);
  }
}
