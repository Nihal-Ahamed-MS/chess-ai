// proxy.ts
import { NextRequest, NextResponse } from 'next/server';
import { decrypt } from '@/app/lib/session';
import { cookies } from 'next/headers';

const protectedRoutes = ['/dashboard'];
const publicRoutes = ['/login', '/signup', '/'];

export default async function proxy(req: NextRequest) {
    //   const path = req.nextUrl.pathname
    //   const isProtectedRoute = protectedRoutes.includes(path)
    //   const isPublicRoute = publicRoutes.includes(path)

    //   // Read session from cookie (fast, no DB call)
    //   const cookie = (await cookies()).get('session')?.value
    //   const session = await decrypt(cookie)

    //   // Redirect unauthenticated users away from protected routes
    //   if (isProtectedRoute && !session?.userId) {
    //     return NextResponse.redirect(new URL('/login', req.nextUrl))
    //   }

    //   // Redirect authenticated users away from public routes
    //   if (isPublicRoute && session?.userId) {
    //     return NextResponse.redirect(new URL('/dashboard', req.nextUrl))
    //   }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};
