import { test, expect } from 'vitest';
import { createTranslator } from 'next-intl';
import en from './en.json';
import id from './id.json';

test('translations differ by locale', () => {
  const tEn = createTranslator({ locale: 'en', messages: en });
  const tId = createTranslator({ locale: 'id', messages: id });
  expect(tEn('Login')).toMatchInlineSnapshot('"Login"');
  expect(tId('Login')).toMatchInlineSnapshot('"Masuk"');
});
