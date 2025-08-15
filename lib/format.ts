const DEFAULT_CURRENCY = process.env.NEXT_PUBLIC_DEFAULT_CURRENCY || 'IDR';
const TZ = process.env.NEXT_PUBLIC_DEFAULT_TZ || 'Asia/Jakarta';

export function formatCurrency(value: number, locale: string, currency: string = DEFAULT_CURRENCY) {
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(value);
}

export function formatDate(
  date: Date | string,
  locale: string,
  options?: Intl.DateTimeFormatOptions,
) {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, { timeZone: TZ, ...options }).format(d);
}
