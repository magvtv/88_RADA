"use client";

import { useMemo } from 'react';
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
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { WeatherDataIcons } from "@/components/ui/icons";
import type { WeeklyForecast } from "@/types/forecast";

export type ChartType = "drought" | "flood" | "all";

interface ForecastChartProps {
  weeklyForecast: WeeklyForecast | null;
  loading: boolean;
  chartType: ChartType;
  onChartTypeChange: (type: ChartType) => void;
  title?: string;
  showDescription?: boolean;
}

export function ForecastChart({ 
  weeklyForecast, 
  loading, 
  chartType,
  onChartTypeChange,
  title,
  showDescription = true
}: ForecastChartProps) {
  // Memoize the trends data to avoid recalculation on every render
  const trendsData = useMemo(() => {
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
  }, [weeklyForecast, chartType]);

  // Get chart title based on type
  const getChartTitle = () => {
    if (title) return title;
    
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

  // Format Y-axis tick labels
  const formatYAxisTick = (value: number | string): string => {
    const numValue = typeof value === 'string' ? Number.parseFloat(value) : value;
    return `${numValue}%`;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>{getChartTitle()}</CardTitle>
            {showDescription && (
              <CardDescription>7-day forecast visualization</CardDescription>
            )}
          </div>
          <div className="flex items-center gap-1 mt-4 sm:mt-0">
            <Button
              variant={chartType === "drought" ? "default" : "outline"}
              size="sm"
              onClick={() => onChartTypeChange("drought")}
            >
              <WeatherDataIcons.Temperature className="mr-2 h-4 w-4" />
              Drought
            </Button>
            <Button
              variant={chartType === "flood" ? "default" : "outline"}
              size="sm"
              onClick={() => onChartTypeChange("flood")}
            >
              <WeatherDataIcons.Humidity className="mr-2 h-4 w-4" />
              Flood
            </Button>
            <Button
              variant={chartType === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => onChartTypeChange("all")}
            >
              <WeatherDataIcons.Chart className="mr-2 h-4 w-4" />
              All
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
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
                    strokeWidth={3}
                    name="Drought"
                  />
                  <Line
                    type="monotone"
                    dataKey="flood"
                    stroke="#4ECDC4"
                    activeDot={{ r: 8 }}
                    strokeWidth={3}
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
                    formatter={(value: number) => [`${value}%`, chartType.charAt(0).toUpperCase() + chartType.slice(1)]}
                    labelFormatter={(date) => new Date(date).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke={getChartColor()}
                    activeDot={{ r: 8 }}
                    strokeWidth={3}
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
  );
}

// Add default export for dynamic import compatibility
export default ForecastChart; 