import { Cloudy } from "lucide-react";
import { apiGet } from "./api";
import { getSession } from "next-auth/react";
import {
  type WeeklyForecast,
  type DailyForecast,
  type ForecastChartData,
  CombinedForecastChartData
} from "@/types/forecast";
import axios from "axios";

const ENDPOINTS = {
  predictions: '/preds/',
  normalPredictions: '/normal_preds',
  triggerPredictions: '/trigger_preds',
};

// Cache configuration
const CACHE_KEYS = {
  FORECAST: 'forecast_cache',
  NORMAL_PREDICTIONS: 'normal_predictions_cache',
  TODAY_FORECAST: 'today_forecast_cache',
  TRENDS: 'trends_cache'
};
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

// Cache helper functions
function getFromCache<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const cached = sessionStorage.getItem(key);
    if (!cached) return null;
    
    const { data, timestamp } = JSON.parse(cached);
    const now = Date.now();
    
    // Check if cache is still valid
    if (now - timestamp < CACHE_DURATION) {
      return data as T;
    }
    
    return null;
  } catch (error) {
    console.error(`Error reading from cache (${key}):`, error);
    return null;
  }
}

function setToCache<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return;
  
  try {
    const cacheData = {
      data,
      timestamp: Date.now()
    };
    sessionStorage.setItem(key, JSON.stringify(cacheData));
  } catch (error) {
    console.error(`Error writing to cache (${key}):`, error);
  }
}

// Service functions with caching
export async function getForecastData(retryCount = 1, useCache = true): Promise<WeeklyForecast> {
  // Try to get from cache first
  if (useCache) {
    const cached = getFromCache<WeeklyForecast>(CACHE_KEYS.FORECAST);
    if (cached) {
      console.log('Using cached forecast data');
      return cached;
    }
  }
  
  try {
    console.log("Fetching forecast data from endpoint:", ENDPOINTS.predictions);
    // Get direct API response using a hardcoded URL for immediate testing
    const API_URL = "https://www.radaprojo.live";
    console.log("Using hardcoded API URL:", API_URL + ENDPOINTS.predictions);
    
    // Try direct axios call first to bypass any middleware issues
    const directResponse = await axios.get(API_URL + ENDPOINTS.predictions);
    const response = directResponse.data;
    
    console.log("Raw API response type:", typeof response);
    console.log("Is array?", Array.isArray(response));
    console.log("API response data sample:", Array.isArray(response) && response.length > 0 ? JSON.stringify(response[0], null, 2) : response);
    
    // Validate response
    if (!response) {
      console.error("Response is null or undefined");
      return createEmptyForecast('No data received from the forecast service');
    }
    
    if (!Array.isArray(response)) {
      console.error("Response is not an array:", response);
      return createEmptyForecast('Invalid forecast data format - expected an array');
    }
    
    if (response.length === 0) {
      console.warn("Received empty array response");
      return createEmptyForecast('Empty forecast data received');
    }
    
    console.log("Sample forecast item:", response[0]);
    
    // Process the response data using our helper function
    const transformedData = {
      forecasts: response.map(item => processForecastItem(item)),
      lastUpdated: response[0]?.updated_at || new Date().toISOString(),
    };
    
    // Cache the result
    if (transformedData.forecasts.length > 0) {
      setToCache(CACHE_KEYS.FORECAST, transformedData);
    }
    
    return transformedData;
  } catch (error) {
    if(axios.isAxiosError(error)) {
      // Log actual error details for debugging
      if (error.response) {
        console.error("API Error:", error.response.status, error.message);
      } else if (error.request) {
        console.error("Request Error:", error.message, error.code);
      } else {
        console.error("Axios Config Error:", error.message);
      }

      // Simple retry mechanism with only 1 retry
      if(error.code === 'ERR_NETWORK' && retryCount > 0) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return getForecastData(retryCount - 1, false);
      }
      
      // For all network-related errors, return empty data instead of throwing
      if (error.code === 'ERR_NETWORK' || !error.response) {
        return createEmptyForecast('API server unavailable');
      }
      
      if (error.response?.status === 403) {
        return createEmptyForecast('Access forbidden');
      }
    }
    
    console.error("Failed to fetch predictions:", error);
    
    // Always return empty forecast instead of throwing to prevent page crashes
    return createEmptyForecast('Unknown error occurred');
  }
}

