import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, ViewChild, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChartService } from '@core/services/chart.service';
import { CHART_PALETTE, MONTHS } from '@core/tokens/chart-palette.token';
import { AppStateService } from '@core/services/app-state.service';
import { ToastService } from '@core/services/toast.service';

export type ReviewBucket = 'all' | 'five' | 'low' | 'flagged';

export interface ReviewRow {
  id: string;
  customer: string;
  maid: string;
  stars: number;
  excerpt: string;
  date: string;
  flagged: boolean;
}

export interface ReviewReplyTemplate {
  id: string;
  label: string;
  body: string;
}

@Component({
  selector: 'app-reviews',
  standalone: true,
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './reviews.component.html',
  styleUrls: ['./reviews.component.css'],
})
export class ReviewsComponent implements AfterViewInit {
  private readonly cs = inject(ChartService);
  private readonly palette = inject(CHART_PALETTE);
  readonly toast = inject(ToastService);
  private readonly appState = inject(AppStateService);

  @ViewChild('revTrendChart') canvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('starChart') canvas2!: ElementRef<HTMLCanvasElement>;

  readonly bucketFilter = signal<ReviewBucket>('all');
  readonly searchQuery = signal('');

  readonly exportOpen = signal(false);
  readonly moderateOpen = signal(false);
  readonly autoReplyOpen = signal(false);
  readonly replyOpen = signal(false);
  readonly replyRow = signal<ReviewRow | null>(null);
  readonly replyChannel = signal<'whatsapp' | 'sms' | 'in_app'>('whatsapp');
  readonly replyTemplateId = signal('thanks');
  readonly replyBody = signal('');
  readonly replySending = signal(false);

  readonly replyTemplates: readonly ReviewReplyTemplate[] = [
    { id: 'thanks', label: 'Thank you (5★)', body: 'Dhanyawad {{name}}! Aapka feedback humein motivate karta hai. QuickMaid team 🙏' },
    { id: 'sorry', label: 'Apology (≤3★)', body: 'Maafi chahte hain {{name}}. Hum is issue ko priority par le rahe hain — CX lead 2h mein call karegi.' },
    { id: 'refund', label: 'Refund update', body: 'Hi {{name}}, aapka refund process ho chuka hai. 24–48h mein UPI par reflect hoga.' },
    { id: 'followup', label: 'Follow-up', body: 'Hi {{name}}, kya aapki concern resolve ho gayi? Koi aur madad chahiye to reply karein.' },
    { id: 'custom', label: 'Custom', body: '' },
  ];

  readonly replyPreview = computed(() => {
    const r = this.replyRow();
    if (!r) return '';
    const first = r.customer.replace(/\.$/, '').split(' ')[0] ?? r.customer;
    return this.replyBody().replace(/\{\{name\}\}/g, first);
  });

  readonly actionOpen = signal(false);
  readonly exportRunning = signal(false);
  readonly actionRunning = signal(false);
  readonly exportScope = signal<'filtered' | 'all'>('filtered');
  readonly actionKind = signal('');
  readonly actionRow = signal<ReviewRow | null>(null);
  readonly escalateNote = signal('');
  readonly helpfulNote = signal('');
  readonly helpfulPublic = signal(true);
  readonly helpfulMarked = signal<ReadonlySet<string>>(new Set());

  readonly flaggedCount = computed(() => this.reviewRows.filter((r) => r.flagged).length);

  readonly actionTitle = computed(() => {
    const titles: Record<string, string> = {
      escalate: 'Escalate to CX lead',
      reply: 'Send reply template',
      helpful: 'Mark helpful',
    };
    return titles[this.actionKind()] ?? 'Confirm';
  });

