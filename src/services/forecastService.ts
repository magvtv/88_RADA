import { apiGet } from "./api";
import {
  type WeeklyForecast,
  type DailyForecast,
  type ForecastChartData,
  LocationData
} from "@/types/forecast";

const ENDPOINTS = {
  weeklyForecast: "/forecasts/weekly",
  todayForecast: "/forecasts/today",
  locationForecast: (latitude: number, longitude: number) =>
    `/forecasts/location?lat=${latitude}&lon=${longitude}`,
  forecastTrends: (type: string, days: number) =>
    `/forecasts/trends?type=${type}&days=${days}`,
};

// Mock data for development
const mockWeeklyForecast: WeeklyForecast = {
  forecasts: [
    {
      date: "2025-04-11",
      day: "Friday",
      weatherData: {
        temperature: 25,
        humidity: 60,
        pressure: 1015,
        windSpeed: 12,
        windDirection: "NE",
        precipitation: 0,
        condition: "Sunny",
      },
    },
    {
      date: "2025-04-12",
      day: "Saturday",
      weatherData: {
        temperature: 27,
        humidity: 65,
        pressure: 1012,
        windSpeed: 10,
        windDirection: "E",
        precipitation: 0,
        condition: "Partly Cloudy",
      },
    },
    {
      date: "2025-04-13",
      day: "Sunday",
      weatherData: {
        temperature: 22,
        humidity: 75,
        pressure: 1010,
        windSpeed: 15,
        windDirection: "SE",
        precipitation: 40,
        condition: "Rainy",
      },
    },
    {
      date: "2025-04-14",
      day: "Monday",
      weatherData: {
        temperature: 20,
        humidity: 80,
        pressure: 1008,
        windSpeed: 18,
        windDirection: "S",
        precipitation: 60,
        condition: "Stormy",
      },
    },
    {
      date: "2025-04-15",
      day: "Tuesday",
      weatherData: {
        temperature: 21,
        humidity: 70,
        pressure: 1011,
        windSpeed: 14,
        windDirection: "SW",
        precipitation: 30,
        condition: "Cloudy",
      },
    },
    {
      date: "2025-04-16",
      day: "Wednesday",
      weatherData: {
        temperature: 24,
        humidity: 65,
        pressure: 1013,
        windSpeed: 10,
        windDirection: "W",
        precipitation: 10,
        condition: "Partly Cloudy",
      },
    },
    {
      date: "2025-04-17",
      day: "Thursday",
      weatherData: {
        temperature: 26,
        humidity: 55,
        pressure: 1016,
        windSpeed: 8,
        windDirection: "NW",
        precipitation: 0,
        condition: "Sunny",
      },
    },
  ],
  lastUpdated: "2025-04-11T09:30:00Z",
};

const mockTrendsData: ForecastChartData[] = [
  { date: "2025-04-11", value: 25, type: "temperature" },
  { date: "2025-04-12", value: 27, type: "temperature" },
  { date: "2025-04-13", value: 22, type: "temperature" },
  { date: "2025-04-14", value: 20, type: "temperature" },
  { date: "2025-04-15", value: 21, type: "temperature" },
  { date: "2025-04-16", value: 24, type: "temperature" },
  { date: "2025-04-17", value: 26, type: "temperature" },
];

// Service functions
export async function getWeeklyForecast(): Promise<WeeklyForecast> {
  try {
    // In a real implementation, this would call the API
    // return await apiGet<WeeklyForecast>(ENDPOINTS.weeklyForecast);

    // For development, return mock data with a simulated delay
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockWeeklyForecast);
      }, 800);
    });
  } catch (error) {
    console.error("Failed to fetch weekly forecast:", error);
    throw error;
  }
}

export async function getTodayForecast(): Promise<DailyForecast> {
  try {
    // In a real implementation, this would call the API
    // return await apiGet<DailyForecast>(ENDPOINTS.todayForecast);

    // For development, return first day from mock data with a simulated delay
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockWeeklyForecast.forecasts[0]);
      }, 600);
    });
  } catch (error) {
    console.error("Failed to fetch today's forecast:", error);
    throw error;
  }
}

export async function getForecastByLocation(
  latitude: number,
  longitude: number
): Promise<WeeklyForecast> {
  try {
    // In a real implementation, this would call the API
    // return await apiGet<WeeklyForecast>(
    //   ENDPOINTS.locationForecast(latitude, longitude)
    // );

    // For development, return mock data with a simulated delay
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockWeeklyForecast);
      }, 1000);
    });
  } catch (error) {
    console.error("Failed to fetch location forecast:", error);
    throw error;
  }
}

export async function getForecastTrends(
  type = "temperature",
  days = 7
): Promise<ForecastChartData[]> {
  try {
    // In a real implementation, this would call the API
    // return await apiGet<ForecastChartData[]>(
    //   ENDPOINTS.forecastTrends(type, days)
    // );

    // For development, return mock data with a simulated delay
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockTrendsData);
      }, 700);
    });
  } catch (error) {
    console.error("Failed to fetch forecast trends:", error);
    throw error;
  }
}
