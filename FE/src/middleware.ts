import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { AUTH_ROLE_COOKIE } from '@/lib/auth-cookies';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const role = request.cookies.get(AUTH_ROLE_COOKIE)?.value;

  const redirectLogin = (url: string) => {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', url);
    return NextResponse.redirect(loginUrl);
  };

  if (pathname.startsWith('/recruiter')) {
    if (!role) return redirectLogin(pathname);
    if (role !== 'RECRUITER') return NextResponse.redirect(new URL('/candidate/dashboard', request.url));
  }

  if (pathname.startsWith('/candidate')) {
    if (!role) return redirectLogin(pathname);
    if (role !== 'CANDIDATE') return NextResponse.redirect(new URL('/recruiter/dashboard', request.url));
  }

  if (pathname.startsWith('/admin')) {
    if (!role) return redirectLogin(pathname);
    if (role !== 'ADMIN') return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/recruiter/:path*', '/candidate/:path*', '/admin/:path*'],
};
