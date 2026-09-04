import { auth } from './src/lib/auth';
import { NextResponse } from 'next/server';
import { hasAnyRole, UserRole } from '@nirmaanify/types';

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isAuthenticated = Boolean(req.auth);
  const userRole = ((req.auth?.user as any)?.role as UserRole) || 'MEMBER';

  const isPublicRoute =
    pathname === '/login' ||
    pathname === '/register' ||
    pathname === '/forgot-password' ||
    pathname === '/reset-password' ||
    pathname === '/verify-email' ||
    pathname.startsWith('/api/auth');

  // 1. Unauthenticated users accessing protected routes -> Redirect to Login
  if (!isAuthenticated && !isPublicRoute) {
    const loginUrl = new URL('/login', req.nextUrl.origin);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Authenticated users accessing login/register -> Redirect to Dashboard
  if (isAuthenticated && (pathname === '/login' || pathname === '/register')) {
    return NextResponse.redirect(new URL('/dashboard', req.nextUrl.origin));
  }

  // 3. Storage is managed per-project; redirect legacy global route to projects
  if (isAuthenticated && pathname.startsWith('/storage')) {
    return NextResponse.redirect(new URL('/projects', req.nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon\\.ico|favicon\\.svg|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
