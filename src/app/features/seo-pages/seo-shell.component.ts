import { NgClass } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  ViewEncapsulation,
} from '@angular/core';
import { RouterLink } from '@angular/router';

export type SeoHeroVariant = 'brand' | 'about' | 'legal' | 'privacy' | 'contact';

@Component({
  selector: 'app-seo-shell',
  standalone: true,
  imports: [RouterLink, NgClass],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  templateUrl: './seo-shell.component.html',
  styleUrls: ['./seo-shell.css'],
})
export class SeoShellComponent {
  @Input({ required: true }) pageTitle!: string;
  /** Optional second part of the H1, rendered with gradient accent (e.g. "& Conditions"). */
  @Input() pageTitleAccent = '';
  @Input() updated = '';
  @Input() eyebrow = '';
  @Input() subtitle = '';
  @Input() heroVariant: SeoHeroVariant = 'brand';
  /** Mini stat card in hero (off for dense legal pages). */
  @Input() showHeroExtras = true;
}
