import { Meta, Title } from '@angular/platform-browser';
import { QM_DEFAULT_DESCRIPTION, QM_DEFAULT_TITLE } from '@core/site.constants';

export { QM_DEFAULT_TITLE, QM_DEFAULT_DESCRIPTION };

/** Minimal reset (title + meta description only). Prefer `SeoService.resetToDefaults()` for full tags. */
export function resetSeoHead(title: Title, meta: Meta): void {
  title.setTitle(QM_DEFAULT_TITLE);
  meta.updateTag({ name: 'description', content: QM_DEFAULT_DESCRIPTION });
}
