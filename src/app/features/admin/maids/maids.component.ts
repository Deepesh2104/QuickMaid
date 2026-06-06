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
import { Router } from '@angular/router';
import { ChartService } from '@core/services/chart.service';
import { CHART_PALETTE, MONTHS } from '@core/tokens/chart-palette.token';
import { AppStateService, PartnerApplication, PersistedMaidRow } from '@core/services/app-state.service';
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

export interface MaidJobHistory {
  id: string;
  customer: string;
  date: string;
  service: string;
  rating: number | null;
  amount: string;
}

export interface MaidPayoutRow {
  date: string;
  amount: string;
  status: string;
}

export interface MaidDocument {
  name: string;
  status: 'verified' | 'pending' | 'missing';
}

export interface MaidProfileDetail {
  age: string;
  aadhaarMasked: string;
  address: string;
  emergencyContact: string;
  joinedDate: string;
  policeVerified: boolean;
  onTimePct: number;
  noShowCount: number;
  languages: string;
  documents: MaidDocument[];
  recentJobs: MaidJobHistory[];
  payouts: MaidPayoutRow[];
  notes: string;
}

@Component({
  selector: 'app-maids',
  standalone: true,
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './maids.component.html',
  styleUrls: ['./maids.component.css', '../shared/admin-profile.css'],
})
export class MaidsComponent implements AfterViewInit {
  private readonly cs = inject(ChartService);
  private readonly palette = inject(CHART_PALETTE);
  readonly toast = inject(ToastService);
  readonly router = inject(Router);
  private readonly appState = inject(AppStateService);

  readonly partnerApps = this.appState.partnerApps;

  @ViewChild('maidTrendChart') trendCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('ratingChart') ratingCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('maidSkillChart') skillCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('maidZoneChart') zoneChartCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('maidUtilChart') utilChartCanvas!: ElementRef<HTMLCanvasElement>;

  readonly statusFilter = signal<'all' | MaidStatus>('all');
  readonly zoneFilter = signal<string>('all');
  readonly searchQuery = signal('');

  readonly exportOpen = signal(false);
  readonly bulkOpen = signal(false);
  readonly exportScope = signal<'filtered' | 'all'>('filtered');
  readonly exportRunning = signal(false);
  readonly bulkRunning = signal(false);
  readonly bulkTarget = signal<'pending' | 'all'>('pending');

  readonly allRows = computed(() => [
    ...this.appState.approvedMaids().map((m) => this.toMaidRow(m)),
    ...this.rows,
  ]);

  readonly pendingCount = computed(() => this.allRows().filter((r) => r.status === 'pending').length);

  readonly partnerQueueOpen = signal(false);
  readonly partnerReview = signal<PartnerApplication | null>(null);
  readonly partnerRunning = signal(false);

  readonly profileOpen = signal(false);
  readonly profileRow = signal<MaidRow | null>(null);

  readonly profileDetail = computed((): MaidProfileDetail | null => {
    const m = this.profileRow();
    return m ? this.buildProfile(m) : null;
  });

  readonly actionOpen = signal(false);
  readonly actionKind = signal('');
  readonly actionRow = signal<MaidRow | null>(null);
  readonly actionRunning = signal(false);

  readonly editPhone = signal('');
  readonly editZone = signal('');
  readonly editSkills = signal('');
  readonly editUpi = signal('');

  readonly approveAadhaar = signal(true);
  readonly approveBank = signal(false);
  readonly approvePolice = signal(false);
  readonly approveTraining = signal(false);
  readonly approveNote = signal('');

  readonly rejectReason = signal('incomplete_docs');
  readonly rejectNote = signal('');

  readonly payoutAmount = signal('');
  readonly payoutRef = signal('');
  readonly payoutNotify = signal(true);

  readonly suspendReason = signal('quality');
  readonly suspendDays = signal('7');

  readonly reinstateNote = signal('');
  readonly removeTyped = signal('');

  readonly skillOptions = ['Cleaning', 'Cooking', 'Deep clean', 'Babysit', 'Utensils', 'B2B'] as const;

