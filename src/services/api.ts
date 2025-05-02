import axios, { type AxiosInstance, type AxiosRequestConfig } from "axios";

// Base API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const CSRF_TOKEN = process.env.NEXT_PUBLIC_CSRF_TOKEN;

if (!API_BASE_URL) {
  throw new Error("API_BASE_URL is not defined in environment variables.");
}


export const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 15 seconds
  headers: {
    "Content-Type": "application/json",
    "accept": "applications/json",
    "X-CSRFTOKEN": CSRF_TOKEN,
    "Access-Control-Allow-Origin": "*",
  },
  withCredentials: true
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // ensure the CSRF token is included in every request
    if(CSRF_TOKEN) {
      config.headers["X-CSRFTOKEN"] = CSRF_TOKEN;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// // Response interceptor
// axiosInstance.interceptors.response.use(
//   (response) => {
//     return response;
//   },
//   (error) => {
//     // Handle global error responses here
//     if (error.response) {
//       // Server returned an error response
//       console.error("API Error:", error.response.status, error.response.data);
//     } else if (error.request) {
//       // Request was made but no response received
//       console.error("Network Error:", error.request);
//     } else {
//       // Something else happened while setting up the request
//       console.error("Error:", error.message);
//     }
//     return Promise.reject(error);
//   }
// );

// Reusable API functions with type safety
export async function apiGet<T>(
  url: string,
  config?: AxiosRequestConfig
): Promise<T> {
  try {
    const response = await axiosInstance.get(url, config);
    return response.data;
  } catch (error) {
    // Here we would handle the error (logging, retry, etc.)
    console.error(`GET request to ${url} failed:`, error);
    throw error;
  }
}

