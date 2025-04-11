"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useForecastStore, useAlertStore } from "@/store";
import { ForecastCard } from "@/components/forecast/ForecastCard";
import { AlertItem } from "@/components/alerts/AlertItem";
import { WeatherDataIcons, NavIcons, ActionIcons } from "@/components/ui/icons";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function DashboardPage() {
  const {
    weeklyForecast,
    todayForecast,
    trendsData,
    loading: forecastLoading,
    fetchTodayForecast
  } = useForecastStore();

  const {
    alerts,
    unreadCount,
    loading: alertsLoading,
  } = useAlertStore();

  useEffect(() => {
    // Fetch today's forecast specifically
    fetchTodayForecast();
  }, [fetchTodayForecast]);

  // Format date for header
  const currentDate = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">{currentDate}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="hidden md:flex"
            onClick={() => window.location.reload()}
          >
            <ActionIcons.Refresh className="mr-2 h-4 w-4" /> Refresh
          </Button>
          <Button asChild variant="default" size="sm">
            <Link href="/forecast">
              <NavIcons.Forecast className="mr-2 h-4 w-4" /> View Forecast
            </Link>
          </Button>
        </div>
      </div>

      {/* Today's Forecast Card */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Today's Forecast</CardTitle>
            <CardDescription>Current conditions and outlook</CardDescription>
          </CardHeader>
          <CardContent>
            {forecastLoading || !todayForecast ? (
              <div className="space-y-3">
                <Skeleton className="h-[125px] w-full rounded-lg" />
              </div>
            ) : (
              <div className="flex flex-col space-y-3">
                <ForecastCard forecast={todayForecast} isHighlighted />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Alerts Card */}
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle>Recent Alerts</CardTitle>
              <CardDescription>
                {unreadCount
                  ? `You have ${unreadCount} unread alert${unreadCount > 1 ? "s" : ""}`
                  : "No new alerts"}
              </CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link href="/alerts">
                <span>View All</span>
                <ActionIcons.Next className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {alertsLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-[80px] w-full rounded-lg" />
                <Skeleton className="h-[80px] w-full rounded-lg" />
              </div>
            ) : alerts.length > 0 ? (
              <div className="space-y-3">
                {alerts.slice(0, 2).map((alert) => (
                  <AlertItem key={alert.id} alert={alert} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No alerts at this time.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Temperature Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Temperature Trend</CardTitle>
          <CardDescription>7-day temperature forecast</CardDescription>
        </CardHeader>
        <CardContent>
          {forecastLoading || !trendsData.length ? (
            <Skeleton className="h-[350px] w-full rounded-lg" />
          ) : (
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={trendsData}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(date) => new Date(date).toLocaleDateString(undefined, { weekday: 'short' })}
                  />
                  <YAxis />
                  <Tooltip
                    formatter={(value) => [`${value}°C`, "Temperature"]}
                    labelFormatter={(date) => new Date(date).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#8884d8"
                    activeDot={{ r: 8 }}
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Weekly Forecast Preview */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle>Weekly Forecast</CardTitle>
            <CardDescription>Next 7 days outlook</CardDescription>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link href="/forecast">
              <span>Full Forecast</span>
              <ActionIcons.Next className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {forecastLoading || !weeklyForecast ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {/* Use individual skeletons instead of mapping */}
              <Skeleton className="h-[150px] w-full rounded-lg" />
              <Skeleton className="h-[150px] w-full rounded-lg" />
              <Skeleton className="h-[150px] w-full rounded-lg" />
              <Skeleton className="h-[150px] w-full rounded-lg" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {weeklyForecast.forecasts.slice(0, 4).map((forecast) => (
                <ForecastCard key={forecast.date} forecast={forecast} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
