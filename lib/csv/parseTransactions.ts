import { parse } from 'csv-parse';
import { Readable } from 'stream';
import { parse as parseDate, isValid } from 'date-fns';
import { zonedTimeToUtc } from 'date-fns-tz';
import { toCents } from '../amount';

export interface ParsedRow {
  occurredAt: Date;
  description?: string;
  amountCents: number;
  isIncome: boolean;
}

export interface ParseResult {
  rows: ParsedRow[];
  errors: { line: number; error: string }[];
}

const TZ = 'Asia/Jakarta';

function parseOccurredAt(value: string): Date | null {
  const formats = ['yyyy-MM-dd', 'dd/MM/yyyy'];
  for (const fmt of formats) {
    const d = parseDate(value, fmt, new Date());
    if (isValid(d)) {
      return zonedTimeToUtc(d, TZ);
    }
  }
  return null;
}

export async function parseTransactions(csv: string): Promise<ParseResult> {
  const rows: ParsedRow[] = [];
  const errors: { line: number; error: string }[] = [];
  const parser = parse({
    columns: (header) => header.map((h) => h.trim().toLowerCase()),
    skip_empty_lines: true,
    trim: true,
  });
  Readable.from(csv).pipe(parser);

  let line = 1;
  for await (const record of parser) {
    line += 1;
    const dateStr = record['date'];
    const amountStr = record['amount'];
    const description = record['description']?.trim();

    if (!dateStr || !amountStr) {
      errors.push({ line, error: 'Missing required fields' });
      continue;
    }

    const occurredAt = parseOccurredAt(dateStr);
    if (!occurredAt) {
      errors.push({ line, error: 'Invalid date' });
      continue;
    }

    const amountNum = parseFloat(amountStr.replace(/,/g, ''));
    if (isNaN(amountNum)) {
      errors.push({ line, error: 'Invalid amount' });
      continue;
    }
    const isIncome = amountNum >= 0;
    const amountCents = Math.abs(toCents(amountNum));
    rows.push({ occurredAt, description, amountCents, isIncome });
  }

  return { rows, errors };
}
