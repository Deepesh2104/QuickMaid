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
import { ChatAttachment, Ticket } from './models/ticket.model';
import { SupportFacade } from './data/support-facade.service';

@Component({
  selector: 'app-support',
  standalone: true,
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [SupportFacade],
  templateUrl: './support.component.html',
  styleUrls: ['./support.component.css'],
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
  get pendingAttachments() { return this.facade.pendingAttachments; }
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
  get noteMode() { return this.facade.noteMode; }
  get emojiOpen() { return this.facade.emojiOpen; }
  get aiBarVisible() { return this.facade.aiBarVisible; }
  get aiSuggestion() { return this.facade.aiSuggestion; }
  get showResolveBanner() { return this.facade.showResolveBanner; }
  get autoCloseBanner() { return this.facade.autoCloseBanner; }
  get EMOJI_LIST() { return this.facade.EMOJI_LIST; }
  get QUICK_REPLIES() { return this.facade.QUICK_REPLIES; }
  get BULK_SEGMENTS() { return this.facade.BULK_SEGMENTS; }
  get bulkChannel() { return this.facade.bulkChannel; }
  get bulkSending() { return this.facade.bulkSending; }
  get bulkContactCount() { return this.facade.bulkContactCount; }
  get bulkSendLog() { return this.facade.bulkSendLog; }
  get exportOpen() { return this.facade.exportOpen; }
  get exportFormat() { return this.facade.exportFormat; }
  get exportScope() { return this.facade.exportScope; }
  get exportRunning() { return this.facade.exportRunning; }
  get SUPPORT_AGENTS() { return this.facade.SUPPORT_AGENTS; }
  get PRIORITY_OPTIONS() { return this.facade.PRIORITY_OPTIONS; }
  get assignedAgentId() { return this.facade.assignedAgentId; }
  get assignedPriority() { return this.facade.assignedPriority; }
  get assignedAgentLabel() { return this.facade.assignedAgentLabel; }
  get quickActionModal() { return this.facade.quickActionModal; }
  get refundAmount() { return this.facade.refundAmount; }
  get pauseDays() { return this.facade.pauseDays; }
  get backupSlot() { return this.facade.backupSlot; }
  get backupMaid() { return this.facade.backupMaid; }
  get waSummary() { return this.facade.waSummary; }
  get slidePanel() { return this.facade.slidePanel; }
  get callPhase() { return this.facade.callPhase; }
  get pastTickets() { return this.facade.pastTickets; }
  get bookingHistory() { return this.facade.bookingHistory; }

  // View refs (chat scroller + textarea + analytics canvases) ---------------
  @ViewChild('anTicketChart') anTicket!: ElementRef<HTMLCanvasElement>;
  @ViewChild('anCsatChart') anCsat!: ElementRef<HTMLCanvasElement>;
  @ViewChild('anHourChart') anHour!: ElementRef<HTMLCanvasElement>;
  @ViewChild('chatBody') chatBody!: ElementRef<HTMLDivElement>;
  @ViewChild('chatInp') chatInp!: ElementRef<HTMLTextAreaElement>;
  @ViewChild('imageInput') imageInput!: ElementRef<HTMLInputElement>;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

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

  openImagePicker(): void {
    this.imageInput?.nativeElement?.click();
  }

  openFilePicker(): void {
    this.fileInput?.nativeElement?.click();
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) this.facade.addAttachment(file);
    input.value = '';
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) this.facade.addAttachment(file);
    input.value = '';
  }

  removePendingAttachment(index: number): void {
    this.facade.removePendingAttachment(index);
  }

  formatFileSize(bytes?: number): string {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  isImageAttachment(att: ChatAttachment): boolean {
    if (att.type === 'image') return true;
    const ext = att.name.split('.').pop()?.toLowerCase() ?? '';
    return ['jpg', 'jpeg', 'jfif', 'png', 'gif', 'webp', 'bmp', 'svg', 'heic', 'heif'].includes(ext);
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
  setBulkChannel(ch: 'whatsapp' | 'inapp' | 'email'): void { this.facade.setBulkChannel(ch); }
  openExportModal(): void { this.facade.openExportModal(); }
  closeExportModal(): void { this.facade.closeExportModal(); }
  confirmExport(): void { this.facade.confirmExport(); }

  openCannedModal(): void { this.facade.openCannedModal(); }
  closeCannedModal(): void { this.facade.closeCannedModal(); }
  filterCanned(q: string): void { this.facade.filterCanned(q); }
  useCanned(idx: number): void {
    this.facade.useCanned(idx);
    setTimeout(() => this.chatInp?.nativeElement?.focus(), 0);
  }
  addCanned(): void { this.facade.addCanned(); }

  toggleNoteMode(): void { this.facade.toggleNoteMode(); }
  toggleEmoji(): void { this.facade.toggleEmoji(); }
  closeEmoji(): void { this.facade.closeEmoji(); }
  insertEmoji(e: string): void {
    this.facade.insertEmoji(e);
    setTimeout(() => this.chatInp?.nativeElement?.focus(), 0);
  }
  useAi(): void {
    this.facade.useAi();
    setTimeout(() => this.chatInp?.nativeElement?.focus(), 0);
  }
  dismissAi(): void { this.facade.dismissAi(); }
  dismissResolveBanner(): void { this.facade.dismissResolveBanner(); }
  dismissCollision(): void { this.facade.dismissCollision(); }
  insertQuickReply(text: string): void {
    this.facade.insertQuickReply(text);
    setTimeout(() => this.chatInp?.nativeElement?.focus(), 0);
  }

  setAssignedAgent(id: string): void { this.facade.setAssignedAgent(id); }
  setAssignedPriority(priority: 'high' | 'med' | 'low'): void { this.facade.setAssignedPriority(priority); }
  setTicketSort(key: 'priority' | 'newest' | 'oldest' | 'sla'): void { this.facade.setTicketSort(key); }
  openQuickAction(type: 'backup' | 'refund' | 'freevisit' | 'pause' | 'wa'): void { this.facade.openQuickAction(type); }
  closeQuickAction(): void { this.facade.closeQuickAction(); }
  confirmQuickAction(): void { this.facade.confirmQuickAction(); }
  quickActionTitle(): string { return this.facade.quickActionTitle(); }
  openSlidePanel(panel: 'call' | 'profile' | 'history'): void { this.facade.openSlidePanel(panel); }
  closeSlidePanel(): void { this.facade.closeSlidePanel(); }
  startCall(): void { this.facade.startCall(); }
  endCall(): void { this.facade.endCall(); }

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
