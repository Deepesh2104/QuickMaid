import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ToastService } from '@core/services/toast.service';

@Component({
  selector: 'app-add-maid',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './add-maid.component.html',
})
export class AddMaidComponent {
  readonly toast = inject(ToastService);
  readonly router = inject(Router);
}
