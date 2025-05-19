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
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes in milliseconds

// Safe console logging (only on client)
const safeLog = (...args: any[]) => {
  if (typeof window !== 'undefined') {
    console.log(...args);
  }
};

// Safe console error (only on client)
const safeError = (...args: any[]) => {
  if (typeof window !== 'undefined') {
    console.error(...args);
  }
};

// Cache helper functions
function getFromCache<T>(key: string): T | null {
  // Only run on client-side
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
    safeError(`Error reading from cache (${key}):`, error);
    return null;
  }
}

function setToCache<T>(key: string, data: T): void {
  // Only run on client-side
  if (typeof window === 'undefined') return;
  
  try {
    const cacheData = {
      data,
      timestamp: Date.now()
    };
    sessionStorage.setItem(key, JSON.stringify(cacheData));
  } catch (error) {
    safeError(`Error writing to cache (${key}):`, error);
  }
}

// Service functions with caching
export async function getForecastData(retryCount = 2, useCache = true): Promise<WeeklyForecast> {
  // Skip cache on server-side
  const isClient = typeof window !== 'undefined';
  const shouldUseCache = isClient && useCache;
  
  // Try to get from cache first
  if (shouldUseCache) {
    const cached = getFromCache<WeeklyForecast>(CACHE_KEYS.FORECAST);
    if (cached) {
      safeLog('Using cached forecast data');
      // If we have cached data, start a background refresh but return the cached data immediately
      if (navigator.onLine) {
        setTimeout(() => {
          getForecastData(0, false).catch(e => {
            safeError('Background refresh failed:', e);
          });
        }, 100);
      }
      return cached;
    }
  }
  
  try {
    // Use the API URL from env when available, fallback to hardcoded
    const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://www.radaprojo.live";
    
    // Suppress detailed logging on server
    if (isClient) {
      safeLog("Fetching forecast data from endpoint:", ENDPOINTS.predictions);
    }
    
    // Try direct axios call with shorter timeout for faster failures
    const directResponse = await axios.get(API_URL + ENDPOINTS.predictions, {
      timeout: 3000 // Reduced timeout to 3 seconds
    });
    const response = directResponse.data;
    
    // Validate response
    if (!response) {
      return createEmptyForecast('No data received from the forecast service');
    }
    
    if (!Array.isArray(response)) {
      return createEmptyForecast('Invalid forecast data format - expected an array');
    }
    
    if (response.length === 0) {
      return createEmptyForecast('Empty forecast data received');
    }
    
    // Process the response data using our helper function
    const transformedData = {
      forecasts: response.map(item => processForecastItem(item)),
      lastUpdated: response[0]?.updated_at || new Date().toISOString(),
    };
    
    // Cache the result (client-side only)
    if (isClient && transformedData.forecasts.length > 0) {
      setToCache(CACHE_KEYS.FORECAST, transformedData);
    }
    
    return transformedData;
  } catch (error) {
    if(axios.isAxiosError(error)) {
      // Log actual error details for debugging
      if (error.response) {
        safeError("API Error:", error.response.status, error.message);
      } else if (error.request) {
        safeError("Request Error:", error.message, error.code);
      } else {
        safeError("Axios Config Error:", error.message);
      }

      // Improved retry mechanism with exponential backoff
      if(error.code === 'ERR_NETWORK' && retryCount > 0) {
        const backoffTime = Math.pow(2, 3 - retryCount) * 500; // Exponential backoff starting at 500ms
        await new Promise(resolve => setTimeout(resolve, backoffTime));
        return getForecastData(retryCount - 1, false);
      }
      
      // For all network-related errors, try to return cached data as fallback
      if (error.code === 'ERR_NETWORK' || !error.response) {
        const cachedData = getFromCache<WeeklyForecast>(CACHE_KEYS.FORECAST);
        if (cachedData) {
          safeLog('Network error, falling back to cached data');
          return {
            ...cachedData,
            error: 'Using cached data - API server unavailable' // Add error message but still return data
          };
        }
        return createEmptyForecast('API server unavailable');
      }
      
      if (error.response?.status === 403) {
        return createEmptyForecast('Access forbidden');
      }
    }
    
    safeError("Failed to fetch predictions:", error);
    
    // Try to return cached data as fallback
    const cachedData = getFromCache<WeeklyForecast>(CACHE_KEYS.FORECAST);
    if (cachedData) {
      safeLog('Error fetching data, falling back to cached data');
      return {
        ...cachedData,
        error: 'Using cached data - Could not fetch latest data' // Add error message but still return data
      };
    }
    
    // Always return empty forecast instead of throwing to prevent page crashes
    return createEmptyForecast('Unknown error occurred');
  }
}

// Helper function to create an empty forecast with a reason
function createEmptyForecast(reason: string): WeeklyForecast {
  safeLog(`Creating empty forecast: ${reason}`);
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
    safeLog('Missing probability values:', { drought: droughtProb, flood: floodProb });
    return "Unknown conditions";
  }
  
  // Check for NaN or negative values
  if(isNaN(droughtProb) || isNaN(floodProb) || droughtProb < 0 || floodProb < 0) {
    safeLog('Invalid probability values:', { drought: droughtProb, flood: floodProb });
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
    safeError("Error validating forecast item:", error);
    return false;
  }
}

