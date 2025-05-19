import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const isAuth = !!req.nextauth.token;
    const isAuthPage = req.nextUrl.pathname.startsWith("/auth/");

    // Don't redirect on API routes to avoid disrupting data fetching
    if (req.nextUrl.pathname.startsWith("/api/")) {
      return null;
    }

    if (isAuthPage) {
      if (isAuth) {
        return NextResponse.redirect(new URL("/", req.url));
      }
      return null;
    }

    if (!isAuth) {
      let from = req.nextUrl.pathname;
      if (req.nextUrl.search) {
        from += req.nextUrl.search;
      }

      return NextResponse.redirect(
        new URL(`/auth/login?from=${encodeURIComponent(from)}`, req.url)
      );
    }
  },
  {
    callbacks: {
      // Only authorize if token exists and contains required fields
      authorized: ({ token }) => {
        return !!token && typeof token === 'object';
      },
    },
  }
);

// Protect these routes with authentication
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/settings/:path*",
    "/forecast/:path*",
    "/alerts/:path*",
  ],
};