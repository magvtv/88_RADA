"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { Loader } from "lucide-react";
import { FaGoogle } from "react-icons/fa";
import axios from "axios";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLoading) return; // Prevent duplicate submissions
    
    setIsLoading(true);

    try {
      // First try direct login with Django backend for debugging
      try {
        console.log("Attempting direct backend login first...");
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
        
        console.log("Direct backend login response:", response.data);
        // If we get here, the credentials are valid with the backend
      } catch (backendError) {
        console.error("Direct backend login failed:", backendError);
      }
      
      // Now try NextAuth login
      console.log("Attempting NextAuth login...");
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      console.log("NextAuth login result:", result);

      if (result?.error) {
        toast.error("Invalid credentials");
        console.error("NextAuth error:", result.error);
      } else {
        toast.success("Logged in successfully!");
        router.push("/")
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    setIsLoading(true);
    signIn("google", { callbackUrl: searchParams.get("callbackUrl") || "/" });
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
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

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>

        <Button
          variant="outline"
          type="button"
          className="w-full"
          onClick={handleGoogleSignIn}
          disabled={isLoading}
        >
          <FaGoogle className="mr-2 h-4 w-4" />
          Google
        </Button>

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
    </div>
  );
}