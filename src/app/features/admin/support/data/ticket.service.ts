import { Injectable, computed, signal } from '@angular/core';
import { ChatMsg, InboxFilter, Ticket, TicketPriority, TicketStatus } from '../models/ticket.model';

const SEED_TICKETS: Ticket[] = [
  {
    id: 'T-089', name: 'Vijay Sharma', init: 'V', color: 'or', type: 'Customer',
    issue: 'Maid no-show — refund chahiye. Subah 8:30 pe booking thi, koi nahi aaya.',
    priority: 'high', status: 'open', time: '2h ago', sla: 'urgent',
    plan: 'Monthly', phone: '+91 98765-44444', zone: 'Pandri',
    bookings: 34, spent: '₹9,520', since: 'Jan 2026', tag: 'No-Show', unread: true,
    msgs: [
      { from: 'customer', text: 'Hello! Meri maid aaj nahi aayi. 8:30 ka booking tha. Koi call bhi nahi aaya.', time: '8:45 AM', read: true },
      { from: 'customer', text: 'Please refund karo. Mujhe office bhi jaana tha.', time: '8:52 AM', read: true },
      { from: 'system', text: 'Ticket #T-089 auto-created — No-Show detected', time: '8:53 AM' },
      { from: 'agent', text: 'Namaskar Vijay ji! Aapki pareshani samajh aaye. Hum abhi investigate kar rahe hain.', time: '9:01 AM', read: true },
      { from: 'customer', text: 'Booking ID #QM-1847 tha. Maid Savita dikha raha tha app par.', time: '9:04 AM', read: true },
      { from: 'agent', text: 'Haan, slot confirm hai. Ops team maid location trace kar raha hai.', time: '9:06 AM', read: true },
      { from: 'customer', text: 'Agar aaj backup possible ho to batao, warna full refund chahiye.', time: '9:10 AM', read: true },
      { from: 'agent', text: 'Backup maid assign karne ki koshish ho rahi hai — 15 min mein update.', time: '9:12 AM', read: true },
      { from: 'system', text: 'Maid device last ping · Pandri 7:58 AM', time: '9:14 AM' },
      { from: 'agent', text: 'Refund policy: no-show par 100% visit amount 24h mein. Aapko SMS bhi jaayega.', time: '9:18 AM', read: true },
      { from: 'customer', text: 'Theek. SMS par UTR bhej dena.', time: '9:20 AM', read: true },
      { from: 'agent', text: 'Bilkul. Yahi thread par UTR paste kar dena jab bank se aa jaye.', time: '9:22 AM', read: true },
    ],
  },
  {
    id: 'T-088', name: 'Sunita Patel', init: 'S', color: 'bl', type: 'Customer',
    issue: 'Cleaning ke dauraan vase toot gaya. ₹800 ka tha.',
    priority: 'high', status: 'progress', time: '5h ago', sla: 'warn',
    plan: 'Annual', phone: '+91 98765-55555', zone: 'Civil Lines',
    bookings: 89, spent: '₹28,000', since: 'Oct 2025', tag: 'Damage', unread: true,
    msgs: [
      { from: 'customer', text: 'Aaj maid ne mera favorite ceramic vase toda. Kya kuch kar sakte ho?',          time: '6:30 AM', read: true },
      { from: 'agent',    text: 'Sunita ji namaskar. Hum investigate karenge. Photo share kar sakte hain?',     time: '7:00 AM', read: true },
      { from: 'customer', text: 'Haan ek second.',                                                              time: '7:02 AM', read: true },
      { from: 'img',      text: '[Photo attached — Broken vase]',                                               time: '7:04 AM', read: true },
      { from: 'agent',    text: 'Dekh liya. Damage guarantee ke under ₹800 refund process honge. 24hrs mein.',  time: '7:15 AM', read: true },
    ],
  },
  {
    id: 'T-087', name: 'Meena Gupta', init: 'M', color: 'gr', type: 'Customer',
    issue: 'Monthly plan 15 din ke liye pause karna chahti hain.',
    priority: 'med', status: 'progress', time: '1d ago', sla: 'ok',
    plan: 'Monthly', phone: '+91 98765-66666', zone: 'Shankar Nagar',
    bookings: 22, spent: '₹5,598', since: 'Mar 2026', tag: 'Plan', unread: false,
    msgs: [
      { from: 'customer', text: 'Main 15 din bahar jaa rahi hoon. Plan pause ho sakta hai?', time: 'Yesterday 3PM',   read: true },
      { from: 'agent',    text: 'Bilkul Meena ji! Dates batao, hum pause kar denge.',        time: 'Yesterday 3:30PM', read: true },
      { from: 'customer', text: 'May 10 se May 24 tak.',                                     time: 'Yesterday 4PM',   read: true },
    ],
  },
  {
    id: 'T-086', name: 'Savita Devi', init: 'S', color: 'or', type: '🧹 Maid',
    issue: 'Payment nahi mila is hafte. Bank transfer pending hai.',
    priority: 'high', status: 'open', time: '3h ago', sla: 'warn',
    plan: 'Worker', phone: '+91 98765-00001', zone: 'Tatibandh',
    bookings: 87, spent: '₹21,750', since: 'Aug 2025', tag: 'Payment', unread: true,
    msgs: [
      { from: 'customer', text: 'Mera is hafte ka payment nahi aaya. ₹5,500 due tha.', time: '10:00 AM', read: true },
      { from: 'system',   text: 'Payment status check initiated',                       time: '10:05 AM' },
    ],
  },
  {
    id: 'T-085', name: 'Rahul Gupta', init: 'R', color: 'bl', type: 'Customer',
    issue: 'Maid time par nahi aayi — 45 min late.',
    priority: 'med', status: 'resolved', time: '2d ago', sla: 'ok',
    plan: 'Annual', phone: '+91 98765-22222', zone: 'Civil Lines',
    bookings: 142, spent: '₹28,000', since: 'Dec 2025', tag: 'Late', unread: false,
    msgs: [
      { from: 'customer', text: 'Maid 45 min late thi aaj.',                                                      time: '2 days ago 9AM',     read: true },
      { from: 'agent',    text: 'Maafi chahte hain Rahul ji. Maid ko feedback diya jayega.',                       time: '2 days ago 9:30AM',  read: true },
      { from: 'customer', text: 'Theek hai. Hopefully next time on time hogi.',                                   time: '2 days ago 10AM',    read: true },
      { from: 'agent',    text: 'Aapke liye ek free visit add kar diya hai. Thank you for patience! 🙏',           time: '2 days ago 10:15AM', read: true },
      { from: 'system',   text: 'Ticket resolved & closed by Agent Priya',                                        time: '2 days ago 10:16AM' },
    ],
  },
];

