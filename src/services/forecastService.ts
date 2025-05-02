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
      date: "2025-05-02",
      day: "Friday",
      weatherData: {
        flood_probability: 48.46,
        drought_probability: 91.19,
        condition: getCondition(48.46, 91.19)
      },
      created_at: "May 01, 2025 21:00",
      updated_at: "May 02, 2025 05:06"
    },
    {
      date: "2025-05-03",
      day: "Saturday",
      weatherData: {
        flood_probability: 64.24,
        drought_probability: 56.94,
        condition: getCondition(64.24, 56.94)
      },
      created_at: "May 01, 2025 21:00",
      updated_at: "May 02, 2025 05:06"
    },
    {
      date: "2025-05-04",
      day: "Sunday",
      weatherData: {
        flood_probability: 71.11,
        drought_probability: 50.41,
        condition: getCondition(71.11, 50.41)
      },
      created_at: "May 01, 2025 21:00",
      updated_at: "May 02, 2025 05:06"
    },
    {
      date: "2025-05-05",
      day: "Monday",
      weatherData: {
        flood_probability: 72.41,
        drought_probability: 45.4,
        condition: getCondition(72.41, 45.4)
      },
      created_at: "May 01, 2025 21:00",
      updated_at: "May 02, 2025 05:06"
    },
    {
      date: "2025-05-06",
      day: "Tuesday",
      weatherData: {
        flood_probability: 72.69,
        drought_probability: 39.03,
        condition: getCondition(72.69, 39.03)
      },
      created_at: "May 01, 2025 21:00",
      updated_at: "May 02, 2025 05:06"
    },
    {
      date: "2025-05-07",
      day: "Wednesday",
      weatherData: {
        flood_probability: 73.78,
        drought_probability: 34.7,
        condition: getCondition(73.78, 34.7)
      },
      created_at: "May 01, 2025 21:00",
      updated_at: "May 02, 2025 05:06"
    },
    {
      date: "2025-05-08",
      day: "Thursday",
      weatherData: {
        flood_probability: 74.05,
        drought_probability: 33.15,
        condition: getCondition(74.05, 33.15)
      },
      created_at: "May 01, 2025 21:00",
      updated_at: "May 02, 2025 05:06"
    }
  ],
  lastUpdated: "May 1, 2025 21:00"
};

// helper function to determine condition based on probabilities
function getCondition(droughtProb: number, floodProb: number): string {
  if(!droughtProb || !floodProb) {
    throw new Error('Both drought and flood probabilities are required');
  }
  const droughtLevel = droughtProb > 70 ? "Severe" : droughtProb > 50 ? "Moderate" : droughtProb > 30 ? "Mild" : "No";
  const floodLevel = floodProb > 70 ? "Severe" : floodProb > 50 ? "Moderate" : floodProb > 30 ? "Mild" : "No";
  return `${droughtLevel} drought | ${floodLevel} flood`;

}


// update trends data to match new probabilities
const mockTrendsData: ForecastChartData[] = mockWeeklyForecast.forecasts.map(forecast => ({
  date: forecast.date,
  value: forecast.weatherData.drought_probability,
  type: "drought",
}));

// mock data for combine trends
const mockCombinedTrendsData: CombinedForecastChartData[] = mockWeeklyForecast.forecasts.map(forecast => ({
  date: forecast.date,
  drought: forecast.weatherData.drought_probability,
  flood: forecast.weatherData.flood_probability
}));


// helper function to transform API response to match our interface
function transformAPIResponse(apiData: DailyForecast[]): WeeklyForecast {
  return {
    forecasts: apiData.map(item => ({
      date: item.date,
      day: item.day,
      weatherData: {
        drought_probability: item.weatherData.drought_probability,
        flood_probability: item.weatherData.flood_probability,
        condition: getCondition(item.weatherData.drought_probability, item.weatherData.flood_probability),
      },
      created_at: item.created_at,
      updated_at: item.updated_at
    })),
    lastUpdated: apiData[0]?.updated_at || new Date().toISOString(),
  };
}

// Service functions
export async function getWeeklyForecast(): Promise<WeeklyForecast> {
  try {
    // implementing real API calls:
    // const response = await apiGet(ENDPOINTS.weeklyForecast);
    // return transformAPIResponse(response);


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
