import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from "axios";

// Base API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.example.com";

export const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // 15 seconds
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // You can add auth tokens here if needed
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

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

// Reusable API functions with type safety
export async function apiGet<T>(
  url: string,
  config?: AxiosRequestConfig
): Promise<T> {
  try {
    const response: AxiosResponse<T> = await axiosInstance.get(url, config);
    return response.data;
  } catch (error) {
    // Here we would handle the error (logging, retry, etc.)
    console.error(`GET request to ${url} failed:`, error);
    throw error;
  }
}

export async function apiPost<T, D>(
  url: string,
  data?: D,
  config?: AxiosRequestConfig
): Promise<T> {
  try {
    const response: AxiosResponse<T> = await axiosInstance.post(
      url,
      data,
      config
    );
    return response.data;
  } catch (error) {
    console.error(`POST request to ${url} failed:`, error);
    throw error;
  }
}

export async function apiPut<T, D>(
  url: string,
  data?: D,
  config?: AxiosRequestConfig
): Promise<T> {
  try {
    const response: AxiosResponse<T> = await axiosInstance.put(
      url,
      data,
      config
    );
    return response.data;
  } catch (error) {
    console.error(`PUT request to ${url} failed:`, error);
    throw error;
  }
}

export async function apiDelete<T>(
  url: string,
  config?: AxiosRequestConfig
): Promise<T> {
  try {
    const response: AxiosResponse<T> = await axiosInstance.delete(url, config);
    return response.data;
  } catch (error) {
    console.error(`DELETE request to ${url} failed:`, error);
    throw error;
  }
}
