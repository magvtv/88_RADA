"use client";

import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useUserStore, useForecastStore, useAlertStore } from "@/store";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if(status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router])

  if(status === "authenticated") {
    return null;
  }

  // Initialize stores with data on client side
  const fetchWeeklyForecast = useForecastStore((state) => state.fetchWeeklyForecast);
  const fetchForecastTrends = useForecastStore((state) => state.fetchForecastTrends);
  const fetchAllAlerts = useAlertStore((state) => state.fetchAllAlerts);

  useEffect(() => {
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
  }, [fetchWeeklyForecast, fetchForecastTrends, fetchAllAlerts]);

  return (
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
  );
}
