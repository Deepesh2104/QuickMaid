import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToastService } from '@core/services/toast.service';

export interface KbArticle {
  id: string;
  title: string;
  tags: string;
  body: string;
  updated: string;
  visibility: 'internal' | 'partner' | 'public';
}

@Component({
  selector: 'app-knowledge-base',
  standalone: true,
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './knowledge-base.component.html',
  styleUrls: ['./knowledge-base.component.css'],
})
export class KnowledgeBaseComponent {
  readonly toast = inject(ToastService);
  readonly query = signal('');

  readonly articles = signal<KbArticle[]>([
    {
      id: 'kb-1',
      title: 'Refund policy — partial cleans',
      tags: 'billing, refunds',
      body: '## Partial clean refund\n\nIf less than 50% area covered, pro-rate refund within 48h.\n\nEscalate to billing if dispute > ₹500.',
      updated: 'May 2',
      visibility: 'internal',
    },
    {
      id: 'kb-2',
      title: 'OTP login failures — playbook',
      tags: 'auth, support',
      body: '## OTP not received\n\n1. Check DND\n2. Resend after 60s\n3. Fallback: email magic link',
      updated: 'Apr 18',
      visibility: 'internal',
    },
    {
      id: 'kb-3',
      title: 'Maid no-show escalation tree',
      tags: 'ops, sla',
      body: '## No-show SLA\n\nT+15m: backup assign\nT+30m: manager ping\nT+60m: auto refund offer',
      updated: 'Mar 30',
      visibility: 'internal',
    },
    {
      id: 'kb-4',
      title: 'Razorpay webhook retries',
      tags: 'integrations',
      body: '## Webhook failures\n\nRetry 3x exponential. Log payload id. Never double-capture.',
      updated: 'Mar 12',
      visibility: 'partner',
    },
  ]);

  readonly editorOpen = signal(false);
  readonly editingId = signal<string | null>(null);
  readonly editorTitle = signal('');
  readonly editorTags = signal('');
  readonly editorBody = signal('');
  readonly editorVisibility = signal<KbArticle['visibility']>('internal');
  readonly editorSaving = signal(false);

  readonly filteredArticles = computed(() => {
    const q = this.query().trim().toLowerCase();
    if (!q) return this.articles();
    return this.articles().filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.tags.toLowerCase().includes(q) ||
        a.body.toLowerCase().includes(q),
    );
  });

  openNewArticle(): void {
    this.editingId.set(null);
    this.editorTitle.set('');
    this.editorTags.set('');
    this.editorBody.set('## Title\n\nBody likho…');
    this.editorVisibility.set('internal');
    this.editorOpen.set(true);
  }

  openEditArticle(article: KbArticle): void {
    this.editingId.set(article.id);
    this.editorTitle.set(article.title);
    this.editorTags.set(article.tags);
    this.editorBody.set(article.body);
    this.editorVisibility.set(article.visibility);
    this.editorOpen.set(true);
  }

  closeEditor(): void {
    this.editorOpen.set(false);
  }

  saveArticle(): void {
    const title = this.editorTitle().trim();
    const tags = this.editorTags().trim();
    const body = this.editorBody().trim();
    if (!title || !body) {
      this.toast.show('Title aur body required', '⚠️');
      return;
    }
    this.editorSaving.set(true);
    setTimeout(() => {
      const updated = new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
      const id = this.editingId();
      if (id) {
        this.articles.update((arr) =>
          arr.map((a) =>
            a.id === id
              ? { ...a, title, tags, body, updated, visibility: this.editorVisibility() }
              : a,
          ),
        );
        this.toast.show('Article updated', '✅');
      } else {
        const newId = 'kb-' + Date.now();
        this.articles.update((arr) => [
          { id: newId, title, tags, body, updated, visibility: this.editorVisibility() },
          ...arr,
        ]);
        this.toast.show('Article published', '✅');
      }
      this.editorSaving.set(false);
      this.editorOpen.set(false);
    }, 500);
  }
}
