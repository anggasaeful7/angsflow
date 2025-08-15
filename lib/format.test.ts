import { describe, expect, test } from 'vitest';
import { formatCurrency, formatDate } from './format';

describe('format helpers', () => {
  test('formatCurrency respects locale and currency', () => {
    expect(formatCurrency(1234.56, 'en', 'USD')).toBe('$1,234.56');
    expect(formatCurrency(1234.56, 'id', 'IDR')).toBe('Rp 1.234,56');
  });

  test('formatDate respects locale', () => {
    const d = new Date(Date.UTC(2024, 0, 15));
    expect(formatDate(d, 'en', { year: 'numeric', month: 'long', day: 'numeric' })).toBe(
      'January 15, 2024',
    );
    expect(formatDate(d, 'id', { year: 'numeric', month: 'long', day: 'numeric' })).toBe(
      '15 Januari 2024',
    );
  });
});
