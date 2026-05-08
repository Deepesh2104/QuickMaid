import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, ViewChild, inject } from '@angular/core';
import { ChartService } from '@core/services/chart.service';
import { CHART_PALETTE } from '@core/tokens/chart-palette.token';
import { ToastService } from '@core/services/toast.service';

@Component({
  selector: 'app-zones',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './zones.component.html',
})
export class ZonesComponent implements AfterViewInit {
  private readonly cs = inject(ChartService);
  private readonly palette = inject(CHART_PALETTE);
  readonly toast = inject(ToastService);

  @ViewChild('zoneChart') canvas!: ElementRef<HTMLCanvasElement>;

  ngAfterViewInit(): void {
    const { OR_RGB } = this.palette;
    setTimeout(() => {
      this.cs.make(this.canvas.nativeElement, {
        type: 'bar',
        data: {
          labels: ['Tatibandh', 'Civil Lines', 'Shankar Nagar', 'Pandri', 'Telibandha'],
          datasets: [
            { label: 'Demand (Bookings)', data: [88, 65, 54, 32, 28], backgroundColor: `rgba(${OR_RGB},.75)`,  borderRadius: 5 },
            { label: 'Supply (Maids)',    data: [34, 28, 21, 12, 9],  backgroundColor: 'rgba(29,78,216,.65)',  borderRadius: 5 },
          ],
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { position: 'top' as const } },
          scales: { x: { grid: { display: false } }, y: { grid: { color: 'rgba(0,0,0,.05)' } } },
        },
      });
    }, 60);
  }
}
