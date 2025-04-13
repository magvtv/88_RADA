import { Cloudy } from "lucide-react";
import { apiGet } from "./api";
import {
  type WeeklyForecast,
  type DailyForecast,
  type ForecastChartData,
  LocationData,
  CombinedForecastChartData
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
        drought: 46,
        flood: 21,
        condition: "Sunny",
      },
    },
    {
      date: "2025-04-12",
      day: "Saturday",
      weatherData: {
        drought: 93,
        flood: 12,
        condition: "Partly Cloudy",
      },
    },
    {
      date: "2025-04-13",
      day: "Sunday",
      weatherData: {
        drought: 34,
        flood: 67,
        condition: "Rainy",
      },
    },
    {
      date: "2025-04-14",
      day: "Monday",
      weatherData: {
        drought: 88,
        flood: 39,
        condition: "Stormy",
      },
    },
    {
      date: "2025-04-15",
      day: "Tuesday",
      weatherData: {
        drought: 72,
        flood: 28,
        condition: "Cloudy",
      },
    },
    {
      date: "2025-04-16",
      day: "Wednesday",
      weatherData: {
        drought: 55,
        flood: 45,
        condition: "Partly Cloudy",
      },
    },
    {
      date: "2025-04-17",
      day: "Thursday",
      weatherData: {
        drought: 19,
        flood: 65,
        condition: "Sunny",
      },
    },
  ],
  lastUpdated: "2025-04-11T09:30:00Z",
};

const mockTrendsData: ForecastChartData[] = [
  { date: "2025-04-11", value: 46, type: "drought" },
  { date: "2025-04-12", value: 93, type: "drought" },
  { date: "2025-04-13", value: 34, type: "drought" },
  { date: "2025-04-14", value: 88, type: "drought" },
  { date: "2025-04-15", value: 72, type: "drought" },
  { date: "2025-04-16", value: 55, type: "drought" },
  { date: "2025-04-17", value: 19, type: "drought" },
];

// mock data for combined forecast
const mockCombinedTrendsData: CombinedForecastChartData[] = [
  { date: "2025-04-11", drought: 46, flood: 21 },
  { date: "2025-04-12", drought: 93, flood: 12 },
  { date: "2025-04-13", drought: 34, flood: 67 },
  { date: "2025-04-14", drought: 88, flood: 39 },
  { date: "2025-04-15", drought: 72, flood: 28 },
  { date: "2025-04-16", drought: 55, flood: 45 },
  { date: "2025-04-17", drought: 19, flood: 65 },
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

// Add this mock data for with the longitude and latitude location data
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
  type = "drought",
  days = 7
): Promise<ForecastChartData[] | CombinedForecastChartData[]> {
  try {
    // In a real implementation, this would call the API
    // return await apiGet<ForecastChartData[]>(
    //   ENDPOINTS.forecastTrends(type, days)
    // );

    // For development, return mock data with a simulated delay
    return new Promise((resolve) => {
      setTimeout(() => {
        // return combined data if type is "all"
        if(type === "all") {
          resolve(mockCombinedTrendsData)
        } else {
          resolve(mockTrendsData);
        }
      }, 700);
    });
  } catch (error) {
    console.error("Failed to fetch forecast trends:", error);
    throw error;
  }
}
