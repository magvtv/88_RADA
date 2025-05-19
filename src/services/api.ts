import axios, { type AxiosInstance, type AxiosRequestConfig } from "axios";

// Base API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://www.radaprojo.live';
const CSRF_TOKEN = process.env.NEXT_PUBLIC_CSRF_TOKEN;

// Log API configuration for debugging
console.log("Using API BASE URL:", API_BASE_URL);


export const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 3000, //3 seconds - reasonable timeout for API calls
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  },
  withCredentials: false // Keep false to avoid CORS issues with credentials
});

// Request interceptor
axiosInstance.interceptors.request.use(
  async (config) => {
    // If in browser, try to get the token from session
    if (typeof window !== 'undefined') {
      try {
        // Get session from localStorage if available
        const session = sessionStorage.getItem('next-auth.session-token') || 
                       localStorage.getItem('next-auth.session-token');
        
        if (session) {
          config.headers["Authorization"] = `Bearer ${session}`;
        }
      } catch (error) {
        console.error("Failed to get auth token:", error);
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Reusable API functions with type safety
export async function apiGet<T>(
  url: string,
  config?: AxiosRequestConfig
): Promise<T> {
  try {
    console.log(`Making API request to: ${url}`);
    console.log(`Full URL: ${API_BASE_URL}${url}`);
    
    const startTime = Date.now();
    const response = await axiosInstance.get(url, config);
    const duration = Date.now() - startTime;
    
    console.log(`API response from ${url} received in ${duration}ms:`, 
                response.status, 
                Array.isArray(response.data) ? `Array[${response.data.length}]` : typeof response.data);
    
    return response.data;

  } catch (error) {
    // Here we would handle the error (logging, retry, etc.)
    if (axios.isAxiosError(error)) {
      if (error.response) {
        // Server returned an error response
        console.error(`API error ${error.response.status} for ${url}:`, error.response.data);
      } else if (error.request) {
        // Request was made but no response received
        console.error(`Network error for ${url} (no response):`, error.message, error.code);
      } else {
        // Something happened in setting up the request
        console.error(`Request setup error for ${url}:`, error.message);
      }
    } else {
      console.error(`Non-axios error for ${url}:`, error);
    }
    
    throw error;
  }
}

export async function apiPost<T>(
  url: string,
  data: any,
  config?: AxiosRequestConfig
): Promise<T> {
  try {
    console.log(`Making POST API request to: ${url}`);
    
    const startTime = Date.now();
    const response = await axiosInstance.post(url, data, config);
    const duration = Date.now() - startTime;
    
    console.log(`API POST response from ${url} received in ${duration}ms:`, 
                response.status);
    
    return response.data;
  } catch (error) {
    // Error handling similar to apiGet
    if (axios.isAxiosError(error)) {
      if (error.response) {
        console.error(`API POST error ${error.response.status} for ${url}:`, error.response.data);
      } else if (error.request) {
        console.error(`Network error for POST ${url}:`, error.message, error.code);
      } else {
        console.error(`Request setup error for POST ${url}:`, error.message);
      }
    } else {
      console.error(`Non-axios error for POST ${url}:`, error);
    }
    
    throw error;
  }
}

export async function apiPut<T>(
  url: string,
  data: any,
  config?: AxiosRequestConfig
): Promise<T> {
  try {
    console.log(`Making PUT API request to: ${url}`);
    
    const startTime = Date.now();
    const response = await axiosInstance.put(url, data, config);
    const duration = Date.now() - startTime;
    
    console.log(`API PUT response from ${url} received in ${duration}ms:`, 
                response.status);
    
    return response.data;
  } catch (error) {
    // Error handling similar to apiGet
    if (axios.isAxiosError(error)) {
      if (error.response) {
        console.error(`API PUT error ${error.response.status} for ${url}:`, error.response.data);
      } else if (error.request) {
        console.error(`Network error for PUT ${url}:`, error.message, error.code);
      } else {
        console.error(`Request setup error for PUT ${url}:`, error.message);
      }
    } else {
      console.error(`Non-axios error for PUT ${url}:`, error);
    }
    
    throw error;
  }
}

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle global error responses here
    if (error.response) {
      // Server returned an error response
      console.error("API Error:", error.response.status, error.response.data);
    } else if (error.request) {
      // Request was made but no response received
      console.error("Network Error:", error.request);
    } else {
      // Something else happened while setting up the request
      console.error("Error:", error.message);
    }
    return Promise.reject(error);
  }
);



