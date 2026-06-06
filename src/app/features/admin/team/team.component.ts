import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToastService } from '@core/services/toast.service';

export interface TeamMemberRow {
  name: string;
  email: string;
  role: string;
  status: 'active' | 'invited' | 'suspended';
  lastActive: string;
}

const ROLE_OPTIONS = [
  'Super Admin',
  'Ops Manager',
  'Support L1',
  'Support L2',
  'Analyst',
] as const;

@Component({
  selector: 'app-team',
  standalone: true,
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './team.component.html',
  styleUrls: ['./team.component.css'],
})
export class TeamComponent {
  readonly toast = inject(ToastService);
  readonly ROLE_OPTIONS = ROLE_OPTIONS;

  readonly rows = signal<TeamMemberRow[]>([
    { name: 'Asha Verma', email: 'asha@quickmaid.in', role: 'Super Admin', status: 'active', lastActive: '2 min ago' },
    { name: 'Rohit Sen', email: 'rohit@quickmaid.in', role: 'Ops Manager', status: 'active', lastActive: '1 hr ago' },
    { name: 'Neha Kulkarni', email: 'neha@quickmaid.in', role: 'Support L1', status: 'active', lastActive: '3 hr ago' },
    { name: 'Karan Mehta', email: 'karan@quickmaid.in', role: 'Analyst', status: 'invited', lastActive: '—' },
  ]);

  readonly inviteOpen = signal(false);
  readonly inviteName = signal('');
  readonly inviteEmail = signal('');
  readonly inviteRole = signal<string>(ROLE_OPTIONS[2]);
  readonly inviteSending = signal(false);

  readonly pendingInviteCount = computed(
    () => this.rows().filter((r) => r.status === 'invited').length,
  );

  openInvite(): void {
    this.inviteName.set('');
    this.inviteEmail.set('');
    this.inviteRole.set(ROLE_OPTIONS[2]);
    this.inviteOpen.set(true);
  }

  closeInvite(): void {
    this.inviteOpen.set(false);
  }

  sendInvite(): void {
    const name = this.inviteName().trim();
    const email = this.inviteEmail().trim().toLowerCase();
    if (!name || !email) {
      this.toast.show('Name aur email required', '⚠️');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      this.toast.show('Valid email daalein', '⚠️');
      return;
    }
    if (this.rows().some((r) => r.email === email)) {
      this.toast.show('Yeh email pehle se hai', '⚠️');
      return;
    }
    this.inviteSending.set(true);
    setTimeout(() => {
      this.rows.update((arr) => [
        ...arr,
        { name, email, role: this.inviteRole(), status: 'invited', lastActive: '—' },
      ]);
      this.inviteSending.set(false);
      this.inviteOpen.set(false);
      this.toast.show(`Invite bheja: ${email}`, '✉️');
    }, 700);
  }

  readonly editOpen = signal(false);
  readonly editRow = signal<TeamMemberRow | null>(null);
  readonly editRole = signal<string>(ROLE_OPTIONS[2]);
  readonly editSaving = signal(false);

  readonly suspendOpen = signal(false);
  readonly suspendRow = signal<TeamMemberRow | null>(null);
  readonly suspendRunning = signal(false);

  readonly resendOpen = signal(false);
  readonly resendRow = signal<TeamMemberRow | null>(null);
  readonly resendRunning = signal(false);

  openEdit(row: TeamMemberRow): void {
    this.editRow.set(row);
    this.editRole.set(row.role);
    this.editOpen.set(true);
  }

  closeEdit(): void {
    this.editOpen.set(false);
  }

  confirmEdit(): void {
    const row = this.editRow();
    if (!row) return;
    this.editSaving.set(true);
    setTimeout(() => {
      this.rows.update((arr) =>
        arr.map((r) => (r.email === row.email ? { ...r, role: this.editRole() } : r)),
      );
      this.editSaving.set(false);
      this.editOpen.set(false);
      this.toast.show(`Role updated · ${row.name}`, '🔐');
    }, 450);
  }

  openSuspend(row: TeamMemberRow): void {
    this.suspendRow.set(row);
    this.suspendOpen.set(true);
  }

  closeSuspend(): void {
    this.suspendOpen.set(false);
  }

  confirmSuspend(): void {
    const row = this.suspendRow();
    if (!row) return;
    this.suspendRunning.set(true);
    setTimeout(() => {
      this.rows.update((arr) =>
        arr.map((r) =>
          r.email === row.email ? { ...r, status: 'suspended' as const, lastActive: '—' } : r,
        ),
      );
      this.suspendRunning.set(false);
      this.suspendOpen.set(false);
      this.toast.show(`${row.name} suspended`, '⛔');
    }, 500);
  }

  openResend(row: TeamMemberRow): void {
    this.resendRow.set(row);
    this.resendOpen.set(true);
  }

  closeResend(): void {
    this.resendOpen.set(false);
  }

  confirmResend(): void {
    const row = this.resendRow();
    if (!row) return;
    this.resendRunning.set(true);
    setTimeout(() => {
      this.resendRunning.set(false);
      this.resendOpen.set(false);
      this.toast.show(`Invite resent · ${row.email}`, '✉️');
    }, 550);
  }
}
