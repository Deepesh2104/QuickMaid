import { DecimalPipe } from '@angular/common';
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

export interface CustomerBookingHistory {
  id: string;
  service: string;
  date: string;
  maid: string;
  amount: string;
  status: string;
}

export interface CustomerProfileDetail {
  memberSince: string;
  address: string;
  preferredSlot: string;
  paymentMethod: string;
  csat: number;
  referrals: number;
  supportTickets: number;
  favoriteMaid: string;
  waOptIn: boolean;
  recentBookings: CustomerBookingHistory[];
  notes: string;
  tags: string[];
}

export interface CustomerMsgTemplate {
  id: string;
  label: string;
  body: string;
}

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [FormsModule, DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.css', '../shared/admin-profile.css'],
})
export class CustomersComponent implements AfterViewInit {
  private readonly cs = inject(ChartService);
  private readonly palette = inject(CHART_PALETTE);
  readonly toast = inject(ToastService);

  @ViewChild('custChart') canvas!: ElementRef<HTMLCanvasElement>;

  readonly planFilter = signal<'all' | PlanKey>('all');
  readonly healthFilter = signal<'all' | HealthKey>('all');

  readonly lastSegmentSync = signal('1h ago');
  readonly syncOpen = signal(false);
  readonly exportOpen = signal(false);
  readonly syncRunning = signal(false);
  readonly exportRunning = signal(false);
  readonly exportScope = signal<'filtered' | 'all'>('filtered');
  readonly exportMaskPii = signal(true);
  readonly syncVip = signal(true);
  readonly syncAtRisk = signal(true);
  readonly syncActive = signal(true);

  readonly profileOpen = signal(false);
  readonly profileRow = signal<CustomerRow | null>(null);

  readonly profileDetail = computed((): CustomerProfileDetail | null => {
    const c = this.profileRow();
    return c ? this.buildProfile(c) : null;
  });

  readonly messageOpen = signal(false);
  readonly messageRow = signal<CustomerRow | null>(null);
  readonly msgChannel = signal<'whatsapp' | 'sms'>('whatsapp');
  readonly msgTemplateId = signal('reminder');
  readonly msgBody = signal('');
  readonly msgSending = signal(false);
  readonly msgSchedule = signal(false);

  readonly msgTemplates: readonly CustomerMsgTemplate[] = [
    {
      id: 'reminder',
      label: 'Booking reminder',
      body: 'Hi {{name}}, aapki next QuickMaid visit {{zone}} ke liye confirm hai. Koi change chahiye to reply karein.',
    },
    {
      id: 'thanks',
      label: 'Thank you post-visit',
      body: 'Dhanyawad {{name}}! Aapka recent visit complete ho gaya. Rating dena na bhoolein 🙏 — QuickMaid',
    },
    {
      id: 'promo',
      label: 'Promo nudge',
      body: 'Hi {{name}}, MONSOON15 se 15% off — abhi book karein {{zone}} area mein. Offer limited!',
    },
    {
      id: 'winback',
      label: 'Win-back credit',
      body: 'Hi {{name}}, hum aapko miss kar rahe hain! ₹200 credit aapke account mein — next booking par use karein.',
    },
    {
      id: 'custom',
      label: 'Custom message',
      body: '',
    },
  ];

  readonly msgPreview = computed(() => {
    const c = this.messageRow();
    if (!c) return '';
    return this.interpolateMsg(this.msgBody(), c);
  });

  readonly msgCharCount = computed(() => this.msgBody().length);
  readonly msgSmsParts = computed(() => Math.max(1, Math.ceil(this.msgCharCount() / 160)));

  readonly winbackOpen = signal(false);
  readonly winbackRow = signal<CustomerRow | null>(null);
  readonly winbackAmount = signal(200);
  readonly winbackChannel = signal<'whatsapp' | 'sms' | 'both'>('whatsapp');
  readonly winbackBody = signal('');
  readonly winbackSending = signal(false);
  readonly winbackExpiry = signal('14');

