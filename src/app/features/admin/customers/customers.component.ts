import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, ViewChild, inject } from '@angular/core';
import { ChartService } from '@core/services/chart.service';
import { CHART_PALETTE, MONTHS } from '@core/tokens/chart-palette.token';
import { ToastService } from '@core/services/toast.service';

@Component({
  selector: 'app-customers',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './customers.component.html',
})
export class CustomersComponent implements AfterViewInit {
  private readonly cs = inject(ChartService);
  private readonly palette = inject(CHART_PALETTE);
  readonly toast = inject(ToastService);

  @ViewChild('custChart') canvas!: ElementRef<HTMLCanvasElement>;

  ngAfterViewInit(): void {
    const { GR, RE } = this.palette;
    setTimeout(() => {
      this.cs.make(this.canvas.nativeElement, {
        type: 'line',
        data: {
          labels: [...MONTHS],
          datasets: [
            { label: 'New Customers', data: [82, 94, 78, 112, 98, 127], borderColor: GR, backgroundColor: 'rgba(28,140,82,.08)',  tension: 0.4, fill: true, pointRadius: 3, pointBackgroundColor: GR },
            { label: 'Churned',       data: [18, 22, 15, 28, 32, 48],   borderColor: RE, backgroundColor: 'rgba(239,68,68,.04)',  tension: 0.4, fill: true, pointRadius: 3, pointBackgroundColor: RE },
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
