import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AppStateService } from '@core/services/app-state.service';
import { QM_SETTINGS_KEY } from '@core/services/dispatch-engine.service';
import { ToastService } from '@core/services/toast.service';

interface SettingsSnapshot {
  emailBookings: boolean;
  smsOtp: boolean;
  pushDispatch: boolean;
  maintenanceMode: boolean;
  twoFactorEnforce: boolean;
}

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [FormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css'],
})
export class SettingsComponent implements OnInit {
  readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  private readonly appState = inject(AppStateService);

  readonly emailBookings = signal(true);
  readonly smsOtp = signal(true);
  readonly pushDispatch = signal(false);
  readonly maintenanceMode = signal(false);
  readonly twoFactorEnforce = signal(false);

  readonly saveOpen = signal(false);
  readonly auditOpen = signal(false);
  readonly resetOpen = signal(false);
  readonly saveRunning = signal(false);
  readonly resetConfirm = signal('');

  readonly toggleSummary = computed(() => {
    const on: string[] = [];
    if (this.emailBookings()) on.push('Email bookings');
    if (this.smsOtp()) on.push('SMS OTP');
    if (this.pushDispatch()) on.push('Push dispatch');
    if (this.maintenanceMode()) on.push('Maintenance');
    if (this.twoFactorEnforce()) on.push('2FA payouts');
    return on.length ? on.join(' · ') : 'No toggles enabled';
  });

  readonly resetValid = computed(() => this.resetConfirm().trim().toUpperCase() === 'RESET');

  ngOnInit(): void {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    if (typeof localStorage === 'undefined') return;
    const raw = localStorage.getItem(QM_SETTINGS_KEY);
    if (!raw) return;
    try {
      const s = JSON.parse(raw) as SettingsSnapshot & { autoAssignMaid?: boolean };
      this.emailBookings.set(s.emailBookings ?? true);
      this.smsOtp.set(s.smsOtp ?? true);
      this.pushDispatch.set(s.pushDispatch ?? false);
      this.maintenanceMode.set(s.maintenanceMode ?? false);
      this.twoFactorEnforce.set(s.twoFactorEnforce ?? false);
    } catch {
      /* ignore corrupt storage */
    }
  }

  private persist(): void {
    if (typeof localStorage === 'undefined') return;
    const snap: SettingsSnapshot = {
      emailBookings: this.emailBookings(),
      smsOtp: this.smsOtp(),
      pushDispatch: this.pushDispatch(),
      maintenanceMode: this.maintenanceMode(),
      twoFactorEnforce: this.twoFactorEnforce(),
    };
    localStorage.setItem(QM_SETTINGS_KEY, JSON.stringify(snap));
  }

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
  toggle2fa(): void {
    this.twoFactorEnforce.update((v) => !v);
  }

  openSave(): void {
    this.saveOpen.set(true);
  }

  closeSave(): void {
    this.saveOpen.set(false);
  }

  confirmSave(): void {
    this.saveRunning.set(true);
    setTimeout(() => {
      this.persist();
      this.saveRunning.set(false);
      this.closeSave();
      this.toast.show('Settings saved!', '⚙️');
    }, 600);
  }

  openAudit(): void {
    this.auditOpen.set(true);
  }

  closeAudit(): void {
    this.auditOpen.set(false);
  }

  goAuditLog(): void {
    this.closeAudit();
    void this.router.navigateByUrl('/admin/audit');
  }

  openReset(): void {
    this.resetConfirm.set('');
    this.resetOpen.set(true);
  }

  closeReset(): void {
    this.resetOpen.set(false);
  }

  confirmReset(): void {
    if (!this.resetValid()) return;
    this.appState.resetDemo();
    this.emailBookings.set(true);
    this.smsOtp.set(true);
    this.pushDispatch.set(false);
    this.maintenanceMode.set(false);
    this.twoFactorEnforce.set(false);
    this.persist();
    this.closeReset();
    this.toast.show('Demo data reset — bookings & partner queue cleared', '♻️');
  }
}
