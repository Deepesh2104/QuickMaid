import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ToastService } from '@core/services/toast.service';

export interface CampaignRow {
  code: string;
  channel: string;
  discount: string;
  status: 'live' | 'draft' | 'ended';
}

@Component({
  selector: 'app-campaigns',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './campaigns.component.html',
})
export class CampaignsComponent {
  readonly toast = inject(ToastService);

  readonly rows: readonly CampaignRow[] = [
    { code: 'MONSOON15', channel: 'WhatsApp', discount: '15%', status: 'live' },
    { code: 'REFER100', channel: 'App', discount: '₹100', status: 'live' },
    { code: 'B2BTRIAL', channel: 'Sales', discount: '1st month', status: 'draft' },
  ];

  newCampaign(): void {
    this.toast.show('Campaign builder · Phase 3', '✨');
  }
}
