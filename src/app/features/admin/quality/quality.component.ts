import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ToastService } from '@core/services/toast.service';

export interface TrainingRow {
  module: string;
  completionPct: number;
  owner: string;
}

@Component({
  selector: 'app-quality',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './quality.component.html',
})
export class QualityComponent {
  readonly toast = inject(ToastService);

  readonly rows: readonly TrainingRow[] = [
    { module: 'Hygiene SOP v3', completionPct: 94, owner: 'QC Lead' },
    { module: 'Chemical handling', completionPct: 78, owner: 'Safety' },
    { module: 'Customer tone & upsell', completionPct: 61, owner: 'CX' },
  ];

  scheduleAudit(): void {
    this.toast.show('Field QC audit scheduled · Phase 3', '✅');
  }
}
