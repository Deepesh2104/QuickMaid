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
import { Router } from '@angular/router';
import { ChartService } from '@core/services/chart.service';
import { CHART_PALETTE, MONTHS } from '@core/tokens/chart-palette.token';
import { ToastService } from '@core/services/toast.service';

export type MaidAv = 'or' | 'bl' | 'gr' | 'pu' | 're';
export type MaidStatus = 'active' | 'pending' | 'suspended';

export interface MaidRow {
  id: string;
  name: string;
  init: string;
  av: MaidAv;
  phone: string;
  zone: string;
  skills: string;
  bookings: number | null;
  rating: number | null;
  earnings: string;
  earningsTone: 'success' | 'muted';
  status: MaidStatus;
  kycLine: string;
  lastActive: string;
  upi: string;
}

@Component({
  selector: 'app-maids',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './maids.component.html',
})
export class MaidsComponent implements AfterViewInit {
  private readonly cs = inject(ChartService);
  private readonly palette = inject(CHART_PALETTE);
  readonly toast = inject(ToastService);
  readonly router = inject(Router);

  @ViewChild('maidTrendChart') trendCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('ratingChart') ratingCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('maidSkillChart') skillCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('maidZoneChart') zoneChartCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('maidUtilChart') utilChartCanvas!: ElementRef<HTMLCanvasElement>;

  readonly statusFilter = signal<'all' | MaidStatus>('all');
  readonly zoneFilter = signal<string>('all');
  readonly searchQuery = signal('');

  readonly rows: readonly MaidRow[] = [
    {
      id: 'MD-1042',
      name: 'Savita Devi',
      init: 'S',
      av: 'or',
      phone: '+91 98765-00001',
      zone: 'Tatibandh',
      skills: 'Cleaning · Cooking',
      bookings: 87,
      rating: 4.9,
      earnings: '₹21,750',
      earningsTone: 'success',
      status: 'active',
      kycLine: 'Aadhaar · UPI verified',
      lastActive: 'Today · 09:40',
      upi: 'savita@upi',
    },
    {
      id: 'MD-1038',
      name: 'Priya Yadav',
      init: 'P',
      av: 'gr',
      phone: '+91 98765-00002',
      zone: 'Civil Lines',
      skills: 'Cooking · Deep clean',
      bookings: 79,
      rating: 4.8,
      earnings: '₹19,750',
      earningsTone: 'success',
      status: 'active',
      kycLine: 'Aadhaar · police ref OK',
      lastActive: 'Today · 08:15',
      upi: 'priya@upi',
    },
    {
      id: 'MD-1101',
      name: 'Rekha Singh',
      init: 'R',
      av: 'bl',
      phone: '+91 98765-00003',
      zone: 'Shankar Nagar',
      skills: 'Cleaning · Babysit',
      bookings: 64,
      rating: 4.6,
      earnings: '₹16,200',
      earningsTone: 'success',
      status: 'active',
      kycLine: 'Aadhaar · training L2',
      lastActive: 'Yesterday · 17:20',
      upi: 'rekha@upi',
    },
    {
      id: 'MD-1124',
      name: 'Mina K.',
      init: 'M',
      av: 'pu',
      phone: '+91 98765-00004',
      zone: 'Pandri',
      skills: 'Cleaning',
      bookings: 41,
      rating: 4.4,
      earnings: '₹11,400',
      earningsTone: 'success',
      status: 'active',
      kycLine: 'Aadhaar ✓',
      lastActive: 'May 8 · 14:00',
      upi: 'mina@upi',
    },
    {
      id: 'MD-1188',
      name: 'Geeta Sahu',
      init: 'G',
      av: 'or',
      phone: '+91 98765-00099',
      zone: 'Pandri',
      skills: 'Cleaning · (trainee)',
      bookings: null,
      rating: null,
      earnings: '₹0',
      earningsTone: 'muted',
      status: 'pending',
      kycLine: 'Bank proof pending',
      lastActive: '—',
      upi: 'pending@upi',
    },
    {
      id: 'MD-1190',
      name: 'Anita S.',
      init: 'A',
      av: 'gr',
      phone: '+91 98765-00102',
      zone: 'Mana',
      skills: 'Cooking',
      bookings: null,
      rating: null,
      earnings: '₹0',
      earningsTone: 'muted',
      status: 'pending',
      kycLine: 'Video KYC slot booked',
      lastActive: '—',
      upi: '—',
    },
    {
      id: 'MD-0991',
      name: 'Durga Bai',
      init: 'D',
      av: 're',
      phone: '+91 98765-00088',
      zone: 'Shankar Nagar',
      skills: 'Cleaning',
      bookings: 12,
      rating: 2.1,
      earnings: '₹3,000',
      earningsTone: 'muted',
      status: 'suspended',
      kycLine: 'Suspended · policy breach',
      lastActive: 'Mar 22',
      upi: 'durga@upi',
    },
    {
      id: 'MD-1055',
      name: 'Kavita R.',
      init: 'K',
      av: 'pu',
      phone: '+91 98765-00055',
      zone: 'Telibandha',
      skills: 'Deep clean · B2B',
      bookings: 52,
      rating: 4.7,
      earnings: '₹14,800',
      earningsTone: 'success',
      status: 'active',
      kycLine: 'Aadhaar · B2B badge',
      lastActive: 'Today · 07:50',
      upi: 'kavita@upi',
    },
  ];

