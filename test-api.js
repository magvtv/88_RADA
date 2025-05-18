/**
 * API-only Authentication Test Script
 * Run with: bun test-api.js
 * 
 * This script only tests direct API calls without browser automation
 */

const axios = require('axios');

// Configuration
const config = {
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'https://radabackend.southafricanorth.cloudapp.azure.com',
  credentials: {
    email: 'test@example.com',
    password: 'Password123!',
  },
};

/**
 * Test authentication API endpoints
 */
async function testApiAuth() {
  console.log('Starting API authentication tests...');
  
  // 1. Test registration/signup
  await testSignup();
  
  // 2. Test login
  await testLogin();
  
  console.log('\nAPI tests completed!');
}

/**
 * Test the signup API
 */
async function testSignup() {
  console.log('\n--- TESTING SIGNUP API ---');
  try {
    console.log(`Testing signup to: ${config.apiBaseUrl}/auth/registration/`);
    const response = await axios.post(
      `${config.apiBaseUrl}/auth/registration/`,
      {
        email: config.credentials.email,
        password1: config.credentials.password,
        password2: config.credentials.password
      },
      {
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
    
    console.log('Signup response status:', response.status);
    console.log('Signup response data:', response.data);
    console.log('Signup successful!');
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Signup failed with response:', error.response?.status, error.response?.data);
    } else {
      console.error('Signup failed with error:', error);
    }
  }
}

/**
 * Test the login API
 */
async function testLogin() {
  console.log('\n--- TESTING LOGIN API ---');
  try {
    console.log(`Testing login to: ${config.apiBaseUrl}/auth/login/`);
    const response = await axios.post(
      `${config.apiBaseUrl}/auth/login/`,
      {
        email: config.credentials.email,
        password: config.credentials.password,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
    
    console.log('Login response status:', response.status);
    console.log('Login response data:', response.data);
    console.log('Login successful!');
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Login failed with response:', error.response?.status, error.response?.data);
    } else {
      console.error('Login failed with error:', error);
    }
  }
}

// Run the tests
testApiAuth().catch(console.error); 