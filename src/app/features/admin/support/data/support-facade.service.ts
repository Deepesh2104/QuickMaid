import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { Chart, ChartConfiguration } from 'chart.js';
import { ChartService } from '@core/services/chart.service';
import { DispatchEngineService } from '@core/services/dispatch-engine.service';
import { ToastService } from '@core/services/toast.service';
import { CHART_PALETTE } from '@core/tokens/chart-palette.token';
import { TicketService } from './ticket.service';
import {
  ChatAttachment,
  ChatMsg,
  InboxFilter,
  Label,
  Ticket,
  TicketPriority,
  TicketSortKey,
} from '../models/ticket.model';

export type QuickActionType = 'backup' | 'refund' | 'freevisit' | 'pause' | 'wa';
export type SlidePanelType = 'call' | 'profile' | 'history';

interface PastTicketItem {
  readonly id: string;
  readonly issue: string;
  readonly date: string;
  readonly status: 'resolved' | 'closed' | 'open';
}

interface BookingHistoryItem {
  readonly id: string;
  readonly date: string;
  readonly service: string;
  readonly maid: string;
  readonly status: string;
  readonly amount: string;
}

const SUPPORT_AGENTS = [
  { id: 'priya', label: 'Priya (Support Lead)' },
  { id: 'rahul', label: 'Rahul (Senior Agent)' },
  { id: 'anita', label: 'Anita (Agent)' },
  { id: 'bot', label: 'Bot (Auto)' },
] as const;

const PRIORITY_OPTIONS: ReadonlyArray<{ value: TicketPriority; label: string }> = [
  { value: 'high', label: '🔴 High Priority' },
  { value: 'med', label: '🟡 Medium' },
  { value: 'low', label: '🟢 Low' },
];

const PAST_TICKETS_BY_CONTACT: Readonly<Record<string, readonly PastTicketItem[]>> = {
  'Vijay Sharma': [
    { id: 'T-041', issue: 'Maid late — 30 mins', date: 'Mar 22', status: 'resolved' },
    { id: 'T-028', issue: 'Plan pause request', date: 'Feb 14', status: 'resolved' },
    { id: 'T-015', issue: 'Refund for missed visit', date: 'Jan 30', status: 'resolved' },
  ],
  'Sunita Patel': [
    { id: 'T-072', issue: 'Cooking quality complaint', date: 'Jan 8', status: 'closed' },
    { id: 'T-061', issue: 'Maid swap request', date: 'Dec 12', status: 'resolved' },
  ],
  'Meena Gupta': [
    { id: 'T-055', issue: 'Billing discrepancy', date: 'Feb 2', status: 'resolved' },
  ],
  'Savita Devi': [
    { id: 'T-033', issue: 'Payout delay last week', date: 'Mar 5', status: 'resolved' },
    { id: 'T-019', issue: 'App login issue', date: 'Jan 18', status: 'closed' },
  ],
  'Rahul Gupta': [
    { id: 'T-085', issue: 'Maid 45 min late', date: 'Apr 4', status: 'resolved' },
    { id: 'T-044', issue: 'Deep clean reschedule', date: 'Feb 28', status: 'resolved' },
  ],
};

const BOOKING_HISTORY_BY_TICKET: Readonly<Record<string, readonly BookingHistoryItem[]>> = {
  'T-089': [
    { id: 'QM-1847', date: 'Jun 6 · 8:30 AM', service: 'Daily cleaning', maid: 'Savita D.', status: 'No-show', amount: '₹149' },
    { id: 'QM-1822', date: 'Jun 5 · 8:30 AM', service: 'Daily cleaning', maid: 'Savita D.', status: 'Completed', amount: '₹149' },
    { id: 'QM-1798', date: 'Jun 4 · 8:30 AM', service: 'Daily cleaning', maid: 'Kamla S.', status: 'Completed', amount: '₹149' },
  ],
  'T-088': [
    { id: 'QM-1831', date: 'Jun 6 · 6:00 AM', service: 'Deep clean', maid: 'Rekha M.', status: 'Completed', amount: '₹499' },
    { id: 'QM-1805', date: 'Jun 3 · 6:00 AM', service: 'Deep clean', maid: 'Rekha M.', status: 'Completed', amount: '₹499' },
  ],
  'T-087': [
    { id: 'QM-1760', date: 'Jun 1 · 9:00 AM', service: 'Monthly plan visit', maid: 'Anita K.', status: 'Completed', amount: '₹0' },
  ],
  'T-086': [
    { id: 'PAY-4421', date: 'Jun 2', service: 'Weekly payout', maid: '—', status: 'Pending', amount: '₹5,500' },
    { id: 'PAY-4398', date: 'May 26', service: 'Weekly payout', maid: '—', status: 'Paid', amount: '₹5,500' },
  ],
  'T-085': [
    { id: 'QM-1702', date: 'Apr 4 · 9:00 AM', service: 'Daily cleaning', maid: 'Priya L.', status: 'Late', amount: '₹149' },
  ],
};

const MAX_ATTACH_BYTES = 5 * 1024 * 1024;
const IMAGE_EXTENSIONS = new Set(['jpg', 'jpeg', 'jfif', 'png', 'gif', 'webp', 'bmp', 'svg', 'heic', 'heif']);

