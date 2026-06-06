import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToastService } from '@core/services/toast.service';

export interface DsarRequest {
  id: string;
  email: string;
  type: 'export' | 'delete';
  status: 'queued' | 'processing' | 'completed';
  requestedAt: string;
}

@Component({
  selector: 'app-compliance',
  standalone: true,
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './compliance.component.html',
  styleUrls: ['./compliance.component.css'],
})
export class ComplianceComponent {
  readonly toast = inject(ToastService);
  readonly consentLog = signal(true);
  readonly dataMin = signal(true);

  readonly dsarOpen = signal(false);
  readonly dsarEmail = signal('');
  readonly dsarType = signal<'export' | 'delete'>('export');
  readonly dsarReason = signal('');
  readonly dsarSubmitting = signal(false);

  readonly dsarQueue = signal<DsarRequest[]>([
    { id: 'DSAR-104', email: 'vijay@example.com', type: 'export', status: 'completed', requestedAt: 'Jun 4, 2026' },
    { id: 'DSAR-105', email: 'sunita.p@example.com', type: 'delete', status: 'processing', requestedAt: 'Jun 5, 2026' },
  ]);

  openDsar(): void {
    this.dsarEmail.set('');
    this.dsarType.set('export');
    this.dsarReason.set('');
    this.dsarOpen.set(true);
  }

  closeDsar(): void {
    this.dsarOpen.set(false);
  }

  submitDsar(): void {
    const email = this.dsarEmail().trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      this.toast.show('Valid email daalein', '⚠️');
      return;
    }
    this.dsarSubmitting.set(true);
    setTimeout(() => {
      const id = 'DSAR-' + Math.floor(100 + Math.random() * 900);
      this.dsarQueue.update((q) => [
        { id, email, type: this.dsarType(), status: 'queued', requestedAt: 'Just now' },
        ...q,
      ]);
      this.dsarSubmitting.set(false);
      this.dsarOpen.set(false);
      this.toast.show(`DSAR ${id} queued`, '📤');
    }, 600);
  }

  toggleConsent(): void {
    this.consentLog.update((v) => !v);
  }

  toggleDataMin(): void {
    this.dataMin.update((v) => !v);
  }

  readonly processOpen = signal(false);
  readonly processRow = signal<DsarRequest | null>(null);
  readonly processRunning = signal(false);

  openProcess(row: DsarRequest): void {
    if (row.status === 'completed') {
      this.toast.show('Already completed', '✅');
      return;
    }
    this.processRow.set(row);
    this.processOpen.set(true);
  }

  closeProcess(): void {
    this.processOpen.set(false);
  }

  confirmProcess(): void {
    const row = this.processRow();
    if (!row) return;
    this.processRunning.set(true);
    setTimeout(() => {
      const next: DsarRequest['status'] =
        row.status === 'queued' ? 'processing' : 'completed';
      this.dsarQueue.update((q) =>
        q.map((d) => (d.id === row.id ? { ...d, status: next } : d)),
      );
      this.processRunning.set(false);
      this.processOpen.set(false);
      this.toast.show(
        next === 'processing' ? `${row.id} → processing` : `${row.id} completed`,
        next === 'processing' ? '⚙️' : '✅',
      );
    }, 650);
  }
}
