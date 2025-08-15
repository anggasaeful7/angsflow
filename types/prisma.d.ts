declare module '@prisma/client' {
  export const OrgRole: {
    OWNER: 'OWNER';
    ADMIN: 'ADMIN';
    MEMBER: 'MEMBER';
  };
  export type OrgRole = (typeof OrgRole)[keyof typeof OrgRole];
  export class PrismaClient {
    constructor(...args: unknown[]);
    [key: string]: unknown;
  }
}
