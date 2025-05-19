"use client";

import { useState, useEffect, Suspense, lazy } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ActionIcons } from "@/components/ui/icons";
import { useForecastData } from '@/hooks/useForecastData';
import { ForecastCardList } from '@/components/forecast/ForecastCardList';
import type { ChartType } from '@/components/forecast/ForecastChart';

// Lazy load the chart component to reduce initial bundle size
const ForecastChart = lazy(() => import('@/components/forecast/ForecastChart').then(mod => ({
  default: mod.ForecastChart
})));

export default function ForecastPage() {
  const { weeklyForecast, loading, isBackgroundLoading, error, refetch } = useForecastData({ prefetch: true });
  const [chartType, setChartType] = useState<ChartType>("drought");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Handle manual refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch(false); // Force full loading state
    } catch (error) {
      console.error("Error refreshing forecast data:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Change the chart type
  const handleChartTypeChange = (type: ChartType) => {
    setChartType(type);
  };

  return (
    <div className="space-y-6">
      {/* Error Information */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p><strong>Error:</strong> {error}</p>
        </div>
      )}
      
      {/* Page Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Weekly Forecast</h1>
          <p className="text-muted-foreground">7-day disaster predictions and trends</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="hidden md:flex"
            onClick={handleRefresh}
            disabled={loading || isRefreshing}
          >
            {isRefreshing || isBackgroundLoading ? (
              <>
                <ActionIcons.Loader className="mr-2 h-4 w-4 animate-spin" />
                {isRefreshing ? "Refreshing..." : "Loading..."}
              </>
            ) : (
              <>
                <ActionIcons.Refresh className="mr-2 h-4 w-4" />
                Refresh
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Weather Chart - Wrapped in Suspense to handle code splitting */}
      <Suspense fallback={<Card><CardContent className="p-6"><Skeleton className="h-[400px] w-full rounded-lg" /></CardContent></Card>}>
        <ForecastChart 
          weeklyForecast={weeklyForecast} 
          loading={loading && !weeklyForecast} // Only show loading if no data available
          chartType={chartType}
          onChartTypeChange={handleChartTypeChange}
        />
      </Suspense>

      {/* Weekly Forecast Cards - In a separate Suspense boundary */}
      <Suspense fallback={
        <div>
          <h2 className="text-xl font-semibold mb-4">Daily Forecasts</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 7 }).map((_, i) => (
              <Skeleton key={i} className="h-[180px] rounded-lg" />
            ))}
          </div>
        </div>
      }>
        <ForecastCardList 
          weeklyForecast={weeklyForecast}
          loading={loading && !weeklyForecast} // Only show loading if no data available
          highlightToday={true}
        />
      </Suspense>
    </div>
  );
} 