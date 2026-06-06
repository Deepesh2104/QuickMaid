import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToastService } from '@core/services/toast.service';

export interface TrainingRow {
  id: string;
  module: string;
  completionPct: number;
  owner: string;
  expiry: string;
}

export interface CertChecklistItem {
  id: string;
  label: string;
  required: boolean;
  checked: boolean;
}

export interface MaidCertRow {
  id: string;
  name: string;
  zone: string;
  checklist: CertChecklistItem[];
  status: 'certified' | 'pending' | 'expired';
}

@Component({
  selector: 'app-quality',
  standalone: true,
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './quality.component.html',
  styleUrls: ['./quality.component.css'],
})
export class QualityComponent {
  readonly toast = inject(ToastService);

  readonly rows = signal<TrainingRow[]>([
    { id: 'm1', module: 'Hygiene SOP v3', completionPct: 94, owner: 'QC Lead', expiry: 'Dec 2026' },
    { id: 'm2', module: 'Chemical handling', completionPct: 78, owner: 'Safety', expiry: 'Sep 2026' },
    { id: 'm3', module: 'Customer tone & upsell', completionPct: 61, owner: 'CX', expiry: 'Aug 2026' },
  ]);

  readonly maids = signal<MaidCertRow[]>([
    {
      id: 'MD-01',
      name: 'Savita Devi',
      zone: 'Pandri',
      status: 'pending',
      checklist: [
        { id: 'c1', label: 'Aadhaar verified', required: true, checked: true },
        { id: 'c2', label: 'Hygiene SOP v3 passed', required: true, checked: true },
        { id: 'c3', label: 'Field shadow visit', required: true, checked: false },
        { id: 'c4', label: 'Mystery audit score ≥ 4.5', required: false, checked: false },
      ],
    },
    {
      id: 'MD-02',
      name: 'Kamla Sharma',
      zone: 'Civil Lines',
      status: 'certified',
      checklist: [
        { id: 'c1', label: 'Aadhaar verified', required: true, checked: true },
        { id: 'c2', label: 'Hygiene SOP v3 passed', required: true, checked: true },
        { id: 'c3', label: 'Field shadow visit', required: true, checked: true },
        { id: 'c4', label: 'Mystery audit score ≥ 4.5', required: false, checked: true },
      ],
    },
  ]);

  readonly auditOpen = signal(false);
  readonly auditMaidId = signal('');
  readonly auditDate = signal('');
  readonly auditZone = signal('Pandri');
  readonly auditSaving = signal(false);
  readonly selectedMaidId = signal('MD-01');

  readonly selectedMaid = computed(() =>
    this.maids().find((m) => m.id === this.selectedMaidId()) ?? null,
  );

  readonly certifiedCount = computed(
    () => this.maids().filter((m) => m.status === 'certified').length,
  );

  readonly checklistProgress = computed(() => {
    const m = this.selectedMaid();
    if (!m) return 0;
    const total = m.checklist.filter((c) => c.required).length;
    const done = m.checklist.filter((c) => c.required && c.checked).length;
    return total ? Math.round((done / total) * 100) : 0;
  });

  openAudit(): void {
    this.auditMaidId.set(this.selectedMaidId());
    this.auditDate.set(new Date().toISOString().slice(0, 10));
    this.auditZone.set(this.selectedMaid()?.zone ?? 'Pandri');
    this.auditOpen.set(true);
  }

  closeAudit(): void {
    this.auditOpen.set(false);
  }

  scheduleAudit(): void {
    if (!this.auditDate()) {
      this.toast.show('Audit date chunein', '⚠️');
      return;
    }
    this.auditSaving.set(true);
    setTimeout(() => {
      this.auditSaving.set(false);
      this.auditOpen.set(false);
      this.toast.show('Field QC audit scheduled', '✅');
    }, 500);
  }

  selectMaid(id: string): void {
    this.selectedMaidId.set(id);
  }

  toggleCheck(maidId: string, itemId: string): void {
    this.maids.update((arr) =>
      arr.map((m) => {
        if (m.id !== maidId) return m;
        const checklist = m.checklist.map((c) =>
          c.id === itemId ? { ...c, checked: !c.checked } : c,
        );
        const requiredDone = checklist.filter((c) => c.required).every((c) => c.checked);
        const status = requiredDone ? 'certified' : m.status === 'expired' ? 'expired' : 'pending';
        return { ...m, checklist, status: requiredDone ? 'certified' : status };
      }),
    );
  }

  certifyMaid(): void {
    const m = this.selectedMaid();
    if (!m || this.checklistProgress() < 100) {
      this.toast.show('Sab required items complete karein', '⚠️');
      return;
    }
    this.maids.update((arr) =>
      arr.map((x) => (x.id === m.id ? { ...x, status: 'certified' as const } : x)),
    );
    this.toast.show(`${m.name} certified!`, '🎓');
  }
}
