import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, ViewChild, inject } from '@angular/core';
import { ChartService } from '@core/services/chart.service';
import { CHART_PALETTE } from '@core/tokens/chart-palette.token';

@Component({
  selector: 'app-plans',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './plans.component.html',
})
export class PlansComponent implements AfterViewInit {
  private readonly cs = inject(ChartService);
  private readonly palette = inject(CHART_PALETTE);

  @ViewChild('renewalChart') canvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('planChart') canvas2!: ElementRef<HTMLCanvasElement>;

  ngAfterViewInit(): void {
    const { OR, GR, BL, RE } = this.palette;
    setTimeout(() => {
      this.cs.make(this.canvas.nativeElement, {
        type: 'bar',
        data: {
          labels: ['Apr 7-10', 'Apr 11-14', 'Apr 15-20', 'Apr 21-25', 'Apr 26-30'],
          datasets: [
            { label: 'Renewals Due',    data: [28, 34, 45, 38, 52], backgroundColor: OR, borderRadius: 5 },
            { label: 'Likely to Churn', data: [4, 6, 8, 5, 9],      backgroundColor: RE, borderRadius: 5 },
          ],
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { position: 'top' as const } },
          scales: { x: { grid: { display: false } }, y: { grid: { color: 'rgba(0,0,0,.05)' } } },
        },
      });

      this.cs.make(this.canvas2.nativeElement, {
        type: 'doughnut',
        data: { labels: ['Monthly (312)', 'Annual (47)', 'B2B (17)', 'Paused (23)'], datasets: [{ data: [312, 47, 17, 23], backgroundColor: [OR, GR, BL, 'rgba(0,0,0,.12)'], borderWidth: 0, hoverOffset: 6 }] },
        options: { responsive: true, maintainAspectRatio: false, cutout: '68%', plugins: { legend: { position: 'right' as const } } } as any,
      });
    }, 60);
  }
}
