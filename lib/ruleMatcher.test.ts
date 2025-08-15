import { it, expect } from 'vitest';
import { matchRule, RuleLike } from './ruleMatcher';

const rules: RuleLike[] = [
  { contains: 'gojek', categoryId: 'A', createdAt: new Date('2024-01-01') },
  { contains: 'gojek-food', categoryId: 'B', createdAt: new Date('2024-01-02') },
  { contains: 'shop', categoryId: 'C', createdAt: new Date('2024-01-03') },
];

it('matches case-insensitive and longest pattern', () => {
  const cat = matchRule('GOJEK-FOOD order', rules);
  expect(cat).toBe('B');
});

it('prefers first rule when tie', () => {
  const tieRules: RuleLike[] = [
    { contains: 'abc', categoryId: '1' },
    { contains: 'abc', categoryId: '2' },
  ];
  const cat = matchRule('xxabcxx', tieRules);
  expect(cat).toBe('1');
});
