"use client";

import { Suspense } from 'react'
import axios from 'axios';
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Loader } from "lucide-react";

function SignUpContent() {
  const [queryParams, setQueryParams] = useState<Record<string, string>>({});
  const searchParams = useSearchParams();
  const router = useRouter();
  const callbackUrl = searchParams.get("from") || "/";
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      setIsLoading(false);
      return;
    }

    // Hardcode the API base URL as fallback
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://www.radaprojo.live';
    console.log("Using API base URL:", apiBaseUrl);

    try {
      const response = await axios.post(
        `${apiBaseUrl}/auth/registration/`, 
        {
          email: formData.email,
          password1: formData.password,
          password2: formData.confirmPassword
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.status === 200 || response.status === 201) {
        toast.success("Account created successfully!");
        
        // Auto-login the user if response contains token
        if (response.data.key) {
          localStorage.setItem('authToken', response.data.key);
          
          // Store user information explicitly with the provided email
          const userData = {
            email: formData.email,
            // Include any additional user data from response
            ...(response.data.user || {})
          };
          localStorage.setItem('user', JSON.stringify(userData));
          
          // Set the token in a cookie as well for middleware auth checks
          document.cookie = `authToken=${response.data.key}; path=/; max-age=${60 * 60 * 24 * 30}`; // 30 days
          
          router.push("/");
        } else {
          // Otherwise redirect to login
          router.push("/auth/login");
        }
      }
    } catch (error) {
      if(axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Failed to create account" ) 
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Extract the params you need
    const callbackUrl = searchParams.get('callbackUrl') || '';
    // Set them in state
    setQueryParams({ callbackUrl });
  }, [searchParams]);

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
        <h1 className="text-2xl font-bold tracking-tight">Create an Account</h1>
        <p className="text-sm text-muted-foreground">
          Enter your details below to create your account
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
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            id="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            required
          />
        </div>

        <Button className="w-full" type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader className="mr-2 h-4 w-4 animate-spin" />
              Creating account...
            </>
          ) : (
            "Sign Up"
          )}
        </Button>
      </form>



      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/auth/login"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          Sign In
        </Link>
      </p>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <Suspense fallback={<div className="text-center p-4">Loading signup form...</div>}>
        <SignUpContent />
      </Suspense>
    </div>
  );
}