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
import { CHART_PALETTE, DAYS } from '@core/tokens/chart-palette.token';
import { ToastService } from '@core/services/toast.service';

export type BookingAv = 'or' | 'bl' | 'pu' | 'gr';
export type BookingStatus = 'completed' | 'ongoing' | 'no-show';

export interface BookingRow {
  id: string;
  customerName: string;
  customerZone: string;
  customerInit: string;
  customerAv: BookingAv;
  maidName: string | null;
  maidInit: string | null;
  maidAv: BookingAv | null;
  maidUnassigned: boolean;
  service: string;
  when: string;
  amount: string;
  amountTone: 'success' | 'warn' | 'muted';
  status: BookingStatus;
}

@Component({
  selector: 'app-bookings',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './bookings.component.html',
})
export class BookingsComponent implements AfterViewInit {
  private readonly cs = inject(ChartService);
  private readonly palette = inject(CHART_PALETTE);
  readonly toast = inject(ToastService);

  @ViewChild('bookWeekChart') canvas!: ElementRef<HTMLCanvasElement>;

  readonly statusFilter = signal<'all' | BookingStatus>('all');
  readonly searchQuery = signal('');

  readonly rows: readonly BookingRow[] = [
    {
      id: '#1847',
      customerName: 'Neha Agarwal',
      customerZone: 'Tatibandh',
      customerInit: 'N',
      customerAv: 'or',
      maidName: 'Savita Devi',
      maidInit: 'S',
      maidAv: 'gr',
      maidUnassigned: false,
      service: 'Cleaning · 2h',
      when: 'May 9 · 10:00 AM',
      amount: '₹298',
      amountTone: 'success',
      status: 'completed',
    },
    {
      id: '#1846',
      customerName: 'Rahul Gupta',
      customerZone: 'Civil Lines',
      customerInit: 'R',
      customerAv: 'bl',
      maidName: 'Priya Yadav',
      maidInit: 'P',
      maidAv: 'bl',
      maidUnassigned: false,
      service: 'Cooking · 1h',
      when: 'May 9 · 9:30 AM',
      amount: '₹199',
      amountTone: 'warn',
      status: 'ongoing',
    },
    {
      id: '#1845',
      customerName: 'Anjali Tiwari',
      customerZone: 'Shankar Nagar',
      customerInit: 'A',
      customerAv: 'pu',
      maidName: 'Rekha Singh',
      maidInit: 'R',
      maidAv: 'or',
      maidUnassigned: false,
      service: 'Utensils · 1h',
      when: 'May 9 · 9:00 AM',
      amount: '₹149',
      amountTone: 'success',
      status: 'completed',
    },
    {
      id: '#1844',
      customerName: 'Vijay Sharma',
      customerZone: 'Pandri',
      customerInit: 'V',
      customerAv: 'gr',
      maidName: null,
      maidInit: null,
      maidAv: null,
      maidUnassigned: true,
      service: 'Cleaning · 1h',
      when: 'May 9 · 8:30 AM',
      amount: '₹149',
      amountTone: 'muted',
      status: 'no-show',
    },
    {
      id: '#1843',
      customerName: 'Kiran Bose',
      customerZone: 'Tatibandh',
      customerInit: 'K',
      customerAv: 'or',
      maidName: 'Mina K.',
      maidInit: 'M',
      maidAv: 'gr',
      maidUnassigned: false,
      service: 'Deep clean · 3h',
      when: 'May 8 · 4:00 PM',
      amount: '₹549',
      amountTone: 'success',
      status: 'completed',
    },
  ];

  readonly filteredRows = computed(() => {
    const q = this.searchQuery().trim().toLowerCase();
    const f = this.statusFilter();
    return this.rows.filter((r) => {
      if (f !== 'all' && r.status !== f) return false;
      if (!q) return true;
      return (
        r.id.toLowerCase().includes(q) ||
        r.customerName.toLowerCase().includes(q) ||
        r.service.toLowerCase().includes(q) ||
        (r.maidName?.toLowerCase().includes(q) ?? false)
      );
    });
  });

  readonly filteredCount = computed(() => this.filteredRows().length);
  readonly totalRows = this.rows.length;

  onSearchInput(ev: Event): void {
    const v = (ev.target as HTMLInputElement).value;
    this.searchQuery.set(v);
  }

  setStatusFilter(s: 'all' | BookingStatus): void {
    this.statusFilter.set(s);
  }

  amtColor(tone: BookingRow['amountTone']): string {
    if (tone === 'success') return 'var(--g)';
    if (tone === 'warn') return '#B45309';
    return 'var(--muted)';
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.initWeekChart(), 60);
  }

  private initWeekChart(): void {
    const { OR_RGB } = this.palette;
    this.cs.make(this.canvas.nativeElement, {
      type: 'bar',
      data: {
        labels: [...DAYS],
        datasets: [
          {
            label: 'Completed',
            data: [312, 287, 334, 298, 356, 412, 278],
            backgroundColor: (context: { chart: { ctx: CanvasRenderingContext2D; chartArea?: { top: number; bottom: number } } }) => {
              const { ctx: c, chartArea } = context.chart;
              if (!chartArea) return `rgba(${OR_RGB},.55)`;
              const g = c.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
              g.addColorStop(0, `rgba(${OR_RGB},.35)`);
              g.addColorStop(1, `rgba(${OR_RGB},.78)`);
              return g;
            },
            borderRadius: 8,
            maxBarThickness: 22,
          },
          {
            label: 'Cancelled / no-show',
            data: [12, 8, 15, 6, 9, 14, 7],
            backgroundColor: 'rgba(239,68,68,.55)',
            borderRadius: 8,
            maxBarThickness: 22,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
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
