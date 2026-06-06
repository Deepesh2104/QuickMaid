import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  DispatchEngineService,
  DispatchJob,
} from '@core/services/dispatch-engine.service';
import { ToastService } from '@core/services/toast.service';

@Component({
  selector: 'app-dispatch',
  standalone: true,
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dispatch.component.html',
  styleUrls: ['./dispatch.component.css'],
})
export class DispatchComponent {
  readonly engine = inject(DispatchEngineService);
  readonly toast = inject(ToastService);

  readonly draggingJobId = signal<string | null>(null);
  readonly rebalanceOpen = signal(false);
  readonly rebalanceRunning = signal(false);

  readonly unassigned = this.engine.unassigned;
  readonly maids = this.engine.maids;
  readonly slots = this.engine.slots;
  readonly unassignedCount = this.engine.unassignedCount;
  readonly assignedCount = this.engine.assignedCount;
  readonly activityLog = this.engine.activityLog;
  readonly lastAutoRun = this.engine.lastAutoRun;

  onDragStart(jobId: string): void {
    this.draggingJobId.set(jobId);
  }

  onDragEnd(): void {
    this.draggingJobId.set(null);
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  dropOnMaid(maidId: string): void {
    const jobId = this.draggingJobId();
    if (!jobId) return;
    if (this.engine.moveJobToMaid(jobId, maidId, 'manual')) {
      const maid = this.engine.maids().find((m) => m.id === maidId);
      this.toast.show(`Assigned ${jobId} → ${maid?.name}`, '✅');
    }
    this.draggingJobId.set(null);
  }

  dropOnUnassigned(): void {
    const jobId = this.draggingJobId();
    if (!jobId) return;
    this.engine.unassignJob(jobId);
    this.draggingJobId.set(null);
  }

  openRebalance(): void {
    this.rebalanceOpen.set(true);
  }

  closeRebalance(): void {
    this.rebalanceOpen.set(false);
  }

  confirmRebalance(): void {
    this.rebalanceRunning.set(true);
    setTimeout(() => {
      this.engine.rebalanceAll();
      this.rebalanceRunning.set(false);
      this.closeRebalance();
    }, 600);
  }

  runAutoAssignQueue(): void {
    this.engine.autoAssignAll(true);
  }

  simulateCancel(job: DispatchJob): void {
    this.engine.simulateMaidCancel(job.id);
  }
}
