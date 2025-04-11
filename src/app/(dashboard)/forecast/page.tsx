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
  BarChart,
  Bar,
  Legend
} from "recharts";

type ChartType = "temperature" | "humidity" | "precipitation";

export default function ForecastPage() {
  const {
    weeklyForecast,
    trendsData,
    loading: forecastLoading,
    fetchForecastTrends
  } = useForecastStore();

  const temperatureUnit = useUserStore((state) => state.preferences.temperatureUnit);

  const [chartType, setChartType] = useState<ChartType>("temperature");

  // Change the chart type and fetch new trends data
  const handleChartTypeChange = (type: ChartType) => {
    setChartType(type);
    fetchForecastTrends(type);
  };

  // Format the chart Y-axis based on chart type - make sure it returns a string
  const formatYAxisTick = (value: number | string, index: number): string => {
    const numValue = typeof value === 'string' ? Number.parseFloat(value) : value;

    switch (chartType) {
      case "temperature":
        return `${numValue}°${temperatureUnit === "celsius" ? "C" : "F"}`;
      case "humidity":
      case "precipitation":
        return `${numValue}%`;
      default:
        return String(numValue);
    }
  };

  // Format tooltip values based on chart type
  const formatTooltipValue = (value: number): string => {
    switch (chartType) {
      case "temperature":
        return `${value}°${temperatureUnit === "celsius" ? "C" : "F"}`;
      case "humidity":
      case "precipitation":
        return `${value}%`;
      default:
        return String(value);
    }
  };

  // Get color for the chart based on type
  const getChartColor = () => {
    switch (chartType) {
      case "temperature":
        return "#FF6B6B"; // Red for temperature
      case "humidity":
        return "#4ECDC4"; // Teal for humidity
      case "precipitation":
        return "#1A85FF"; // Blue for precipitation
      default:
        return "#8884d8"; // Default purple
    }
  };

  // Get chart title based on type
  const getChartTitle = () => {
    switch (chartType) {
      case "temperature":
        return "Temperature Forecast";
      case "humidity":
        return "Humidity Forecast";
      case "precipitation":
        return "Precipitation Forecast";
      default:
        return "Weather Forecast";
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Weekly Forecast</h1>
          <p className="text-muted-foreground">7-day weather predictions and trends</p>
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
            <div className="flex items-center gap-2 mt-4 sm:mt-0">
              <Button
                variant={chartType === "temperature" ? "default" : "outline"}
                size="sm"
                onClick={() => handleChartTypeChange("temperature")}
              >
                <WeatherDataIcons.Temperature className="mr-2 h-4 w-4" />
                Temperature
              </Button>
              <Button
                variant={chartType === "humidity" ? "default" : "outline"}
                size="sm"
                onClick={() => handleChartTypeChange("humidity")}
              >
                <WeatherDataIcons.Humidity className="mr-2 h-4 w-4" />
                Humidity
              </Button>
              <Button
                variant={chartType === "precipitation" ? "default" : "outline"}
                size="sm"
                onClick={() => handleChartTypeChange("precipitation")}
              >
                <WeatherDataIcons.Wind className="mr-2 h-4 w-4" />
                Precipitation
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {forecastLoading || !trendsData.length ? (
            <Skeleton className="h-[350px] w-full rounded-lg" />
          ) : (
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                {chartType === "precipitation" ? (
                  <BarChart
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
                    <Bar
                      dataKey="value"
                      fill={getChartColor()}
                      name={chartType.charAt(0).toUpperCase() + chartType.slice(1)}
                    />
                    <Legend />
                  </BarChart>
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
          <CardDescription>Detailed daily weather information</CardDescription>
        </CardHeader>
        <CardContent>
          {forecastLoading || !weeklyForecast ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <Skeleton className="h-[200px] w-full rounded-lg" />
              <Skeleton className="h-[200px] w-full rounded-lg" />
              <Skeleton className="h-[200px] w-full rounded-lg" />
              <Skeleton className="h-[200px] w-full rounded-lg" />
              <Skeleton className="h-[200px] w-full rounded-lg" />
              <Skeleton className="h-[200px] w-full rounded-lg" />
              <Skeleton className="h-[200px] w-full rounded-lg" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
