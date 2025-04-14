"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useForecastStore, useUserStore } from "@/store";
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

type ChartType = "drought" | "flood" | "all";

export default function ForecastPage() {
  const {
    weeklyForecast,
    trendsData,
    loading: forecastLoading,
    fetchForecastTrends
  } = useForecastStore();

  const [chartType, setChartType] = useState<ChartType>("drought");

  // Change the chart type and fetch new trends data
  const handleChartTypeChange = (type: ChartType) => {
    setChartType(type);
    fetchForecastTrends(type);
  };

  // Format the chart Y-axis based on chart type - make sure it returns a string
  const formatYAxisTick = (value: number | string, index: number): string => {
    const numValue = typeof value === 'string' ? Number.parseFloat(value) : value;

    switch (chartType) {
      case "drought":
        return `${numValue}%`;
      case "flood":
      case "all":
        return `${numValue}%`;
      default:
        return String(numValue);
    }
  };

  // Format tooltip values based on chart type
  const formatTooltipValue = (value: number): string => {
    switch (chartType) {
      case "drought":
        return `${value}%`;
      case "flood":
      case "all":
        return `${value}%`;
      default:
        return String(value);
    }
  };

  // Get color for the chart based on type
  const getChartColor = () => {
    switch (chartType) {
      case "drought":
        return "#FF6B6B"; // Red for temperature
      case "flood":
        return "#4ECDC4"; // Teal for humidity
      case "all":
        return "#8884d8"; // Default purple/ Blue for precipitation
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

  return (
    <div className="space-y-6">
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
            onClick={() => window.location.reload()}
          >
            <ActionIcons.Refresh className="mr-2 h-4 w-4" /> Refresh
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
          {forecastLoading || !trendsData.length ? (
            <Skeleton className="h-[400px] w-full rounded-lg" />
          ) : (
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                {chartType === "all" ? (
                  <LineChart
                    data={trendsData}
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
                    data={trendsData}
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
                      formatter={(value: number) => [formatTooltipValue(value), chartType.charAt(0).toUpperCase() + chartType.slice(1)]}
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
        </CardContent>
      </Card>

      {/* Weekly Forecast Cards */}
      <Card>
        <CardHeader>
          <CardTitle>7-Day Forecast</CardTitle>
          <CardDescription>Detailed disaster information</CardDescription>
        </CardHeader>
        <CardContent>
          {forecastLoading || !weeklyForecast ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Skeleton className="h-[350px] w-full rounded-lg" />
              <Skeleton className="h-[350px] w-full rounded-lg" />
              <Skeleton className="h-[350px] w-full rounded-lg" />
              <Skeleton className="h-[350px] w-full rounded-lg" />
              <Skeleton className="h-[350px] w-full rounded-lg" />
              <Skeleton className="h-[350px] w-full rounded-lg" />
              <Skeleton className="h-[350px] w-full rounded-lg" />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {weeklyForecast.forecasts.map((forecast) => (
                <ForecastCard
                  key={forecast.date}
                  forecast={forecast}
                  isHighlighted={forecast.date === weeklyForecast.forecasts[0].date}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Last updated info */}
      {!forecastLoading && weeklyForecast && (
        <p className="text-sm text-muted-foreground text-center">
          Last updated: {new Date(weeklyForecast.lastUpdated).toLocaleString()}
        </p>
      )}
    </div>
  );
}
