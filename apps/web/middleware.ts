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

  // 3. RBAC Route Checks
  if (isAuthenticated && pathname.startsWith('/storage')) {
    const isAllowed = hasAnyRole(userRole, ['OWNER', 'ADMIN', 'DEVELOPER', 'EDITOR', 'MEMBER', 'VIEWER']);
    if (!isAllowed) {
      const unauthorizedUrl = new URL('/dashboard', req.nextUrl.origin);
      unauthorizedUrl.searchParams.set('denied', 'storage');
      return NextResponse.redirect(unauthorizedUrl);
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon\\.ico|favicon\\.svg|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
