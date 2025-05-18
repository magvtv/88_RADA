"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function AuthError() {
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const errorType = searchParams.get("error");
    
    // Handle different error types
    switch (errorType) {
      case "Callback":
        setError("There was a problem with the Google authentication callback.");
        break;
      case "AccessDenied":
        setError("Access was denied to your account.");
        break;
      case "Configuration":
        setError("There is a problem with the authentication configuration.");
        break;
      default:
        setError("An unknown authentication error occurred.");
        break;
    }
  }, [searchParams]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Authentication Error</h1>
        <p className="text-gray-700 mb-6">{error}</p>
        <div className="flex gap-4">
          <Link 
            href="/auth/login"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Try Again
          </Link>
          <Link 
            href="/"
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
} 