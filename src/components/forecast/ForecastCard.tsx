"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DailyForecast } from "@/types/forecast";
import { useUserStore } from "@/store";
import { getWeatherIcon } from "@/components/ui/icons";

interface ForecastCardProps {
  forecast: DailyForecast;
  isHighlighted?: boolean;
}

export function ForecastCard({ forecast, isHighlighted = false }: ForecastCardProps) {
  const temperatureUnit = useUserStore((state) => state.preferences.temperatureUnit);

  // Convert temperature if needed
  const temperature = temperatureUnit === "celsius"
    ? forecast.weatherData.temperature
    : (forecast.weatherData.temperature * 9) / 5 + 32;

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
          {/* Temperature */}
          <div>
            <p className="text-2xl font-bold">
              {Math.round(temperature)}°{temperatureUnit === "celsius" ? "C" : "F"}
            </p>
            <p className="text-sm text-muted-foreground">{forecast.weatherData.condition}</p>
          </div>

          {/* Weather details */}
          <div className="text-sm space-y-1">
            <p>Humidity: {forecast.weatherData.humidity}%</p>
            <p>
              Wind: {forecast.weatherData.windSpeed} km/h {forecast.weatherData.windDirection}
            </p>
            {forecast.weatherData.precipitation > 0 && (
              <p>Precipitation: {forecast.weatherData.precipitation}%</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
