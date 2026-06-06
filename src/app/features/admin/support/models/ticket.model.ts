export type TicketStatus = 'open' | 'progress' | 'resolved' | 'snoozed';
export type TicketPriority = 'high' | 'med' | 'low';
export type TicketSla = 'urgent' | 'warn' | 'ok';
export type TicketColor = 'or' | 'bl' | 'gr' | 'pu' | 're';
export type ChatFrom = 'customer' | 'agent' | 'system' | 'img';
export type InboxFilter = 'all' | 'open' | 'progress' | 'resolved' | 'bot';
export type TicketSortKey = 'priority' | 'newest' | 'oldest' | 'sla';

export type ChatAttachmentType = 'image' | 'file';

export interface ChatAttachment {
  name: string;
  url: string;
  type: ChatAttachmentType;
  size?: number;
}

export interface ChatMsg {
  from: ChatFrom;
  text: string;
  time: string;
  read?: boolean;
  attachment?: ChatAttachment;
}

export interface Ticket {
  id: string;
  name: string;
  init: string;
  color: TicketColor;
  type: string;
  issue: string;
  priority: TicketPriority;
  status: TicketStatus;
  time: string;
  sla: TicketSla;
  plan: string;
  phone: string;
  zone: string;
  bookings: number;
  spent: string;
  since: string;
  tag: string;
  unread: boolean;
  msgs: ChatMsg[];
}

export interface Label {
  name: string;
  color: string;
}
