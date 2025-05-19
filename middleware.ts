import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// Simplified middleware that only handles auth page redirections
export default withAuth(
  function middleware(req) {
    const isAuth = !!req.nextauth.token;
    const isAuthPage = req.nextUrl.pathname.startsWith("/auth/");

    // Don't redirect on API routes
    if (req.nextUrl.pathname.startsWith("/api/")) {
      return null;
    }

    // Only redirect on auth pages if the user is already authenticated
    if (isAuthPage && isAuth) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    return null;
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        // Allow all requests through the middleware
        // Authentication will be handled at the page level
        return true;
      },
    },
  }
);

// Only match auth pages - no longer protecting other routes
export const config = {
  matcher: ["/auth/:path*"]
};