import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, ViewChild, inject } from '@angular/core';
import { ChartService } from '@core/services/chart.service';
import { CHART_PALETTE, MONTHS } from '@core/tokens/chart-palette.token';

@Component({
  selector: 'app-revenue',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './revenue.component.html',
})
export class RevenueComponent implements AfterViewInit {
  private readonly cs = inject(ChartService);
  private readonly palette = inject(CHART_PALETTE);

  @ViewChild('revChart') canvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('revSrcChart') canvas2!: ElementRef<HTMLCanvasElement>;

  ngAfterViewInit(): void {
    const { OR, GR, BL, AM, OR_RGB } = this.palette;
    setTimeout(() => {
      this.cs.make(this.canvas.nativeElement, {
        type: 'bar',
        data: {
          labels: [...MONTHS],
          datasets: [
            { label: 'Instant',       data: [48000, 52000, 44000, 61000, 57000, 68560],            backgroundColor: `rgba(${OR_RGB},.5)`,    borderRadius: 4 },
            { label: 'Subscriptions', data: [140000, 158000, 162000, 195000, 215000, 240000],      backgroundColor: 'rgba(28,140,82,.55)',   borderRadius: 4 },
            { label: 'B2B',           data: [28000, 32000, 38000, 52000, 68000, 85000],            backgroundColor: 'rgba(29,78,216,.55)',   borderRadius: 4 },
          ],
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { position: 'top' as const } },
          scales: {
            x: { stacked: true, grid: { display: false } },
            y: { stacked: true, grid: { color: 'rgba(0,0,0,.05)' }, ticks: { callback: (v: any) => '₹' + Math.round(v / 1000) + 'K' } },
          },
        },
      } as any);

      this.cs.make(this.canvas2.nativeElement, {
        type: 'doughnut',
        data: {
          labels: ['Monthly Plans', 'B2B Contracts', 'Instant', 'Annual', 'Add-ons'],
          datasets: [{ data: [56, 20, 16, 6, 2], backgroundColor: [GR, BL, OR, AM, 'rgba(168,85,247,.8)'], borderWidth: 0, hoverOffset: 6 }],
        },
        options: { responsive: true, maintainAspectRatio: false, cutout: '65%', plugins: { legend: { position: 'right' as const } } } as any,
      });
    }, 60);
  }
}
