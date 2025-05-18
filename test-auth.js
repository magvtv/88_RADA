/**
 * Authentication Test Script
 * Run with: bun test-auth.js
 * 
 * This script tests both direct API calls and UI-based authentication
 */

const puppeteer = require('puppeteer');
const axios = require('axios');

// Configuration
const config = {
  baseUrl: 'http://localhost:3000',
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'https://radabackend.southafricanorth.cloudapp.azure.com',
  signupPath: '/auth/signup',
  loginPath: '/auth/login',
  credentials: {
    email: 'test@example.com',
    password: 'Password123!',
  },
  timeout: 30000,
};

/**
 * Test signup and login flow
 */
async function testAuth() {
  console.log('Starting authentication tests...');
  
  // First test direct API calls
  await testDirectApiCalls();
  
  const browser = await puppeteer.launch({ 
    headless: false, // Set to true for headless mode
    slowMo: 100,     // Slow down by 100ms per operation for visibility
  });
  
  const page = await browser.newPage();
  
  try {
    // Enable console logs from the browser
    page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
    
    // 1. Test Signup
    console.log('\n--- TESTING SIGNUP ---');
    await testSignup(page);
    
    // 2. Test Login
    console.log('\n--- TESTING LOGIN ---');
    await testLogin(page);
    
    console.log('\nTests completed successfully!');
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    // Uncomment to close browser automatically
    // await browser.close();
  }
}

/**
 * Test direct API calls to the backend
 */
async function testDirectApiCalls() {
  console.log('\n--- TESTING DIRECT API CALLS ---');
  
  // Test backend login endpoint
  try {
    console.log(`Testing direct login to: ${config.apiBaseUrl}/auth/login/`);
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
    
    console.log('Direct login response status:', response.status);
    console.log('Direct login response data:', response.data);
    console.log('Direct login successful!');
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Direct login failed with response:', error.response?.status, error.response?.data);
    } else {
      console.error('Direct login failed with error:', error);
    }
  }
}

/**
 * Test the signup process
 */
async function testSignup(page) {
  console.log(`Navigating to signup page: ${config.baseUrl}${config.signupPath}`);
  await page.goto(`${config.baseUrl}${config.signupPath}`, { waitUntil: 'networkidle2' });
  
  console.log('Filling signup form...');
  
  // Enter email
  await page.type('#email', config.credentials.email);
  console.log(`Entered email: ${config.credentials.email}`);
  
  // Enter password
  await page.type('#password', config.credentials.password);
  console.log('Entered password');
  
  // Enter confirm password
  await page.type('#confirmPassword', config.credentials.password);
  console.log('Entered confirm password');
  
  // Click signup button
  console.log('Submitting signup form...');
  await Promise.all([
    page.click('button[type="submit"]'),
    page.waitForNavigation({ timeout: config.timeout }).catch(() => {})
  ]);
  
  // Wait for toasts
  await page.waitForTimeout(2000);
  
  console.log('Signup process completed');
}

/**
 * Test the login process
 */
async function testLogin(page) {
  console.log(`Navigating to login page: ${config.baseUrl}${config.loginPath}`);
  await page.goto(`${config.baseUrl}${config.loginPath}`, { waitUntil: 'networkidle2' });
  
  console.log('Filling login form...');
  
  // Enter email
  await page.type('#email', config.credentials.email);
  console.log(`Entered email: ${config.credentials.email}`);
  
  // Enter password
  await page.type('#password', config.credentials.password);
  console.log('Entered password');
  
  // Click login button
  console.log('Submitting login form...');
  await Promise.all([
    page.click('button[type="submit"]'),
    page.waitForNavigation({ timeout: config.timeout }).catch(() => {})
  ]);
  
  // Wait for toasts
  await page.waitForTimeout(2000);
  
  // Check if we have a failure message
  const errorToast = await page.evaluate(() => {
    const toasts = Array.from(document.querySelectorAll('[role="status"]'));
    const errorToast = toasts.find(toast => 
      toast.textContent.includes('Invalid credentials') || 
      toast.textContent.includes('error') ||
      toast.textContent.includes('failed')
    );
    return errorToast ? errorToast.textContent : null;
  });
  
  if (errorToast) {
    console.error('Login failed with message:', errorToast);
  } else {
    console.log('Login successful!');
  }
}

// Run the tests
testAuth().catch(console.error); 