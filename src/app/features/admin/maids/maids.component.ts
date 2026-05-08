import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, ViewChild, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ChartService } from '@core/services/chart.service';
import { CHART_PALETTE, MONTHS } from '@core/tokens/chart-palette.token';
import { ToastService } from '@core/services/toast.service';

@Component({
  selector: 'app-maids',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './maids.component.html',
})
export class MaidsComponent implements AfterViewInit {
  private readonly cs = inject(ChartService);
  private readonly palette = inject(CHART_PALETTE);
  readonly toast = inject(ToastService);
  readonly router = inject(Router);

  @ViewChild('maidTrendChart') trendCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('ratingChart') ratingCanvas!: ElementRef<HTMLCanvasElement>;

  ngAfterViewInit(): void {
    const { OR, GR, AM, RE, OR_RGB } = this.palette;
    setTimeout(() => {
      this.cs.make(this.trendCanvas.nativeElement, {
        type: 'line',
        data: {
          labels: [...MONTHS],
          datasets: [{ label: 'New Maids', data: [12, 18, 14, 22, 28, 19], borderColor: OR, backgroundColor: `rgba(${OR_RGB},.08)`, tension: 0.4, fill: true, pointRadius: 4, pointBackgroundColor: OR }],
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: { x: { grid: { display: false } }, y: { grid: { color: 'rgba(0,0,0,.05)' } } },
        },
      });
      this.cs.make(this.ratingCanvas.nativeElement, {
        type: 'bar',
        data: { labels: ['5★', '4★', '3★', '2★', '1★'], datasets: [{ data: [124, 48, 10, 3, 1], backgroundColor: [GR, 'rgba(28,140,82,.5)', 'rgba(245,158,11,.7)', AM, RE], borderRadius: 5 }] },
        options: {
          responsive: true, maintainAspectRatio: false, indexAxis: 'y' as const,
          plugins: { legend: { display: false } },
          scales: { x: { grid: { color: 'rgba(0,0,0,.05)' } }, y: { grid: { display: false } } },
        },
      });
    }, 60);
  }
}
