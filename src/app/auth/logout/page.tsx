"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { Loader } from "lucide-react";
import axios from "axios";

function LogoutContent() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Perform logout and redirect to login page
    const performLogout = async () => {
      try {
        // Get token from localStorage
        const token = localStorage.getItem('authToken');
        
        if (token) {
          // Call Django backend logout endpoint 
          try {
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
          } catch (backendError) {
            console.error("Backend logout error:", backendError);
          }
        }
        
        // Clear local storage
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        
        // Clear the auth cookie
        document.cookie = "authToken=; path=/; max-age=0";
        
        // Redirect to login page
        router.push("/auth/login");
      } catch (error) {
        console.error("Logout error:", error);
        setError("Error during logout. Please try again.");
      }
    };

    performLogout();
  }, [router]);

  return (
    <>
      {error ? (
        <p className="text-red-500 mb-4">{error}</p>
      ) : (
        <>
          <Loader className="h-8 w-8 animate-spin mb-4" />
          <p className="text-lg">Logging out...</p>
        </>
      )}
    </>
  );
}

export default function LogoutPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <Suspense fallback={<div className="text-center"><Loader className="h-8 w-8 animate-spin mb-4" /><p>Preparing logout...</p></div>}>
        <LogoutContent />
      </Suspense>
    </div>
  );
} 