  readonly reviewRows: readonly ReviewRow[] = [
    { id: 'RV-501', customer: 'Neha A.', maid: 'Savita D.', stars: 5, excerpt: 'Spotless kitchen, on time.', date: 'May 9', flagged: false },
    { id: 'RV-500', customer: 'Rahul G.', maid: 'Priya Y.', stars: 5, excerpt: 'Great cooking, polite.', date: 'May 8', flagged: false },
    { id: 'RV-499', customer: 'Anjali T.', maid: 'Rekha S.', stars: 2, excerpt: 'Late by 40 min, rushed job.', date: 'May 7', flagged: true },
    { id: 'RV-498', customer: 'Vijay S.', maid: '—', stars: 4, excerpt: 'App booking smooth.', date: 'May 6', flagged: false },
    { id: 'RV-497', customer: 'Kiran B.', maid: 'Mina K.', stars: 5, excerpt: 'Deep clean worth it.', date: 'May 5', flagged: false },
    { id: 'RV-496', customer: 'Office admin', maid: 'Team A', stars: 1, excerpt: 'No-show, refund pending.', date: 'May 4', flagged: true },
  ];

  readonly filteredReviews = computed(() => {
    const b = this.bucketFilter();
    const q = this.searchQuery().trim().toLowerCase();
    return this.reviewRows.filter((r) => {
      if (b === 'five' && r.stars !== 5) return false;
      if (b === 'low' && r.stars > 3) return false;
      if (b === 'flagged' && !r.flagged) return false;
      if (!q) return true;
      return (
        r.id.toLowerCase().includes(q) ||
        r.customer.toLowerCase().includes(q) ||
        r.maid.toLowerCase().includes(q) ||
        r.excerpt.toLowerCase().includes(q)
      );
    });
  });

  readonly revCount = computed(() => this.filteredReviews().length);
  readonly revTotal = this.reviewRows.length;

  onSearch(ev: Event): void {
    this.searchQuery.set((ev.target as HTMLInputElement).value);
  }

  setBucket(b: ReviewBucket): void {
    this.bucketFilter.set(b);
  }

  starStr(n: number): string {
    return '★'.repeat(n) + '☆'.repeat(5 - n);
  }

