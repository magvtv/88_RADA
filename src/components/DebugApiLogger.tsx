"use client";

import { useEffect } from 'react';
import axios from 'axios';

// This component is only used for debugging API issues
export default function DebugApiLogger() {
  useEffect(() => {
    const testApi = async () => {
      try {
        console.log('Debugging API directly from component');
        
        // Test with the direct API URL
        const apiBaseUrl = 'https://www.radaprojo.live';
        
        console.log('Testing API connection to:', apiBaseUrl + '/preds/');
        try {
          // Use credentials:false to avoid CORS preflight issues
          const response = await axios.get(`${apiBaseUrl}/preds/`, {
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            withCredentials: false,
            timeout: 5000 // 5 second timeout
          });
          
          console.log('API response status:', response.status);
          console.log('API response type:', typeof response.data);
          console.log('Is array:', Array.isArray(response.data));
          
          if (Array.isArray(response.data) && response.data.length > 0) {
            console.log('First data item:', response.data[0]);
            console.log('Data structure validation:');
            const item = response.data[0];
            console.log('- date:', typeof item.date, item.date);
            console.log('- day:', typeof item.day, item.day);
            console.log('- drought_probability:', typeof item.drought_probability, item.drought_probability);
            console.log('- flood_probability:', typeof item.flood_probability, item.flood_probability);
          }
        } catch (error: any) {
          console.error('API test failed:', error.message);
          if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
          }
        }
      } catch (error) {
        console.error('Debug API test failed:', error);
      }
    };
    
    testApi();
  }, []);
  
  // This component doesn't render anything visible
  return null;
} 