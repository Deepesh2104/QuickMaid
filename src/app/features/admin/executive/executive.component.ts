import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ToastService } from '@core/services/toast.service';

interface BoardSection {
  readonly title: string;
  readonly bullets: readonly string[];
}

@Component({
  selector: 'app-executive',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './executive.component.html',
  styleUrls: ['./executive.component.css'],
})
export class ExecutiveComponent {
  readonly toast = inject(ToastService);

  readonly previewOpen = signal(false);
  readonly exporting = signal(false);

  readonly boardSections: readonly BoardSection[] = [
    {
      title: 'Revenue & growth',
      bullets: [
        'MRR ₹18.4L (+12% MoM) — Raipur core 78% of GMV',
        'Annual plan mix 34% (↑ 3pp) — target 40% by Q3',
        'New customer CAC ₹420 vs LTV ₹4,800 (11x)',
      ],
    },
    {
      title: 'Operations',
      bullets: [
        'On-time start 91% · no-show rate 2.8% (target <3%)',
        '42 maids online peak · 6 open dispatch slots evening',
        'CSAT 4.8 · NPS 62 (rolling 90d)',
      ],
    },
    {
      title: 'Risks & asks',
      bullets: [
        'SMS OTP provider degraded — email fallback live',
        'Hire 2 ops leads for Bhilai pilot (Sep)',
        'Board approval: ₹12L marketing H2 budget',
      ],
    },
  ];

  openPreview(): void {
    this.previewOpen.set(true);
  }

  closePreview(): void {
    this.previewOpen.set(false);
  }

  exportBoard(): void {
    this.exporting.set(true);
    setTimeout(() => {
      this.exporting.set(false);
      const content = this.boardSections
        .map((s) => `${s.title}\n${s.bullets.map((b) => '• ' + b).join('\n')}`)
        .join('\n\n');
      const blob = new Blob(
        [`QuickMaid Board Pack — FY26 Q2\nGenerated: ${new Date().toLocaleString('en-IN')}\n\n${content}`],
        { type: 'text/plain' },
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'quickmaid_board_pack_fy26q2.txt';
      a.click();
      URL.revokeObjectURL(url);
      this.toast.show('Board pack downloaded (demo .txt)', '📑');
    }, 600);
  }
}
