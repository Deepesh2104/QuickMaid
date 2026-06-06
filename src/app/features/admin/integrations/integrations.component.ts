import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToastService } from '@core/services/toast.service';

export interface IntegrationSecret {
  id: string;
  label: string;
  category: string;
  masked: string;
  value: string;
  editable: boolean;
}

@Component({
  selector: 'app-integrations',
  standalone: true,
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './integrations.component.html',
  styleUrls: ['./integrations.component.css'],
})
export class IntegrationsComponent {
  readonly toast = inject(ToastService);

  readonly secrets = signal<IntegrationSecret[]>([
    { id: 'sms-auth', label: 'MSG91 Auth key', category: 'SMS', masked: '••••••••sk9f', value: 'demo_msg91_sk9f', editable: true },
    { id: 'rzp-key', label: 'Razorpay key id', category: 'Payments', masked: 'rzp_live_****7k2', value: 'rzp_live_demo7k2', editable: true },
    { id: 'rzp-wh', label: 'Razorpay webhook secret', category: 'Payments', masked: 'whsec_****', value: 'whsec_demo_secret', editable: true },
    { id: 'maps', label: 'Google Maps JS key', category: 'Maps', masked: 'AIza****9x', value: 'AIza_demo_key9x', editable: true },
    { id: 'wa-token', label: 'WhatsApp Business token', category: 'WhatsApp', masked: 'EAAx****', value: 'EAAx_demo_token', editable: true },
  ]);

  readonly vaultOpen = signal(false);
  readonly editingId = signal<string | null>(null);
  readonly editValue = signal('');
  readonly editLabel = signal('');
  readonly saving = signal(false);

  readonly geoWebhook = signal('https://api.quickmaid.in/hooks/geo');
  readonly smsProvider = signal('MSG91');

  openVault(secret: IntegrationSecret): void {
    this.editingId.set(secret.id);
    this.editLabel.set(secret.label);
    this.editValue.set(secret.value);
    this.vaultOpen.set(true);
  }

  closeVault(): void {
    this.vaultOpen.set(false);
  }

  maskValue(value: string): string {
    if (value.length <= 8) return '••••••••';
    return value.slice(0, 4) + '****' + value.slice(-4);
  }

  saveSecret(): void {
    const id = this.editingId();
    const val = this.editValue().trim();
    if (!id || !val) {
      this.toast.show('Value required', '⚠️');
      return;
    }
    this.saving.set(true);
    setTimeout(() => {
      this.secrets.update((arr) =>
        arr.map((s) =>
          s.id === id ? { ...s, value: val, masked: this.maskValue(val) } : s,
        ),
      );
      this.saving.set(false);
      this.vaultOpen.set(false);
      this.toast.show('Secret updated (demo vault)', '🔑');
    }, 500);
  }

  saveAll(): void {
    this.toast.show('Integration settings saved (demo)', '✅');
  }

  rotateSecret(id: string): void {
    const s = this.secrets().find((x) => x.id === id);
    if (!s) return;
    const rotated = s.value + '_rot';
    this.secrets.update((arr) =>
      arr.map((x) => (x.id === id ? { ...x, value: rotated, masked: this.maskValue(rotated) } : x)),
    );
    this.toast.show('Key rotated (demo)', '🔄');
  }
}
