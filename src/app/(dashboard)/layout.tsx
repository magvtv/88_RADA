"use client";

import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { AuthCheck } from "@/components/auth/auth-check";
import { useUserStore, useForecastStore, useAlertStore } from "@/store";
import { Loader } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { status } = useSession();

  // Initialize stores with data on client side
  const fetchWeeklyForecast = useForecastStore((state) => state.fetchWeeklyForecast);
  const fetchForecastTrends = useForecastStore((state) => state.fetchForecastTrends);
  const fetchAllAlerts = useAlertStore((state) => state.fetchAllAlerts);

  useEffect(() => {
    // Only fetch data when authenticated
    if (status === "authenticated") {
      // Initialize hydration for user preferences
      const unsubscribeUser = useUserStore.persist.onFinishHydration(() => {
        console.log("User preferences hydrated");
      });

      // Fetch initial data
      fetchWeeklyForecast();
      fetchForecastTrends();
      fetchAllAlerts();

      return () => {
        unsubscribeUser();
      };
    }
  }, [status, fetchWeeklyForecast, fetchForecastTrends, fetchAllAlerts]);

  // Show loading state while checking auth
  if (status === "loading") {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <AuthCheck>
      <div className="flex min-h-screen flex-col">
        <Header />
        <div className="flex flex-1">
          {/* Sidebar (hidden on mobile) */}
          <aside className="hidden md:flex w-64 shrink-0 border-r bg-background">
            <Sidebar />
          </aside>

          {/* Main content */}
          <main className="flex-1 overflow-y-auto">
            <div className="container py-6">{children}</div>
          </main>
        </div>
      </div>
    </AuthCheck>
  );
}