// Helper function to create an empty forecast with a reason
function createEmptyForecast(reason: string): WeeklyForecast {
  console.info(`Creating empty forecast: ${reason}`);
  return {
    forecasts: [],
    lastUpdated: new Date().toISOString(),
    error: reason
  };
}

// helper function to determine condition based on probabilities
function getCondition(droughtProb: number, floodProb: number): string {
  // Check if the values are undefined/null, or valid numbers
  if(droughtProb === undefined || droughtProb === null || floodProb === undefined || floodProb === null) {
    console.warn('Missing probability values:', { drought: droughtProb, flood: floodProb });
    return "Unknown conditions";
  }
  
  // Check for NaN or negative values
  if(isNaN(droughtProb) || isNaN(floodProb) || droughtProb < 0 || floodProb < 0) {
    console.warn('Invalid probability values:', { drought: droughtProb, flood: floodProb });
    return "Invalid data";
  }
  
  const droughtLevel = droughtProb > 70 ? "Severe" : droughtProb > 50 ? "Moderate" : droughtProb > 30 ? "Mild" : "No";
  const floodLevel = floodProb > 70 ? "Severe" : floodProb > 50 ? "Moderate" : floodProb > 30 ? "Mild" : "No";
  return `${droughtLevel} drought | ${floodLevel} flood`;
}

// Helper function to process a single forecast item
function processForecastItem(item: any): DailyForecast {
  // Get values directly from API response based on our API test results
  const droughtProb = item.drought_probability;
  const floodProb = item.flood_probability;
  
  return {
    date: item.date,
    day: item.day,
    weatherData: {
      drought_probability: droughtProb,
      flood_probability: floodProb,
      condition: getCondition(droughtProb, floodProb),
    },
    created_at: item.created_at,
    updated_at: item.updated_at
  };
}

function isValidDailyForecast(item: any): boolean {
  try {
    if (!item || typeof item !== 'object') return false;
    if (typeof item.date !== 'string') return false;
    if (typeof item.day !== 'string') return false;
    if (typeof item.created_at !== 'string') return false;
    if (typeof item.updated_at !== 'string') return false;
    
    // Check for flat structure (API response)
    if (typeof item.drought_probability === 'number' && 
        typeof item.flood_probability === 'number') {
      return true;
    }
    
    // Check for nested structure (our internal DailyForecast model)
    if (item.weatherData && 
        typeof item.weatherData.drought_probability === 'number' && 
        typeof item.weatherData.flood_probability === 'number') {
      return true;
    }
    
    return false;
  } catch (error) {
    console.error("Error validating forecast item:", error);
    return false;
  }
}

// Separate data fetching functions
export async function getTodayForecast(useCache = true): Promise<DailyForecast> {
  // Try to get from cache first
  if (useCache) {
    const cached = getFromCache<DailyForecast>(CACHE_KEYS.TODAY_FORECAST);
    if (cached) {
      console.log('Using cached today forecast data');
      return cached;
    }
  }
  
  try {
    // Direct API request with hardcoded URL
    const API_URL = "https://www.radaprojo.live";
    console.log("Fetching today's forecast from:", API_URL + ENDPOINTS.predictions);
    
    // Try direct axios call first to bypass any middleware issues
    const directResponse = await axios.get(API_URL + ENDPOINTS.predictions);
    const response = directResponse.data;
    
    if (!response || !Array.isArray(response) || response.length === 0) {
      return createEmptyDailyForecast('No forecast data available');
    }
    
    // Get the first item (today's forecast) and process it
    const todayData = response[0];
    const todayForecast = processForecastItem(todayData);
    
    // Cache the result
    setToCache(CACHE_KEYS.TODAY_FORECAST, todayForecast);
    return todayForecast;
  } catch (error) {
    if(axios.isAxiosError(error)) {
      // Log actual error details for debugging
      if (error.response) {
        console.error("API Error (today's forecast):", error.response.status);
      } else if (error.request) {
        console.error("Request Error (today's forecast):", error.message);
      } else {
        console.error("Axios Config Error (today's forecast):", error.message);
      }
    }
    
    console.error("Failed to fetch today's forecast:", error);
    
    // Return an empty forecast with appropriate message
    return createEmptyDailyForecast('Failed to fetch forecast');
  }
}

