import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToastService } from '@core/services/toast.service';

export interface ReportRow {
  id: string;
  name: string;
  cadence: string;
  owner: string;
  next: string;
  format: 'csv' | 'xlsx' | 'pdf';
  email: string;
}

const CADENCE_OPTIONS = ['Daily 06:00', 'Weekly Mon', 'Monthly 1st', 'T+2', 'On demand'] as const;

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css'],
})
export class ReportsComponent {
  readonly toast = inject(ToastService);
  readonly CADENCE_OPTIONS = CADENCE_OPTIONS;

  readonly rows = signal<ReportRow[]>([
    { id: 'r1', name: 'Daily bookings CSV', cadence: 'Daily 06:00', owner: 'Ops', next: 'Tomorrow', format: 'csv', email: 'ops@quickmaid.in' },
    { id: 'r2', name: 'Revenue by zone', cadence: 'Weekly Mon', owner: 'Finance', next: 'Mon', format: 'xlsx', email: 'finance@quickmaid.in' },
    { id: 'r3', name: 'Maid payout reconciliation', cadence: 'T+2', owner: 'Finance', next: 'May 16', format: 'csv', email: 'finance@quickmaid.in' },
    { id: 'r4', name: 'NPS & CSAT rollup', cadence: 'Monthly 1st', owner: 'CX', next: 'Jun 1', format: 'pdf', email: 'cx@quickmaid.in' },
  ]);

  readonly scheduleOpen = signal(false);
  readonly runOpen = signal(false);
  readonly runTargetId = signal<string | null>(null);
  readonly saving = signal(false);
  readonly running = signal(false);

  readonly formName = signal('');
  readonly formCadence = signal<string>(CADENCE_OPTIONS[0]);
  readonly formOwner = signal('Ops');
  readonly formFormat = signal<ReportRow['format']>('csv');
  readonly formEmail = signal('ops@quickmaid.in');

  openSchedule(): void {
    this.formName.set('');
    this.formCadence.set(CADENCE_OPTIONS[0]);
    this.formOwner.set('Ops');
    this.formFormat.set('csv');
    this.formEmail.set('ops@quickmaid.in');
    this.scheduleOpen.set(true);
  }

  closeSchedule(): void {
    this.scheduleOpen.set(false);
  }

  openRunNow(row?: ReportRow): void {
    this.runTargetId.set(row?.id ?? null);
    this.runOpen.set(true);
  }

  closeRun(): void {
    this.runOpen.set(false);
  }

  saveSchedule(): void {
    const name = this.formName().trim();
    if (!name) {
      this.toast.show('Report name required', '⚠️');
      return;
    }
    this.saving.set(true);
    setTimeout(() => {
      this.rows.update((arr) => [
        ...arr,
        {
          id: 'r' + Date.now(),
          name,
          cadence: this.formCadence(),
          owner: this.formOwner(),
          next: 'Scheduled',
          format: this.formFormat(),
          email: this.formEmail(),
        },
      ]);
      this.saving.set(false);
      this.scheduleOpen.set(false);
      this.toast.show('Report scheduled (demo)', '📅');
    }, 500);
  }

  confirmRun(): void {
    this.running.set(true);
    const id = this.runTargetId();
    const row = id ? this.rows().find((r) => r.id === id) : null;
    const name = row?.name ?? 'Ad-hoc export';
    const fmt = row?.format ?? 'csv';
    setTimeout(() => {
      if (fmt === 'pdf') {
        const body = `QuickMaid Report\n${name}\nGenerated: ${new Date().toLocaleString('en-IN')}\n\n(Demo PDF placeholder — use production export service.)`;
        this.downloadBlob(body, 'application/pdf', this.safeFilename(name, 'pdf'));
      } else if (fmt === 'xlsx') {
        const header = 'metric,value,period';
        const lines = ['bookings,142,last_7d', 'revenue_inr,284500,last_7d', 'nps,72,last_30d'];
        this.downloadBlob([header, ...lines].join('\n'), 'text/csv', this.safeFilename(name, 'csv'));
      } else {
        const header = 'id,label,value,owner';
        const lines = this.rows().map((r) =>
          [r.id, `"${r.name}"`, r.cadence, r.owner].join(','),
        );
        this.downloadBlob([header, ...lines].join('\n'), 'text/csv', this.safeFilename(name, 'csv'));
      }
      this.running.set(false);
      this.runOpen.set(false);
      this.toast.show(`Downloaded: ${name}`, '📥');
    }, 700);
  }

  private safeFilename(name: string, ext: string): string {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '') + '.' + ext;
  }

  private downloadBlob(body: string, mime: string, filename: string): void {
    const blob = new Blob([body], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  runTargetName(): string {
    const id = this.runTargetId();
    if (!id) return 'Ad-hoc export';
    return this.rows().find((r) => r.id === id)?.name ?? 'Report';
  }
}
