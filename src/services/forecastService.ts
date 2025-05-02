import { Cloudy } from "lucide-react";
import { apiGet } from "./api";
import {
  type WeeklyForecast,
  type DailyForecast,
  type ForecastChartData,
  CombinedForecastChartData
} from "@/types/forecast";

const ENDPOINTS = {
  weeklyForecast: "/forecasts/weekly",
  todayForecast: "/forecasts/today",
  forecastTrends: (type: string, days: number) =>
    `/forecasts/trends?type=${type}&days=${days}`,
};

// Mock data for development
const mockWeeklyForecast: WeeklyForecast = {
  forecasts: [
    {
      date: "2025-04-21",
      day: "Monday",
      weatherData: {
        drought: 63.91,
        flood: 54.77,
        condition: getCondition(63.91, 54.77),
      },
      created_at: "April 21, 2025 12:30",
      updated_at: "April 21, 2025 13:30"
    },
    {
      date: "2025-04-22",
      day: "Tuesday",
      weatherData: {
        drought: 53.11,
        flood: 68.32,
        condition: getCondition(53.11, 68.32),
      },
      created_at: "April 21, 2025 12:30",
      updated_at: "April 21, 2025 13:30"
    },
    {
      date: "2025-04-23",
      day: "Wednesday",
      weatherData: {
        drought: 47.45,
        flood: 73.13,
        condition: getCondition(47.45, 73.13),
      },
      created_at: "April 21, 2025 12:30",
      updated_at: "April 21, 2025 13:30"
    },
    {
      date: "2025-04-24",
      day: "Thursday",
      weatherData: {
        drought: 43.35,
        flood: 73.36,
        condition: getCondition(43.35, 73.36),
      },
      created_at: "April 21, 2025 12:30",
      updated_at: "April 21, 2025 13:30"
    },
    {
      date: "2025-04-25",
      day: "Friday",
      weatherData: {
        drought: 38.09,
        flood: 73.40,
        condition: getCondition(38.09, 73.40),
      },
      created_at: "April 21, 2025 12:30",
      updated_at: "April 21, 2025 13:30"
    },
    {
      date: "2025-04-26",
      day: "Saturday",
      weatherData: {
        drought: 34.41,
        flood: 74.16,
        condition: getCondition(34.41, 74.16),
      },
      created_at: "April 21, 2025 12:30",
      updated_at: "April 21, 2025 13:30"
    },
    {
      date: "2025-04-27",
      day: "Sunday",
      weatherData: {
        drought: 32.97,
        flood: 74.40,
        condition: getCondition(32.97, 74.40),
      },
      created_at: "April 21, 2025 12:30",
      updated_at: "April 21, 2025 13:30"
    }
  ],
  lastUpdated: "April 21, 2025 13:30"

};


// helper function to determine condition based on probabilities
function getCondition(drought: number, flood: number): string {
  const droughtLevel = drought > 70 ? "Severe" : drought > 50 ? "Moderate" : drought > 30 ? "Mild" : "No";
  const floodLevel = flood > 70 ? "Severe" : flood > 50 ? "Moderate" : flood > 30 ? "Mild" : "No";
  return `${droughtLevel} drought | ${floodLevel} flood`;

}


// update trends data to match new probabilities
const mockTrendsData: ForecastChartData[] = mockWeeklyForecast.forecasts.map(forecast => ({
  date: forecast.date,
  value: forecast.weatherData.drought,
  type: "drought",
}));

// mock data for combine trends
const mockCombinedTrendsData: CombinedForecastChartData[] = mockWeeklyForecast.forecasts.map(forecast => ({
  date: forecast.date,
  drought: forecast.weatherData.drought,
  flood: forecast.weatherData.flood
}));


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
