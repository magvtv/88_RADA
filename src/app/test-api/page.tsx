"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';

export default function TestApiPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const API_URL = 'https://www.radaprojo.live';
        console.log("Fetching from:", API_URL + '/preds/');
        
        const response = await axios.get(`${API_URL}/preds/`);
        console.log("Response:", response.data);
        setData(response.data);
        setError(null);
      } catch (err: any) {
        console.error("API Error:", err);
        setError(err.message || 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="container p-6">
      <h1 className="text-2xl font-bold mb-4">API Test Page</h1>
      
      {loading && <p>Loading...</p>}
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p><strong>Error:</strong> {error}</p>
        </div>
      )}
      
      {data && (
        <div className="mt-4">
          <h2 className="text-xl font-bold mb-2">API Response:</h2>
          <div className="bg-gray-100 p-4 rounded overflow-auto max-h-[500px]">
            <pre>{JSON.stringify(data, null, 2)}</pre>
          </div>
          
          <h3 className="text-lg font-bold mt-6 mb-2">Forecast Items:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.isArray(data) && data.map((item, index) => (
              <div key={index} className="border rounded p-4 bg-white shadow">
                <p><strong>Date:</strong> {item.date}</p>
                <p><strong>Day:</strong> {item.day}</p>
                <p><strong>Drought Probability:</strong> {item.drought_probability}%</p>
                <p><strong>Flood Probability:</strong> {item.flood_probability}%</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 