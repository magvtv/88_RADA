"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader } from "lucide-react";

interface AuthCheckProps {
  children: React.ReactNode;
}

/**
 * Client-side authentication check component
 * Redirects to login if user is not authenticated
 */
export function AuthCheck({ children }: AuthCheckProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  
  useEffect(() => {
    // Check if user is authenticated by looking for the token
    const authToken = localStorage.getItem('authToken');
    const isAuth = !!authToken;
    setIsAuthenticated(isAuth);
    
    if (!isAuth) {
      // Store the current path for redirect after login
      const returnUrl = encodeURIComponent(pathname);
      router.push(`/auth/login?from=${returnUrl}`);
    }
  }, [router, pathname]);

  // Show loading state while checking auth
  if (isAuthenticated === null) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Only render children if authenticated
  return isAuthenticated ? <>{children}</> : null;
} 