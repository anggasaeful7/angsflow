import 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      activeOrgId?: string | null;
    };
  }
  interface User {
    id: string;
    activeOrgId?: string | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    activeOrgId?: string | null;
  }
}
