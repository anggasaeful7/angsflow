import { format, utcToZonedTime } from 'date-fns-tz';

const TZ = process.env.NEXT_PUBLIC_DEFAULT_TZ || 'Asia/Jakarta';

export function formatDate(date: Date | string, fmt: string) {
  const zoned = utcToZonedTime(date, TZ);
  return format(zoned, fmt, { timeZone: TZ });
}
