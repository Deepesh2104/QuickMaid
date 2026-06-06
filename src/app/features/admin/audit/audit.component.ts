import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppStateService, AuditEntry } from '@core/services/app-state.service';
import { ToastService } from '@core/services/toast.service';

export interface AuditRow {
  at: string;
  actor: string;
  action: string;
  target: string;
}

@Component({
  selector: 'app-audit',
  standalone: true,
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './audit.component.html',
  styleUrls: ['./audit.component.css'],
})
export class AuditComponent {
  readonly toast = inject(ToastService);
  private readonly appState = inject(AppStateService);

  readonly rows = computed(() => this.appState.auditLog());

  readonly detailOpen = signal(false);
  readonly detailRow = signal<AuditEntry | null>(null);

  readonly exportOpen = signal(false);
  readonly exportFrom = signal('2026-05-01');
  readonly exportTo = signal('2026-05-14');
  readonly exportActor = signal('all');
  readonly exportRunning = signal(false);

  openExport(): void {
    this.exportOpen.set(true);
  }

  closeExport(): void {
    this.exportOpen.set(false);
  }

  openDetail(row: AuditEntry): void {
    this.detailRow.set(row);
    this.detailOpen.set(true);
  }

  closeDetail(): void {
    this.detailOpen.set(false);
  }

  confirmExport(): void {
    this.exportRunning.set(true);
    setTimeout(() => {
      const header = 'timestamp,actor,action,target';
      const lines = this.rows().map(
        (r) => [r.at, r.actor, r.action, `"${r.target}"`].join(','),
      );
      const body = [header, ...lines].join('\n');
      const blob = new Blob([body], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'quickmaid_audit_export.csv';
      a.click();
      URL.revokeObjectURL(url);
      this.exportRunning.set(false);
      this.exportOpen.set(false);
      this.toast.show('Audit CSV downloaded', '📥');
    }, 500);
  }
}
