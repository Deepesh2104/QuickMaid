import { Injectable } from '@angular/core';
import { Chart, ChartConfiguration } from 'chart.js';
import { configureChartDefaults } from '../config/chart.config';

@Injectable({ providedIn: 'root' })
export class ChartService {
  constructor() {
    configureChartDefaults();
  }

  make(canvas: HTMLCanvasElement | null | undefined, cfg: ChartConfiguration): Chart | null {
    if (!canvas) return null;
    const existing = Chart.getChart(canvas);
    if (existing) existing.destroy();
    return new Chart(canvas, cfg);
  }
}
