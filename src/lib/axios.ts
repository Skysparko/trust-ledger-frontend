import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from "axios";

// Get base URL from environment variable or default to API endpoint
// Next.js environment variables are loaded at build time, so we read from process.env
const getBaseURL = (): string => {
  // Priority: API_URL (server-side) > NEXT_PUBLIC_API_URL (both) > default
  // According to cURL docs, API is at http://localhost:3000
  const baseURL = 
    process.env.API_URL || 
    process.env.NEXT_PUBLIC_API_URL || 
    "http://localhost:3000/api";
  
  // Debug log in development
  if (process.env.NODE_ENV === "development") {
    console.log("[Axios] Base URL configured:", baseURL);
    console.log("[Axios] NEXT_PUBLIC_API_URL:", process.env.NEXT_PUBLIC_API_URL);
    console.log("[Axios] API_URL:", process.env.API_URL);
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

// Helper function to check if URL is an admin endpoint (needs admin token)
const isAdminEndpoint = (url: string, method?: string): boolean => {
  if (!url) return false;
  
  // Extract path from URL (handles both absolute and relative URLs)
  let urlPath = url;
  try {
    if (url.includes("://")) {
      // Absolute URL
      urlPath = new URL(url).pathname;
    } else {
      // Relative URL - extract path part (before query string)
      urlPath = url.split("?")[0];
    }
  } catch {
    // If URL parsing fails, use the original string
    urlPath = url.split("?")[0];
  }
  
  // Admin API endpoints that require admin token
  // For investment-opportunities: GET requests can use regular user token, POST/PUT/DELETE need admin token
  const isInvestmentOpportunities = urlPath.includes("/investment-opportunities");
  if (isInvestmentOpportunities) {
    // Only POST, PUT, DELETE need admin token (super admin)
    // GET requests can use regular user token
    const isReadOnly = method === "GET" || !method || method === "get";
    return !isReadOnly; // Returns true only for write operations
  }
  
  // Other admin endpoints always need admin token
  return (
    urlPath.startsWith("/admin/") ||
    urlPath.startsWith("/api/admin/") ||
    urlPath.includes("/admin/")
  );
};

// Helper function to get auth token from cookies or localStorage
const getAuthToken = (url: string, needsAdminToken: boolean): string | null => {
  if (typeof document === "undefined") return null;
  
  // For admin endpoints, prioritize admin_token
  if (needsAdminToken) {
    // First, check admin_token in cookies
    const cookies = document.cookie.split(";");
    for (let cookie of cookies) {
      const [name, value] = cookie.trim().split("=");
      if (name === "admin_token") {
        const tokenValue = decodeURIComponent(value);
        if (tokenValue && tokenValue !== "undefined" && tokenValue !== "null") {
          return tokenValue;
        }
      }
    }
    
    // Check admin token in localStorage (admin_user)
    try {
      const adminUser = localStorage.getItem("admin_user");
      if (adminUser) {
        const parsed = JSON.parse(adminUser);
        if (parsed?.token && parsed.token !== "undefined" && parsed.token !== "null") {
          return parsed.token;
        }
      }
    } catch {
      // Ignore parsing errors
    }
    
    // Check admin_token in localStorage
    try {
      const token = localStorage.getItem("admin_token");
      if (token && token !== "undefined" && token !== "null") {
        return token;
      }
    } catch {
      // Ignore parsing errors
    }
  } else {
    // For regular user endpoints, use auth_token
    // First, check auth_token in cookies
    const cookies = document.cookie.split(";");
    for (let cookie of cookies) {
      const [name, value] = cookie.trim().split("=");
      if (name === "auth_token" || name === "token") {
        const tokenValue = decodeURIComponent(value);
        if (tokenValue && tokenValue !== "undefined" && tokenValue !== "null") {
          return tokenValue;
        }
      }
    }
    
    // Check auth_token in localStorage
    try {
      const token = localStorage.getItem("auth_token");
      if (token && token !== "undefined" && token !== "null") {
        return token;
      }
    } catch {
      // Ignore parsing errors
    }
  }
  
  return null;
};

// Request interceptor: add auth token to headers
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get the full URL (baseURL + url)
    const fullUrl = config.url ? `${config.baseURL || ""}${config.url}` : config.baseURL || "";
    const method = config.method?.toUpperCase();
    const needsAdminToken = isAdminEndpoint(fullUrl, method);
    const token = getAuthToken(fullUrl, needsAdminToken);
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Debug logging in development
    if (process.env.NODE_ENV === "development") {
      console.log(`[API Request] ${method} ${fullUrl}`, {
        isAdmin: needsAdminToken,
        tokenType: needsAdminToken ? "admin_token" : "auth_token",
        headers: config.headers,
        data: config.data,
      });
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
    // Debug logging in development
    if (process.env.NODE_ENV === "development") {
      console.log(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url}`, {
        status: response.status,
        data: response.data,
      });
    }
    return response;
  },
  (error: AxiosError) => {
    // Debug logging in development
    if (process.env.NODE_ENV === "development") {
      console.error(`[API Error] ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
        status: error.response?.status,
        message: error.message,
        data: error.response?.data,
      });
    }
    // Handle 401 Unauthorized - redirect to login
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        // Clear auth data
        document.cookie = "auth_token=; Max-Age=0; path=/";
        document.cookie = "auth=; Max-Age=0; path=/";
        document.cookie = "token=; Max-Age=0; path=/";
        localStorage.removeItem("auth_token");
        localStorage.removeItem("auth_user");
        
        // Only redirect to login if not already there and not an admin route
        const currentPath = window.location.pathname;
        if (
          !currentPath.includes("/login") && 
          !currentPath.includes("/admin/login") &&
          !currentPath.includes("/signup") &&
          !currentPath.includes("/reset")
        ) {
          // Use router if available, otherwise use window.location
          setTimeout(() => {
            window.location.href = "/login";
          }, 100);
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

