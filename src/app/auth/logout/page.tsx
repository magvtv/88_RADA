"use client";

import { useEffect, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader } from "lucide-react";
import axios from "axios";

export default function LogoutPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Perform logout and redirect to login page
    const performLogout = async () => {
      try {
        // 1. Call Django backend logout endpoint first
        try {
          // Get the access token from the NextAuth session
          const token = (session as any)?.accessToken;
          
          // Only call backend if we have a token
          if (token) {
            await axios.post(
              `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/logout/`,
              {},
              {
                headers: {
                  'Authorization': `Token ${token}`,
                  'Content-Type': 'application/json',
                }
              }
            );
            console.log("Backend logout successful");
          }
        } catch (backendError) {
          console.error("Backend logout error:", backendError);
          // Continue with frontend logout even if backend logout fails
        }

        // 2. Clear client-side session with NextAuth
        await signOut({ redirect: false });
        
        // 3. Redirect to login page
        router.push("/auth/login");
      } catch (error) {
        console.error("Logout error:", error);
        setError("Error during logout. Please try again.");
      }
    };

    performLogout();
  }, [router, session]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      {error ? (
        <p className="text-red-500 mb-4">{error}</p>
      ) : (
        <>
          <Loader className="h-8 w-8 animate-spin mb-4" />
          <p className="text-lg">Logging out...</p>
        </>
      )}
    </div>
  );
} 