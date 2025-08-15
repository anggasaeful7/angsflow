export function toCents(amount: number | string): number {
  const num = typeof amount === 'number' ? amount : parseFloat(amount.replace(/,/g, ''));
  if (isNaN(num)) return 0;
  return Math.round(num * 100);
}
