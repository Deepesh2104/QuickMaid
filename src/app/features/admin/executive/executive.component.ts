import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ToastService } from '@core/services/toast.service';

@Component({
  selector: 'app-executive',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './executive.component.html',
})
export class ExecutiveComponent {
  readonly toast = inject(ToastService);

  exportBoard(): void {
    this.toast.show('Board pack PDF · Phase 3', '📑');
  }
}
