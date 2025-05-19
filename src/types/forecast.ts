// Type definitions for forecast data

export interface WeatherData {
  drought_probability: number;
  flood_probability: number;
  condition?: string;
}

export interface DailyForecast {
  date: string;
  day: string;
  weatherData: WeatherData;
  created_at: string;
  updated_at: string;
}

export interface WeeklyForecast {
  forecasts: DailyForecast[];
  lastUpdated: string;
  error?: string; // Optional error message for when forecast data can't be fetched
}

export interface ForecastChartData {
  date: string;
  value: number;
  type: string; // e.g., 'drought', 'flood', 'both'
}

export interface CombinedForecastChartData {
  date: string;
  drought: number;
  flood: number;
}
