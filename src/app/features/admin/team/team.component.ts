import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ToastService } from '@core/services/toast.service';

export interface TeamMemberRow {
  name: string;
  email: string;
  role: string;
  status: 'active' | 'invited' | 'suspended';
  lastActive: string;
}

@Component({
  selector: 'app-team',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './team.component.html',
})
export class TeamComponent {
  readonly toast = inject(ToastService);

  readonly rows: readonly TeamMemberRow[] = [
    { name: 'Asha Verma', email: 'asha@quickmaid.in', role: 'Super Admin', status: 'active', lastActive: '2 min ago' },
    { name: 'Rohit Sen', email: 'rohit@quickmaid.in', role: 'Ops Manager', status: 'active', lastActive: '1 hr ago' },
    { name: 'Neha Kulkarni', email: 'neha@quickmaid.in', role: 'Support L1', status: 'active', lastActive: '3 hr ago' },
    { name: 'Karan Mehta', email: 'karan@quickmaid.in', role: 'Analyst', status: 'invited', lastActive: '—' },
  ];

  invite(): void {
    this.toast.show('Invite flow · Phase 3', '✉️');
  }
}
