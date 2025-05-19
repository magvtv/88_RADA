"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DailyForecast } from "@/types/forecast";
// import { useUserStore } from "@/store";
import { getWeatherIcon } from "@/components/ui/icons";
import { useEffect } from "react";

interface ForecastCardProps {
  forecast: DailyForecast;
  isHighlighted?: boolean;
}

export function ForecastCard({ forecast, isHighlighted = false }: ForecastCardProps) {
  useEffect(() => {
    console.log("ForecastCard mounted with data:", JSON.stringify(forecast, null, 2));
  }, [forecast]);

  // Validate forecast data to prevent rendering errors
  if (!forecast) {
    console.error("ForecastCard received null or undefined forecast");
    return (
      <Card className="h-full transition-all bg-gray-100">
        <CardHeader className="pb-2">
          <CardTitle className="text-base sm:text-lg">No Data Available</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Unable to load forecast data</p>
        </CardContent>
      </Card>
    );
  }

  // Check if weatherData is valid
  if (!forecast.weatherData) {
    console.error("ForecastCard: weatherData is missing", forecast);
    return (
      <Card className="h-full transition-all bg-gray-100">
        <CardHeader className="pb-2">
          <CardTitle className="text-base sm:text-lg">{forecast.day || "Unknown"}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Weather data unavailable</p>
        </CardContent>
      </Card>
    );
  }

  // Safely extract weather data
  const droughtProb = forecast.weatherData.drought_probability || 0;
  const floodProb = forecast.weatherData.flood_probability || 0;
  
  // Average disaster probability of both drought and floods
  const displayDisasterProbability = (droughtProb + floodProb) / 2;
  console.log("Rendering ForecastCard for:", forecast.day, droughtProb, floodProb);

  // Format date
  let formattedDate = "Unknown date";
  try {
    const date = new Date(forecast.date);
    formattedDate = date.toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  } catch (err) {
    console.error("Error formatting date:", forecast.date, err);
  }
  
  // Get weather icon based on condition
  const WeatherIcon = getWeatherIcon(forecast.weatherData.condition ?? "");

  return (
    <Card
      className={`h-full transition-all ${
        isHighlighted
          ? "ring-2 ring-primary shadow-md"
          : "hover:shadow-md"
      }`}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-base sm:text-lg flex justify-between items-center">
          <span>{forecast.day || "Unknown"}</span>
          <WeatherIcon className="h-6 w-6 text-primary" />
        </CardTitle>
        <span className="text-sm text-muted-foreground">{formattedDate}</span>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2">
          {/* Average Disaster Probability */}
          <div>
            <p className="text-2xl font-bold">
              {Math.round(droughtProb)}%
            </p>
            <p className="text-sm text-muted-foreground">{forecast.weatherData.condition || "Unknown"}</p>
          </div>

          {/* Disaster Probabilities details */}
          <div className="text-sm flex flex-col items-end justify-center">
            <p>
              Flood: {Math.round(floodProb)}%
            </p>
            {displayDisasterProbability > 25 && (
              <p>Combined: {Math.round(displayDisasterProbability)}%</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
