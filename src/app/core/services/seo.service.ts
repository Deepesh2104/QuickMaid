import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import {
  DEFAULT_OG_IMAGE_PATH,
  QM_DEFAULT_DESCRIPTION,
  QM_DEFAULT_TITLE,
  SITE_ORIGIN,
} from '@core/site.constants';

export interface QmPageSeoConfig {
  title: string;
  description: string;
  /** Path starting with /, e.g. `/about` */
  canonicalPath: string;
  ogTitle?: string;
  ogDescription?: string;
  /** Path starting with /, served from SITE_ORIGIN */
  ogImagePath?: string;
  twitterCard?: 'summary' | 'summary_large_image';
  /** e.g. `noindex, nofollow` for staging */
  robots?: string;
}

@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly doc = inject(DOCUMENT);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);

  private absoluteUrl(path: string): string {
    const p = path.startsWith('/') ? path : `/${path}`;
    return `${SITE_ORIGIN}${p}`;
  }

  setPage(c: QmPageSeoConfig): void {
    const url = this.absoluteUrl(c.canonicalPath);
    const ogImage = this.absoluteUrl(c.ogImagePath ?? DEFAULT_OG_IMAGE_PATH);
    const ogTitle = c.ogTitle ?? c.title;
    const ogDesc = c.ogDescription ?? c.description;

    this.title.setTitle(c.title);
    this.meta.updateTag({ name: 'description', content: c.description });

    if (c.robots) {
      this.ensureMetaName('robots', c.robots);
    } else {
      this.doc.head?.querySelector<HTMLMetaElement>('meta[name="robots"][data-qm-seo]')?.remove();
    }

    this.ensureLinkCanonical(url);

    this.ensureMetaProperty('og:type', 'website');
    this.ensureMetaProperty('og:site_name', 'QuickMaid');
    this.ensureMetaProperty('og:url', url);
    this.ensureMetaProperty('og:title', ogTitle);
    this.ensureMetaProperty('og:description', ogDesc);
    this.ensureMetaProperty('og:image', ogImage);

    this.ensureMetaName('twitter:card', c.twitterCard ?? 'summary_large_image');
    this.ensureMetaName('twitter:title', ogTitle);
    this.ensureMetaName('twitter:description', ogDesc);
    this.ensureMetaName('twitter:image', ogImage);
  }

  /** Home + default social tags (e.g. after leaving a routed page). */
  resetToDefaults(): void {
    this.doc.head?.querySelector<HTMLMetaElement>('meta[name="robots"][data-qm-seo]')?.remove();
    this.setPage({
      title: QM_DEFAULT_TITLE,
      description: QM_DEFAULT_DESCRIPTION,
      canonicalPath: '/',
      ogTitle: QM_DEFAULT_TITLE,
      ogDescription: QM_DEFAULT_DESCRIPTION,
      ogImagePath: DEFAULT_OG_IMAGE_PATH,
    });
  }

  injectJsonLd(id: string, data: unknown): void {
    const head = this.doc.head;
    if (!head) return;
    this.doc.getElementById(id)?.remove();
    const script = this.doc.createElement('script');
    script.type = 'application/ld+json';
    script.id = id;
    script.setAttribute('data-qm-seo', '1');
    script.textContent = JSON.stringify(data);
    head.appendChild(script);
  }

  removeJsonLdById(id: string): void {
    this.doc.getElementById(id)?.remove();
  }

  private ensureLinkCanonical(href: string): void {
    const head = this.doc.head;
    if (!head) return;
    let link = head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = this.doc.createElement('link');
      link.setAttribute('rel', 'canonical');
      head.appendChild(link);
    }
    link.setAttribute('href', href);
    link.setAttribute('data-qm-seo', '1');
  }

  private ensureMetaProperty(property: string, content: string): void {
    const head = this.doc.head;
    if (!head) return;
    let el = head.querySelector<HTMLMetaElement>(`meta[property="${property}"]`);
    if (!el) {
      el = this.doc.createElement('meta');
      el.setAttribute('property', property);
      head.appendChild(el);
    }
    el.setAttribute('content', content);
    el.setAttribute('data-qm-seo', '1');
  }

  private ensureMetaName(name: string, content: string): void {
    const head = this.doc.head;
    if (!head) return;
    let el = head.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
    if (!el) {
      el = this.doc.createElement('meta');
      el.setAttribute('name', name);
      head.appendChild(el);
    }
    el.setAttribute('content', content);
    el.setAttribute('data-qm-seo', '1');
  }
}
