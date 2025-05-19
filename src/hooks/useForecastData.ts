import { useState, useEffect } from 'react';
import axios from 'axios';
import { WeeklyForecast, DailyForecast } from '@/types/forecast';

// API Configuration
const API_URL = 'https://www.radaprojo.live';
const ENDPOINTS = {
  predictions: '/preds/',
  normalPredictions: '/normal_preds',
  triggerPredictions: '/trigger_preds',
};

interface ForecastDataState {
  weeklyForecast: WeeklyForecast | null;
  todayForecast: DailyForecast | null;
  loading: boolean;
  isBackgroundLoading: boolean;
  error: string | null;
  refetch: (showLoading?: boolean) => Promise<void>;
}

export function useForecastData(): ForecastDataState {
  const [weeklyForecast, setWeeklyForecast] = useState<WeeklyForecast | null>(null);
  const [todayForecast, setTodayForecast] = useState<DailyForecast | null>(null);
  const [loading, setLoading] = useState(true);
  const [isBackgroundLoading, setIsBackgroundLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      } else {
        setIsBackgroundLoading(true);
      }
      setError(null);
      
      // Fetch data from the API
      const response = await axios.get(`${API_URL}${ENDPOINTS.predictions}`, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        withCredentials: false,
        timeout: 5000 // 5 second timeout
      });
      
      const data = response.data;
      
      // Validate response
      if (!data || !Array.isArray(data) || data.length === 0) {
        throw new Error('Invalid or empty data received from API');
      }
      
      // Process the weekly forecast data
      const processedData: WeeklyForecast = {
        forecasts: data.map(item => ({
          date: item.date,
          day: item.day,
          weatherData: {
            drought_probability: item.drought_probability,
            flood_probability: item.flood_probability,
            condition: getCondition(item.drought_probability, item.flood_probability)
          },
          created_at: item.created_at,
          updated_at: item.updated_at
        })),
        lastUpdated: data[0]?.updated_at || new Date().toISOString()
      };
      
      // Extract today's forecast
      const todayData = processedData.forecasts[0];
      
      setWeeklyForecast(processedData);
      setTodayForecast(todayData);
    } catch (err: any) {
      console.error('Error fetching forecast data:', err);
      setError(err.message || 'Failed to fetch forecast data');
    } finally {
      setLoading(false);
      setIsBackgroundLoading(false);
    }
  };

  // Helper function to determine condition based on probabilities
  function getCondition(droughtProb: number, floodProb: number): string {
    if (droughtProb === undefined || droughtProb === null || 
        floodProb === undefined || floodProb === null) {
      return "Unknown conditions";
    }
    
    if (isNaN(droughtProb) || isNaN(floodProb) || droughtProb < 0 || floodProb < 0) {
      return "Invalid data";
    }
    
    const droughtLevel = droughtProb > 70 ? "Severe" : droughtProb > 50 ? "Moderate" : droughtProb > 30 ? "Mild" : "No";
    const floodLevel = floodProb > 70 ? "Severe" : floodProb > 50 ? "Moderate" : floodProb > 30 ? "Mild" : "No";
    return `${droughtLevel} drought | ${floodLevel} flood`;
  }

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, []);

  return {
    weeklyForecast,
    todayForecast,
    loading,
    isBackgroundLoading,
    error,
    refetch: fetchData
  };
} 