  readonly zones = computed(() => {
    const z = new Set(this.rows.map((r) => r.zone));
    return [...z].sort();
  });

  readonly filteredRows = computed(() => {
    const st = this.statusFilter();
    const zf = this.zoneFilter();
    const q = this.searchQuery().trim().toLowerCase();
    return this.rows.filter((r) => {
      if (st !== 'all' && r.status !== st) return false;
      if (zf !== 'all' && r.zone !== zf) return false;
      if (!q) return true;
      return (
        r.id.toLowerCase().includes(q) ||
        r.name.toLowerCase().includes(q) ||
        r.phone.replace(/\s/g, '').includes(q.replace(/\s/g, '')) ||
        r.zone.toLowerCase().includes(q) ||
        r.skills.toLowerCase().includes(q) ||
        r.upi.toLowerCase().includes(q)
      );
    });
  });

  readonly filteredCount = computed(() => this.filteredRows().length);
  readonly totalRows = this.rows.length;

  readonly kpiActive = computed(() => this.rows.filter((r) => r.status === 'active').length);
  readonly kpiPending = computed(() => this.rows.filter((r) => r.status === 'pending').length);
  readonly kpiSuspended = computed(() => this.rows.filter((r) => r.status === 'suspended').length);
  readonly kpiAvgRating = computed(() => {
    const rated = this.rows.filter((r) => r.rating != null) as (MaidRow & { rating: number })[];
    if (!rated.length) return '—';
    const n = rated.reduce((a, r) => a + r.rating, 0) / rated.length;
    return n.toFixed(1);
  });

  onSearch(ev: Event): void {
    this.searchQuery.set((ev.target as HTMLInputElement).value);
  }

  setStatus(s: 'all' | MaidStatus): void {
    this.statusFilter.set(s);
  }

  setZone(z: string): void {
    this.zoneFilter.set(z);
  }

  earningsColor(tone: MaidRow['earningsTone']): string {
    return tone === 'success' ? 'var(--g)' : 'var(--muted)';
  }

  starLine(n: number | null): string {
    if (n == null) return '—';
    const full = Math.round(n);
    return '★'.repeat(full) + '☆'.repeat(5 - full) + ' ' + n.toFixed(1);
  }

  starTone(n: number | null): string {
    if (n == null) return 'var(--muted)';
    if (n < 3) return '#EF4444';
    if (n < 4.2) return '#B45309';
    return 'var(--ink)';
  }

