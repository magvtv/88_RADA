"use client";

import { useState, useEffect, Suspense } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ForecastCard } from "@/components/forecast/ForecastCard";
import { WeatherDataIcons, ActionIcons } from "@/components/ui/icons";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";
import { useForecastData } from '@/hooks/useForecastData';

type ChartType = "drought" | "flood" | "all";

export default function DirectForecastPage() {
  const { weeklyForecast, loading, error, refetch } = useForecastData();
  const [chartType, setChartType] = useState<ChartType>("drought");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Handle manual refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
    } catch (error) {
      console.error("Error refreshing forecast data:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Get chart title based on type
  const getChartTitle = () => {
    switch (chartType) {
      case "drought":
        return "Drought Forecast";
      case "flood":
        return "Flood Forecast";
      case "all":
        return "Combined Forecast";
    }
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

  // Format Y-axis tick labels
  const formatYAxisTick = (value: number | string): string => {
    const numValue = typeof value === 'string' ? Number.parseFloat(value) : value;
    return `${numValue}%`;
  };

  // Change the chart type
  const handleChartTypeChange = (type: ChartType) => {
    setChartType(type);
  };

  return (
    <div className="space-y-6">
      {/* Debug Information */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p><strong>Error:</strong> {error}</p>
        </div>
      )}
      
      {/* Page Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Weekly Forecast (Direct)</h1>
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
        </div>
      </div>

      {/* Weather Chart */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>{getChartTitle()}</CardTitle>
              <CardDescription>7-day forecast visualization</CardDescription>
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
          <Suspense fallback={<Skeleton className="h-[400px] w-full rounded-lg" />}>
            {loading ? (
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
                        strokeWidth={2}
                        name="Drought"
                      />
                      <Line
                        type="monotone"
                        dataKey="flood"
                        stroke="#4ECDC4"
                        activeDot={{ r: 8 }}
                        strokeWidth={2}
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
                        strokeWidth={2}
                        name={chartType.charAt(0).toUpperCase() + chartType.slice(1)}
                      />
                      <Legend />
                    </LineChart>
                  )}
                </ResponsiveContainer>
              </div>
            )}
          </Suspense>
        </CardContent>
      </Card>

      {/* Weekly Forecast Cards */}
      <Card>
        <CardHeader>
          <CardTitle>7-Day Forecast</CardTitle>
          <CardDescription>Detailed disaster information</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(7)].map((_, i) => (
                <Skeleton key={i} className="h-[350px] w-full rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {weeklyForecast && weeklyForecast.forecasts && weeklyForecast.forecasts.map((forecast) => (
                <ForecastCard
                  key={forecast.date}
                  forecast={forecast}
                  isHighlighted={forecast.date === weeklyForecast.forecasts[0]?.date}
                />
              ))}
              
              {(!weeklyForecast || !weeklyForecast.forecasts || weeklyForecast.forecasts.length === 0) && (
                <div className="col-span-full text-center py-8">
                  <p className="text-lg text-muted-foreground">No forecast data available</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Last updated info */}
      {!loading && weeklyForecast && (
        <p className="text-sm text-muted-foreground text-center">
          Last updated: {new Date(weeklyForecast.lastUpdated).toLocaleString()}
        </p>
      )}
    </div>
  );
} 