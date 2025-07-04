import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getNewAccessToken, getSession } from './lib/auth.utils';

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const publicPaths = ['/login', '/', '/signup'];
  const isPublicPath = publicPaths.includes(path);

  if (isPublicPath) {
    return NextResponse.next();
  }
  const session = await getSession();

  if (!session) {
    await getNewAccessToken();

    return NextResponse.redirect(new URL('/login', request.nextUrl));
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|images|favicon.ico).*)'],
};
