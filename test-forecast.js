const axios = require('axios');

// API Configuration
const API_BASE_URL = 'https://www.radaprojo.live';
const ENDPOINTS = {
  predictions: '/preds/',
  normalPredictions: '/normal_preds',
  triggerPredictions: '/trigger_preds',
};

// Test function
async function testForecastAPI() {
  try {
    console.log('--- TESTING FORECAST API ---');
    // Test the predictions endpoint
    console.log(`Testing predictions endpoint: ${API_BASE_URL}${ENDPOINTS.predictions}`);
    const response = await axios.get(`${API_BASE_URL}${ENDPOINTS.predictions}`);
    
    console.log('Response status:', response.status);
    console.log('Data type:', typeof response.data);
    console.log('Is array:', Array.isArray(response.data));
    
    if (Array.isArray(response.data)) {
      console.log('Number of items:', response.data.length);
      if (response.data.length > 0) {
        console.log('First item sample:', JSON.stringify(response.data[0], null, 2));
      } else {
        console.log('Empty array received');
      }
    } else {
      console.log('Data received:', JSON.stringify(response.data, null, 2));
    }
    
    console.log('Forecast API test completed successfully!');
  } catch (error) {
    console.error('ERROR TESTING FORECAST API:');
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
      console.error('Headers:', error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('Request error:', error.message);
      console.error('Request details:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error:', error.message);
    }
  }
}

// Run the test
testForecastAPI(); 