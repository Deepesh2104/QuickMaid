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
      { path: 'executive', label: 'Executive', icon: '📈' },
      { path: 'bookings', label: 'Bookings', icon: '📋', badge: '12' },
      { path: 'dispatch', label: 'Dispatch', icon: '🎯' },
      { path: 'customers', label: 'Customers', icon: '👥' },
      { path: 'maids', label: 'Maids', icon: '👩', badge: '3', badgeTone: 'red' },
      { path: 'add-maid', label: 'Add maid', icon: '➕' },
    ],
  },
  {
    title: 'Finance & growth',
    items: [
      { path: 'revenue', label: 'Revenue', icon: '💰' },
      { path: 'payouts', label: 'Payouts', icon: '💸' },
      { path: 'plans', label: 'Plans', icon: '📦' },
      { path: 'reports', label: 'Reports', icon: '📑' },
      { path: 'campaigns', label: 'Campaigns', icon: '🎁' },
      { path: 'corporate', label: 'Corporate', icon: '🏢' },
    ],
  },
  {
    title: 'Operations',
    items: [
      { path: 'zones', label: 'Zones', icon: '🗺️' },
      { path: 'reviews', label: 'Reviews', icon: '⭐' },
      { path: 'quality', label: 'Training & QC', icon: '✅' },
    ],
  },
  {
    title: 'People & support',
    items: [
      { path: 'team', label: 'Team & roles', icon: '👤' },
      { path: 'support', label: 'Support', icon: '🎧', badge: '5', badgeTone: 'red' },
      { path: 'knowledge-base', label: 'Knowledge base', icon: '📚' },
      { path: 'notifications', label: 'Alerts', icon: '🔔' },
    ],
  },
  {
    title: 'Platform',
    items: [
      { path: 'audit', label: 'Audit log', icon: '📜' },
      { path: 'compliance', label: 'Compliance', icon: '🔒' },
      { path: 'integrations', label: 'Integrations', icon: '🔌' },
      { path: 'settings', label: 'Settings', icon: '⚙️' },
    ],
  },
] as const;

export const BREADCRUMB_LABELS: Readonly<Record<string, string>> = {
  dashboard: 'Dashboard',
  executive: 'Executive overview',
  bookings: 'Bookings',
  dispatch: 'Dispatch board',
  customers: 'Customers',
  maids: 'Maids',
  revenue: 'Revenue',
  payouts: 'Payouts',
  plans: 'Plans & Subscriptions',
  reports: 'Reports hub',
  campaigns: 'Campaigns',
  corporate: 'Corporate accounts',
  zones: 'Zone Management',
  reviews: 'Reviews',
  quality: 'Training & QC',
  team: 'Team & roles',
  support: 'Support Center',
  'knowledge-base': 'Knowledge base',
  notifications: 'Alert center',
  audit: 'Audit log',
  compliance: 'Privacy & compliance',
  integrations: 'Integrations',
  settings: 'Settings',
  'add-maid': 'Add New Maid',
};
