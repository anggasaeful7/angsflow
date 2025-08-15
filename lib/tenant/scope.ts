export function scope<T extends { where?: Record<string, unknown> }>(orgId: string, query: T): T {
  return { ...query, where: { ...(query.where ?? {}), orgId } };
}