function isImageFile(file: File): boolean {
  if (file.type.startsWith('image/')) return true;
  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
  return IMAGE_EXTENSIONS.has(ext);
}

interface AgentStatus {
  readonly label: string;
  readonly color: string;
}

interface CannedReply {
  shortcut: string;
  text: string;
}

const AGENT_STATUSES: readonly AgentStatus[] = [
  { label: 'Online',  color: '#22C55E' },
  { label: 'Away',    color: '#F59E0B' },
  { label: 'Busy',    color: '#EF4444' },
  { label: 'Offline', color: '#94A3B8' },
];

const LABEL_PRESETS: readonly Label[] = [
  { name: 'Urgent',    color: '#EF4444' },
  { name: 'VIP',       color: '#9333EA' },
  { name: 'Bug',       color: '#1D4ED8' },
  { name: 'Billing',   color: '#B45309' },
  { name: 'Follow-up', color: '#1C8C52' },
  { name: 'Happy',     color: '#22C55E' },
];

const CHANNELS: Readonly<Record<string, string>> = {
  'T-089': '💬 WhatsApp',
  'T-088': '💬 WhatsApp',
  'T-087': '📱 In-App',
  'T-086': '📞 Call',
  'T-085': '💬 WhatsApp',
};

const AI_SUGGESTIONS: Readonly<Record<string, string>> = {
  'No-Show': '"Vijay ji, maafi chahte hain. Hum abhi backup maid arrange kar rahe hain. Refund 24hrs mein process hoga."',
  Damage:    '"Sunita ji, damage guarantee ke under full amount refund hoga. Koi tension nahi."',
  Plan:      '"Meena ji, aapki dates pe plan pause kar diya gaya hai. Kisi aur help chahiye?"',
  Payment:   '"Savita didi, payment issue check kar liya. Processing error tha — abhi fix ho raha hai."',
  Late:      '"Rahul ji, is inconvenience ke liye maafi. Ek free visit add kar di hai aapke account mein."',
};

const EMOJI_LIST = [
  '😀', '😊', '🙏', '👍', '❤️', '😢', '😡', '🎉', '✅', '⚠️',
  '💬', '📞', '🏠', '🧹', '👩‍🍳', '💸', '🔄', '⏳', '🙌', '💪',
] as const;

const BULK_SEGMENTS = [
  { name: 'All Monthly Customers', count: 312 },
  { name: 'No-Show Last 7 Days', count: 47 },
  { name: 'Inactive (14+ days)', count: 83 },
  { name: 'Annual Plan Up for Renewal', count: 28 },
] as const;

const QUICK_REPLIES = [
  { label: '👋 Namaskar', text: '👋 Namaskar! Main aapki kaise madad kar sakta/sakti hoon?' },
  { label: '🙏 Thanks', text: '🙏 Dhanyawad aapke patience ke liye!' },
  { label: '⏳ Wait', text: '⏳ Ek minute — booking details check kar raha/rahi hoon.' },
  { label: '✅ Resolved?', text: '✅ Kya aapki problem solve ho gayi hai?' },
] as const;

const SEED_CANNED: readonly CannedReply[] = [
  { shortcut: '/nm',       text: 'Namaskar! Main aapki kaise madad kar sakta/sakti hoon?' },
  { shortcut: '/refund',   text: 'Aapka refund 24-48 ghante mein process ho jaayega. UPI mein seedha aayega.' },
  { shortcut: '/noshow',   text: 'Maafi chahte hain ki maid time par nahi aayi. Hum abhi backup assign kar rahe hain.' },
  { shortcut: '/resolve',  text: 'Kya aapki problem solve ho gayi hai? Koi aur madad chahiye?' },
  { shortcut: '/wait',     text: 'Ek minute please — main aapki booking details check kar raha/rahi hoon.' },
  { shortcut: '/thanks',   text: 'Dhanyawad aapke patience ke liye! QuickMaid always aapke saath hai. 🙏' },
  { shortcut: '/pause',    text: 'Aapka plan pause kar diya gaya hai. Jab chahein resume karein — just WhatsApp karein!' },
  { shortcut: '/escalate', text: 'Yeh issue senior team ko transfer kar raha/rahi hoon. 30 min mein call aayegi.' },
];

const COLOR_BG: Readonly<Record<string, string>> = {
  bl: 'rgba(59,130,246,.12)',
  gr: 'rgba(28,140,82,.12)',
  pu: 'rgba(168,85,247,.12)',
  re: 'rgba(239,68,68,.1)',
};

const COLOR_FG: Readonly<Record<string, string>> = {
  or: 'var(--or)',
  bl: '#1D4ED8',
  gr: 'var(--g)',
  pu: '#9333EA',
  re: '#EF4444',
};

function nowTime(): string {
  const d = new Date();
  const h = d.getHours();
  const m = d.getMinutes();
  return h + ':' + (m < 10 ? '0' : '') + m + (h < 12 ? ' AM' : ' PM');
}

/**
 * Facade for the Support feature.
 *
 * Encapsulates all UI state, derived values, and side-effects
 * (timers, sounds, analytics chart rendering, ticket creation),
 * keeping `SupportComponent` a thin presenter that simply binds
 * to signals and forwards user intents.
 */
