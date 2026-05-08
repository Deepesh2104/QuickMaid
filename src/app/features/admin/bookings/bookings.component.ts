import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, ViewChild, inject } from '@angular/core';
import { ChartService } from '@core/services/chart.service';
import { DAYS } from '@core/tokens/chart-palette.token';
import { ToastService } from '@core/services/toast.service';

@Component({
  selector: 'app-bookings',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './bookings.component.html',
})
export class BookingsComponent implements AfterViewInit {
  private readonly cs = inject(ChartService);
  readonly toast = inject(ToastService);

  @ViewChild('bookWeekChart') canvas!: ElementRef<HTMLCanvasElement>;

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.cs.make(this.canvas.nativeElement, {
        type: 'bar',
        data: {
          labels: [...DAYS],
          datasets: [
            { label: 'Completed', data: [312, 287, 334, 298, 356, 412, 278], backgroundColor: 'rgba(28,140,82,.65)',  borderRadius: 5 },
            { label: 'Cancelled', data: [12, 8, 15, 6, 9, 14, 7],            backgroundColor: 'rgba(239,68,68,.65)',  borderRadius: 5 },
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
