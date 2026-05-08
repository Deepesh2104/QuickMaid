import { Chart, registerables } from 'chart.js';

let registered = false;

export function configureChartDefaults(): void {
  if (registered) return;
  registered = true;
  Chart.register(...registerables);
  Chart.defaults.color = '#7A7068';
  Chart.defaults.font.family = "'Cabinet Grotesk',sans-serif";
  Chart.defaults.font.size = 11;
}
