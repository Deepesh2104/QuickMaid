import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, ViewChild, computed, inject, signal } from '@angular/core';
import { ChartService } from '@core/services/chart.service';
import { CHART_PALETTE } from '@core/tokens/chart-palette.token';
import { ToastService } from '@core/services/toast.service';

export type PlanKind = 'monthly' | 'annual' | 'b2b' | 'instant';
export type PlanAcctStatus = 'active' | 'paused' | 'renewal';

export interface PlanSubscriberRow {
  id: string;
  customer: string;
  init: string;
  av: 'or' | 'bl' | 'pu' | 'gr';
  plan: PlanKind;
  planLabel: string;
  renews: string;
  mrr: string;
  status: PlanAcctStatus;
}

@Component({
  selector: 'app-plans',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './plans.component.html',
})
export class PlansComponent implements AfterViewInit {
  private readonly cs = inject(ChartService);
  private readonly palette = inject(CHART_PALETTE);
  readonly toast = inject(ToastService);

  @ViewChild('renewalChart') canvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('planChart') canvas2!: ElementRef<HTMLCanvasElement>;

  readonly planFilter = signal<'all' | PlanKind>('all');
  readonly statusFilter = signal<'all' | PlanAcctStatus>('all');
  readonly searchQuery = signal('');

  readonly subscribers: readonly PlanSubscriberRow[] = [
    { id: 'SUB-901', customer: 'Neha Agarwal', init: 'N', av: 'or', plan: 'monthly', planLabel: 'Monthly', renews: 'May 14', mrr: '₹799', status: 'active' },
    { id: 'SUB-902', customer: 'Rahul Gupta', init: 'R', av: 'bl', plan: 'annual', planLabel: 'Annual', renews: 'Dec 02', mrr: '₹6,999/yr', status: 'active' },
    { id: 'SUB-903', customer: 'Acme Offices', init: 'A', av: 'pu', plan: 'b2b', planLabel: 'B2B', renews: 'Jun 01', mrr: '₹24,000', status: 'renewal' },
    { id: 'SUB-904', customer: 'Vijay Sharma', init: 'V', av: 'gr', plan: 'instant', planLabel: 'Instant', renews: '—', mrr: '₹0', status: 'paused' },
    { id: 'SUB-905', customer: 'Sana Khan', init: 'S', av: 'or', plan: 'monthly', planLabel: 'Monthly', renews: 'May 20', mrr: '₹799', status: 'renewal' },
    { id: 'SUB-906', customer: 'Green Homes', init: 'G', av: 'gr', plan: 'b2b', planLabel: 'B2B', renews: 'Apr 28', mrr: '₹18,500', status: 'paused' },
  ];

  readonly filteredSubs = computed(() => {
    const p = this.planFilter();
    const s = this.statusFilter();
    const q = this.searchQuery().trim().toLowerCase();
    return this.subscribers.filter((r) => {
      if (p !== 'all' && r.plan !== p) return false;
      if (s !== 'all' && r.status !== s) return false;
      if (!q) return true;
      return r.id.toLowerCase().includes(q) || r.customer.toLowerCase().includes(q);
    });
  });

  readonly subCount = computed(() => this.filteredSubs().length);
  readonly subTotal = this.subscribers.length;

  onSearch(ev: Event): void {
    this.searchQuery.set((ev.target as HTMLInputElement).value);
  }

  setPlan(p: 'all' | PlanKind): void {
    this.planFilter.set(p);
  }

  setStatus(s: 'all' | PlanAcctStatus): void {
    this.statusFilter.set(s);
  }

  ngAfterViewInit(): void {
    const { OR, GR, BL, RE } = this.palette;
    setTimeout(() => {
      this.cs.make(this.canvas.nativeElement, {
        type: 'bar',
        data: {
          labels: ['Apr 7-10', 'Apr 11-14', 'Apr 15-20', 'Apr 21-25', 'Apr 26-30'],
          datasets: [
            { label: 'Renewals due', data: [28, 34, 45, 38, 52], backgroundColor: OR, borderRadius: 6 },
            { label: 'Likely churn', data: [4, 6, 8, 5, 9], backgroundColor: RE, borderRadius: 6 },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'top' as const, labels: { boxWidth: 10, font: { size: 10 }, usePointStyle: true } } },
          scales: {
            x: { grid: { display: false }, ticks: { font: { size: 10 } } },
            y: { grid: { color: 'rgba(19,17,14,.06)' }, border: { display: false }, ticks: { font: { size: 10 } } },
          },
        },
      });

      this.cs.make(this.canvas2.nativeElement, {
        type: 'doughnut',
        data: {
          labels: ['Monthly (312)', 'Annual (47)', 'B2B (17)', 'Paused (23)'],
          datasets: [{ data: [312, 47, 17, 23], backgroundColor: [OR, GR, BL, 'rgba(0,0,0,.12)'], borderWidth: 0, hoverOffset: 6 }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '68%',
          plugins: { legend: { position: 'right' as const, labels: { boxWidth: 10, font: { size: 10 } } } },
        } as any,
      });
    }, 60);
  }
}
