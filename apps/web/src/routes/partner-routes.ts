export const partnerSections = [
  'products',
  'inventory',
  'storefront',
  'fulfillment',
  'promotions',
  'analytics',
  'team',
  'settings',
] as const;

export type PartnerSection = (typeof partnerSections)[number];
export type PartnerDestination = '' | 'orders' | PartnerSection;

export const isPartnerSection = (value: string): value is PartnerSection =>
  partnerSections.includes(value as PartnerSection);

export const partnerCoursePath = (
  courseId: string,
  destination: PartnerDestination = '',
) =>
  `/partner/course/${encodeURIComponent(courseId)}${destination ? `/${destination}` : ''}`;

export const partnerNavigation = [
  { label: 'Overview', destination: '' },
  { label: 'Orders', destination: 'orders' },
  { label: 'Products', destination: 'products' },
  { label: 'Inventory', destination: 'inventory' },
  { label: 'Storefront', destination: 'storefront' },
  { label: 'Fulfillment', destination: 'fulfillment' },
  { label: 'Promotions', destination: 'promotions' },
  { label: 'Analytics', destination: 'analytics' },
  { label: 'Team', destination: 'team' },
  { label: 'Settings', destination: 'settings' },
] as const satisfies readonly {
  label: string;
  destination: PartnerDestination;
}[];
