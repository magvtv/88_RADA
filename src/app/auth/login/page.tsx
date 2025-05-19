"use client";

import { useState, Suspense, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader } from "lucide-react";
import axios from "axios";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://www.radaprojo.live';
  console.log("Using API base URL:", apiBaseUrl);

  useEffect(() => {
    const checkApiStatus = async () => {
      try {
        const response = await axios.get(
          `${apiBaseUrl}/auth/login/`
        );
        console.log("API response:", response.data);
      } catch (error) {
        console.error("API error:", error);
      }
    };
    
    checkApiStatus();
  }, [apiBaseUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLoading) return; // Prevent duplicate submissions
    
    setIsLoading(true);

    try {
      // Login directly with Django backend
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/login/`,
        {
          email: formData.email,
          password: formData.password,
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
        
      console.log("Login successful:", response.data);
      
      // Store token in localStorage for use in authenticated requests
      if (response.data.key) {
        localStorage.setItem('authToken', response.data.key);
        
        // Store user information
        const userEmail = formData.email; // Use the email from login form
        const userData = {
          email: userEmail,
          // Use other user data if it's in the response
          ...(response.data.user || {})
        };
        
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Set the token in a cookie as well for middleware auth checks
        document.cookie = `authToken=${response.data.key}; path=/; max-age=${60 * 60 * 24 * 30}`; // 30 days
      }
      
      toast.success("Logged in successfully!");
      router.push(searchParams.get("callbackUrl") || "/");
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Invalid credentials or server error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <div className="w-full max-w-sm space-y-8">
      <div className="flex flex-col items-center space-y-2">
        <Image
          src="/logo.png"
          alt="RADA Logo"
          width={48}
          height={48}
          className="h-12 w-12"
        />
        <h1 className="text-2xl font-bold tracking-tight">Welcome Back</h1>
        <p className="text-sm text-muted-foreground">
          Sign in to your account to continue
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="m@example.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
            disabled={isLoading}
          />
        </div>

        <Button className="w-full" type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader className="mr-2 h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            "Sign In"
          )}
        </Button>
      </form>



      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link
          href="/auth/signup"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          Sign Up
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <Suspense fallback={<div className="text-center p-4">Loading login form...</div>}>
        <LoginContent />
      </Suspense>
    </div>
  );
}