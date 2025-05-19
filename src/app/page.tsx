"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAlertStore } from "@/store";
import { ForecastCard } from "@/components/forecast/ForecastCard";
import { AlertItem } from "@/components/alerts/AlertItem";
import { WeatherDataIcons, NavIcons, ActionIcons } from "@/components/ui/icons";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Legend, Tooltip, ResponsiveContainer } from "recharts";
import { AppLayout } from "@/components/layout/AppLayout";
import { useForecastData } from '@/hooks/useForecastData';

type ChartType = "drought" | "flood" | "all";

export default function DashboardPage() {
  const { weeklyForecast, todayForecast, loading: forecastLoading, error: forecastError, refetch } = useForecastData();
  
  const {
    alerts,
    unreadCount,
    loading: alertsLoading,
    fetchUnreadAlerts,
  } = useAlertStore();

  useEffect(() => {
    // Fetch alerts data
    fetchUnreadAlerts();
  }, [fetchUnreadAlerts]);

  // Format date for header
  const currentDate = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const [chartType, setChartType] = useState<ChartType>("drought");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Format the chart Y-axis based on chart type
  const formatYAxisTick = (value: number | string): string => {
    const numValue = typeof value === 'string' ? Number.parseFloat(value) : value;
    return `${numValue}%`;
  };

  // Get color for the chart based on type
  const getChartColor = () => {
    switch (chartType) {
      case "drought":
        return "#FF6B6B"; // Red for drought
      case "flood":
        return "#4ECDC4"; // Teal for flood
      case "all":
        return "#8884d8"; // Default purple
    }
  };

  // Change the chart type
  const handleChartTypeChange = (type: ChartType) => {
    setChartType(type);
  };

  // Create chart data from forecast data
  const getTrendsData = () => {
    if (!weeklyForecast || !weeklyForecast.forecasts) return [];
    
    if (chartType === "all") {
      return weeklyForecast.forecasts.map(item => ({
        date: item.date,
        drought: item.weatherData.drought_probability,
        flood: item.weatherData.flood_probability
      }));
    } else {
      return weeklyForecast.forecasts.map(item => ({
        date: item.date,
        value: chartType === "drought" 
          ? item.weatherData.drought_probability 
          : item.weatherData.flood_probability,
        type: chartType
      }));
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      await fetchUnreadAlerts();
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6 my-4">
        {/* Dashboard Header */}
        <div className="flex flex-col px-4 mt-4 gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl ml-4 font-bold tracking-tight">Dashboard</h1>
            <p className="ml-4 text-muted-foreground">{currentDate}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="hidden md:flex"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              {isRefreshing ? (
                <>
                  <ActionIcons.Loader className="mr-2 h-4 w-4 animate-spin" />
                  Refreshing...
                </>
              ) : (
                <>
                  <ActionIcons.Refresh className="mr-2 h-4 w-4" />
                  Refresh
                </>
              )}
            </Button>
            <Button asChild variant="default" size="sm">
              <Link href="/forecast">
                <NavIcons.Forecast className="mr-2 h-4 w-4" /> View Forecast
              </Link>
            </Button>
          </div>
        </div>
  
        {/* Today's Forecast Card */}
        <div className="grid md:mx-6 sm:mx-2 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Today's Baringo Disaster Forecast</CardTitle>
              <CardDescription>Current disaster conditions and outlook</CardDescription>
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
  
        {/* Disaster Trend Chart */}
        <div className="md:mx-6 sm:mx-2">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle>Disaster Trend</CardTitle>
                  <CardDescription>7-day disaster forecast</CardDescription>
                </div>
                <div className="flex items-center gap-1 mt-4 sm:mt-0">
                  <Button
                    variant={chartType === "drought" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleChartTypeChange("drought")}
                  >
                    <WeatherDataIcons.Temperature className="mr-2 h-4 w-4" />
                    Drought
                  </Button>
                  <Button
                    variant={chartType === "flood" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleChartTypeChange("flood")}
                  >
                    <WeatherDataIcons.Humidity className="mr-2 h-4 w-4" />
                    Flood
                  </Button>
                  <Button
                    variant={chartType === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleChartTypeChange("all")}
                  >
                    <WeatherDataIcons.Chart className="mr-2 h-4 w-4" />
                    All
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {forecastLoading || !weeklyForecast || !weeklyForecast.forecasts ? (
                <Skeleton className="h-[400px] w-full rounded-lg" />
              ) : (
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                  {chartType === "all" ? (
                  <LineChart
                    data={getTrendsData()}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 40,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(date) => new Date(date).toLocaleDateString(undefined, { weekday: 'short' })}
                    />
                    <YAxis
                      tickFormatter={(value) => `${value}%`}
                    />
                    <Tooltip
                      formatter={(value: number, name: string) => [`${value}%`, name === 'drought' ? 'Drought' : 'Flood']}
                      labelFormatter={(date) => new Date(date).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                    />
                    <Line
                      type="monotone"
                      dataKey="drought"
                      stroke="#FF6B6B"
                      activeDot={{ r: 8 }}
                      strokeWidth={1}
                      name="Drought"
                    />
                    <Line
                      type="monotone"
                      dataKey="flood"
                      stroke="#4ECDC4"
                      activeDot={{ r: 8 }}
                      strokeWidth={1}
                      name="Flood"
                    />
                    <Legend />
                  </LineChart>
                ) : (
                  <LineChart
                    data={getTrendsData()}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 40,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(date) => new Date(date).toLocaleDateString(undefined, { weekday: 'short' })}
                    />
                    <YAxis
                      tickFormatter={formatYAxisTick}
                    />
                    <Tooltip
                      formatter={(value: number) => [`${value}%`, chartType.charAt(0).toUpperCase() + chartType.slice(1)]}
                      labelFormatter={(date) => new Date(date).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                    />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke={getChartColor()}
                      activeDot={{ r: 8 }}
                      strokeWidth={1}
                      name={chartType.charAt(0).toUpperCase() + chartType.slice(1)}
                    />
                    <Legend />
                  </LineChart>
                )}
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
  
        {/* Weekly Forecast Preview */}
        <div className="md:mx-6 sm:mx-2">
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
      </div>
    </AppLayout>
  );
}
