import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, ViewChild, computed, inject, signal } from '@angular/core';
import { ChartService } from '@core/services/chart.service';
import { CHART_PALETTE, MONTHS } from '@core/tokens/chart-palette.token';
import { ToastService } from '@core/services/toast.service';

export type ReviewBucket = 'all' | 'five' | 'low' | 'flagged';

export interface ReviewRow {
  id: string;
  customer: string;
  maid: string;
  stars: number;
  excerpt: string;
  date: string;
  flagged: boolean;
}

@Component({
  selector: 'app-reviews',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './reviews.component.html',
})
export class ReviewsComponent implements AfterViewInit {
  private readonly cs = inject(ChartService);
  private readonly palette = inject(CHART_PALETTE);
  readonly toast = inject(ToastService);

  @ViewChild('revTrendChart') canvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('starChart') canvas2!: ElementRef<HTMLCanvasElement>;

  readonly bucketFilter = signal<ReviewBucket>('all');
  readonly searchQuery = signal('');

  readonly reviewRows: readonly ReviewRow[] = [
    { id: 'RV-501', customer: 'Neha A.', maid: 'Savita D.', stars: 5, excerpt: 'Spotless kitchen, on time.', date: 'May 9', flagged: false },
    { id: 'RV-500', customer: 'Rahul G.', maid: 'Priya Y.', stars: 5, excerpt: 'Great cooking, polite.', date: 'May 8', flagged: false },
    { id: 'RV-499', customer: 'Anjali T.', maid: 'Rekha S.', stars: 2, excerpt: 'Late by 40 min, rushed job.', date: 'May 7', flagged: true },
    { id: 'RV-498', customer: 'Vijay S.', maid: '—', stars: 4, excerpt: 'App booking smooth.', date: 'May 6', flagged: false },
    { id: 'RV-497', customer: 'Kiran B.', maid: 'Mina K.', stars: 5, excerpt: 'Deep clean worth it.', date: 'May 5', flagged: false },
    { id: 'RV-496', customer: 'Office admin', maid: 'Team A', stars: 1, excerpt: 'No-show, refund pending.', date: 'May 4', flagged: true },
  ];

  readonly filteredReviews = computed(() => {
    const b = this.bucketFilter();
    const q = this.searchQuery().trim().toLowerCase();
    return this.reviewRows.filter((r) => {
      if (b === 'five' && r.stars !== 5) return false;
      if (b === 'low' && r.stars > 3) return false;
      if (b === 'flagged' && !r.flagged) return false;
      if (!q) return true;
      return (
        r.id.toLowerCase().includes(q) ||
        r.customer.toLowerCase().includes(q) ||
        r.maid.toLowerCase().includes(q) ||
        r.excerpt.toLowerCase().includes(q)
      );
    });
  });

  readonly revCount = computed(() => this.filteredReviews().length);
  readonly revTotal = this.reviewRows.length;

  onSearch(ev: Event): void {
    this.searchQuery.set((ev.target as HTMLInputElement).value);
  }

  setBucket(b: ReviewBucket): void {
    this.bucketFilter.set(b);
  }

  starStr(n: number): string {
    return '★'.repeat(n) + '☆'.repeat(5 - n);
  }

  ngAfterViewInit(): void {
    const { GR, AM, RE } = this.palette;
    setTimeout(() => {
      this.cs.make(this.canvas.nativeElement, {
        type: 'line',
        data: {
          labels: [...MONTHS],
          datasets: [
            {
              label: 'Avg rating',
              data: [4.5, 4.6, 4.7, 4.7, 4.8, 4.8],
              borderColor: AM,
              backgroundColor: 'rgba(245,158,11,.1)',
              tension: 0.4,
              fill: true,
              pointRadius: 4,
              pointBackgroundColor: AM,
              borderWidth: 2,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { display: false }, ticks: { font: { size: 10 } } },
            y: { min: 4, max: 5, grid: { color: 'rgba(19,17,14,.06)' }, border: { display: false }, ticks: { font: { size: 10 } } },
          },
        },
      });

      this.cs.make(this.canvas2.nativeElement, {
        type: 'bar',
        data: {
          labels: ['5★', '4★', '3★', '2★', '1★'],
          datasets: [{ data: [948, 245, 65, 18, 8], backgroundColor: [GR, 'rgba(28,140,82,.5)', AM, 'rgba(245,158,11,.4)', RE], borderRadius: 6 }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          indexAxis: 'y' as const,
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { color: 'rgba(19,17,14,.06)' }, ticks: { font: { size: 10 } } },
            y: { grid: { display: false }, ticks: { font: { size: 10 } } },
          },
        },
      });
    }, 60);
  }
}
