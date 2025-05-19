"use client";

import { useForecastData } from '@/hooks/useForecastData';

export default function TestHookPage() {
  const { weeklyForecast, todayForecast, loading, error, refetch } = useForecastData();

  return (
    <div className="container p-6">
      <h1 className="text-2xl font-bold mb-4">Forecast Hook Test Page</h1>
      
      <div className="mb-4">
        <button 
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={refetch}
        >
          Refresh Data
        </button>
      </div>
      
      {loading && <p className="text-gray-500">Loading forecast data...</p>}
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p><strong>Error:</strong> {error}</p>
        </div>
      )}
      
      {todayForecast && (
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-2">Today's Forecast</h2>
          <div className="border rounded p-4 bg-white shadow">
            <p><strong>Date:</strong> {todayForecast.date}</p>
            <p><strong>Day:</strong> {todayForecast.day}</p>
            <p><strong>Drought Probability:</strong> {todayForecast.weatherData.drought_probability}%</p>
            <p><strong>Flood Probability:</strong> {todayForecast.weatherData.flood_probability}%</p>
            <p><strong>Condition:</strong> {todayForecast.weatherData.condition}</p>
          </div>
        </div>
      )}
      
      {weeklyForecast && (
        <div>
          <h2 className="text-xl font-bold mb-2">Weekly Forecast</h2>
          <p className="text-gray-500 mb-4">Last updated: {new Date(weeklyForecast.lastUpdated).toLocaleString()}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {weeklyForecast.forecasts.map((forecast, index) => (
              <div key={index} className="border rounded p-4 bg-white shadow">
                <p><strong>Date:</strong> {forecast.date}</p>
                <p><strong>Day:</strong> {forecast.day}</p>
                <p><strong>Drought Probability:</strong> {forecast.weatherData.drought_probability}%</p>
                <p><strong>Flood Probability:</strong> {forecast.weatherData.flood_probability}%</p>
                <p><strong>Condition:</strong> {forecast.weatherData.condition}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 