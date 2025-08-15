import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import createIntlMiddleware from 'next-intl/middleware';

const intl = createIntlMiddleware({
  locales: ['id', 'en'],
  defaultLocale: 'id',
});

const protectedRoutes = ['/dashboard', '/transactions', '/budgets', '/goals', '/coach', '/orgs'];

export default async function middleware(req: NextRequest) {
  const res = intl(req);
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const segments = req.nextUrl.pathname.split('/');
  const locale = segments[1];
  const pathWithoutLocale = '/' + segments.slice(2).join('/');

  if (protectedRoutes.some((p) => pathWithoutLocale.startsWith(p))) {
    if (!token) {
      return NextResponse.redirect(new URL(`/${locale || 'id'}/login`, req.url));
    }
    if (!token.activeOrgId && !pathWithoutLocale.startsWith('/orgs')) {
      return NextResponse.redirect(new URL(`/${locale || 'id'}/orgs`, req.url));
    }
  }

  return res;
}

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};
