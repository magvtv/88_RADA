import { Cloudy } from "lucide-react";
import { apiGet } from "./api";
import {
  type WeeklyForecast,
  type DailyForecast,
  type ForecastChartData,
  CombinedForecastChartData
} from "@/types/forecast";
import axios from "axios";

const ENDPOINTS = {
  predictions: 'api/proxy/preds/',
  normalPredictions: 'api/proxy/normal_preds',
};


// Service functions
export async function getForecastData(retryCount = 3): Promise<WeeklyForecast> {
  try {
    const response = await apiGet(ENDPOINTS.predictions);
    if(!response) {
      throw new Error('No data received from the forecast service');
    }
    if (!Array.isArray(response) || !response.every(isValidDailyForecast)) {
      throw new Error('Invalid API response format');
    }
    return transformAPIResponse(response as DailyForecast[]);
  } catch (error) {
    if(axios.isAxiosError(error)) {
      console.error("Network or CORS error:", error.message);

      // handle specific error cases
      if(error.code === 'ERR_NETWORK' && retryCount > 0) {
        console.log(`Retrying... (${retryCount} attempts left)`); 
        await new Promise(resolve => setTimeout(resolve, 1000));
        return getForecastData(retryCount - 1);
        throw new Error('Unable to connect to the forecast service. Please check your connection')
      }
      if (error.code === 'ERR_NETWORK') {
        throw new Error('Unable to connect to the forecast service. Please check your connection');
      }
      if (error.response?.status === 403) {
        throw new Error('Access forbidden. Please check your authentication.')
      }
    }
    console.error("Failed to fetch predictions:", error);
    throw error;
  }
}

// helper function to determine condition based on probabilities
function getCondition(droughtProb: number, floodProb: number): string {
  if(!droughtProb || !floodProb) {
    throw new Error('Both drought and flood probabilities are required');
  }
  const droughtLevel = droughtProb > 70 ? "Severe" : droughtProb > 50 ? "Moderate" : droughtProb > 30 ? "Mild" : "No";
  const floodLevel = floodProb > 70 ? "Severe" : floodProb > 50 ? "Moderate" : floodProb > 30 ? "Mild" : "No";
  return `${droughtLevel} drought | ${floodLevel} flood`;

}


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

function isValidDailyForecast(item: any): item is DailyForecast {
  return (
    item && typeof item.date === 'string' && typeof item.day === 'string' && item.weatherData && typeof item.weatherData.drought_probability === 'number' && typeof item.weatherData.flood_probability === 'number' && typeof item.created_at === 'string' && item.updated_at === 'string'
  )
}

async function getTrendsData(): Promise<ForecastChartData[]> {
  const forecast = await getForecastData();
  return forecast.forecasts.map(forecast => ({
    date: forecast.date,
    value: forecast.weatherData.drought_probability,
    type: "drought"
  }))
}

async function getCombinedTrendsData(): Promise<CombinedForecastChartData[]> {
  const forecast = await getForecastData()
  return forecast.forecasts.map(forecast => ({
    date: forecast.date,
    drought: forecast.weatherData.drought_probability,
    flood: forecast.weatherData.flood_probability
  }))
}

// export async function getNormalPredictions(): Promise<WeeklyForecast> {
//   try {
//     const response = await apiGet(ENDPOINTS.normalPredictions);
//     return transformAPIResponse(response);
//   } catch (error) {
//     console.error("Failed to fetch normal predictions:", error);
//     throw error;
//   }
// }

export async function getTodayForecast(): Promise<DailyForecast> {
  try {
    const forecast = await getForecastData();
    return forecast.forecasts[0];
  } catch (error) {
    if(axios.isAxiosError(error)) {
      console.error("Network or CORS error:", error.message);

      // handle specific error cases
      if(error.code === 'ERR_NETWORK') {
        throw new Error('Unable to connect to the forecast service. Please check your connection')
      }
    }
    console.error("Failed to fetch today's forecast:", error);
    throw error;
  }
}

export async function getWeeklyForecast(): Promise<WeeklyForecast> {
  try {
    return await getForecastData();

  } catch (error) {
    if(axios.isAxiosError(error)) {
      console.error("Network or CORS error:", error.message);

      // handle specific error cases
      if(error.code === 'ERR_NETWORK') {
        throw new Error('Unable to connect to the forecast service. Please check your connection')
      }
    }
    console.error("Failed to fetch weekly forecast:", error)
    throw error;
  }
}

export async function getForecastTrends(
  type = "drought",
  days = 7
): Promise<ForecastChartData[] | CombinedForecastChartData[]> {
  try {
    if(type === "all") {
      return await getCombinedTrendsData();
    }
    return await getTrendsData();
  } catch (error) {
    if(axios.isAxiosError(error)) {
      console.error("Network or CORS error:", error.message);

      // handle specific error cases
      if(error.code === 'ERR_NETWORK') {
        throw new Error('Unable to connect to the forecast service. Please check your connection')
      }
    }
    console.error("Failed to fetch forecast trends:", error);
    throw error;
  }
}
