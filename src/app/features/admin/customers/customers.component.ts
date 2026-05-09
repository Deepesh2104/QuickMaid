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

export type CustomerAv = 'or' | 'bl' | 'pu' | 'gr';
export type PlanKey = 'instant' | 'monthly' | 'annual';
export type HealthKey = 'vip' | 'active' | 'at-risk';

export interface CustomerRow {
  name: string;
  email: string;
  phone: string;
  zone: string;
  plan: PlanKey;
  planLabel: string;
  bookings: number;
  spent: string;
  spentTone: 'strong' | 'muted';
  lastBooking: string;
  lastTone: 'muted' | 'danger';
  health: HealthKey;
  init: string;
  av: CustomerAv;
}

@Component({
  selector: 'app-customers',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './customers.component.html',
})
export class CustomersComponent implements AfterViewInit {
  private readonly cs = inject(ChartService);
  private readonly palette = inject(CHART_PALETTE);
  readonly toast = inject(ToastService);

  @ViewChild('custChart') canvas!: ElementRef<HTMLCanvasElement>;

  readonly planFilter = signal<'all' | PlanKey>('all');
  readonly healthFilter = signal<'all' | HealthKey>('all');
  readonly searchQuery = signal('');

  readonly rows: readonly CustomerRow[] = [
    {
      name: 'Neha Agarwal',
      email: 'neha@gmail.com',
      phone: '+91 98765-11111',
      zone: 'Tatibandh',
      plan: 'monthly',
      planLabel: 'Monthly',
      bookings: 34,
      spent: '₹9,520',
      spentTone: 'strong',
      lastBooking: 'Today',
      lastTone: 'muted',
      health: 'vip',
      init: 'N',
      av: 'or',
    },
    {
      name: 'Rahul Gupta',
      email: 'rahul@gmail.com',
      phone: '+91 98765-22222',
      zone: 'Civil Lines',
      plan: 'annual',
      planLabel: 'Annual',
      bookings: 142,
      spent: '₹28,000',
      spentTone: 'strong',
      lastBooking: 'Yesterday',
      lastTone: 'muted',
      health: 'vip',
      init: 'R',
      av: 'bl',
    },
    {
      name: 'Anjali Tiwari',
      email: 'anjali@gmail.com',
      phone: '+91 98765-33333',
      zone: 'Shankar Nagar',
      plan: 'monthly',
      planLabel: 'Monthly',
      bookings: 28,
      spent: '₹7,840',
      spentTone: 'strong',
      lastBooking: '2 days ago',
      lastTone: 'muted',
      health: 'active',
      init: 'A',
      av: 'pu',
    },
    {
      name: 'Vijay Sharma',
      email: 'vijay@gmail.com',
      phone: '+91 98765-44444',
      zone: 'Pandri',
      plan: 'instant',
      planLabel: 'Instant',
      bookings: 3,
      spent: '₹447',
      spentTone: 'muted',
      lastBooking: '18 days ago',
      lastTone: 'danger',
      health: 'at-risk',
      init: 'V',
      av: 'gr',
    },
    {
      name: 'Sana Khan',
      email: 'sana@gmail.com',
      phone: '+91 98765-55555',
      zone: 'Pandri',
      plan: 'instant',
      planLabel: 'Instant',
      bookings: 11,
      spent: '₹2,180',
      spentTone: 'strong',
      lastBooking: '5 days ago',
      lastTone: 'muted',
      health: 'active',
      init: 'S',
      av: 'or',
    },
  ];

  readonly filteredRows = computed(() => {
    const q = this.searchQuery().trim().toLowerCase();
    const p = this.planFilter();
    const h = this.healthFilter();
    return this.rows.filter((r) => {
      if (p !== 'all' && r.plan !== p) return false;
      if (h !== 'all' && r.health !== h) return false;
      if (!q) return true;
      return (
        r.name.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        r.phone.replace(/\s/g, '').includes(q.replace(/\s/g, '')) ||
        r.zone.toLowerCase().includes(q)
      );
    });
  });

  readonly filteredCount = computed(() => this.filteredRows().length);
  readonly totalRows = this.rows.length;

  onSearchInput(ev: Event): void {
    this.searchQuery.set((ev.target as HTMLInputElement).value);
  }

  setPlanFilter(v: 'all' | PlanKey): void {
    this.planFilter.set(v);
  }

  setHealthFilter(v: 'all' | HealthKey): void {
    this.healthFilter.set(v);
  }

  lastColor(tone: CustomerRow['lastTone']): string {
    return tone === 'danger' ? '#EF4444' : 'var(--muted)';
  }

  spentColor(tone: CustomerRow['spentTone']): string {
    return tone === 'strong' ? 'var(--g)' : 'var(--muted)';
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.initCustChart(), 60);
  }

  private initCustChart(): void {
    const { GR, RE, OR_RGB } = this.palette;
    this.cs.make(this.canvas.nativeElement, {
      type: 'line',
      data: {
        labels: [...MONTHS],
        datasets: [
          {
            label: 'New customers',
            data: [82, 94, 78, 112, 98, 127],
            borderColor: GR,
            backgroundColor: (context: { chart: { ctx: CanvasRenderingContext2D; chartArea?: { top: number; bottom: number } } }) => {
              const { ctx: c, chartArea } = context.chart;
              if (!chartArea) return 'rgba(28,140,82,.1)';
              const g = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
              g.addColorStop(0, 'rgba(28, 140, 82, 0.2)');
              g.addColorStop(1, 'rgba(28, 140, 82, 0)');
              return g;
            },
            tension: 0.38,
            fill: true,
            pointRadius: 3,
            pointBackgroundColor: GR,
            borderWidth: 2,
          },
          {
            label: 'Churned',
            data: [18, 22, 15, 28, 32, 48],
            borderColor: RE,
            backgroundColor: 'rgba(239,68,68,.06)',
            tension: 0.38,
            fill: true,
            pointRadius: 3,
            pointBackgroundColor: RE,
            borderWidth: 2,
          },
          {
            label: 'Net adds',
            data: [64, 72, 63, 84, 66, 79],
            borderColor: `rgb(${OR_RGB})`,
            borderDash: [4, 4],
            tension: 0.38,
            fill: false,
            pointRadius: 0,
            borderWidth: 1.5,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index' as const, intersect: false },
        plugins: {
          legend: { position: 'top' as const, labels: { boxWidth: 10, font: { size: 10 }, usePointStyle: true } },
        },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 10 } } },
          y: { grid: { color: 'rgba(19,17,14,.06)' }, border: { display: false }, ticks: { font: { size: 10 } } },
        },
      },
    } as any);
  }
}