  readonly winbackPreview = computed(() => {
    const c = this.winbackRow();
    if (!c) return '';
    const first = c.name.split(' ')[0] ?? c.name;
    return this.winbackBody()
      .replace(/\{\{name\}\}/g, first)
      .replace(/\{\{amount\}\}/g, `₹${this.winbackAmount()}`)
      .replace(/\{\{zone\}\}/g, c.zone);
  });
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

  openSync(): void {
    this.syncOpen.set(true);
  }

  closeSync(): void {
    this.syncOpen.set(false);
  }

  confirmSync(): void {
    this.syncRunning.set(true);
    setTimeout(() => {
      this.lastSegmentSync.set('Just now');
      this.syncRunning.set(false);
      this.closeSync();
      this.toast.show('CRM segments synced', '🔄');
    }, 800);
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
      const data = this.exportScope() === 'filtered' ? this.filteredRows() : [...this.rows];
      const header = 'name,email,phone,zone,plan,bookings,spent,health';
      const lines = data.map((c) => {
        const phone = this.exportMaskPii() ? c.phone.replace(/\d(?=\d{4})/g, '•') : c.phone;
        const email = this.exportMaskPii() ? c.email.replace(/(.{2}).+(@.+)/, '$1•••$2') : c.email;
        return [c.name, email, phone, c.zone, c.planLabel, c.bookings, c.spent, c.health].join(',');
      });
      const body = [header, ...lines].join('\n');
      const blob = new Blob([body], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'quickmaid_customers.csv';
      a.click();
      URL.revokeObjectURL(url);
      this.exportRunning.set(false);
      this.closeExport();
      this.toast.show(`Customer export · ${data.length} rows`, '📥');
    }, 500);
  }

  healthLabel(h: HealthKey): string {
    if (h === 'vip') return 'VIP';
    if (h === 'at-risk') return 'At-risk';
    return 'Active';
  }

  healthBadgeClass(h: HealthKey): string {
    if (h === 'vip') return 'badge badge-or';
    if (h === 'at-risk') return 'badge badge-red';
    return 'badge badge-green';
  }

  openProfile(row: CustomerRow): void {
    this.profileRow.set(row);
    this.profileOpen.set(true);
  }

  closeProfile(): void {
    this.profileOpen.set(false);
  }

  private buildProfile(c: CustomerRow): CustomerProfileDetail {
    const maids = ['Savita D.', 'Priya Y.', 'Kamla S.', 'Rekha S.'];
    const maid = maids[c.name.length % maids.length];
    const services = ['Home cleaning', 'Kitchen help', 'Deep clean', 'Bartan + laundry'];
    const recentBookings: CustomerBookingHistory[] = [
      {
        id: `BK-${1040 + c.bookings}`,
        service: services[0],
        date: c.lastBooking,
        maid,
        amount: c.plan === 'instant' ? '₹149' : '₹799',
        status: 'Completed',
      },
      {
        id: `BK-${1030 + c.bookings}`,
        service: services[1],
        date: 'May 6',
        maid: maids[(c.bookings + 1) % maids.length],
        amount: '₹199',
        status: 'Completed',
      },
      {
        id: `BK-${1020 + c.bookings}`,
        service: services[2],
        date: 'Apr 28',
        maid: maids[(c.bookings + 2) % maids.length],
        amount: '₹349',
        status: c.health === 'at-risk' ? 'No-show' : 'Completed',
      },
    ];
    return {
      memberSince: c.health === 'vip' ? 'Aug 2024' : c.bookings > 20 ? 'Jan 2025' : 'Mar 2026',
      address: `H.No. ${120 + c.bookings}, ${c.zone}, Raipur, CG 492001`,
      preferredSlot: c.plan === 'monthly' ? 'Mon–Sat · 8–11 AM' : 'Weekends · 4–7 PM',
      paymentMethod: c.plan === 'instant' ? 'UPI · pay per visit' : 'UPI auto-debit',
      csat: c.health === 'at-risk' ? 3.2 : c.health === 'vip' ? 4.9 : 4.5,
      referrals: c.health === 'vip' ? 4 : c.bookings > 15 ? 2 : 0,
      supportTickets: c.health === 'at-risk' ? 2 : 0,
      favoriteMaid: maid,
      waOptIn: true,
      recentBookings,
      notes:
        c.health === 'at-risk'
          ? 'Win-back call due · last visit 18+ days ago.'
          : c.health === 'vip'
            ? 'Prefers same maid · Hindi only · gate code 4421.'
            : 'Standard customer · no special notes.',
      tags:
        c.health === 'vip'
          ? ['VIP', 'Recurring', 'High LTV']
          : c.health === 'at-risk'
            ? ['Churn risk', 'Win-back']
            : ['Active', c.zone],
    };
  }

  private interpolateMsg(body: string, c: CustomerRow): string {
    const first = c.name.split(' ')[0] ?? c.name;
    return body.replace(/\{\{name\}\}/g, first).replace(/\{\{zone\}\}/g, c.zone).replace(/\{\{phone\}\}/g, c.phone);
  }

  openMessage(row: CustomerRow): void {
    this.messageRow.set(row);
    this.msgChannel.set('whatsapp');
    this.msgSchedule.set(false);
    const defaultId = row.health === 'at-risk' ? 'winback' : 'reminder';
    this.msgTemplateId.set(defaultId);
    const tpl = this.msgTemplates.find((t) => t.id === defaultId) ?? this.msgTemplates[0];
    this.msgBody.set(this.interpolateMsg(tpl.body, row));
    this.messageOpen.set(true);
  }

  closeMessage(): void {
    this.messageOpen.set(false);
  }

  onMsgTemplateChange(id: string): void {
    this.msgTemplateId.set(id);
    const c = this.messageRow();
    if (!c) return;
    const tpl = this.msgTemplates.find((t) => t.id === id);
    if (tpl && id !== 'custom') {
      this.msgBody.set(this.interpolateMsg(tpl.body, c));
    }
  }

  confirmMessage(): void {
    const c = this.messageRow();
    if (!c || !this.msgBody().trim()) return;
    this.msgSending.set(true);
    const ch = this.msgChannel();
    const scheduled = this.msgSchedule();
    window.setTimeout(() => {
      this.msgSending.set(false);
      const via = ch === 'whatsapp' ? 'WhatsApp' : 'SMS';
      this.toast.show(scheduled ? `${via} queued for ${c.name}` : `${via} sent to ${c.name}`, '💬');
      this.closeMessage();
    }, 750);
  }

  openWinback(row: CustomerRow): void {
    this.winbackRow.set(row);
    this.winbackAmount.set(200);
    this.winbackChannel.set('whatsapp');
    this.winbackExpiry.set('14');
    this.onWinbackAmountChange(200);
    this.winbackOpen.set(true);
  }

  closeWinback(): void {
    this.winbackOpen.set(false);
  }

  onWinbackAmountChange(amt: number): void {
    this.winbackAmount.set(amt);
    const c = this.winbackRow();
    if (!c) return;
    const first = c.name.split(' ')[0] ?? c.name;
    const days = this.winbackExpiry();
    this.winbackBody.set(
      `Hi ${first}, hum aapko miss kar rahe hain! ₹${amt} credit aapke wallet mein — ${c.zone} area mein next booking par use karein. Valid ${days} days.`,
    );
  }

  confirmWinback(): void {
    const c = this.winbackRow();
    if (!c || !this.winbackBody().trim()) return;
    this.winbackSending.set(true);
    const ch = this.winbackChannel();
    const via = ch === 'both' ? 'WhatsApp + SMS' : ch === 'whatsapp' ? 'WhatsApp' : 'SMS';
    window.setTimeout(() => {
      this.winbackSending.set(false);
      this.toast.show(`Win-back ₹${this.winbackAmount()} via ${via} · ${c.name}`, '🎁');
      this.closeWinback();
    }, 750);
  }

  openAction(kind: string, row: CustomerRow): void {
    if (kind === 'profile') {
      this.openProfile(row);
      return;
    }
    if (kind === 'message') {
      this.openMessage(row);
      return;
    }
    if (kind === 'winback') {
      this.openWinback(row);
      return;
    }
  }
}
