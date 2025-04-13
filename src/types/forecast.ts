export interface WeatherData {
  drought: number;
  flood: number;
  condition: string; // e.g., 'Sunny', 'Rainy', 'Cloudy'
}

export interface DailyForecast {
  date: string;
  day: string;
  weatherData: WeatherData;
}

export interface WeeklyForecast {
  forecasts: DailyForecast[];
  lastUpdated: string;
}

export interface ForecastChartData {
  date: string;
  value: number;
  type: string; // e.g., 'temperature', 'humidity', 'precipitation'
}

export interface LocationData {
  name: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

export interface CombinedForecastChartData {
  date: string;
  drought: number;
  flood: number;
}
