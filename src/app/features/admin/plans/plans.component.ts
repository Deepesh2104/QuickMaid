import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, ViewChild, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
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

export interface PlanBillingEvent {
  date: string;
  event: string;
  amount: string;
}

export interface PlanDetail {
  started: string;
  visitsIncluded: string;
  paymentMethod: string;
  autoRenew: boolean;
  totalSpent: string;
  nextInvoice: string;
  zone: string;
  billingHistory: PlanBillingEvent[];
  perks: string[];
}

@Component({
  selector: 'app-plans',
  standalone: true,
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './plans.component.html',
  styleUrls: ['./plans.component.css'],
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

  readonly priceRulesOpen = signal(false);
  readonly newPlanOpen = signal(false);
  readonly planSaving = signal(false);
  readonly formPlanName = signal('');
  readonly formPlanKind = signal<PlanKind>('monthly');
  readonly formPlanPrice = signal('799');

  readonly detailOpen = signal(false);
  readonly detailRow = signal<PlanSubscriberRow | null>(null);

  readonly detailInfo = computed((): PlanDetail | null => {
    const s = this.detailRow();
    return s ? this.buildDetail(s) : null;
  });

  readonly lifecycleOpen = signal(false);
  readonly lifecycleRow = signal<PlanSubscriberRow | null>(null);
  readonly lifecycleReason = signal('customer_request');
  readonly lifecycleNotify = signal(true);
  readonly lifecycleRunning = signal(false);

  readonly priceRules = [
    { plan: 'Instant', base: '₹149/hr', surge: '+20% weekends' },
    { plan: 'Monthly', base: '₹799/mo', surge: '—' },
    { plan: 'Annual', base: '₹6,999/yr', surge: '2 mo free' },
    { plan: 'B2B', base: 'Custom SLA', surge: 'Per seat' },
  ] as const;

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

  openPriceRules(): void {
    this.priceRulesOpen.set(true);
  }

  closePriceRules(): void {
    this.priceRulesOpen.set(false);
  }

  openNewPlan(): void {
    this.formPlanName.set('');
    this.formPlanKind.set('monthly');
    this.formPlanPrice.set('799');
    this.newPlanOpen.set(true);
  }

  closeNewPlan(): void {
    this.newPlanOpen.set(false);
  }

  confirmNewPlan(): void {
    const name = this.formPlanName().trim();
    if (!name) {
      this.toast.show('Plan name required', '⚠️');
      return;
    }
    this.planSaving.set(true);
    setTimeout(() => {
      this.planSaving.set(false);
      this.closeNewPlan();
      this.toast.show(`Plan draft saved · ${name}`, '📦');
    }, 600);
  }

  statusBadgeClass(s: PlanAcctStatus): string {
    if (s === 'active') return 'badge badge-green';
    if (s === 'paused') return 'badge badge-gray';
    return 'badge badge-amber';
  }

  statusLabel(s: PlanAcctStatus): string {
    if (s === 'active') return 'Active';
    if (s === 'paused') return 'Paused';
    return 'Renewal due';
  }

  private buildDetail(s: PlanSubscriberRow): PlanDetail {
    const perks =
      s.plan === 'b2b'
        ? ['Dedicated account mgr', 'SLA 4h', 'Invoice NET-15']
        : s.plan === 'annual'
          ? ['2 months free', 'Priority maid', 'Free deep clean / quarter']
          : s.plan === 'monthly'
            ? ['4 visits / month', 'Free reschedule', 'Same maid preference']
            : ['Pay per visit', 'No lock-in'];
    return {
      started: s.plan === 'instant' ? 'Mar 2026' : 'Aug 2024',
      visitsIncluded: s.plan === 'instant' ? '—' : s.plan === 'b2b' ? 'Custom SLA' : s.plan === 'annual' ? '48 / yr' : '4 / mo',
      paymentMethod: s.plan === 'b2b' ? 'Bank transfer · PO' : 'UPI auto-debit',
      autoRenew: s.status !== 'paused',
      totalSpent: s.plan === 'b2b' ? '₹2,88,000' : s.plan === 'annual' ? '₹28,000' : s.plan === 'monthly' ? '₹9,520' : '₹447',
      nextInvoice: s.renews === '—' ? '—' : s.renews + ' 2026',
      zone: s.customer.includes('Office') || s.customer.includes('Homes') ? 'Multi-site' : 'Tatibandh',
      billingHistory: [
        { date: 'May 1', event: s.status === 'renewal' ? 'Renewal reminder sent' : 'Invoice paid', amount: s.mrr },
        { date: 'Apr 1', event: 'Invoice paid', amount: s.mrr },
        { date: 'Mar 1', event: 'Invoice paid', amount: s.mrr },
      ],
      perks,
    };
  }

  openDetail(row: PlanSubscriberRow): void {
    this.detailRow.set(row);
    this.detailOpen.set(true);
  }

  closeDetail(): void {
    this.detailOpen.set(false);
  }

  openLifecycle(row: PlanSubscriberRow): void {
    this.lifecycleRow.set(row);
    this.lifecycleReason.set('customer_request');
    this.lifecycleNotify.set(true);
    this.lifecycleOpen.set(true);
  }

  closeLifecycle(): void {
    this.lifecycleOpen.set(false);
  }

  confirmLifecycle(): void {
    const s = this.lifecycleRow();
    if (!s) return;
    this.lifecycleRunning.set(true);
    const action = s.status === 'paused' ? 'Resumed' : 'Paused';
    window.setTimeout(() => {
      this.lifecycleRunning.set(false);
      this.toast.show(`${action} · ${s.customer}`, s.status === 'paused' ? '▶️' : '⏸️');
      this.closeLifecycle();
    }, 600);
  }

  openAction(kind: string, row: PlanSubscriberRow): void {
    if (kind === 'view') {
      this.openDetail(row);
      return;
    }
    if (kind === 'lifecycle') {
      this.openLifecycle(row);
      return;
    }
  }
}
