export interface ThemePreset {
  readonly id: string;
  readonly name: string;
  readonly swatch: string;
  readonly swatch2: string;
  readonly description: string;
}

export const THEME_PRESETS: readonly ThemePreset[] = [
  { id: 'orange',      name: 'Default — Sunset Orange', swatch: '#FF5C1A', swatch2: '#FF7A40', description: 'Bold, energetic, food-delivery style' },
  { id: 'teal',        name: 'A — Deep Teal',           swatch: '#0D9488', swatch2: '#14B8A6', description: 'Fresh, hygienic, modern · Intercom, Shopify, HubSpot' },
  { id: 'indigo',      name: 'B — Indigo Trust',        swatch: '#4F46E5', swatch2: '#6366F1', description: 'Enterprise, professional, calm · Stripe, Linear, Notion AI' },
  { id: 'emerald',     name: 'C — Emerald Growth',      swatch: '#059669', swatch2: '#10B981', description: 'Money, success, premium · QuickBooks, Wise, Razorpay' },
  { id: 'violet',      name: 'D — Royal Violet',        swatch: '#7C3AED', swatch2: '#A78BFA', description: 'Premium SaaS, modern · Vercel, Plaid, Mercury' },
  { id: 'slate-coral', name: 'E — Soft Slate + Coral',  swatch: '#0F172A', swatch2: '#F43F5E', description: 'Apple-minimal, high-end · Linear, Arc, Superhuman' },
] as const;

export const DEFAULT_THEME_ID = 'indigo';