  ngAfterViewInit(): void {
    const { GR, AM, RE } = this.palette;
    setTimeout(() => {
      this.cs.make(this.canvas.nativeElement, {
        type: 'line',
        data: {
          labels: [...MONTHS],
          datasets: [
            {
              label: 'Avg rating',
              data: [4.5, 4.6, 4.7, 4.7, 4.8, 4.8],
              borderColor: AM,
              backgroundColor: 'rgba(245,158,11,.1)',
              tension: 0.4,
              fill: true,
              pointRadius: 4,
              pointBackgroundColor: AM,
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
            y: { min: 4, max: 5, grid: { color: 'rgba(19,17,14,.06)' }, border: { display: false }, ticks: { font: { size: 10 } } },
          },
        },
      });

      this.cs.make(this.canvas2.nativeElement, {
        type: 'bar',
        data: {
          labels: ['5★', '4★', '3★', '2★', '1★'],
          datasets: [{ data: [948, 245, 65, 18, 8], backgroundColor: [GR, 'rgba(28,140,82,.5)', AM, 'rgba(245,158,11,.4)', RE], borderRadius: 6 }],
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
      const data = this.exportScope() === 'filtered' ? this.filteredReviews() : [...this.reviewRows];
      const header = 'id,customer,maid,stars,excerpt,date,flagged';
      const lines = data.map((r) =>
        [r.id, r.customer, r.maid, r.stars, `"${r.excerpt}"`, r.date, r.flagged].join(','),
      );
      const body = [header, ...lines].join('\n');
      const blob = new Blob([body], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'quickmaid_reviews.csv';
      a.click();
      URL.revokeObjectURL(url);
      this.exportRunning.set(false);
      this.closeExport();
      this.toast.show(`Reviews CSV · ${data.length} rows`, '📥');
    }, 500);
  }

  openModerate(): void {
    this.moderateOpen.set(true);
  }

  closeModerate(): void {
    this.moderateOpen.set(false);
  }

  openAutoReply(): void {
    this.autoReplyOpen.set(true);
  }

  closeAutoReply(): void {
    this.autoReplyOpen.set(false);
  }

  openReply(row: ReviewRow): void {
    this.replyRow.set(row);
    this.replyChannel.set(row.stars <= 3 ? 'whatsapp' : 'in_app');
    const defaultId = row.stars <= 2 ? 'sorry' : row.stars === 5 ? 'thanks' : 'followup';
    this.replyTemplateId.set(defaultId);
    const tpl = this.replyTemplates.find((t) => t.id === defaultId) ?? this.replyTemplates[0];
    const first = row.customer.replace(/\.$/, '').split(' ')[0] ?? row.customer;
    this.replyBody.set(tpl.body.replace(/\{\{name\}\}/g, first));
    this.replyOpen.set(true);
  }

  closeReply(): void {
    this.replyOpen.set(false);
  }

  onReplyTemplateChange(id: string): void {
    this.replyTemplateId.set(id);
    const r = this.replyRow();
    if (!r) return;
    const tpl = this.replyTemplates.find((t) => t.id === id);
    if (tpl && id !== 'custom') {
      const first = r.customer.replace(/\.$/, '').split(' ')[0] ?? r.customer;
      this.replyBody.set(tpl.body.replace(/\{\{name\}\}/g, first));
    }
  }

  confirmReply(): void {
    const r = this.replyRow();
    if (!r || !this.replyBody().trim()) return;
    this.replySending.set(true);
    const ch = this.replyChannel();
    const via = ch === 'whatsapp' ? 'WhatsApp' : ch === 'sms' ? 'SMS' : 'In-app';
    window.setTimeout(() => {
      this.replySending.set(false);
      this.toast.show(`${via} reply sent · ${r.id}`, '💬');
      this.closeReply();
    }, 700);
  }

  isHelpful(id: string): boolean {
    return this.helpfulMarked().has(id);
  }

  openAction(kind: string, row: ReviewRow): void {
    if (kind === 'reply') {
      this.openReply(row);
      return;
    }
    this.actionKind.set(kind);
    this.actionRow.set(row);
    this.escalateNote.set('');
    this.helpfulNote.set(
      kind === 'helpful'
        ? `Thanks ${row.customer.split(' ')[0]} — glad the service met your expectations.`
        : '',
    );
    this.helpfulPublic.set(row.stars >= 4);
    this.actionOpen.set(true);
  }

  closeAction(): void {
    this.actionOpen.set(false);
  }

  confirmAction(): void {
    const r = this.actionRow();
    const kind = this.actionKind();
    if (!r) return;
    if (kind === 'escalate' && !this.escalateNote().trim()) {
      this.toast.show('Escalation note required', '⚠️');
      return;
    }
    if (kind === 'helpful' && !this.helpfulNote().trim()) {
      this.toast.show('Thank-you note required', '⚠️');
      return;
    }
    this.actionRunning.set(true);
    window.setTimeout(() => {
      if (kind === 'helpful') {
        this.helpfulMarked.update((set) => new Set([...set, r.id]));
        const vis = this.helpfulPublic() ? 'public' : 'internal';
        this.appState.logAudit('review.helpful', `${r.id} · ${vis}`, 'admin');
      }
      if (kind === 'escalate') {
        this.appState.logAudit('review.escalate', r.id, 'admin');
      }
      const icons: Record<string, string> = { escalate: '🚨', helpful: '👍' };
      const msgs: Record<string, string> = {
        escalate: 'Escalated to CX lead',
        helpful: this.helpfulPublic() ? 'Published helpful reply' : 'Marked helpful (internal)',
      };
      this.actionRunning.set(false);
      this.closeAction();
      this.toast.show(`${msgs[kind]} · ${r.id}`, icons[kind] ?? '✓');
    }, 500);
  }
}
