import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from "axios";

// Get base URL from environment variable or default to API endpoint
// Next.js environment variables are loaded at build time, so we read from process.env
const getBaseURL = (): string => {
  // Priority: API_URL (server-side) > NEXT_PUBLIC_API_URL (both) > default
  const baseURL = 
    process.env.API_URL || 
    process.env.NEXT_PUBLIC_API_URL || 
    "http://localhost:8000/api";
  
  // Debug log in development
  if (process.env.NODE_ENV === "development") {
    console.log("[Axios] Base URL configured:", baseURL);
    console.log("[Axios] NEXT_PUBLIC_API_URL:", process.env.NEXT_PUBLIC_API_URL);
  }
  
  return baseURL;
};

// Create axios instance with default config
export const axiosInstance: AxiosInstance = axios.create({
  baseURL: getBaseURL(),
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Helper function to get auth token from cookies
const getAuthToken = (): string | null => {
  if (typeof document === "undefined") return null;
  
  const cookies = document.cookie.split(";");
  for (let cookie of cookies) {
    const [name, value] = cookie.trim().split("=");
    if (name === "auth_token" || name === "token") {
      return decodeURIComponent(value);
    }
  }
  
  // Fallback: check localStorage for token
  try {
    const authData = localStorage.getItem("auth_token");
    if (authData) {
      const parsed = JSON.parse(authData);
      return typeof parsed === "string" ? parsed : parsed?.token || null;
    }
  } catch {
    // Ignore parsing errors
  }
  
  return null;
};

// Request interceptor: add auth token to headers
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAuthToken();
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor: handle 401 and error messages
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    // Handle 401 Unauthorized - redirect to login
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        // Clear auth data
        document.cookie = "auth_token=; Max-Age=0; path=/";
        localStorage.removeItem("auth_token");
        localStorage.removeItem("auth_user");
        
        // Redirect to login if not already there
        const currentPath = window.location.pathname;
        if (!currentPath.includes("/login") && !currentPath.includes("/admin/login")) {
          window.location.href = "/login";
        }
      }
    }
    
    // Extract error message from response
    const errorMessage = 
      (error.response?.data as any)?.message ||
      (error.response?.data as any)?.error ||
      error.message ||
      "An unexpected error occurred";
    
    // Create enhanced error with message
    const enhancedError = new Error(errorMessage);
    (enhancedError as any).status = error.response?.status;
    (enhancedError as any).data = error.response?.data;
    
    return Promise.reject(enhancedError);
  }
);

export default axiosInstance;

