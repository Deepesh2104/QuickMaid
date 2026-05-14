import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToastService } from '@core/services/toast.service';

export interface KbArticle {
  title: string;
  tags: string;
  updated: string;
}

@Component({
  selector: 'app-knowledge-base',
  standalone: true,
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './knowledge-base.component.html',
})
export class KnowledgeBaseComponent {
  readonly toast = inject(ToastService);
  readonly query = signal('');

  readonly articles: readonly KbArticle[] = [
    { title: 'Refund policy — partial cleans', tags: 'billing, refunds', updated: 'May 2' },
    { title: 'OTP login failures — playbook', tags: 'auth, support', updated: 'Apr 18' },
    { title: 'Maid no-show escalation tree', tags: 'ops, sla', updated: 'Mar 30' },
    { title: 'Razorpay webhook retries', tags: 'integrations', updated: 'Mar 12' },
  ];

  publish(): void {
    this.toast.show('Editor · Phase 3', '📝');
  }
}
