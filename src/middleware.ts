import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySessionToken, SESSION_COOKIE_NAME } from '@/lib/session-token';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Archivos estáticos y Next internals se omiten
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // 2. Cookie criptográfica de sesión firmada
  const sessionToken = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const verified = await verifySessionToken(sessionToken);
  const isExplicitlyLoggedOut = request.cookies.get('finanzapp_logged_out')?.value === 'true';

  // 3. Rutas de autenticación pública (login y APIs de usuarios)
  const isLoginPage = pathname === '/login';
  const isAuthApi = pathname.startsWith('/api/usuarios');

  // Si el usuario cerró sesión explícitamente y trata de acceder sin autenticarse
  if (isExplicitlyLoggedOut && !verified && !isLoginPage && !isAuthApi) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'Sesión finalizada. Inicia sesión con tu PIN.' },
        { status: 401 }
      );
    }
    const loginUrl = new URL('/login', request.url);
    if (pathname !== '/') {
      loginUrl.searchParams.set('from', pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  // Si YA tiene sesión válida e intenta entrar a /login
  if (verified && isLoginPage) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
