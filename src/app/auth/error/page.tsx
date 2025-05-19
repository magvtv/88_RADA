"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function ErrorContent() {
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const errorType = searchParams.get("error");
    
    // Handle different error types
    switch (errorType) {
      case "InvalidCredentials":
        setError("Invalid email or password. Please try again.");
        break;
      case "AccessDenied":
        setError("Access was denied to your account.");
        break;
      case "ServerError":
        setError("There was a server error. Please try again later.");
        break;
      default:
        setError("An authentication error occurred. Please try again.");
        break;
    }
  }, [searchParams]);

  return (
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
  );
}

export default function AuthError() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-4">
      <Suspense fallback={<div className="text-center">Loading error details...</div>}>
        <ErrorContent />
      </Suspense>
    </div>
  );
} 