@Injectable()
export class SupportFacade {
  private readonly tickets = inject(TicketService);
  private readonly toast = inject(ToastService);
  private readonly dispatch = inject(DispatchEngineService);
  private readonly cs = inject(ChartService);
  private readonly palette = inject(CHART_PALETTE);

  readonly AGENT_STATUSES = AGENT_STATUSES;
  readonly LABEL_PRESETS = LABEL_PRESETS;
  readonly EMOJI_LIST = EMOJI_LIST;
  readonly QUICK_REPLIES = QUICK_REPLIES;
  readonly BULK_SEGMENTS = BULK_SEGMENTS;
  readonly SUPPORT_AGENTS = SUPPORT_AGENTS;
  readonly PRIORITY_OPTIONS = PRIORITY_OPTIONS;

  readonly noteMode = signal(false);
  readonly soundOn = signal(true);
  readonly agentStatusIdx = signal(0);
  readonly msgSearchOpen = signal(false);
  readonly msgSearchQuery = signal('');
  readonly msgSearchCount = signal('');
  readonly emojiOpen = signal(false);
  readonly labelPickerOpen = signal(false);
  readonly charCount = signal(0);
  readonly charCountColor = computed(() => (this.charCount() > 450 ? '#EF4444' : 'var(--muted)'));
  readonly inboxFilter = signal<InboxFilter>('all');
  readonly ticketSort = signal<TicketSortKey>('priority');
  readonly searchQuery = signal('');
  readonly bulkOpen = signal(false);
  readonly cannedOpen = signal(false);
  readonly analyticsOpen = signal(false);
  readonly mergeOpen = signal(false);
  readonly showResolveBanner = signal(false);
  readonly autoCloseBanner = signal(true);
  readonly aiBarVisible = signal(true);
  readonly inputText = signal('');
  readonly pendingAttachments = signal<ChatAttachment[]>([]);
  readonly csatRating = signal(0);
  readonly csatLabel = signal('Awaiting resolution');
  readonly slaDisplay = signal('2h 34m');
  readonly queueCount = signal(3);
  readonly avgRespTime = signal('4:04');
  readonly activeLabels = signal<Label[]>([]);
  readonly channel = signal('💬 WhatsApp');
  readonly collisionVisible = signal(false);
  readonly newCannedText = signal('');
  readonly bulkSegmentIdx = signal(0);
  readonly bulkMsg = signal(
    'Namaskar! QuickMaid ki taraf se aapko special offer — is hafte 10% cashback! 🎁',
  );
  readonly bulkChannel = signal<'whatsapp' | 'inapp' | 'email'>('whatsapp');
  readonly bulkSending = signal(false);
  readonly bulkSendLog = signal<string[]>([]);

  readonly exportOpen = signal(false);
  readonly exportFormat = signal<'csv' | 'json'>('csv');
  readonly exportScope = signal<'active' | 'all'>('active');
  readonly exportRunning = signal(false);

  readonly assignedAgentId = signal('priya');
  readonly assignedPriority = signal<TicketPriority>('med');
  readonly quickActionModal = signal<QuickActionType | null>(null);
  readonly refundAmount = signal('149');
  readonly pauseDays = signal('7');
  readonly backupSlot = signal('today-6pm');
  readonly backupMaid = signal('Kamla Sharma');
  readonly waSummary = signal('');
  readonly slidePanel = signal<SlidePanelType | null>(null);
  readonly callPhase = signal<'idle' | 'ringing' | 'connected'>('idle');

  readonly cannedList = signal<CannedReply[]>([...SEED_CANNED]);
  readonly cannedQuery = signal('');
  readonly mergeSelectedId = signal('');

  readonly ticketsList = this.tickets.tickets;
  readonly activeTicket = this.tickets.activeTicket;

