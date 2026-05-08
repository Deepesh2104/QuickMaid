import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ToastService } from '@core/services/toast.service';

@Component({
  selector: 'app-payouts',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './payouts.component.html',
})
export class PayoutsComponent {
  readonly toast = inject(ToastService);
}
