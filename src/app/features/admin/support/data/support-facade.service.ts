import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { Chart, ChartConfiguration } from 'chart.js';
import { ChartService } from '@core/services/chart.service';
import { ToastService } from '@core/services/toast.service';
import { CHART_PALETTE } from '@core/tokens/chart-palette.token';
import { TicketService } from './ticket.service';
import { ChatMsg, InboxFilter, Label, Ticket } from '../models/ticket.model';

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
  private readonly cs = inject(ChartService);
  private readonly palette = inject(CHART_PALETTE);

  readonly AGENT_STATUSES = AGENT_STATUSES;
  readonly LABEL_PRESETS = LABEL_PRESETS;

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
  readonly searchQuery = signal('');
  readonly bulkOpen = signal(false);
  readonly cannedOpen = signal(false);
  readonly analyticsOpen = signal(false);
  readonly mergeOpen = signal(false);
  readonly showResolveBanner = signal(false);
  readonly autoCloseBanner = signal(true);
  readonly aiBarVisible = signal(true);
  readonly inputText = signal('');
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
    return arr;
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

  readonly filteredCanned = computed(() => {
    const q = this.cannedQuery().toLowerCase();
    if (!q) return this.cannedList();
    return this.cannedList().filter((c) => c.text.toLowerCase().includes(q) || c.shortcut.includes(q));
  });

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
  }

  sendMessage(): { sent: boolean; ghostReply: () => void } {
    const t = this.tickets.activeTicket();
    if (!t) return { sent: false, ghostReply: () => {} };
    const text = this.inputText().trim();
    if (!text) return { sent: false, ghostReply: () => {} };
    const timeStr = nowTime();
    if (this.noteMode()) {
      this.tickets.addMessage({ from: 'system', text: '📝 Internal Note: ' + text, time: timeStr });
      this.toast.show('Internal note saved', '📝');
    } else {
      this.tickets.addMessage({ from: 'agent', text, time: timeStr, read: false });
    }
    this.inputText.set('');
    this.charCount.set(0);
    if (t.msgs.length > 4) this.showResolveBanner.set(true);
    return {
      sent: !this.noteMode(),
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
    const txt = this.aiText().replace('Suggested: ', '').replace(/^"|"$/g, '');
    this.inputText.set(txt);
    this.charCount.set(txt.length);
    this.aiBarVisible.set(false);
  }

  toggleNoteMode(): void { this.noteMode.update((v) => !v); }
  toggleEmoji(): void { this.emojiOpen.update((v) => !v); }

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
  sendBulk(): void {
    if (!this.bulkMsg().trim()) { this.toast.show('Message khaali hai!', '⚠️'); return; }
    this.closeBulkModal();
    this.toast.show('312 contacts ko message bheja ja raha hai! 📢', '📢');
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
