export const formatUsd = (cents: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
    cents / 100,
  );
export const labelize = (value: string) =>
  value
    .split('-')
    .map((word) => word[0]?.toUpperCase() + word.slice(1))
    .join(' ');