  readonly visibleTickets = computed(() => {
    const f = this.inboxFilter();
    const q = this.searchQuery().toLowerCase();
    let arr = this.tickets.tickets();
    if (f !== 'all') {
      arr = f === 'bot'
        ? arr.filter((t) => t.tag === 'Bot')
        : arr.filter((t) => t.status === f);
    }
    if (q) {
      arr = arr.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.issue.toLowerCase().includes(q) ||
          t.id.toLowerCase().includes(q),
      );
    }
    const sort = this.ticketSort();
    const priorityRank: Record<TicketPriority, number> = { high: 0, med: 1, low: 2 };
    const slaRank = { urgent: 0, warn: 1, ok: 2 } as const;
    const sorted = [...arr];
    sorted.sort((a, b) => {
      if (sort === 'priority') {
        return priorityRank[a.priority] - priorityRank[b.priority];
      }
      if (sort === 'sla') {
        return slaRank[a.sla] - slaRank[b.sla];
      }
      if (sort === 'oldest') {
        return a.id.localeCompare(b.id);
      }
      return b.id.localeCompare(a.id);
    });
    return sorted;
  });

  readonly ticketCountBadge = this.tickets.handlingCount;
  readonly handlingCount = this.tickets.handlingCount;

  readonly renderedMessages = computed(() => {
    const t = this.tickets.activeTicket();
    if (!t) return [] as Array<any>;
    const out: Array<any> = [];
    let lastDay = '';
    t.msgs.forEach((m) => {
      const day = m.time.includes('Yesterday')
        ? 'Yesterday'
        : m.time.includes('days ago')
          ? '2 Days Ago'
          : 'Today';
      if (day !== lastDay) {
        out.push({ kind: 'sep', day });
        lastDay = day;
      }
      out.push({ kind: 'msg', msg: m });
    });
    return out;
  });

  readonly aiText = computed(() => {
    const t = this.tickets.activeTicket();
    if (!t) return '';
    return 'Suggested: ' + (AI_SUGGESTIONS[t.tag] ?? '"Aapki help ke liye hamesha taiyaar hain!"');
  });

  readonly aiSuggestion = computed(() => {
    const raw = this.aiText();
    if (!raw) return '';
    return raw.replace(/^Suggested:\s*/, '').replace(/^"|"$/g, '');
  });

  readonly assignedAgentLabel = computed(() => {
    const id = this.assignedAgentId();
    return SUPPORT_AGENTS.find((a) => a.id === id)?.label ?? id;
  });

  readonly pastTickets = computed((): PastTicketItem[] => {
    const t = this.tickets.activeTicket();
    if (!t) return [];
    const seed = PAST_TICKETS_BY_CONTACT[t.name] ?? [];
    const fromInbox: PastTicketItem[] = this.tickets
      .tickets()
      .filter((x) => x.name === t.name && x.id !== t.id)
      .map((x) => ({
        id: x.id,
        issue: x.issue.length > 48 ? x.issue.substring(0, 48) + '…' : x.issue,
        date: x.time,
        status: x.status === 'resolved' ? 'resolved' : 'open',
      }));
    const seen = new Set<string>();
    return [...fromInbox, ...seed].filter((item) => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });
  });

  readonly bookingHistory = computed((): BookingHistoryItem[] => {
    const t = this.tickets.activeTicket();
    if (!t) return [];
    return [...(BOOKING_HISTORY_BY_TICKET[t.id] ?? [])];
  });

  readonly filteredCanned = computed(() => {
    const q = this.cannedQuery().toLowerCase();
    if (!q) return this.cannedList();
    return this.cannedList().filter((c) => c.text.toLowerCase().includes(q) || c.shortcut.includes(q));
  });

  readonly bulkContactCount = computed(
    () => BULK_SEGMENTS[this.bulkSegmentIdx()]?.count ?? 0,
  );

  readonly mergeCandidates = computed(() => {
    const a = this.tickets.activeTicket();
    return this.tickets.tickets().filter((t) => t.id !== a?.id);
  });

  private slaTimer: ReturnType<typeof setInterval> | null = null;
  private avgRespTimer: ReturnType<typeof setInterval> | null = null;

  constructor() {
    inject(DestroyRef).onDestroy(() => this.stopTimers());
  }

  startTimers(): void {
    this.startSlaTimer();
    this.startAvgRespTimer();
  }

  private stopTimers(): void {
    if (this.slaTimer) clearInterval(this.slaTimer);
    if (this.avgRespTimer) clearInterval(this.avgRespTimer);
  }

  private startSlaTimer(): void {
    let mins = 154;
    this.slaTimer = setInterval(() => {
      mins++;
      const h = Math.floor(mins / 60);
      const m = mins % 60;
      this.slaDisplay.set(h + 'h ' + m + 'm');
    }, 60000);
  }

  private startAvgRespTimer(): void {
    this.avgRespTimer = setInterval(() => {
      const [m, s] = this.avgRespTime().split(':').map(Number);
      let ns = s + (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 5);
      let nm = m;
      if (ns < 0) { ns += 60; nm = Math.max(1, nm - 1); }
      if (ns >= 60) { ns -= 60; nm = Math.min(9, nm + 1); }
      this.avgRespTime.set(nm + ':' + (ns < 10 ? '0' : '') + ns);
    }, 30000);
  }

  colorBg(c: string): string {
    return COLOR_BG[c] ?? `rgba(${this.palette.OR_RGB},.12)`;
  }
  colorFg(c: string): string {
    return COLOR_FG[c] ?? 'var(--or)';
  }

  openTicket(t: Ticket): void {
    this.clearPendingAttachments();
    this.tickets.setActive(t);
    this.aiBarVisible.set(true);
    this.showResolveBanner.set(t.msgs.length > 3);
    this.channel.set(CHANNELS[t.id] ?? '💬 WhatsApp');

    const labels: Label[] =
      t.id === 'T-088' ? [{ name: 'Damage', color: '#EF4444' }, { name: 'VIP', color: '#9333EA' }] :
      t.id === 'T-089' ? [{ name: 'Refund', color: '#EF4444' }, { name: 'No-Show', color: this.palette.OR }] :
      t.priority === 'high' ? [{ name: 'Urgent', color: '#EF4444' }] : [];
    if (t.plan === 'Annual' && !labels.some((l) => l.name === 'VIP')) {
      labels.push({ name: 'VIP', color: '#9333EA' });
    }
    this.activeLabels.set(labels);
    this.collisionVisible.set(t.id === 'T-088');
    this.autoCloseBanner.set(t.status === 'open');
    this.assignedPriority.set(t.priority);
    this.assignedAgentId.set(t.id === 'T-088' ? 'rahul' : 'priya');
    this.slidePanel.set(null);
    this.callPhase.set('idle');
    this.quickActionModal.set(null);
  }

  addAttachment(file: File): boolean {
    if (!this.tickets.activeTicket()) {
      this.toast.show('Pehle ek ticket kholo', '⚠️');
      return false;
    }
    if (file.size > MAX_ATTACH_BYTES) {
      this.toast.show('File 5MB se chhoti honi chahiye', '⚠️');
      return false;
    }
    const isImage = isImageFile(file);
    const attachment: ChatAttachment = {
      name: file.name,
      url: URL.createObjectURL(file),
      type: isImage ? 'image' : 'file',
      size: file.size,
    };
    this.pendingAttachments.update((arr) => [...arr, attachment]);
    this.toast.show(isImage ? 'Photo attach ho gayi' : 'File attach ho gayi', isImage ? '🖼️' : '📎');
    return true;
  }

  removePendingAttachment(index: number): void {
    this.pendingAttachments.update((arr) => {
      const next = [...arr];
      const [removed] = next.splice(index, 1);
      if (removed?.url) URL.revokeObjectURL(removed.url);
      return next;
    });
  }

  clearPendingAttachments(): void {
    this.pendingAttachments().forEach((a) => {
      if (a.url) URL.revokeObjectURL(a.url);
    });
    this.pendingAttachments.set([]);
  }

  sendMessage(): { sent: boolean; ghostReply: () => void } {
    const t = this.tickets.activeTicket();
    if (!t) return { sent: false, ghostReply: () => {} };
    const text = this.inputText().trim();
    const pending = [...this.pendingAttachments()];
    if (!text && !pending.length) return { sent: false, ghostReply: () => {} };
    const timeStr = nowTime();

    if (this.noteMode()) {
      if (pending.length) {
        this.toast.show('Notes mein files attach nahi hoti', '⚠️');
        return { sent: false, ghostReply: () => {} };
      }
      this.tickets.addMessage({ from: 'system', text: '📝 Internal Note: ' + text, time: timeStr });
      this.toast.show('Internal note saved', '📝');
      this.inputText.set('');
      this.charCount.set(0);
      return { sent: false, ghostReply: () => {} };
    }

    pending.forEach((attachment) => {
      this.tickets.addMessage({
        from: 'agent',
        text: '',
        time: timeStr,
        read: false,
        attachment: { ...attachment },
      });
    });
    this.pendingAttachments.set([]);

    if (text) {
      this.tickets.addMessage({ from: 'agent', text, time: timeStr, read: false });
    }

    this.inputText.set('');
    this.charCount.set(0);
    if (t.msgs.length > 4) this.showResolveBanner.set(true);
    return {
      sent: true,
      ghostReply: () => this.scheduleGhostReply(timeStr),
    };
  }

  private scheduleGhostReply(timeStr: string): void {
    setTimeout(() => {
      const replies = [
        'Shukriya! Kab tak hoga?',
        'Theek hai, wait karta hoon.',
        'Thanks for quick response!',
        'Aur kuch baaki hai?',
      ];
      this.tickets.addMessage({
        from: 'customer',
        text: replies[Math.floor(Math.random() * replies.length)],
        time: timeStr,
        read: true,
      });
      if (this.soundOn()) this.playNotifSound();
    }, 2000 + Math.random() * 2000);
  }

  insertQuickReply(txt: string): void {
    const stripped = txt.replace(/^[^\s]+\s/, '');
    this.inputText.set(stripped);
    this.charCount.set(stripped.length);
  }

  useAi(): void {
    const txt = this.aiSuggestion();
    this.inputText.set(txt);
    this.charCount.set(txt.length);
    this.aiBarVisible.set(false);
    this.emojiOpen.set(false);
  }

  dismissAi(): void {
    this.aiBarVisible.set(false);
  }

  dismissResolveBanner(): void {
    this.showResolveBanner.set(false);
  }

  dismissCollision(): void {
    this.collisionVisible.set(false);
  }

  setAssignedAgent(id: string): void {
    this.assignedAgentId.set(id);
    const label = SUPPORT_AGENTS.find((a) => a.id === id)?.label ?? id;
    this.toast.show('Assigned to ' + label, '👤');
  }

  setAssignedPriority(priority: TicketPriority): void {
    this.assignedPriority.set(priority);
    this.tickets.updatePriority(priority);
    const label = PRIORITY_OPTIONS.find((o) => o.value === priority)?.label ?? priority;
    this.toast.show('Priority: ' + label, '🚨');
  }

  openQuickAction(type: QuickActionType): void {
    const t = this.tickets.activeTicket();
    if (!t) {
      this.toast.show('Pehle ticket select karo', '⚠️');
      return;
    }
    if (type === 'wa') {
      const first = t.name.split(' ')[0];
      this.waSummary.set(
        `Namaskar ${first} ji! QuickMaid support summary:\nTicket ${t.id} — ${t.issue}\nHum jald hi resolve karenge. 🙏`,
      );
    }
    if (type === 'refund') {
      this.refundAmount.set(t.plan === 'Annual' ? '499' : '149');
    }
    this.quickActionModal.set(type);
  }

  closeQuickAction(): void {
    this.quickActionModal.set(null);
  }

  confirmQuickAction(): void {
    const type = this.quickActionModal();
    const t = this.tickets.activeTicket();
    if (!type || !t) return;
    const timeStr = nowTime();
    const systemMsgs: Record<QuickActionType, string> = {
      backup: `🔄 Backup maid ${this.backupMaid()} assigned for ${this.backupSlotLabel()}`,
      refund: `💸 Refund of ₹${this.refundAmount()} initiated — UTR 24h mein SMS par`,
      freevisit: '🎁 1 free visit credited to customer account',
      pause: `⏸️ Plan paused for ${this.pauseDays()} days`,
      wa: '💬 Conversation summary sent on WhatsApp',
    };
    const toasts: Record<QuickActionType, string> = {
      backup: 'Backup maid assigned!',
      refund: `Refund ₹${this.refundAmount()} initiated!`,
      freevisit: 'Free visit credited!',
      pause: `Plan paused for ${this.pauseDays()} days`,
      wa: 'Summary sent on WhatsApp',
    };
    if (type === 'backup') {
      const maid =
        this.dispatch.assignBackupForBooking(t.id, t.zone, t.name) ?? this.backupMaid();
      systemMsgs.backup = `🔄 Backup maid ${maid} assigned for ${this.backupSlotLabel()}`;
    }

    this.tickets.addMessage({ from: 'system', text: systemMsgs[type], time: timeStr });
    this.toast.show(toasts[type], type === 'wa' ? '💬' : '✅');
    this.quickActionModal.set(null);
  }

  backupSlotLabel(): string {
    const map: Record<string, string> = {
      'today-6pm': 'aaj 6:00 PM',
      'today-8pm': 'aaj 8:00 PM',
      'tomorrow-8am': 'kal 8:00 AM',
      'tomorrow-6pm': 'kal 6:00 PM',
    };
    return map[this.backupSlot()] ?? this.backupSlot();
  }

  quickActionTitle(): string {
    const titles: Record<QuickActionType, string> = {
      backup: '🔄 Assign Backup Maid',
      refund: '💸 Issue Refund',
      freevisit: '🎁 Give Free Visit',
      pause: '⏸️ Pause Plan',
      wa: '💬 Send WhatsApp Summary',
    };
    return titles[this.quickActionModal()!] ?? '';
  }

  openSlidePanel(panel: SlidePanelType): void {
    if (!this.tickets.activeTicket()) {
      this.toast.show('Pehle ticket select karo', '⚠️');
      return;
    }
    this.slidePanel.set(panel);
    if (panel !== 'call') this.callPhase.set('idle');
  }

  closeSlidePanel(): void {
    this.slidePanel.set(null);
    this.callPhase.set('idle');
  }

  startCall(): void {
    this.callPhase.set('ringing');
    setTimeout(() => {
      if (this.slidePanel() === 'call') this.callPhase.set('connected');
    }, 2200);
  }

  endCall(): void {
    this.callPhase.set('idle');
    this.toast.show('Call ended', '📞');
    this.closeSlidePanel();
  }

  toggleNoteMode(): void {
    this.noteMode.update((v) => !v);
    this.emojiOpen.set(false);
  }

  toggleEmoji(): void {
    this.emojiOpen.update((v) => !v);
  }

  closeEmoji(): void {
    this.emojiOpen.set(false);
  }

  insertEmoji(e: string): void {
    this.inputText.update((v) => v + e);
    this.charCount.set(this.inputText().length);
    this.emojiOpen.set(false);
  }

  toggleSound(): void {
    this.soundOn.update((v) => !v);
    this.toast.show(this.soundOn() ? 'Sound on 🔔' : 'Sound off 🔕', this.soundOn() ? '🔔' : '🔕');
  }

  playNotifSound(): void {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.type = 'sine'; o.frequency.value = 880;
      g.gain.setValueAtTime(0, ctx.currentTime);
      g.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.05);
      g.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3);
      o.start(ctx.currentTime); o.stop(ctx.currentTime + 0.3);
    } catch {
      /* AudioContext blocked — silent fallback */
    }
  }

  cycleStatus(): void {
    this.tickets.cycleStatus();
    const t = this.tickets.activeTicket();
    if (!t) return;
    const label = t.status === 'open' ? 'Open' : t.status === 'progress' ? 'In Progress' : 'Resolved';
    this.toast.show('Status: ' + label, '🔄');
  }

  cycleAgentStatus(): void {
    const next = (this.agentStatusIdx() + 1) % this.AGENT_STATUSES.length;
    this.agentStatusIdx.set(next);
    this.toast.show('Status: ' + this.AGENT_STATUSES[next].label, '👤');
  }

  resolveTicket(): void {
    this.tickets.resolve();
    this.showResolveBanner.set(false);
    this.tickets.addMessage({
      from: 'system',
      text: '✅ Ticket resolved & closed. CSAT survey sent to customer.',
      time: nowTime(),
    });
    this.toast.show('Ticket resolved! CSAT survey sent. 🎉', '✅');
    this.csatLabel.set('CSAT survey sent to customer');
  }

  escalate(): void {
    this.toast.show('🚨 Escalated to Manager! Supervisor notified.', '🚨');
    if (!this.tickets.activeTicket()) return;
    this.tickets.addMessage({
      from: 'system',
      text: '🚨 Escalated to Senior Manager — Rahul Kumar notified',
      time: nowTime(),
    });
  }

  createNewTicket(): Ticket {
    const names = ['Kavita Patel', 'Ravi Shankar', 'Pooja Mishra'];
    const issues = ['Service quality complaint', 'Booking rescheduling', 'App not working'];
    const colors = ['or', 'bl', 'gr'] as const;
    const n = Math.floor(Math.random() * names.length);
    const newT: Ticket = {
      id: 'T-0' + Math.floor(Math.random() * 900 + 100),
      name: names[n], init: names[n][0], color: colors[n],
      type: 'Customer', issue: issues[n], priority: 'med', status: 'open',
      time: 'Just now', sla: 'warn', plan: 'Instant',
      phone: '+91 98765-' + Math.floor(10000 + Math.random() * 90000),
      zone: 'Tatibandh',
      bookings: Math.floor(1 + Math.random() * 20),
      spent: '₹' + Math.floor(500 + Math.random() * 5000).toLocaleString(),
      since: 'Apr 2026', tag: 'General', unread: true,
      msgs: [{ from: 'customer', text: issues[n] + ' ke baare mein help chahiye.', time: 'Just now', read: true }],
    };
    this.tickets.prepend(newT);
    this.openTicket(newT);
    this.queueCount.update((v) => v + 1);
    this.toast.show('New ticket created: ' + newT.id, '🎫');
    if (this.soundOn()) this.playNotifSound();
    return newT;
  }

  setInboxFilter(f: InboxFilter): void { this.inboxFilter.set(f); }

  setTicketSort(key: TicketSortKey): void {
    this.ticketSort.set(key);
  }

  toggleMsgSearch(): void {
    this.msgSearchOpen.update((v) => !v);
    if (!this.msgSearchOpen()) this.resetMsgSearch();
  }
  closeMsgSearch(): void { this.msgSearchOpen.set(false); this.resetMsgSearch(); }
  private resetMsgSearch(): void { this.msgSearchQuery.set(''); this.msgSearchCount.set(''); }

  onSearchMessages(q: string): void {
    this.msgSearchQuery.set(q);
    if (!q) { this.msgSearchCount.set(''); return; }
    const t = this.tickets.activeTicket();
    if (!t) return;
    const matches = t.msgs.filter(
      (m) => m.from !== 'system' && m.text.toLowerCase().includes(q.toLowerCase()),
    ).length;
    this.msgSearchCount.set(matches ? matches + ' result' + (matches > 1 ? 's' : '') : 'No results');
  }

  highlight(text: string): string {
    const q = this.msgSearchQuery();
    if (!q) return text;
    const safe = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return text.replace(new RegExp('(' + safe + ')', 'gi'), '<span class="msg-highlight">$1</span>');
  }

  toggleLabelPicker(e: Event): void {
    e.stopPropagation();
    this.labelPickerOpen.update((v) => !v);
  }
  addLabel(name: string, color: string): void {
    if (!this.activeLabels().some((l) => l.name === name)) {
      this.activeLabels.update((arr) => [...arr, { name, color }]);
      this.toast.show('Label added: ' + name, '🏷️');
    }
    this.labelPickerOpen.set(false);
  }
  removeLabel(name: string): void {
    this.activeLabels.update((arr) => arr.filter((l) => l.name !== name));
  }

  setCsat(n: number): void {
    this.csatRating.set(n);
    const labels = ['', 'Bahut bura 😞', 'Bura 😐', 'Theek hai 🙂', 'Achha 😊', 'Excellent! 🤩'];
    this.csatLabel.set(labels[n]);
    this.toast.show('CSAT ' + n + '/5 recorded', '⭐');
  }

  openBulkModal(): void { this.bulkOpen.set(true); }
  closeBulkModal(): void { this.bulkOpen.set(false); }
  selectBulkSegment(idx: number): void { this.bulkSegmentIdx.set(idx); }
  setBulkChannel(ch: 'whatsapp' | 'inapp' | 'email'): void {
    this.bulkChannel.set(ch);
  }

  sendBulk(): void {
    if (!this.bulkMsg().trim()) {
      this.toast.show('Message khaali hai!', '⚠️');
      return;
    }
    const count = this.bulkContactCount();
    const seg = BULK_SEGMENTS[this.bulkSegmentIdx()]?.name ?? 'Segment';
    const ch = this.bulkChannel();
    this.bulkSending.set(true);
    setTimeout(() => {
      this.bulkSending.set(false);
      this.closeBulkModal();
      const line = `${new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} · ${count} via ${ch} · ${seg}`;
      this.bulkSendLog.update((log) => [line, ...log].slice(0, 5));
      this.toast.show(`${count} contacts ko message queue ho gaya! 📢`, '📢');
    }, 900);
  }

  openExportModal(): void {
    this.exportOpen.set(true);
  }

  closeExportModal(): void {
    this.exportOpen.set(false);
  }

  confirmExport(): void {
    const t = this.tickets.activeTicket();
    const tickets =
      this.exportScope() === 'active' && t ? [t] : this.tickets.tickets();
    this.exportRunning.set(true);
    setTimeout(() => {
      const fmt = this.exportFormat();
      let body: string;
      let filename: string;
      let mime: string;
      if (fmt === 'json') {
        body = JSON.stringify(
          tickets.map((x) => ({
            id: x.id,
            customer: x.name,
            issue: x.issue,
            messages: x.msgs,
          })),
          null,
          2,
        );
        filename = 'quickmaid_support_export.json';
        mime = 'application/json';
      } else {
        const lines = ['ticket_id,customer,from,text,time'];
        tickets.forEach((x) => {
          x.msgs.forEach((m) => {
            const safe = (s: string) => `"${s.replace(/"/g, '""')}"`;
            lines.push([x.id, x.name, m.from, safe(m.text), m.time].join(','));
          });
        });
        body = lines.join('\n');
        filename = 'quickmaid_support_export.csv';
        mime = 'text/csv';
      }
      const blob = new Blob([body], { type: mime });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      this.exportRunning.set(false);
      this.exportOpen.set(false);
      this.toast.show(`Export downloaded (${tickets.length} tickets)`, '📥');
    }, 500);
  }

  openCannedModal(): void { this.cannedOpen.set(true); }
  closeCannedModal(): void { this.cannedOpen.set(false); }
  filterCanned(q: string): void { this.cannedQuery.set(q); }
  useCanned(idx: number): void {
    const c = this.filteredCanned()[idx];
    this.inputText.set(c.text);
    this.charCount.set(c.text.length);
    this.closeCannedModal();
  }
  addCanned(): void {
    const t = this.newCannedText().trim();
    if (!t) return;
    this.cannedList.update((arr) => [...arr, { shortcut: '/custom' + arr.length, text: t }]);
    this.newCannedText.set('');
    this.toast.show('Canned response saved!', '✅');
  }

  toggleAnalytics(onOpen: () => void): void {
    const next = !this.analyticsOpen();
    this.analyticsOpen.set(next);
    if (next) onOpen();
  }

  buildAnalyticsConfigs(): {
    ticket: ChartConfiguration;
    csat: ChartConfiguration;
    hour: ChartConfiguration;
  } {
    const { OR, GR, BL, AM, RE, PU, OR_RGB } = this.palette;
    return {
      ticket: {
        type: 'doughnut',
        data: {
          labels: ['No-Show', 'Damage', 'Payment', 'Plan Change', 'Quality', 'Other'],
          datasets: [{ data: [28, 14, 22, 18, 12, 6], backgroundColor: [RE, OR, AM, BL, GR, 'rgba(147,51,234,.7)'], borderWidth: 0, hoverOffset: 5 }],
        },
        options: { responsive: true, maintainAspectRatio: false, cutout: '65%', plugins: { legend: { position: 'right', labels: { font: { size: 10 } } } } } as any,
      },
      csat: {
        type: 'line',
        data: {
          labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          datasets: [{ label: 'CSAT %', data: [91, 94, 88, 96, 92, 97, 94], borderColor: PU, backgroundColor: 'rgba(147,51,234,.08)', tension: 0.4, fill: true, pointRadius: 4, pointBackgroundColor: PU }],
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: { x: { grid: { display: false } }, y: { min: 80, max: 100, grid: { color: 'rgba(0,0,0,.05)' } } },
        },
      },
      hour: {
        type: 'bar',
        data: {
          labels: ['8A', '9A', '10A', '11A', '12P', '1P', '2P', '3P', '4P', '5P', '6P'],
          datasets: [{
            data: [4, 12, 22, 18, 14, 8, 16, 20, 18, 12, 6],
            backgroundColor: (ctx: any) => {
              const v = ctx.raw;
              return v > 18 ? OR : v > 12 ? `rgba(${OR_RGB},.5)` : `rgba(${OR_RGB},.22)`;
            },
            borderRadius: 5,
          }],
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: { x: { grid: { display: false } }, y: { grid: { color: 'rgba(0,0,0,.05)' } } },
        },
      } as any,
    };
  }

  renderChart(canvas: HTMLCanvasElement | null | undefined, cfg: ChartConfiguration): Chart | null {
    return this.cs.make(canvas, cfg);
  }

  openMergeModal(): boolean {
    if (!this.tickets.activeTicket()) {
      this.toast.show('Pehle ticket select karo', '⚠️');
      return false;
    }
    this.mergeOpen.set(true);
    return true;
  }
  closeMergeModal(): void {
    this.mergeOpen.set(false);
    this.mergeSelectedId.set('');
  }
  selectMergeTicket(id: string): void { this.mergeSelectedId.set(id); }
  doMerge(): void {
    if (!this.mergeSelectedId()) { this.toast.show('Koi ticket select nahi kiya', '⚠️'); return; }
    const target = this.tickets.tickets().find((t) => t.id === this.mergeSelectedId());
    const active = this.tickets.activeTicket();
    this.toast.show(`Tickets merged: ${active?.id} ← ${target?.id}`, '🔀');
    this.closeMergeModal();
    if (active && target) {
      this.tickets.addMessage({
        from: 'system',
        text: `🔀 Ticket ${target.id} (${target.name}) merged into this ticket`,
        time: nowTime(),
      });
    }
  }

  trackById(_: number, t: Ticket): string { return t.id; }
}