@Injectable({ providedIn: 'root' })
export class TicketService {
  private readonly _tickets = signal<Ticket[]>(SEED_TICKETS);
  private readonly _activeTicket = signal<Ticket | null>(null);

  readonly tickets = this._tickets.asReadonly();
  readonly activeTicket = this._activeTicket.asReadonly();

  readonly handlingCount = computed(
    () => this._tickets().filter((t) => t.status !== 'resolved').length,
  );

  setActive(t: Ticket): void {
    t.unread = false;
    this._activeTicket.set(t);
    this._tickets.update((arr) => [...arr]);
  }

  addMessage(msg: ChatMsg): void {
    const t = this._activeTicket();
    if (!t) return;
    t.msgs.push(msg);
    this._activeTicket.set({ ...t });
  }

  cycleStatus(): void {
    const t = this._activeTicket();
    if (!t) return;
    const order: TicketStatus[] = ['open', 'progress', 'resolved'];
    const i = order.indexOf(t.status);
    t.status = order[(i + 1) % order.length];
    this._activeTicket.set({ ...t });
    this._tickets.update((arr) => [...arr]);
  }

  resolve(): void {
    const t = this._activeTicket();
    if (!t) return;
    t.status = 'resolved';
    t.unread = false;
    this._activeTicket.set({ ...t });
    this._tickets.update((arr) => [...arr]);
  }

  updatePriority(priority: TicketPriority): void {
    const t = this._activeTicket();
    if (!t) return;
    t.priority = priority;
    this._activeTicket.set({ ...t });
    this._tickets.update((arr) => arr.map((x) => (x.id === t.id ? { ...t } : x)));
  }

  prepend(t: Ticket): void {
    this._tickets.update((arr) => [t, ...arr]);
  }

  filterTickets(query: string): Ticket[] {
    const q = query.toLowerCase();
    return this._tickets().filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.issue.toLowerCase().includes(q) ||
        t.id.toLowerCase().includes(q),
    );
  }

  filterByStatus(status: InboxFilter): Ticket[] {
    if (status === 'all') return this._tickets();
    if (status === 'bot') return this._tickets().filter((t) => t.tag === 'Bot');
    return this._tickets().filter((t) => t.status === status);
  }
}
