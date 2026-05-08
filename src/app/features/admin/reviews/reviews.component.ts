import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, ViewChild, inject } from '@angular/core';
import { ChartService } from '@core/services/chart.service';
import { CHART_PALETTE, MONTHS } from '@core/tokens/chart-palette.token';

@Component({
  selector: 'app-reviews',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './reviews.component.html',
})
export class ReviewsComponent implements AfterViewInit {
  private readonly cs = inject(ChartService);
  private readonly palette = inject(CHART_PALETTE);

  @ViewChild('revTrendChart') canvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('starChart') canvas2!: ElementRef<HTMLCanvasElement>;

  ngAfterViewInit(): void {
    const { GR, AM, RE } = this.palette;
    setTimeout(() => {
      this.cs.make(this.canvas.nativeElement, {
        type: 'line',
        data: { labels: [...MONTHS], datasets: [{ label: 'Avg Rating', data: [4.5, 4.6, 4.7, 4.7, 4.8, 4.8], borderColor: AM, backgroundColor: 'rgba(245,158,11,.08)', tension: 0.4, fill: true, pointRadius: 4, pointBackgroundColor: AM }] },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: { x: { grid: { display: false } }, y: { min: 4, max: 5, grid: { color: 'rgba(0,0,0,.05)' } } },
        },
      });

      this.cs.make(this.canvas2.nativeElement, {
        type: 'bar',
        data: { labels: ['5 Stars', '4 Stars', '3 Stars', '2 Stars', '1 Star'], datasets: [{ data: [948, 245, 65, 18, 8], backgroundColor: [GR, 'rgba(28,140,82,.5)', AM, 'rgba(245,158,11,.4)', RE], borderRadius: 5 }] },
        options: {
          responsive: true, maintainAspectRatio: false, indexAxis: 'y' as const,
          plugins: { legend: { display: false } },
          scales: { x: { grid: { color: 'rgba(0,0,0,.05)' } }, y: { grid: { display: false } } },
        },
      });
    }, 60);
  }
}
