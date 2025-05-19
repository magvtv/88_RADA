"use client";

import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { Loader } from "lucide-react";

interface AuthCheckProps {
  children: React.ReactNode;
}

/**
 * Client-side authentication check component
 * Redirects to login if user is not authenticated
 */
export function AuthCheck({ children }: AuthCheckProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  
  useEffect(() => {
    if (status === "unauthenticated") {
      // Store the current path for redirect after login
      const returnUrl = encodeURIComponent(pathname);
      router.push(`/auth/login?from=${returnUrl}`);
    }
  }, [status, router, pathname]);

  // Show loading state while checking auth
  if (status === "loading") {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Only render children if authenticated
  return status === "authenticated" ? <>{children}</> : null;
} 