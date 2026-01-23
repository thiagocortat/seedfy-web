import { createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          const cookie = request.cookies.get(name);
          console.log(`Middleware: Reading cookie ${name}:`, cookie?.value ? 'FOUND' : 'MISSING');
          return cookie?.value;
        },
        set(name: string, value: string, options: any) {
          console.log(`Middleware: Setting cookie ${name}`);
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: any) {
          console.log(`Middleware: Removing cookie ${name}`);
          request.cookies.set({
            name,
            value: '',
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  // IMPORTANT: Avoid using supabase.auth.getUser() immediately if you suspect cookie issues.
  // Instead, rely on getSession for middleware checks to be more lenient, 
  // or ensure the cookie handling above is perfect.
  // For debugging, we keep getUser() but we must ensure the response object is used if cookies were refreshed.
  
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();
  
  const user = session?.user;

  console.log('Middleware Auth Debug:', {
    path: request.nextUrl.pathname,
    hasUser: !!user,
    email: user?.email,
    error: error?.message,
    cookiesKeys: request.cookies.getAll().map(c => c.name),
    envCheck: {
      url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      key: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    }
  });

  // If accessing dashboard and not logged in, redirect to login
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (!user) {
      console.log('Middleware: Redirecting to login (no user)');
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Whitelist check
    const allowedEmails = (process.env.ADMIN_ALLOWED_EMAILS || '')
      .split(',')
      .map(email => email.trim().toLowerCase());
      
    if (user.email && !allowedEmails.includes(user.email.toLowerCase())) {
      console.log('Middleware: Redirecting to login (unauthorized email)', user.email);
      // Optional: Sign out if not allowed
      await supabase.auth.signOut();
      return NextResponse.redirect(new URL('/login?error=unauthorized', request.url));
    }
  }

  // If accessing login and already logged in, redirect to dashboard
  if (request.nextUrl.pathname === '/login' && user) {
    const allowedEmails = (process.env.ADMIN_ALLOWED_EMAILS || '')
      .split(',')
      .map(email => email.trim().toLowerCase());

    if (user.email && allowedEmails.includes(user.email.toLowerCase())) {
        console.log('Middleware: Redirecting to dashboard (already logged in)');
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ['/dashboard/:path*', '/login'],
};
