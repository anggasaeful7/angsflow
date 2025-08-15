export interface RuleLike {
  contains: string;
  categoryId: string;
  createdAt?: Date;
}

export function matchRule(description: string, rules: RuleLike[]): string | null {
  const desc = description.toLowerCase();
  const matches = rules
    .map((r, index) => ({
      rule: r,
      index,
      contains: r.contains.toLowerCase().trim(),
    }))
    .filter((r) => desc.includes(r.contains));

  if (matches.length === 0) return null;

  matches.sort((a, b) => {
    const lenDiff = b.contains.length - a.contains.length;
    if (lenDiff !== 0) return lenDiff;
    const aTime = a.rule.createdAt ? a.rule.createdAt.getTime() : 0;
    const bTime = b.rule.createdAt ? b.rule.createdAt.getTime() : 0;
    if (bTime !== aTime) return bTime - aTime;
    return a.index - b.index;
  });

  return matches[0].rule.categoryId;
}
