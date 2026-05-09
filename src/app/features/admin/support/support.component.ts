import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewChild,
  inject,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastService } from '@core/services/toast.service';
import { Ticket } from './models/ticket.model';
import { SupportFacade } from './data/support-facade.service';

@Component({
  selector: 'app-support',
  standalone: true,
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [SupportFacade],
  templateUrl: './support.component.html',
})
export class SupportComponent implements AfterViewInit {
  readonly facade = inject(SupportFacade);
  private readonly router = inject(Router);

  // Aliases retained for the existing template — keeps templateUrl unchanged.
  readonly ts = { tickets: this.facade.ticketsList, activeTicket: this.facade.activeTicket };
  readonly toast = inject(ToastService);

  // Direct passthroughs for template parity ----------------------------------
  get soundOn() { return this.facade.soundOn; }
  get agentStatusIdx() { return this.facade.agentStatusIdx; }
  get msgSearchOpen() { return this.facade.msgSearchOpen; }
  get msgSearchQuery() { return this.facade.msgSearchQuery; }
  get msgSearchCount() { return this.facade.msgSearchCount; }
  get labelPickerOpen() { return this.facade.labelPickerOpen; }
  get inboxFilter() { return this.facade.inboxFilter; }
  get searchQuery() { return this.facade.searchQuery; }
  get bulkOpen() { return this.facade.bulkOpen; }
  get cannedOpen() { return this.facade.cannedOpen; }
  get analyticsOpen() { return this.facade.analyticsOpen; }
  get mergeOpen() { return this.facade.mergeOpen; }
  get inputText() { return this.facade.inputText; }
  get csatRating() { return this.facade.csatRating; }
  get csatLabel() { return this.facade.csatLabel; }
  get slaDisplay() { return this.facade.slaDisplay; }
  get queueCount() { return this.facade.queueCount; }
  get avgRespTime() { return this.facade.avgRespTime; }
  get activeLabels() { return this.facade.activeLabels; }
  get channel() { return this.facade.channel; }
  get collisionVisible() { return this.facade.collisionVisible; }
  get newCannedText() { return this.facade.newCannedText; }
  get bulkSegmentIdx() { return this.facade.bulkSegmentIdx; }
  get bulkMsg() { return this.facade.bulkMsg; }
  get cannedList() { return this.facade.cannedList; }
  get cannedQuery() { return this.facade.cannedQuery; }
  get filteredCanned() { return this.facade.filteredCanned; }
  get visibleTickets() { return this.facade.visibleTickets; }
  get ticketCountBadge() { return this.facade.ticketCountBadge; }
  get handlingCount() { return this.facade.handlingCount; }
  get renderedMessages() { return this.facade.renderedMessages; }
  get mergeSelectedId() { return this.facade.mergeSelectedId; }
  get mergeCandidates() { return this.facade.mergeCandidates; }
  get AGENT_STATUSES() { return this.facade.AGENT_STATUSES; }
  get LABEL_PRESETS() { return this.facade.LABEL_PRESETS; }

  // View refs (chat scroller + textarea + analytics canvases) ---------------
  @ViewChild('anTicketChart') anTicket!: ElementRef<HTMLCanvasElement>;
  @ViewChild('anCsatChart') anCsat!: ElementRef<HTMLCanvasElement>;
  @ViewChild('anHourChart') anHour!: ElementRef<HTMLCanvasElement>;
  @ViewChild('chatBody') chatBody!: ElementRef<HTMLDivElement>;
  @ViewChild('chatInp') chatInp!: ElementRef<HTMLTextAreaElement>;

  ngAfterViewInit(): void {
    this.facade.startTimers();
  }

  // Routing -----------------------------------------------------------------
  exitSupport(): void {
    this.router.navigate(['/admin/dashboard']);
  }

  // Color helpers (template still uses these names) ------------------------
  colorBg(c: string): string { return this.facade.colorBg(c); }
  colorFg(c: string): string { return this.facade.colorFg(c); }

