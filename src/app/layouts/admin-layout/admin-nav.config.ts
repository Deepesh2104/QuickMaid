export interface NavItem {
  readonly path: string;
  readonly label: string;
  readonly icon: string;
  readonly badge?: string;
  readonly badgeTone?: 'default' | 'red';
}

export interface NavSection {
  readonly title: string;
  readonly items: readonly NavItem[];
}

export const ADMIN_NAV: readonly NavSection[] = [
  {
    title: 'Main',
    items: [
      { path: 'dashboard', label: 'Dashboard', icon: '📊' },
      { path: 'bookings',  label: 'Bookings',  icon: '📋', badge: '12' },
      { path: 'customers', label: 'Customers', icon: '👥' },
      { path: 'maids',     label: 'Maids',     icon: '👩', badge: '3', badgeTone: 'red' },
    ],
  },
  {
    title: 'Finance',
    items: [
      { path: 'revenue', label: 'Revenue', icon: '💰' },
      { path: 'payouts', label: 'Payouts', icon: '💸' },
      { path: 'plans',   label: 'Plans',   icon: '📦' },
    ],
  },
  {
    title: 'Operations',
    items: [
      { path: 'zones',   label: 'Zones',   icon: '🗺️' },
      { path: 'reviews', label: 'Reviews', icon: '⭐' },
      { path: 'support', label: 'Support', icon: '🎧', badge: '5', badgeTone: 'red' },
    ],
  },
  {
    title: 'Settings',
    items: [
      { path: 'settings', label: 'Settings', icon: '⚙️' },
    ],
  },
] as const;

export const BREADCRUMB_LABELS: Readonly<Record<string, string>> = {
  dashboard: 'Dashboard',
  bookings: 'Bookings',
  customers: 'Customers',
  maids: 'Maids',
  revenue: 'Revenue',
  payouts: 'Payouts',
  plans: 'Plans & Subscriptions',
  zones: 'Zone Management',
  reviews: 'Reviews',
  support: 'Support Center',
  settings: 'Settings',
  'add-maid': 'Add New Maid',
};
