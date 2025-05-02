"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DailyForecast } from "@/types/forecast";
// import { useUserStore } from "@/store";
import { getWeatherIcon } from "@/components/ui/icons";

interface ForecastCardProps {
  forecast: DailyForecast;
  isHighlighted?: boolean;
}

export function ForecastCard({ forecast, isHighlighted = false }: ForecastCardProps) {
  // Average disaster probability of both drought and floods
  const displayDisasterProbability = (forecast.weatherData.drought_probability + forecast.weatherData.flood_probability ) / 2;

  // Format date
  const date = new Date(forecast.date);
  const formattedDate = date.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  // Get weather icon based on condition
  const WeatherIcon = getWeatherIcon(forecast.weatherData.condition);

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
          <span>{forecast.day}</span>
          <WeatherIcon className="h-6 w-6 text-primary" />
        </CardTitle>
        <span className="text-sm text-muted-foreground">{formattedDate}</span>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2">
          {/* Average Disaster Probability */}
          <div>
            <p className="text-2xl font-bold">
              {Math.round(forecast.weatherData.drought_probability)}%
            </p>
            <p className="text-sm text-muted-foreground">{forecast.weatherData.condition}</p>
          </div>

          {/* Disaster Probabilities details */}
          <div className="text-sm flex  flex-col items-end justify-center">
            <p>
              Flood: {Math.round(forecast.weatherData.flood_probability)}%
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