  // Ticket / chat actions ---------------------------------------------------
  openTicket(t: Ticket): void {
    this.facade.openTicket(t);
    setTimeout(() => this.scrollChatToBottom(), 50);
    setTimeout(() => this.scrollChatToBottom(), 200);
  }

  scrollChatToBottom(): void {
    const el = this.chatBody?.nativeElement;
    if (el) el.scrollTop = el.scrollHeight;
  }

  onInputChange(text: string): void {
    this.inputText.set(text);
    const el = this.chatInp?.nativeElement;
    if (el) {
      el.style.height = 'auto';
      el.style.height = Math.min(el.scrollHeight, 100) + 'px';
    }
  }

  handleEnter(e: KeyboardEvent): void {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      this.sendMessage();
    }
  }

  sendMessage(): void {
    const result = this.facade.sendMessage();
    if (this.chatInp?.nativeElement) this.chatInp.nativeElement.style.height = 'auto';
    setTimeout(() => this.scrollChatToBottom(), 50);
    if (result.sent) {
      result.ghostReply();
      setTimeout(() => this.scrollChatToBottom(), 4500);
    }
  }

  toggleSound(): void { this.facade.toggleSound(); }

  cycleStatus(): void { this.facade.cycleStatus(); }
  cycleAgentStatus(): void { this.facade.cycleAgentStatus(); }
  resolveTicket(): void { this.facade.resolveTicket(); }
  escalate(): void { this.facade.escalate(); }
  createNewTicket(): void { this.facade.createNewTicket(); }

  setInboxFilter(f: 'all' | 'open' | 'progress' | 'resolved' | 'bot'): void {
    this.facade.setInboxFilter(f);
  }

  toggleMsgSearch(): void { this.facade.toggleMsgSearch(); }
  closeMsgSearch(): void { this.facade.closeMsgSearch(); }
  onSearchMessages(q: string): void { this.facade.onSearchMessages(q); }
  highlight(text: string): string { return this.facade.highlight(text); }

  toggleLabelPicker(e: Event): void { this.facade.toggleLabelPicker(e); }
  addLabel(name: string, color: string): void { this.facade.addLabel(name, color); }
  removeLabel(name: string): void { this.facade.removeLabel(name); }

  setCsat(n: number): void { this.facade.setCsat(n); }

  openBulkModal(): void { this.facade.openBulkModal(); }
  closeBulkModal(): void { this.facade.closeBulkModal(); }
  selectBulkSegment(idx: number): void { this.facade.selectBulkSegment(idx); }
  sendBulk(): void { this.facade.sendBulk(); }

  openCannedModal(): void { this.facade.openCannedModal(); }
  closeCannedModal(): void { this.facade.closeCannedModal(); }
  filterCanned(q: string): void { this.facade.filterCanned(q); }
  useCanned(idx: number): void {
    this.facade.useCanned(idx);
    setTimeout(() => this.chatInp?.nativeElement?.focus(), 0);
  }
  addCanned(): void { this.facade.addCanned(); }

  toggleAnalytics(): void {
    this.facade.toggleAnalytics(() => setTimeout(() => this.renderAnalytics(), 80));
  }

  private renderAnalytics(): void {
    const cfgs = this.facade.buildAnalyticsConfigs();
    this.facade.renderChart(this.anTicket?.nativeElement, cfgs.ticket);
    this.facade.renderChart(this.anCsat?.nativeElement, cfgs.csat);
    this.facade.renderChart(this.anHour?.nativeElement, cfgs.hour);
  }

  openMergeModal(): void { this.facade.openMergeModal(); }
  closeMergeModal(): void { this.facade.closeMergeModal(); }
  selectMergeTicket(id: string): void { this.facade.selectMergeTicket(id); }
  doMerge(): void { this.facade.doMerge(); }

  trackById(_: number, t: Ticket): string { return this.facade.trackById(_, t); }
}
