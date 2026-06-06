import { Injectable, computed, inject, signal } from '@angular/core';
import { ToastService } from '@core/services/toast.service';

export const QM_SETTINGS_KEY = 'qm_settings';

export interface DispatchJob {
  id: string;
  customer: string;
  area: string;
  service: string;
  slot: string;
}

export interface DispatchMaid {
  id: string;
  name: string;
  zone: string;
  jobs: DispatchJob[];
  online: boolean;
}

export interface DispatchActivity {
  at: string;
  text: string;
  icon: string;
}

export interface DispatchSlot {
  time: string;
  open: number;
  assigned: number;
  risk: 'ok' | 'watch' | 'hot';
}

function nowClock(): string {
  return new Intl.DateTimeFormat('en-IN', { hour: '2-digit', minute: '2-digit' }).format(new Date());
}

function zonesMatch(jobArea: string, maidZone: string): boolean {
  const a = jobArea.toLowerCase().trim();
  const b = maidZone.toLowerCase().trim();
  return a === b || a.includes(b) || b.includes(a);
}

@Injectable({ providedIn: 'root' })
export class DispatchEngineService {
  private readonly toast = inject(ToastService);

  readonly unassigned = signal<DispatchJob[]>([
    { id: 'B-902', customer: 'Anita K.', area: 'Civil Lines', service: 'Deep', slot: '16:30' },
    { id: 'B-904', customer: 'Meena P.', area: 'Shankar Nagar', service: 'Daily', slot: '18:00' },
    { id: 'B-906', customer: 'Suresh L.', area: 'Civil Lines', service: 'Deep', slot: '19:00' },
  ]);

  readonly maids = signal<DispatchMaid[]>([
    {
      id: 'M-01',
      name: 'Savita D.',
      zone: 'Pandri',
      online: true,
      jobs: [{ id: 'B-901', customer: 'Vijay S.', area: 'Pandri', service: 'Daily', slot: '16:00' }],
    },
    {
      id: 'M-02',
      name: 'Kamla S.',
      zone: 'Civil Lines',
      online: true,
      jobs: [{ id: 'B-903', customer: 'Rohit G.', area: 'Tatibandh', service: 'Kitchen', slot: '17:00' }],
    },
    { id: 'M-03', name: 'Rekha M.', zone: 'Tatibandh', online: true, jobs: [] },
    {
      id: 'M-04',
      name: 'Priya L.',
      zone: 'Shankar Nagar',
      online: true,
      jobs: [{ id: 'B-905', customer: 'Kavita M.', area: 'Pandri', service: 'Regular', slot: '18:30' }],
    },
  ]);

  readonly activityLog = signal<DispatchActivity[]>([
    { at: '16:02', text: 'Auto-assign · 3 jobs matched on board load', icon: '⚡' },
  ]);

  readonly lastAutoRun = signal('On load');

  readonly unassignedCount = computed(() => this.unassigned().length);

  readonly assignedCount = computed(() =>
    this.maids().reduce((n, m) => n + m.jobs.length, 0),
  );

  readonly slots = computed((): DispatchSlot[] => [
    { time: '08:00–10:00', open: 2, assigned: 20, risk: 'ok' },
    { time: '10:00–12:00', open: 5, assigned: 24, risk: 'watch' },
    {
      time: '16:00–18:00',
      open: this.unassigned().length,
      assigned: this.assignedCount(),
      risk: this.unassigned().length > 4 ? 'hot' : this.unassigned().length > 0 ? 'watch' : 'ok',
    },
    { time: '18:00–20:00', open: 3, assigned: 17, risk: 'ok' },
  ]);

  private log(text: string, icon: string): void {
    this.activityLog.update((list) => [{ at: nowClock(), text, icon }, ...list].slice(0, 12));
  }

  findBestMaid(job: DispatchJob, excludeMaidId?: string): DispatchMaid | undefined {
    const pool = this.maids().filter((m) => m.online && m.id !== excludeMaidId);
    if (!pool.length) return undefined;
    const zoneMatches = pool.filter((m) => zonesMatch(job.area, m.zone));
    const candidates = zoneMatches.length ? zoneMatches : pool;
    return candidates.reduce((best, m) =>
      m.jobs.length < best.jobs.length ? m : best,
    );
  }

