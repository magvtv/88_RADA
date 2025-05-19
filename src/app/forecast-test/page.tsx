"use client";

import { useState, useEffect } from 'react';
import { useForecastData } from '@/hooks/useForecastData';
import { ForecastCard } from '@/components/forecast/ForecastCard';

export default function ForecastTest() {
  const { weeklyForecast, todayForecast, loading, error, refetch } = useForecastData();
  
  // For direct API testing
  const [directData, setDirectData] = useState<any>(null);
  const [directLoading, setDirectLoading] = useState(false);
  
  // Fetch data directly from API for comparison
  useEffect(() => {
    const fetchDirectData = async () => {
      try {
        setDirectLoading(true);
        const response = await fetch('https://www.radaprojo.live/preds/');
        if (!response.ok) {
          throw new Error(`API returned ${response.status}`);
        }
        const data = await response.json();
        console.log('Direct API data:', data);
        setDirectData(data);
      } catch (err) {
        console.error('Direct API error:', err);
      } finally {
        setDirectLoading(false);
      }
    };
    
    fetchDirectData();
  }, []);
  
  return (
    <div className="container p-6">
      <h1 className="text-2xl font-bold mb-4">Forecast Test Page</h1>
      
      <div className="mb-4">
        <button 
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mr-4"
          onClick={refetch}
        >
          Refresh Data from Hook
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Hook Data */}
        <div className="border p-4 rounded-lg">
          <h2 className="text-xl font-bold mb-2">Data from Hook</h2>
          {loading && <p>Loading...</p>}
          {error && <p className="text-red-500">{error}</p>}
          
          {weeklyForecast && (
            <div>
              <h3 className="font-semibold mt-4 mb-2">Weekly Forecast Structure:</h3>
              <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-[200px]">
                {JSON.stringify(weeklyForecast, null, 2)}
              </pre>
              
              <h3 className="font-semibold mt-4 mb-2">First Forecast Item:</h3>
              {weeklyForecast.forecasts.length > 0 ? (
                <div className="mt-4">
                  <ForecastCard 
                    forecast={weeklyForecast.forecasts[0]} 
                    isHighlighted={true}
                  />
                </div>
              ) : (
                <p>No forecast items available</p>
              )}
            </div>
          )}
        </div>
        
        {/* Direct API Data */}
        <div className="border p-4 rounded-lg">
          <h2 className="text-xl font-bold mb-2">Direct API Data</h2>
          {directLoading && <p>Loading...</p>}
          
          {directData && (
            <div>
              <h3 className="font-semibold mt-4 mb-2">Raw API Response Structure:</h3>
              <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-[200px]">
                {JSON.stringify(directData[0], null, 2)}
              </pre>
              
              {directData.length > 0 && (
                <div className="mt-4">
                  <h3 className="font-semibold mb-2">First Item Converted to ForecastCard:</h3>
                  <ForecastCard 
                    forecast={{
                      date: directData[0].date,
                      day: directData[0].day,
                      weatherData: {
                        drought_probability: directData[0].drought_probability,
                        flood_probability: directData[0].flood_probability,
                        condition: `${directData[0].drought_probability > 50 ? 'High' : 'Low'} drought | ${directData[0].flood_probability > 50 ? 'High' : 'Low'} flood`
                      },
                      created_at: directData[0].created_at,
                      updated_at: directData[0].updated_at
                    }}
                    isHighlighted={true}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {weeklyForecast && weeklyForecast.forecasts.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-4">All Forecast Cards from Hook</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {weeklyForecast.forecasts.map((forecast, index) => (
              <ForecastCard 
                key={index}
                forecast={forecast}
                isHighlighted={index === 0}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 