  ngAfterViewInit(): void {
    const { OR, GR, BL, AM, RE, OR_RGB } = this.palette;
    setTimeout(() => {
      this.cs.make(this.trendCanvas.nativeElement, {
        type: 'line',
        data: {
          labels: [...MONTHS],
          datasets: [
            {
              label: 'New maids',
              data: [12, 18, 14, 22, 28, 19],
              borderColor: OR,
              backgroundColor: `rgba(${OR_RGB},.1)`,
              tension: 0.4,
              fill: true,
              pointRadius: 4,
              pointBackgroundColor: OR,
              borderWidth: 2,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { display: false }, ticks: { font: { size: 10 } } },
            y: { grid: { color: 'rgba(19,17,14,.06)' }, border: { display: false }, ticks: { font: { size: 10 } } },
          },
        },
      });

      this.cs.make(this.ratingCanvas.nativeElement, {
        type: 'bar',
        data: {
          labels: ['5★', '4★', '3★', '2★', '1★'],
          datasets: [
            {
              data: [124, 48, 10, 3, 1],
              backgroundColor: [GR, 'rgba(28,140,82,.5)', AM, 'rgba(245,158,11,.45)', RE],
              borderRadius: 6,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          indexAxis: 'y' as const,
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { color: 'rgba(19,17,14,.06)' }, ticks: { font: { size: 10 } } },
            y: { grid: { display: false }, ticks: { font: { size: 10 } } },
          },
        },
      });

      this.cs.make(this.skillCanvas.nativeElement, {
        type: 'doughnut',
        data: {
          labels: ['Cleaning', 'Cooking', 'Deep clean', 'B2B / combo'],
          datasets: [{ data: [58, 24, 12, 6], backgroundColor: [OR, GR, BL, AM], borderWidth: 0, hoverOffset: 6 }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '58%',
          plugins: {
            legend: {
              position: 'bottom' as const,
              labels: { boxWidth: 8, padding: 8, font: { size: 9 }, usePointStyle: true },
            },
          },
        } as any,
      });

      this.cs.make(this.zoneChartCanvas.nativeElement, {
        type: 'bar',
        data: {
          labels: ['Tatibandh', 'Civil L.', 'Shankar', 'Pandri', 'Telib.', 'Mana'],
          datasets: [
            {
              label: 'Active',
              data: [1, 1, 1, 1, 1, 0],
              backgroundColor: `rgba(${OR_RGB},.72)`,
              borderRadius: 6,
              maxBarThickness: 22,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { display: false }, ticks: { font: { size: 9 }, maxRotation: 45 } },
            y: {
              beginAtZero: true,
              suggestedMax: 3,
              ticks: { stepSize: 1, font: { size: 10 } },
              grid: { color: 'rgba(19,17,14,.06)' },
              border: { display: false },
            },
          },
        },
      });

      this.cs.make(this.utilChartCanvas.nativeElement, {
        type: 'line',
        data: {
          labels: ['W1', 'W2', 'W3', 'W4'],
          datasets: [
            {
              label: 'Jobs / maid (avg)',
              data: [11.2, 11.8, 10.4, 12.1],
              borderColor: GR,
              backgroundColor: 'rgba(28,140,82,.12)',
              tension: 0.35,
              fill: true,
              pointRadius: 4,
              pointBackgroundColor: GR,
              borderWidth: 2,
            },
            {
              label: 'On-time %',
              data: [88, 91, 85, 93],
              borderColor: BL,
              backgroundColor: 'transparent',
              tension: 0.35,
              fill: false,
              pointRadius: 3,
              pointBackgroundColor: BL,
              borderWidth: 2,
              yAxisID: 'y1',
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top' as const,
              labels: { boxWidth: 8, font: { size: 9 }, usePointStyle: true },
            },
          },
          scales: {
            x: { grid: { display: false }, ticks: { font: { size: 10 } } },
            y: {
              id: 'y',
              position: 'left' as const,
              grid: { color: 'rgba(19,17,14,.06)' },
              border: { display: false },
              ticks: { font: { size: 9 } },
              title: { display: true, text: 'Jobs / maid', font: { size: 9 }, color: 'var(--muted)' },
            },
            y1: {
              id: 'y1',
              position: 'right' as const,
              grid: { drawOnChartArea: false },
              border: { display: false },
              min: 70,
              max: 100,
              ticks: { font: { size: 9 }, callback: (v: string | number) => `${v}%` },
              title: { display: true, text: 'On-time', font: { size: 9 }, color: 'var(--muted)' },
            },
          },
        },
      } as any);
    }, 60);
  }
}
