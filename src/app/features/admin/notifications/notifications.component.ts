import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToastService } from '@core/services/toast.service';

export interface AlertRow {
  id: string;
  severity: 'info' | 'warn' | 'crit';
  title: string;
  at: string;
  read: boolean;
}

export interface RoutingRule {
  id: string;
  name: string;
  severity: 'info' | 'warn' | 'crit' | 'any';
  channel: 'email' | 'slack' | 'sms' | 'push';
  recipients: string;
  enabled: boolean;
}

const SEVERITY_OPTIONS = ['any', 'crit', 'warn', 'info'] as const;
const CHANNEL_OPTIONS = ['email', 'slack', 'sms', 'push'] as const;

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css'],
})
export class NotificationsComponent {
  readonly toast = inject(ToastService);
  readonly SEVERITY_OPTIONS = SEVERITY_OPTIONS;
  readonly CHANNEL_OPTIONS = CHANNEL_OPTIONS;

  readonly rows = signal<AlertRow[]>([
    { id: '1', severity: 'crit', title: 'Payout batch #882 failed gateway timeout', at: '12 min ago', read: false },
    { id: '2', severity: 'warn', title: 'SLA breach · 4 bookings > 45m wait', at: '28 min ago', read: false },
    { id: '3', severity: 'info', title: 'New corporate account pending KYC', at: '1 hr ago', read: true },
  ]);

  readonly rules = signal<RoutingRule[]>([
    { id: 'ru1', name: 'Critical → PagerDuty', severity: 'crit', channel: 'sms', recipients: 'ops-oncall@quickmaid.in', enabled: true },
    { id: 'ru2', name: 'SLA warnings', severity: 'warn', channel: 'slack', recipients: '#ops-alerts', enabled: true },
    { id: 'ru3', name: 'Info digest', severity: 'info', channel: 'email', recipients: 'ops@quickmaid.in', enabled: false },
  ]);

  readonly ruleEditorOpen = signal(false);
  readonly editingRuleId = signal<string | null>(null);
  readonly ruleName = signal('');
  readonly ruleSeverity = signal<RoutingRule['severity']>('warn');
  readonly ruleChannel = signal<RoutingRule['channel']>('email');
  readonly ruleRecipients = signal('');
  readonly ruleEnabled = signal(true);
  readonly ruleSaving = signal(false);

  readonly activeRuleCount = computed(
    () => this.rules().filter((r) => r.enabled).length,
  );

  markAllRead(): void {
    this.rows.update((list) => list.map((r) => ({ ...r, read: true })));
    this.toast.show('All marked read', '✅');
  }

  openNewRule(): void {
    this.editingRuleId.set(null);
    this.ruleName.set('');
    this.ruleSeverity.set('warn');
    this.ruleChannel.set('email');
    this.ruleRecipients.set('');
    this.ruleEnabled.set(true);
    this.ruleEditorOpen.set(true);
  }

  openEditRule(rule: RoutingRule): void {
    this.editingRuleId.set(rule.id);
    this.ruleName.set(rule.name);
    this.ruleSeverity.set(rule.severity);
    this.ruleChannel.set(rule.channel);
    this.ruleRecipients.set(rule.recipients);
    this.ruleEnabled.set(rule.enabled);
    this.ruleEditorOpen.set(true);
  }

  closeRuleEditor(): void {
    this.ruleEditorOpen.set(false);
  }

  saveRule(): void {
    const name = this.ruleName().trim();
    const recipients = this.ruleRecipients().trim();
    if (!name || !recipients) {
      this.toast.show('Name aur recipients required', '⚠️');
      return;
    }
    this.ruleSaving.set(true);
    setTimeout(() => {
      const id = this.editingRuleId();
      const payload = {
        name,
        severity: this.ruleSeverity(),
        channel: this.ruleChannel(),
        recipients,
        enabled: this.ruleEnabled(),
      };
      if (id) {
        this.rules.update((arr) => arr.map((r) => (r.id === id ? { ...r, ...payload } : r)));
        this.toast.show('Rule updated', '✅');
      } else {
        this.rules.update((arr) => [...arr, { id: 'ru' + Date.now(), ...payload }]);
        this.toast.show('Rule created', '✅');
      }
      this.ruleSaving.set(false);
      this.ruleEditorOpen.set(false);
    }, 400);
  }

  toggleRule(id: string): void {
    this.rules.update((arr) =>
      arr.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r)),
    );
  }

  deleteRule(id: string): void {
    this.rules.update((arr) => arr.filter((r) => r.id !== id));
    this.toast.show('Rule deleted', '🗑️');
  }

  readonly alertOpen = signal(false);
  readonly alertRow = signal<AlertRow | null>(null);

  openAlert(row: AlertRow): void {
    this.rows.update((list) => list.map((r) => (r.id === row.id ? { ...r, read: true } : r)));
    this.alertRow.set({ ...row, read: true });
    this.alertOpen.set(true);
  }

  closeAlert(): void {
    this.alertOpen.set(false);
  }
}