  moveJobToMaid(jobId: string, maidId: string, reason: 'manual' | 'auto' | 'backup'): boolean {
    let job: DispatchJob | undefined;

    this.unassigned.update((list) => {
      const idx = list.findIndex((j) => j.id === jobId);
      if (idx >= 0) {
        job = list[idx];
        return list.filter((j) => j.id !== jobId);
      }
      return list;
    });

    if (!job) {
      for (const m of this.maids()) {
        const found = m.jobs.find((j) => j.id === jobId);
        if (found) {
          job = found;
          break;
        }
      }
      this.maids.update((arr) =>
        arr.map((m) => ({ ...m, jobs: m.jobs.filter((j) => j.id !== jobId) })),
      );
    }

    if (!job) return false;

    this.maids.update((arr) =>
      arr.map((m) => (m.id === maidId ? { ...m, jobs: [...m.jobs, job!] } : m)),
    );

    const maid = this.maids().find((m) => m.id === maidId);
    const prefix = reason === 'auto' ? 'Auto' : reason === 'backup' ? 'Backup' : 'Manual';
    this.log(`${prefix}: ${job.id} → ${maid?.name} (${job.area})`, reason === 'backup' ? '🔄' : '✅');
    return true;
  }

  unassignJob(jobId: string): void {
    let job: DispatchJob | undefined;
    this.maids.update((arr) =>
      arr.map((m) => {
        const found = m.jobs.find((j) => j.id === jobId);
        if (found) job = found;
        return { ...m, jobs: m.jobs.filter((j) => j.id !== jobId) };
      }),
    );
    if (job) {
      this.unassigned.update((list) => (list.some((j) => j.id === jobId) ? list : [...list, job!]));
      this.log(`${job.id} returned to queue`, '↩️');
    }
  }

  autoAssignJob(jobId: string): boolean {
    const job = this.unassigned().find((j) => j.id === jobId);
    if (!job) return false;
    const maid = this.findBestMaid(job);
    if (!maid) return false;
    return this.moveJobToMaid(jobId, maid.id, 'auto');
  }

  autoAssignAll(notify = true): number {
    let count = 0;
    let safety = 20;
    while (safety-- > 0) {
      const queue = [...this.unassigned()];
      if (!queue.length) break;
      const before = this.unassigned().length;
      for (const job of queue) {
        const maid = this.findBestMaid(job);
        if (maid) this.moveJobToMaid(job.id, maid.id, 'auto');
      }
      const after = this.unassigned().length;
      count += before - after;
      if (before === after) break;
    }
    if (count > 0) {
      this.lastAutoRun.set('Just now');
      if (notify) {
        this.toast.show(`Auto-assigned ${count} job${count > 1 ? 's' : ''}`, '⚡');
        this.notifyCustomersWhatsApp(count);
      }
    }
    return count;
  }

  simulateMaidCancel(jobId: string): { ok: boolean; maid?: string } {
    let fromMaidId: string | undefined;
    let job: DispatchJob | undefined;

    this.maids.update((arr) =>
      arr.map((m) => {
        const found = m.jobs.find((j) => j.id === jobId);
        if (found) {
          fromMaidId = m.id;
          job = found;
        }
        return { ...m, jobs: m.jobs.filter((j) => j.id !== jobId) };
      }),
    );

    if (!job || !fromMaidId) {
      this.toast.show('Job not found on board', '⚠️');
      return { ok: false };
    }

    const fromMaid = this.maids().find((m) => m.id === fromMaidId);
    this.log(`${fromMaid?.name} cancelled · ${job.id}`, '❌');
    this.unassigned.update((list) => [...list, job!]);

    const backup = this.findBestMaid(job, fromMaidId);
    if (!backup) {
      this.toast.show('No backup maid — SLA risk, ops needed', '🚨');
      return { ok: false };
    }

    this.unassigned.update((list) => list.filter((j) => j.id !== jobId));
    this.maids.update((arr) =>
      arr.map((m) => (m.id === backup.id ? { ...m, jobs: [...m.jobs, job!] } : m)),
    );
    this.log(`Backup: ${job.id} → ${backup.name} (Urban-style auto)`, '🔄');
    this.toast.show(`Backup ${backup.name} assigned · WhatsApp sent`, '💬');
    return { ok: true, maid: backup.name };
  }

  assignBackupForBooking(bookingId: string, zone: string, customerName: string): string | null {
    const synthetic: DispatchJob = {
      id: bookingId,
      customer: customerName,
      area: zone,
      service: 'Backup',
      slot: 'ASAP',
    };
    const maid = this.findBestMaid(synthetic);
    if (!maid) {
      this.log(`Backup failed · ${bookingId} · no maid in ${zone}`, '🚨');
      return null;
    }
    this.log(`Backup: ${bookingId} → ${maid.name} · ${customerName}`, '🔄');
    return maid.name;
  }

  rebalanceAll(): number {
    const n = this.autoAssignAll(true);
    if (!n) {
      this.toast.show(this.unassigned().length ? 'No zone match — try manual drag' : 'Queue already empty', 'ℹ️');
    }
    return n;
  }

  private notifyCustomersWhatsApp(count: number): void {
    if (count > 0) {
      this.log(`${count} customer WhatsApp confirmations queued`, '💬');
    }
  }
}
