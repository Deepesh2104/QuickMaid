import { Injectable, computed, signal } from '@angular/core';

export const QM_APP_STATE_KEY = 'qm_app_state';

export interface InboundBooking {
  id: string;
  customerName: string;
  phone: string;
  zone: string;
  service: string;
  when: string;
  amount: string;
  source: 'web';
  createdAt: string;
}

export interface PartnerApplication {
  id: string;
  name: string;
  phone: string;
  city: string;
  skills: string;
  bankHint: string;
  status: 'pending';
  submittedAt: string;
}

export interface WaitlistEntry {
  city: string;
  email: string;
  at: string;
}

/** Maids approved from partner queue — persisted for demo roster */
export interface PersistedMaidRow {
  id: string;
  name: string;
  init: string;
  av: string;
  phone: string;
  zone: string;
  skills: string;
  status: 'pending';
  kycLine: string;
  lastActive: string;
  upi: string;
}

export interface AuditEntry {
  at: string;
  actor: string;
  action: string;
  target: string;
}

interface PersistedState {
  inboundBookings: InboundBooking[];
  partnerApps: PartnerApplication[];
  waitlist: WaitlistEntry[];
  approvedMaids: PersistedMaidRow[];
  extraAudit: AuditEntry[];
}

const SEED_AUDIT: AuditEntry[] = [
  { at: '2026-05-14 09:12', actor: 'asha@quickmaid.in', action: 'settings.update', target: 'maintenance_mode=false' },
  { at: '2026-05-14 08:40', actor: 'rohit@quickmaid.in', action: 'booking.reassign', target: 'BK-10432' },
  { at: '2026-05-13 18:02', actor: 'system', action: 'payout.batch', target: 'batch #882' },
  { at: '2026-05-13 11:55', actor: 'neha@quickmaid.in', action: 'customer.export', target: 'masked CSV' },
  { at: '2026-05-12 16:20', actor: 'rohit@quickmaid.in', action: 'maid.suspend', target: 'MD-1188' },
  { at: '2026-05-12 09:05', actor: 'asha@quickmaid.in', action: 'role.update', target: 'karan@quickmaid.in → Analyst' },
];

function nowStamp(): string {
  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date());
}

@Injectable({ providedIn: 'root' })
export class AppStateService {
  readonly inboundBookings = signal<InboundBooking[]>([]);
  readonly partnerApps = signal<PartnerApplication[]>([]);
  readonly waitlist = signal<WaitlistEntry[]>([]);
  readonly approvedMaids = signal<PersistedMaidRow[]>([]);
  readonly extraAudit = signal<AuditEntry[]>([]);

  readonly inboundCount = computed(() => this.inboundBookings().length);
  readonly partnerPendingCount = computed(() => this.partnerApps().length);
  readonly waitlistCount = computed(() => this.waitlist().length);
  readonly unreadAlerts = computed(() => 2 + this.inboundCount() + (this.partnerPendingCount() > 0 ? 1 : 0));

  readonly auditLog = computed(() => [...this.extraAudit(), ...SEED_AUDIT]);

  readonly maidsBadge = computed(() => {
    const n = 3 + this.partnerPendingCount();
    return n > 0 ? String(n) : undefined;
  });

  readonly bookingsBadge = computed(() => {
    const n = 12 + this.inboundCount();
    return String(n);
  });

  readonly supportBadge = computed(() => {
    const n = 5 + this.inboundCount();
    return n > 5 ? String(n) : '5';
  });

  constructor() {
    this.load();
  }

  private load(): void {
    if (typeof localStorage === 'undefined') return;
    const raw = localStorage.getItem(QM_APP_STATE_KEY);
    if (!raw) return;
    try {
      const s = JSON.parse(raw) as PersistedState;
      this.inboundBookings.set(s.inboundBookings ?? []);
      this.partnerApps.set(s.partnerApps ?? []);
      this.waitlist.set(s.waitlist ?? []);
      this.approvedMaids.set(s.approvedMaids ?? []);
      this.extraAudit.set(s.extraAudit ?? []);
    } catch {
      /* ignore */
    }
  }

  private persist(): void {
    if (typeof localStorage === 'undefined') return;
    const snap: PersistedState = {
      inboundBookings: this.inboundBookings(),
      partnerApps: this.partnerApps(),
      waitlist: this.waitlist(),
      approvedMaids: this.approvedMaids(),
      extraAudit: this.extraAudit(),
    };
    localStorage.setItem(QM_APP_STATE_KEY, JSON.stringify(snap));
  }

  addInboundBooking(input: {
    id: string;
    phone: string;
    service: string;
    when: string;
    address: string;
    amount: number;
  }): void {
    const zone = this.zoneFromAddress(input.address);
    const row: InboundBooking = {
      id: input.id,
      customerName: `Guest · ${input.phone.slice(-4)}`,
      phone: input.phone,
      zone,
      service: input.service,
      when: input.when,
      amount: `₹${input.amount}`,
      source: 'web',
      createdAt: new Date().toISOString(),
    };
    this.inboundBookings.update((list) => [row, ...list]);
    this.logAudit('booking.created', input.id, 'web');
    this.persist();
  }

  addPartnerApplication(input: {
    name: string;
    phone: string;
    city: string;
    skills: string;
    bankName: string;
  }): void {
    const id = `MD-${1100 + this.partnerApps().length}`;
    const row: PartnerApplication = {
      id,
      name: input.name,
      phone: input.phone,
      city: input.city,
      skills: input.skills,
      bankHint: input.bankName,
      status: 'pending',
      submittedAt: 'Just now',
    };
    this.partnerApps.update((list) => [row, ...list]);
    this.logAudit('partner.apply', id, 'web');
    this.persist();
  }

  addWaitlist(city: string, email: string): void {
    this.waitlist.update((list) => [{ city, email, at: new Date().toISOString() }, ...list]);
    this.logAudit('waitlist.join', `${city} · ${email}`, 'web');
    this.persist();
  }

  removePartnerApp(id: string): void {
    this.partnerApps.update((list) => list.filter((p) => p.id !== id));
    this.persist();
  }

  addApprovedMaid(row: PersistedMaidRow): void {
    this.approvedMaids.update((list) => [row, ...list.filter((m) => m.id !== row.id)]);
    this.persist();
  }

  removeWaitlistEntry(email: string, city: string): void {
    this.waitlist.update((list) =>
      list.filter((w) => !(w.email === email && w.city === city)),
    );
    this.persist();
  }

  clearWaitlist(): void {
    this.waitlist.set([]);
    this.persist();
  }

  logAudit(action: string, target: string, actor = 'system'): void {
    const entry: AuditEntry = { at: nowStamp(), actor, action, target };
    this.extraAudit.update((list) => [entry, ...list].slice(0, 50));
    this.persist();
  }

  resetDemo(): void {
    this.inboundBookings.set([]);
    this.partnerApps.set([]);
    this.waitlist.set([]);
    this.approvedMaids.set([]);
    this.extraAudit.set([]);
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(QM_APP_STATE_KEY);
    }
  }

  private zoneFromAddress(address: string): string {
    const zones = ['Tatibandh', 'Civil Lines', 'Shankar Nagar', 'Pandri', 'Telibandha', 'Mana'];
    const hit = zones.find((z) => address.toLowerCase().includes(z.toLowerCase()));
    return hit ?? 'Raipur';
  }
}
