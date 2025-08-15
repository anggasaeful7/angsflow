import { expect, it } from 'vitest';
import { parseTransactions } from './parseTransactions';

const sample = `Date,Description,Amount\n2025-08-01,GOJEK-FOOD,-45000\n02/08/2025,PLN Prepaid,-200000\n`;

it('parses dates and amounts correctly', async () => {
  const { rows, errors } = await parseTransactions(sample);
  expect(errors.length).toBe(0);
  expect(rows.length).toBe(2);
  expect(rows[0].amountCents).toBe(4500000);
  expect(rows[0].isIncome).toBe(false);
  expect(rows[1].amountCents).toBe(20000000);
});

it('collects errors for invalid rows', async () => {
  const { rows, errors } = await parseTransactions(`Date,Description,Amount\n2025-08-01,,abc\n`);
  expect(rows.length).toBe(0);
  expect(errors.length).toBe(1);
});
