import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Middleware function to handle auth checks
export function middleware(request: NextRequest) {
  // Don't redirect on API routes
  if (request.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  const isAuthPage = request.nextUrl.pathname.startsWith("/auth/");
  const isDashboardRoute = 
    request.nextUrl.pathname === "/" || 
    request.nextUrl.pathname.startsWith("/chat") ||
    request.nextUrl.pathname.startsWith("/alerts") ||
    request.nextUrl.pathname.startsWith("/forecast") ||
    request.nextUrl.pathname.startsWith("/settings");

  // Note: Since localStorage is not accessible in middleware (client-side only),
  // we need to use cookies to check authentication status
  const authToken = request.cookies.get("authToken")?.value;
  const isAuthenticated = !!authToken;

  // If accessing auth pages while already authenticated, redirect to home
  if (isAuthPage && isAuthenticated) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // If accessing protected routes while not authenticated, redirect to login
  if (isDashboardRoute && !isAuthenticated) {
    return NextResponse.redirect(
      new URL(`/auth/login?callbackUrl=${encodeURIComponent(request.nextUrl.pathname)}`, request.url)
    );
  }

  return NextResponse.next();
}

// Match both auth pages and protected routes
export const config = {
  matcher: [
    "/auth/:path*",
    "/",
    "/chat/:path*",
    "/alerts/:path*", 
    "/forecast/:path*",
    "/settings/:path*"
  ]
};