// Helper function to create an empty daily forecast
function createEmptyDailyForecast(errorReason = 'No data available'): DailyForecast {
  return {
    date: new Date().toISOString().split('T')[0],
    day: new Date().toLocaleDateString('en-US', { weekday: 'long' }),
    weatherData: {
      drought_probability: 0,
      flood_probability: 0,
      condition: errorReason
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
}

// Optimized weekly forecast function
export async function getWeeklyForecast(useCache = true): Promise<WeeklyForecast> {
  return getForecastData(1, useCache);
}

// Optimized forecast trends function with caching
export async function getForecastTrends(
  type = "drought",
  days = 7,
  useCache = true
): Promise<ForecastChartData[] | CombinedForecastChartData[]> {
  // Try to get from cache first with type-specific key
  const cacheKey = `${CACHE_KEYS.TRENDS}_${type}`;
  if (useCache) {
    const cached = getFromCache<ForecastChartData[] | CombinedForecastChartData[]>(cacheKey);
    if (cached) {
      console.log(`Using cached ${type} trends data`);
      return cached;
    }
  }
  
  try {
    // Use main forecast data for all trend types
    const API_URL = "https://www.radaprojo.live";
    console.log("Fetching trends from:", API_URL + ENDPOINTS.predictions);
    
    // Try direct axios call first to bypass any middleware issues
    const directResponse = await axios.get(API_URL + ENDPOINTS.predictions);
    const response = directResponse.data;
    
    if (!response || !Array.isArray(response) || response.length === 0) {
      return type === "all" ? [] : [];
    }
    
    // Process the response based on trend type
    let result;
    if(type === "all") {
      // Format data for combined chart
      result = response.map(item => {
        return {
          date: item.date,
          drought: item.drought_probability,
          flood: item.flood_probability
        };
      });
    } else {
      // Format data for single type chart
      result = response.map(item => {
        return {
          date: item.date,
          value: type === "drought" ? item.drought_probability : item.flood_probability,
          type
        };
      });
    }
    
    // Cache the result
    setToCache(cacheKey, result);
    return result;
  } catch (error) {
    if(axios.isAxiosError(error)) {
      // Log actual error details for debugging
      if (error.request) {
        console.error("Request Error (trends):", error.message);
      } else {
        console.error("Axios Config Error (trends):", error.message);
      }
      
      // Network errors should return empty data instead of throwing
      if(error.code === 'ERR_NETWORK' || !error.response) {
        console.info("Trends data unavailable, returning empty array");
      }
    }
    console.error("Failed to fetch forecast trends:", error);
    
    // Always return empty array instead of throwing
    return type === "all" 
      ? [] as CombinedForecastChartData[] 
      : [] as ForecastChartData[];
  }
}

// Optimized normal predictions function with caching
export async function getNormalPredictions(useCache = true): Promise<WeeklyForecast> {
  // Try to get from cache first
  if (useCache) {
    const cached = getFromCache<WeeklyForecast>(CACHE_KEYS.NORMAL_PREDICTIONS);
    if (cached) {
      console.log('Using cached normal predictions data');
      return cached;
    }
  }
  
  try {
    // Direct API request with hardcoded URL
    const API_URL = "https://www.radaprojo.live";
    console.log("Fetching normal predictions from:", API_URL + ENDPOINTS.normalPredictions);
    
    // Try direct axios call first to bypass any middleware issues
    const directResponse = await axios.get(API_URL + ENDPOINTS.normalPredictions);
    const response = directResponse.data;
    
    // Validate response
    if(!response) {
      return createEmptyForecast('No data received from the normal predictions service');
    }
    
    // Handle empty array response
    if (Array.isArray(response) && response.length === 0) {
      return createEmptyForecast('Empty normal predictions response');
    }
    
    // Process response data using our helper function
    const transformedData = {
      forecasts: (response as any[]).map(item => processForecastItem(item)),
      lastUpdated: Array.isArray(response) && response.length > 0 ? 
        (response[0] as any).updated_at || new Date().toISOString() : 
        new Date().toISOString(),
    };
    
    // Cache the result
    if (transformedData.forecasts.length > 0) {
      setToCache(CACHE_KEYS.NORMAL_PREDICTIONS, transformedData);
    }
    
    return transformedData;
  } catch (error) {
    if(axios.isAxiosError(error)) {
      // Log actual error details for debugging
      if (error.response) {
        console.error("API Error (normal predictions):", error.response.status, error.message);
      } else if (error.request) {
        console.error("Request Error (normal predictions):", error.message, error.code);
      } else {
        console.error("Axios Config Error (normal predictions):", error.message);
      }

      // Simple retry mechanism with only 1 retry
      if(error.code === 'ERR_NETWORK') {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return getNormalPredictions(false);
      }
      
      // For all network-related errors, return empty data instead of throwing
      if (error.code === 'ERR_NETWORK' || !error.response) {
        return createEmptyForecast('Normal predictions API unavailable');
      }
      
      if (error.response?.status === 403) {
        return createEmptyForecast('Access forbidden to normal predictions');
      }
    }
    
    console.error("Failed to fetch normal predictions:", error);
    
    // Always return empty forecast instead of throwing to prevent page crashes
    return createEmptyForecast('Unknown error fetching normal predictions');
  }
}

// Only trigger predictions on demand - not during regular page loads
export async function triggerPredictions(): Promise<{ success: boolean; message: string }> {
  try {
    // Direct API request with hardcoded URL
    const API_URL = "https://www.radaprojo.live";
    console.log("Triggering predictions from:", API_URL + ENDPOINTS.triggerPredictions);
    
    // Try direct axios call first to bypass any middleware issues
    const directResponse = await axios.get(API_URL + ENDPOINTS.triggerPredictions);
    const response = directResponse.data;
    
    if (!response) {
      return {
        success: false,
        message: 'No response from trigger predictions endpoint'
      };
    }
    
    // Clear all caches to ensure fresh data on next fetch
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(CACHE_KEYS.FORECAST);
      sessionStorage.removeItem(CACHE_KEYS.NORMAL_PREDICTIONS);
      sessionStorage.removeItem(CACHE_KEYS.TODAY_FORECAST);
      sessionStorage.removeItem(CACHE_KEYS.TRENDS);
    }
    
    return {
      success: true,
      message: 'Successfully triggered new predictions'
    };
  } catch (error) {
    console.error("Failed to trigger predictions:", error);
    return {
      success: false,
      message: 'Failed to trigger new predictions. Please try again later.'
    };
  }
}

// Function to clear all forecast caches
export function clearForecastCaches(): void {
  if (typeof window === 'undefined') return;
  
  Object.values(CACHE_KEYS).forEach(key => {
    sessionStorage.removeItem(key);
  });
  
  console.log('All forecast caches cleared');
}

// Function to prefetch data in background (for use during navigation)
export async function prefetchForecastData(): Promise<void> {
  try {
    console.log('Prefetching forecast data in background');
    // Start requests but don't await them
    const promises = [
      getTodayForecast(true),
      getForecastTrends('drought', 7, true),
      getForecastTrends('flood', 7, true)
    ];
    
    // Let them run in background
    Promise.all(promises).catch(error => {
      console.error('Background prefetch error:', error);
    });
  } catch (error) {
    console.error('Error in prefetch:', error);
  }
}
