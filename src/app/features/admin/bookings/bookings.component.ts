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
import { AppStateService } from '@core/services/app-state.service';
import { DispatchEngineService } from '@core/services/dispatch-engine.service';
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

export interface BookingTimelineEvent {
  time: string;
  label: string;
  done: boolean;
  current?: boolean;
}

export interface BookingDetail {
  customerPhone: string;
  customerAddress: string;
  paymentMethod: string;
  paymentStatus: string;
  maidPhone: string | null;
  maidRating: number | null;
  duration: string;
  instructions: string;
  timeline: BookingTimelineEvent[];
  csat: number | null;
  notes: string;
}

@Component({
  selector: 'app-bookings',
  standalone: true,
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './bookings.component.html',
  styleUrls: ['./bookings.component.css'],
})
export class BookingsComponent implements AfterViewInit {
  private readonly cs = inject(ChartService);
  private readonly palette = inject(CHART_PALETTE);
  private readonly dispatch = inject(DispatchEngineService);
  private readonly appState = inject(AppStateService);
  readonly toast = inject(ToastService);

  @ViewChild('bookWeekChart') canvas!: ElementRef<HTMLCanvasElement>;

  readonly statusFilter = signal<'all' | BookingStatus>('all');
  readonly searchQuery = signal('');

  readonly lastSync = signal('Live');
  readonly refreshOpen = signal(false);
  readonly exportOpen = signal(false);
  readonly bulkOpen = signal(false);
  readonly refreshRunning = signal(false);
  readonly exportRunning = signal(false);
  readonly bulkRunning = signal(false);
  readonly exportScope = signal<'filtered' | 'all'>('filtered');
  readonly bulkZone = signal('all');

  readonly zones = computed(() => {
    const z = new Set(this.rows().map((r) => r.customerZone));
    return [...z].sort();
  });

  readonly ongoingCount = computed(() => this.rows().filter((r) => r.status === 'ongoing').length);

  readonly detailOpen = signal(false);
  readonly detailRow = signal<BookingRow | null>(null);

  readonly detailInfo = computed((): BookingDetail | null => {
    const b = this.detailRow();
    return b ? this.buildDetail(b) : null;
  });

  readonly actionOpen = signal(false);
  readonly actionKind = signal('');
  readonly actionRow = signal<BookingRow | null>(null);
  readonly actionRunning = signal(false);
  readonly cancelReason = signal('customer_request');
  readonly cancelNotify = signal(true);
  readonly refundAmount = signal('');
  readonly refundReason = signal('no_show');
  readonly reassignMaidId = signal('');
  readonly trackEta = signal('12 min');

  readonly reassignOptions = computed(() => {
    const b = this.actionRow();
    const pool = this.dispatch.maids().filter((m) => m.online);
    if (!b) return pool;
    const zone = b.customerZone.toLowerCase();
    const matched = pool.filter(
      (m) => m.zone.toLowerCase() === zone || m.zone.toLowerCase().includes(zone) || zone.includes(m.zone.toLowerCase()),
    );
    return matched.length ? matched : pool;
  });

  readonly actionTitle = computed(() => {
    const titles: Record<string, string> = {
      track: 'Live tracking',
      cancel: 'Cancel booking',
      reassign: 'Reassign maid',
      refund: 'Initiate refund',
    };
    return titles[this.actionKind()] ?? 'Confirm action';
  });

