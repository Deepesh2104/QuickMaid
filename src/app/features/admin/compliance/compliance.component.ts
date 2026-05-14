import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ToastService } from '@core/services/toast.service';

@Component({
  selector: 'app-compliance',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './compliance.component.html',
})
export class ComplianceComponent {
  readonly toast = inject(ToastService);
  readonly consentLog = signal(true);
  readonly dataMin = signal(true);

  requestExport(): void {
    this.toast.show('DSAR export queued · Phase 3', '📤');
  }

  toggleConsent(): void {
    this.consentLog.update((v) => !v);
  }

  toggleDataMin(): void {
    this.dataMin.update((v) => !v);
  }
}