// Separate data fetching functions
export async function getTodayForecast(useCache = true): Promise<DailyForecast> {
  const isClient = typeof window !== 'undefined';
  
  // Try to get from cache first
  if (isClient && useCache) {
    const cached = getFromCache<DailyForecast>(CACHE_KEYS.TODAY_FORECAST);
    if (cached) {
      safeLog('Using cached today forecast data');
      return cached;
    }
  }
  
  try {
    // Direct API request with hardcoded URL
    const API_URL = "https://www.radaprojo.live";
    if (isClient) {
      safeLog("Fetching today's forecast from:", API_URL + ENDPOINTS.predictions);
    }
    
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
    if (isClient) {
      setToCache(CACHE_KEYS.TODAY_FORECAST, todayForecast);
    }
    return todayForecast;
  } catch (error) {
    if(axios.isAxiosError(error)) {
      // Log actual error details for debugging
      if (error.response) {
        safeError("API Error (today's forecast):", error.response.status);
      } else if (error.request) {
        safeError("Request Error (today's forecast):", error.message);
      } else {
        safeError("Axios Config Error (today's forecast):", error.message);
      }
    }
    
    safeError("Failed to fetch today's forecast:", error);
    
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
  const isClient = typeof window !== 'undefined';
  
  // Try to get from cache first with type-specific key
  const cacheKey = `${CACHE_KEYS.TRENDS}_${type}`;
  if (isClient && useCache) {
    const cached = getFromCache<ForecastChartData[] | CombinedForecastChartData[]>(cacheKey);
    if (cached) {
      safeLog(`Using cached ${type} trends data`);
      return cached;
    }
  }
  
  try {
    // Use main forecast data for all trend types
    const API_URL = "https://www.radaprojo.live";
    if (isClient) {
      safeLog("Fetching trends from:", API_URL + ENDPOINTS.predictions);
    }
    
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
    if (isClient) {
      setToCache(cacheKey, result);
    }
    return result;
  } catch (error) {
    if(axios.isAxiosError(error)) {
      // Log actual error details for debugging
      if (error.request) {
        safeError("Request Error (trends):", error.message);
      } else {
        safeError("Axios Config Error (trends):", error.message);
      }
      
      // Network errors should return empty data instead of throwing
      if(error.code === 'ERR_NETWORK' || !error.response) {
        safeLog("Trends data unavailable, returning empty array");
      }
    }
    safeError("Failed to fetch forecast trends:", error);
    
    // Always return empty array instead of throwing
    return type === "all" 
      ? [] as CombinedForecastChartData[] 
      : [] as ForecastChartData[];
  }
}

// Optimized normal predictions function with caching
export async function getNormalPredictions(useCache = true): Promise<WeeklyForecast> {
  const isClient = typeof window !== 'undefined';
  
  // Try to get from cache first
  if (isClient && useCache) {
    const cached = getFromCache<WeeklyForecast>(CACHE_KEYS.NORMAL_PREDICTIONS);
    if (cached) {
      safeLog('Using cached normal predictions data');
      return cached;
    }
  }
  
  try {
    // Direct API request with hardcoded URL
    const API_URL = "https://www.radaprojo.live";
    if (isClient) {
      safeLog("Fetching normal predictions from:", API_URL + ENDPOINTS.normalPredictions);
    }
    
    // Try direct axios call first to bypass any middleware issues
    const directResponse = await axios.get(API_URL + ENDPOINTS.normalPredictions);
    const response = directResponse.data;
    
    if (isClient) {
      safeLog("Normal predictions response:", response);
    }
    
    // Validate response
    if(!response) {
      return createEmptyForecast('No data received from the normal predictions service');
    }
    
    // Handle the specific response format where response is an object with status field
    if (typeof response === 'object' && 'status' in response) {
      if (isClient) {
        safeLog("Received status response from normal predictions:", response.status);
      }
      
      // If it's a success status but no actual predictions, create a placeholder
      if (response.status === "success") {
        return {
          forecasts: [],
          lastUpdated: new Date().toISOString(),
          error: 'No prediction data available yet. Try generating new predictions.'
        };
      }
      
      return createEmptyForecast(`API status: ${response.status}`);
    }
    
    // Check if response is an array
    if (!Array.isArray(response)) {
      safeError("Normal predictions response is not an array:", response);
      return createEmptyForecast('Invalid normal predictions format - expected an array');
    }
    
    // Handle empty array response
    if (response.length === 0) {
      return createEmptyForecast('Empty normal predictions response');
    }
    
    // Process response data using our helper function
    const transformedData = {
      forecasts: response.map(item => processForecastItem(item)),
      lastUpdated: response[0]?.updated_at || new Date().toISOString(),
    };
    
    // Cache the result
    if (isClient && transformedData.forecasts.length > 0) {
      setToCache(CACHE_KEYS.NORMAL_PREDICTIONS, transformedData);
    }
    
    return transformedData;
  } catch (error) {
    if(axios.isAxiosError(error)) {
      // Log actual error details for debugging
      if (error.response) {
        safeError("API Error (normal predictions):", error.response.status, error.message);
      } else if (error.request) {
        safeError("Request Error (normal predictions):", error.message, error.code);
      } else {
        safeError("Axios Config Error (normal predictions):", error.message);
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
    
    safeError("Failed to fetch normal predictions:", error);
    
    // Always return empty forecast instead of throwing to prevent page crashes
    return createEmptyForecast('Unknown error fetching normal predictions');
  }
}

// Only trigger predictions on demand - not during regular page loads
export async function triggerPredictions(): Promise<{ success: boolean; message: string }> {
  const isClient = typeof window !== 'undefined';
  
  try {
    // Direct API request with hardcoded URL
    const API_URL = "https://www.radaprojo.live";
    if (isClient) {
      safeLog("Triggering predictions from:", API_URL + ENDPOINTS.triggerPredictions);
    }
    
    // Use POST method as required by the server
    const directResponse = await axios.post(API_URL + ENDPOINTS.triggerPredictions, {}, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      withCredentials: false,
      timeout: 2000 // 2 second timeout
    });
    const response = directResponse.data;
    
    if (!response) {
      return {
        success: false,
        message: 'No response from trigger predictions endpoint'
      };
    }
    
    // Handle the specific response structure from the server
    if (response.status) {
      safeLog("Trigger predictions response:", response.status);
    }
    
    // Clear all caches to ensure fresh data on next fetch
    if (isClient) {
      sessionStorage.removeItem(CACHE_KEYS.FORECAST);
      sessionStorage.removeItem(CACHE_KEYS.NORMAL_PREDICTIONS);
      sessionStorage.removeItem(CACHE_KEYS.TODAY_FORECAST);
      sessionStorage.removeItem(CACHE_KEYS.TRENDS);
    }
    
    return {
      success: true,
      message: response.status || 'Successfully triggered new predictions'
    };
  } catch (error) {
    safeError("Failed to trigger predictions:", error);
    // Provide more detailed error information if available
    let errorMessage = 'Failed to trigger new predictions. Please try again later.';
    
    if (axios.isAxiosError(error)) {
      if (error.response) {
        errorMessage = `Server error (${error.response.status}): ${error.message}`;
      } else if (error.request) {
        errorMessage = 'Network error: Server not responding';
      }
    }
    
    return {
      success: false,
      message: errorMessage
    };
  }
}

// Function to clear all forecast caches
export function clearForecastCaches(): void {
  if (typeof window === 'undefined') return;
  
  Object.values(CACHE_KEYS).forEach(key => {
    sessionStorage.removeItem(key);
  });
  
  safeLog('All forecast caches cleared');
}

// Function to prefetch data in background (for use during navigation)
export async function prefetchForecastData(): Promise<void> {
  // Check if we're on the client side
  if (typeof window === 'undefined') return;
  
  // Only prefetch if we're online
  if (!navigator.onLine) return;
  
  // First, check if we already have cached data
  const cachedForecast = getFromCache<WeeklyForecast>(CACHE_KEYS.FORECAST);
  
  try {
    // Fetch forecast data in the background with a short timeout
    const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://www.radaprojo.live";
    safeLog("Prefetching forecast data...");
    
    // Perform a faster, lower priority fetch for preloading
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 second timeout for prefetch
    
    const prefetchPromise = axios.get(API_URL + ENDPOINTS.predictions, {
      signal: controller.signal,
      headers: {
        'Priority': 'low',
        'Purpose': 'prefetch'
      }
    });
    
    // Use Promise.race to handle both success and timeout gracefully
    const response = await Promise.race([
      prefetchPromise,
      // Add a delay promise that resolves if we already have cached data
      new Promise<{data: null}>(resolve => {
        setTimeout(() => resolve({ data: null }), cachedForecast ? 1000 : 2000);
      })
    ]);
    
    clearTimeout(timeoutId);
    
    // Process response if we got one
    if (response && 'data' in response && response.data) {
      const data = response.data;
      
      if (Array.isArray(data) && data.length > 0) {
        const transformedData = {
          forecasts: data.map(item => processForecastItem(item)),
          lastUpdated: data[0]?.updated_at || new Date().toISOString(),
        };
        
        // Cache the result
        setToCache(CACHE_KEYS.FORECAST, transformedData);
        safeLog("Successfully prefetched and cached forecast data");
      }
    }
  } catch (error) {
    // Silently fail for prefetch - we don't want to disrupt the user experience
    if (axios.isAxiosError(error) && error.name === 'AbortError') {
      safeLog("Prefetch aborted due to timeout");
    } else {
      safeError("Error during prefetch:", error);
    }
  }
  
  // Also prefetch today's forecast data if needed
  if (!getFromCache(CACHE_KEYS.TODAY_FORECAST)) {
    try {
      getTodayForecast(true).catch(() => {}); // Silently fail
    } catch (e) {} // Ignore errors
  }
}
