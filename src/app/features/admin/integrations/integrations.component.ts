import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ToastService } from '@core/services/toast.service';

@Component({
  selector: 'app-integrations',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './integrations.component.html',
})
export class IntegrationsComponent {
  readonly toast = inject(ToastService);

  save(): void {
    this.toast.show('Secrets vault · Phase 3', '🔑');
  }
}