  readonly actionTitle = computed(() => {
    const titles: Record<string, string> = {
      edit: 'Edit worker',
      approve: 'Approve KYC',
      reject: 'Reject application',
      reinstate: 'Reinstate worker',
      remove: 'Remove from roster',
      payout: 'Process payout',
      suspend: 'Suspend worker',
    };
    return titles[this.actionKind()] ?? 'Confirm action';
  });

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
    const z = new Set(this.allRows().map((r) => r.zone));
    return [...z].sort();
  });

  readonly filteredRows = computed(() => {
    const st = this.statusFilter();
    const zf = this.zoneFilter();
    const q = this.searchQuery().trim().toLowerCase();
    return this.allRows().filter((r) => {
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
  readonly totalRows = computed(() => this.allRows().length);

  readonly kpiActive = computed(() => this.allRows().filter((r) => r.status === 'active').length);
  readonly kpiPending = computed(() => this.allRows().filter((r) => r.status === 'pending').length);
  readonly kpiSuspended = computed(() => this.allRows().filter((r) => r.status === 'suspended').length);
  readonly kpiAvgRating = computed(() => {
    const rated = this.allRows().filter((r) => r.rating != null) as (MaidRow & { rating: number })[];
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

  openExport(): void {
    this.exportOpen.set(true);
  }

  closeExport(): void {
    this.exportOpen.set(false);
  }

  confirmExport(): void {
    this.exportRunning.set(true);
    setTimeout(() => {
      const data = this.exportScope() === 'filtered' ? this.filteredRows() : [...this.allRows()];
      const header = 'id,name,phone,zone,skills,status,rating,earnings';
      const lines = data.map((r) =>
        [r.id, r.name, r.phone, r.zone, `"${r.skills}"`, r.status, r.rating ?? '', r.earnings].join(','),
      );
      const body = [header, ...lines].join('\n');
      const blob = new Blob([body], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'quickmaid_roster.csv';
      a.click();
      URL.revokeObjectURL(url);
      this.exportRunning.set(false);
      this.closeExport();
      this.toast.show(`Roster CSV · ${data.length} rows`, '📥');
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
      const n = this.bulkTarget() === 'pending' ? this.pendingCount() : this.allRows().length;
      this.bulkRunning.set(false);
      this.closeBulk();
      this.toast.show(`Doc reminder SMS · ${n} maids`, '📣');
    }, 700);
  }

  statusBadgeClass(s: MaidStatus): string {
    if (s === 'active') return 'badge badge-green';
    if (s === 'pending') return 'badge badge-amber';
    return 'badge badge-red';
  }

  statusLabel(s: MaidStatus): string {
    if (s === 'active') return 'Active';
    if (s === 'pending') return 'Pending KYC';
    return 'Suspended';
  }

  docStatusClass(s: MaidDocument['status']): string {
    if (s === 'verified') return 'badge badge-green';
    if (s === 'pending') return 'badge badge-amber';
    return 'badge badge-red';
  }

  openProfile(row: MaidRow): void {
    this.profileRow.set(row);
    this.profileOpen.set(true);
  }

  closeProfile(): void {
    this.profileOpen.set(false);
  }

  private buildProfile(m: MaidRow): MaidProfileDetail {
    const customers = ['Neha A.', 'Rahul G.', 'Anjali T.', 'Vijay S.', 'Sana K.'];
    const n = m.bookings ?? 0;
    const recentJobs: MaidJobHistory[] = [
      {
        id: `BK-${1100 + n}`,
        customer: customers[n % customers.length],
        date: m.lastActive.includes('Today') ? 'Today' : 'May 8',
        service: m.skills.split('·')[0]?.trim() ?? 'Cleaning',
        rating: m.rating,
        amount: '₹349',
      },
      {
        id: `BK-${1090 + n}`,
        customer: customers[(n + 1) % customers.length],
        date: 'May 6',
        service: 'Deep clean',
        rating: m.rating ? m.rating - 0.1 : null,
        amount: '₹499',
      },
      {
        id: `BK-${1080 + n}`,
        customer: customers[(n + 2) % customers.length],
        date: 'May 3',
        service: 'Kitchen help',
        rating: m.rating,
        amount: '₹299',
      },
    ];
    const payouts: MaidPayoutRow[] =
      m.status === 'pending'
        ? []
        : [
            { date: 'Mar 31', amount: m.earnings, status: m.status === 'suspended' ? 'Held' : 'Paid' },
            { date: 'Mar 15', amount: '₹4,200', status: 'Paid' },
            { date: 'Feb 28', amount: '₹3,850', status: 'Paid' },
          ];
    const pending = m.status === 'pending';
    const suspended = m.status === 'suspended';
    return {
      age: `${28 + (m.id.charCodeAt(m.id.length - 1) % 12)}`,
      aadhaarMasked: pending ? 'XXXX-XXXX-9012 (pending)' : `XXXX-XXXX-${m.id.slice(-4)}`,
      address: `Ward ${40 + n}, ${m.zone}, Raipur, CG`,
      emergencyContact: `+91 98${m.id.slice(-3)}-11${m.id.slice(-2)}`,
      joinedDate: pending ? '—' : suspended ? 'Jun 2024' : 'Jan 2025',
      policeVerified: !pending && m.kycLine.toLowerCase().includes('police'),
      onTimePct: suspended ? 72 : m.rating && m.rating > 4.5 ? 96 : 89,
      noShowCount: suspended ? 3 : pending ? 0 : 1,
      languages: 'Hindi · Chhattisgarhi',
      documents: [
        { name: 'Aadhaar', status: pending ? 'pending' : 'verified' },
        { name: 'Police verification', status: m.kycLine.toLowerCase().includes('police') ? 'verified' : pending ? 'pending' : 'missing' },
        { name: 'Bank / UPI', status: m.upi.includes('pending') || m.upi === '—' ? 'pending' : 'verified' },
        { name: 'Training L2', status: m.kycLine.includes('L2') || m.kycLine.includes('training') ? 'verified' : pending ? 'pending' : 'missing' },
      ],
      recentJobs: pending ? [] : recentJobs,
      payouts,
      notes:
        suspended
          ? 'Suspended after policy breach · reinstate only after ops review.'
          : pending
            ? 'Onboarding queue · complete video KYC + bank proof.'
            : `${m.kycLine} · preferred ${m.zone} cluster.`,
    };
  }

  private resetActionForms(row: MaidRow, kind: string): void {
    if (kind === 'edit') {
      this.editPhone.set(row.phone);
      this.editZone.set(row.zone);
      this.editSkills.set(row.skills);
      this.editUpi.set(row.upi);
    }
    if (kind === 'approve') {
      const p = this.buildProfile(row);
      const doc = (n: string) => p.documents.find((d) => d.name.includes(n))?.status;
      this.approveAadhaar.set(doc('Aadhaar') === 'verified' || doc('Aadhaar') === 'pending');
      this.approveBank.set(doc('Bank') === 'verified' || doc('Bank') === 'pending');
      this.approvePolice.set(doc('Police') === 'verified');
      this.approveTraining.set(doc('Training') === 'verified' || doc('Training') === 'pending');
      this.approveNote.set('');
    }
    if (kind === 'reject') {
      this.rejectReason.set('incomplete_docs');
      this.rejectNote.set('');
    }
    if (kind === 'payout') {
      this.payoutAmount.set(row.earnings);
      this.editUpi.set(row.upi);
      this.payoutRef.set(`PAY-${row.id.slice(-4)}-${Date.now().toString().slice(-4)}`);
      this.payoutNotify.set(true);
    }
    if (kind === 'suspend') {
      this.suspendReason.set('quality');
      this.suspendDays.set('7');
    }
    if (kind === 'reinstate') {
      this.reinstateNote.set('');
    }
    if (kind === 'remove') {
      this.removeTyped.set('');
    }
  }

  openAction(kind: string, row: MaidRow): void {
    if (kind === 'profile') {
      this.openProfile(row);
      return;
    }
    this.actionKind.set(kind);
    this.actionRow.set(row);
    this.resetActionForms(row, kind);
    this.actionOpen.set(true);
  }

  closeAction(): void {
    this.actionOpen.set(false);
  }

  confirmAction(): void {
    const row = this.actionRow();
    const kind = this.actionKind();
    if (!row) return;
    if (kind === 'remove' && this.removeTyped().trim().toUpperCase() !== 'REMOVE') {
      this.toast.show('Type REMOVE to confirm', '⚠️');
      return;
    }
    if (kind === 'approve' && !this.approveAadhaar()) {
      this.toast.show('Aadhaar verification required', '⚠️');
      return;
    }
    this.actionRunning.set(true);
    const icons: Record<string, string> = {
      edit: '✏️',
      approve: '✅',
      reject: '❌',
      reinstate: '♻️',
      remove: '🗑️',
      payout: '💸',
      suspend: '⛔',
    };
    const messages: Record<string, string> = {
      edit: `Updated ${row.id} · ${this.editZone()}`,
      approve: `KYC approved · ${row.name}`,
      reject: `Rejected · ${row.name}`,
      reinstate: `Reinstated · ${row.name}`,
      remove: `Removed · ${row.name}`,
      payout: `Payout ${this.payoutAmount()} → ${this.editUpi() || row.upi}`,
      suspend: `Suspended ${row.name} · ${this.suspendDays()}d`,
    };
    window.setTimeout(() => {
      this.actionRunning.set(false);
      this.toast.show(messages[kind] ?? 'Done', icons[kind] ?? '✓');
      this.closeAction();
    }, 650);
  }

  private toMaidRow(m: PersistedMaidRow): MaidRow {
    return {
      id: m.id,
      name: m.name,
      init: m.init,
      av: m.av as MaidAv,
      phone: m.phone,
      zone: m.zone,
      skills: m.skills,
      bookings: null,
      rating: null,
      earnings: '—',
      earningsTone: 'muted',
      status: m.status,
      kycLine: m.kycLine,
      lastActive: m.lastActive,
      upi: m.upi,
    };
  }

  openPartnerQueue(): void {
    const apps = this.partnerApps();
    if (apps.length === 0) return;
    this.partnerReview.set(apps[0]);
    this.partnerQueueOpen.set(true);
  }

  closePartnerQueue(): void {
    this.partnerQueueOpen.set(false);
  }

  selectPartnerApp(app: PartnerApplication): void {
    this.partnerReview.set(app);
  }

  dismissPartner(): void {
    const app = this.partnerReview();
    if (!app) return;
    this.partnerRunning.set(true);
    window.setTimeout(() => {
      this.appState.removePartnerApp(app.id);
      this.appState.logAudit('partner.dismiss', app.id, 'admin');
      const next = this.partnerApps()[0] ?? null;
      this.partnerReview.set(next);
      this.partnerRunning.set(false);
      if (!next) this.partnerQueueOpen.set(false);
      this.toast.show(`Application dismissed · ${app.name}`, '🗑️');
    }, 450);
  }

  approvePartner(): void {
    const app = this.partnerReview();
    if (!app) return;
    this.partnerRunning.set(true);
    window.setTimeout(() => {
      const init = app.name.trim().charAt(0).toUpperCase() || '?';
      const row: PersistedMaidRow = {
        id: app.id,
        name: app.name,
        init,
        av: 'bl',
        phone: app.phone,
        zone: app.city,
        skills: app.skills,
        status: 'pending',
        kycLine: `Bank · ${app.bankHint} · web apply`,
        lastActive: app.submittedAt,
        upi: '—',
      };
      this.appState.addApprovedMaid(row);
      this.appState.removePartnerApp(app.id);
      this.appState.logAudit('partner.approve', app.id, 'admin');
      const next = this.partnerApps()[0] ?? null;
      this.partnerReview.set(next);
      this.partnerRunning.set(false);
      if (!next) this.partnerQueueOpen.set(false);
      this.toast.show(`${app.name} added to roster (pending KYC)`, '✅');
    }, 650);
  }
}
