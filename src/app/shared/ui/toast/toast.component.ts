import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ToastService } from '@core/services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="toast" [class.show]="toast.state().show">
      <div class="toast-left"></div>
      <span class="toast-icon">{{ toast.state().icon }}</span>
      <span>{{ toast.state().msg }}</span>
    </div>
  `,
})
export class ToastComponent {
  readonly toast = inject(ToastService);
}