  private readonly seedRows: readonly BookingRow[] = [
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

  readonly rows = computed((): readonly BookingRow[] => {
    const inbound = this.appState.inboundBookings().map(
      (b): BookingRow => ({
        id: b.id,
        customerName: b.customerName,
        customerZone: b.zone,
        customerInit: 'G',
        customerAv: 'gr',
        maidName: null,
        maidInit: null,
        maidAv: null,
        maidUnassigned: true,
        service: b.service,
        when: b.when,
        amount: b.amount,
        amountTone: 'warn',
        status: 'ongoing',
      }),
    );
    return [...inbound, ...this.seedRows];
  });

  readonly filteredRows = computed(() => {
    const q = this.searchQuery().trim().toLowerCase();
    const f = this.statusFilter();
    return this.rows().filter((r) => {
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
  readonly totalRows = computed(() => this.rows().length);

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
      this.toast.show('Board refreshed', '✨');
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
      const data = this.exportScope() === 'filtered' ? this.filteredRows() : [...this.rows()];
      const header = 'id,customer,zone,maid,service,when,amount,status';
      const lines = data.map((b) =>
        [
          b.id,
          b.customerName,
          b.customerZone,
          b.maidName ?? 'Unassigned',
          `"${b.service}"`,
          b.when,
          b.amount,
          b.status,
        ].join(','),
      );
      const body = [header, ...lines].join('\n');
      const blob = new Blob([body], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'quickmaid_bookings.csv';
      a.click();
      URL.revokeObjectURL(url);
      this.exportRunning.set(false);
      this.closeExport();
      this.toast.show(`Bookings CSV · ${data.length} rows`, '📥');
    }, 500);
  }

  openBulk(): void {
    this.bulkOpen.set(true);
  }

  closeBulk(): void {
    this.bulkOpen.set(false);
  }

  confirmBulk(): void {
    this.bulkRunning.set(true);
    setTimeout(() => {
      const zone = this.bulkZone();
      const pool = this.rows().filter((r) => r.status === 'ongoing' && r.maidUnassigned);
      const n = zone === 'all' ? pool.length : pool.filter((r) => r.customerZone === zone).length;
      this.bulkRunning.set(false);
      this.closeBulk();
      this.toast.show(`Bulk assign · ${n || this.ongoingCount()} jobs queued`, '👥');
    }, 700);
  }

  statusBadgeClass(s: BookingStatus): string {
    if (s === 'completed') return 'badge badge-green';
    if (s === 'ongoing') return 'badge badge-amber';
    return 'badge badge-red';
  }

  statusLabel(s: BookingStatus): string {
    if (s === 'completed') return 'Completed';
    if (s === 'ongoing') return 'Ongoing';
    return 'No-show';
  }

  openDetail(row: BookingRow): void {
    this.detailRow.set(row);
    this.detailOpen.set(true);
  }

  closeDetail(): void {
    this.detailOpen.set(false);
  }

  private buildDetail(b: BookingRow): BookingDetail {
    const n = parseInt(b.id.replace(/\D/g, ''), 10) || 1840;
    const phone = `+91 98765-${String(n % 100000).padStart(5, '0')}`;
    const timelines: Record<BookingStatus, BookingTimelineEvent[]> = {
      completed: [
        { time: 'May 8 · 9:00 AM', label: 'Booking confirmed', done: true },
        { time: 'May 8 · 9:15 AM', label: `Maid assigned · ${b.maidName ?? '—'}`, done: true },
        { time: 'May 9 · 10:00 AM', label: 'Visit started', done: true },
        { time: 'May 9 · 12:05 PM', label: 'Visit completed', done: true },
        { time: 'May 9 · 12:08 PM', label: `Payment captured · ${b.amount}`, done: true },
      ],
      ongoing: [
        { time: 'May 9 · 8:00 AM', label: 'Booking confirmed', done: true },
        { time: 'May 9 · 8:20 AM', label: `Maid assigned · ${b.maidName ?? '—'}`, done: true },
        { time: 'May 9 · 9:30 AM', label: 'Maid en route', done: true, current: true },
        { time: '—', label: 'Visit in progress', done: false },
        { time: '—', label: 'Payment pending', done: false },
      ],
      'no-show': [
        { time: 'May 9 · 7:45 AM', label: 'Booking confirmed', done: true },
        { time: 'May 9 · 8:00 AM', label: 'No maid assigned (SLA breach)', done: true },
        { time: 'May 9 · 8:45 AM', label: 'No-show flagged', done: true, current: true },
        { time: '—', label: 'Refund pending', done: false },
      ],
    };
    return {
      customerPhone: phone,
      customerAddress: `H.No. ${100 + (n % 80)}, ${b.customerZone}, Raipur, CG`,
      paymentMethod: 'UPI · QuickMaid wallet',
      paymentStatus: b.status === 'completed' ? 'Paid' : b.status === 'no-show' ? 'Refund queued' : 'Authorized',
      maidPhone: b.maidName ? `+91 98765-0${String(n % 1000).padStart(4, '0')}` : null,
      maidRating: b.maidName ? 4.5 + (n % 5) * 0.1 : null,
      duration: b.service.includes('3h') ? '3h' : b.service.includes('2h') ? '2h' : '1h',
      instructions: b.status === 'no-show' ? 'Gate code expired — customer unreachable' : 'Ring bell twice · shoes outside',
      timeline: timelines[b.status],
      csat: b.status === 'completed' ? 4 + (n % 10) / 10 : null,
      notes:
        b.status === 'no-show'
          ? 'Ops queue · assign backup or refund within 2h SLA.'
          : b.status === 'ongoing'
            ? 'Live GPS ping every 3 min · customer notified on start.'
            : 'Standard visit · CSAT survey sent post-completion.',
    };
  }

  openAction(kind: string, row: BookingRow): void {
    if (kind === 'view') {
      this.openDetail(row);
      return;
    }
    this.actionKind.set(kind);
    this.actionRow.set(row);
    this.cancelReason.set('customer_request');
    this.cancelNotify.set(true);
    this.refundAmount.set(row.amount);
    this.refundReason.set('no_show');
    const opts = this.dispatch.maids().filter((m) => m.online);
    const zone = row.customerZone.toLowerCase();
    const matched = opts.filter(
      (m) => m.zone.toLowerCase() === zone || m.zone.toLowerCase().includes(zone),
    );
    this.reassignMaidId.set((matched[0] ?? opts[0])?.id ?? '');
    this.trackEta.set(row.status === 'ongoing' ? '12 min' : '—');
    this.actionOpen.set(true);
  }

  closeAction(): void {
    this.actionOpen.set(false);
  }

  confirmAction(): void {
    const b = this.actionRow();
    const kind = this.actionKind();
    if (!b) return;
    this.actionRunning.set(true);

    const finish = (msg: string, icon: string) => {
      window.setTimeout(() => {
        this.actionRunning.set(false);
        this.toast.show(msg, icon);
        this.closeAction();
      }, 650);
    };

    if (kind === 'cancel') {
      const note = this.cancelNotify() ? ' · customer notified' : '';
      finish(`Cancelled ${b.id}${note}`, '❌');
      return;
    }

    if (kind === 'refund') {
      finish(`Refund ${this.refundAmount() || b.amount} queued · ${b.id}`, '💸');
      return;
    }

    if (kind === 'reassign') {
      const selected = this.dispatch.maids().find((m) => m.id === this.reassignMaidId());
      if (selected) {
        this.dispatch.assignBackupForBooking(b.id, b.customerZone, b.customerName);
        finish(`Reassigned ${b.id} → ${selected.name}`, '🔄');
      } else {
        const maid = this.dispatch.assignBackupForBooking(b.id, b.customerZone, b.customerName);
        this.actionRunning.set(false);
        if (maid) {
          this.toast.show(`Backup ${maid} assigned!`, '🔄');
        } else {
          this.toast.show('No backup maid in zone — ops queue', '🚨');
        }
        this.closeAction();
      }
      return;
    }

    finish('Done', '✓');
  }
}
