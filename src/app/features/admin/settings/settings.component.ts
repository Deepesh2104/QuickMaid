import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ToastService } from '@core/services/toast.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './settings.component.html',
})
export class SettingsComponent {
  readonly toast = inject(ToastService);

  readonly emailBookings = signal(true);
  readonly smsOtp = signal(true);
  readonly pushDispatch = signal(false);
  readonly maintenanceMode = signal(false);
  readonly autoAssignMaid = signal(true);
  readonly twoFactorEnforce = signal(false);

  toggleEmail(): void {
    this.emailBookings.update((v) => !v);
  }
  toggleSms(): void {
    this.smsOtp.update((v) => !v);
  }
  togglePush(): void {
    this.pushDispatch.update((v) => !v);
  }
  toggleMaint(): void {
    this.maintenanceMode.update((v) => !v);
  }
  toggleAutoAssign(): void {
    this.autoAssignMaid.update((v) => !v);
  }
  toggle2fa(): void {
    this.twoFactorEnforce.update((v) => !v);
  }
}
