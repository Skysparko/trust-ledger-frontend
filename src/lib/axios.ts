import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from "axios";

// Get base URL from environment variable or default to API endpoint
// Next.js environment variables are loaded at build time, so we read from process.env
const getBaseURL = (): string => {
  // In Next.js:
  // - NEXT_PUBLIC_* variables are available on both client and server
  // - Variables without NEXT_PUBLIC_ prefix are ONLY available on the server
  // For client-side code (browser), we should only use NEXT_PUBLIC_API_URL
  // For server-side code (API routes, SSR), we can use API_URL or NEXT_PUBLIC_API_URL
  
  // Check if we're on the client (browser)
  const isClient = typeof window !== 'undefined';
  
  // Priority: NEXT_PUBLIC_API_URL (available everywhere) > default
  // Only use API_URL on server-side
  const baseURL = isClient
    ? (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api")
    : (process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api");
  
  // Debug log in development
  if (process.env.NODE_ENV === "development") {
    console.log("[Axios] Base URL configured:", baseURL);
    console.log("[Axios] NEXT_PUBLIC_API_URL:", process.env.NEXT_PUBLIC_API_URL);
    console.log("[Axios] API_URL:", isClient ? "N/A (client-side)" : process.env.NEXT_PUBLIC_API_URL);
    console.log("[Axios] Environment:", isClient ? "client" : "server");
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
  
  // Blockchain endpoints that require admin token (super admin)
  // Only endpoints with SuperAdminGuard need admin token
  const blockchainAdminEndpoints = [
    "/blockchain/deploy-bond-token",      // SuperAdminGuard
    "/blockchain/wallet-info",            // SuperAdminGuard
    "/blockchain/contract-from-tx",       // SuperAdminGuard
    // Note: mint-bonds and transfer-bonds use UserAuthGuard, not SuperAdminGuard
  ];
  
  const isBlockchainAdminEndpoint = blockchainAdminEndpoints.some(endpoint =>
    urlPath.startsWith(endpoint) ||
    urlPath.startsWith(`/api${endpoint}`) ||
    urlPath.includes(endpoint)
  );
  
  // Other admin endpoints always need admin token
  return (
    urlPath.startsWith("/admin/") ||
    urlPath.startsWith("/api/admin/") ||
    urlPath.includes("/admin/") ||
    isBlockchainAdminEndpoint
  );
};

// Helper function to check if user is logged in
const isUserLoggedIn = (): boolean => {
  if (typeof document === "undefined" || typeof window === "undefined") return false;
  
  try {
    // Check if auth_user exists in localStorage (indicates user is logged in)
    const authUser = localStorage.getItem("auth_user");
    if (authUser) {
      const parsed = JSON.parse(authUser);
      if (parsed && typeof parsed === "object") {
        return true;
      }
    }
    
    // Also check for auth_token as fallback
    const authToken = localStorage.getItem("auth_token");
    if (authToken && authToken !== "undefined" && authToken !== "null") {
      return true;
    }
    
    // Check cookies for auth_token
    const cookies = document.cookie.split(";");
    for (let cookie of cookies) {
      const [name, value] = cookie.trim().split("=");
      if (name === "auth_token" || name === "token") {
        const tokenValue = decodeURIComponent(value);
        if (tokenValue && tokenValue !== "undefined" && tokenValue !== "null") {
          return true;
        }
      }
    }
  } catch {
    // Ignore parsing errors
  }
  
  return false;
};

// Helper function to check if URL is one of the investment-opportunities endpoints that need conditional auth
const isInvestmentOpportunitiesConditionalAuthEndpoint = (url: string): boolean => {
  if (!url) return false;
  
  // Extract path from URL (handles both absolute and relative URLs)
  let urlPath = url;
  try {
    if (url.includes("://")) {
      // Absolute URL - extract pathname
      urlPath = new URL(url).pathname;
    } else {
      // Relative URL - extract path part (before query string)
      urlPath = url.split("?")[0];
    }
  } catch {
    // If URL parsing fails, use the original string (without query params)
    urlPath = url.split("?")[0];
  }
  
  // Normalize path - remove /api prefix if present
  const normalizedPath = urlPath.replace(/^\/api/, "");
  
  // Check if it's one of the specific endpoints that should only send token if user is logged in
  // 1. /investment-opportunities/dropdown
  // 2. /investment-opportunities (base endpoint)
  const isDropdown = normalizedPath === "/investment-opportunities/dropdown";
  const isBaseEndpoint = normalizedPath === "/investment-opportunities";
  
  return isDropdown || isBaseEndpoint;
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
    // Get the URL to check - prefer config.url (relative path) for endpoint matching
    // If config.url is empty or relative, construct full URL from baseURL + url
    const relativeUrl = config.url || "";
    let fullUrl = relativeUrl;
    if (config.baseURL && !relativeUrl.startsWith("http://") && !relativeUrl.startsWith("https://")) {
      // Construct full URL from baseURL + relative URL
      const base = config.baseURL.endsWith("/") ? config.baseURL.slice(0, -1) : config.baseURL;
      const url = relativeUrl.startsWith("/") ? relativeUrl : `/${relativeUrl}`;
      fullUrl = `${base}${url}`;
    }
    
    const method = config.method?.toUpperCase();
    const needsAdminToken = isAdminEndpoint(fullUrl, method);
    
    // Check if this is one of the investment-opportunities endpoints that need conditional auth
    // Check both relative URL and full URL to handle all cases
    const isConditionalAuthEndpoint = 
      isInvestmentOpportunitiesConditionalAuthEndpoint(relativeUrl) || 
      isInvestmentOpportunitiesConditionalAuthEndpoint(fullUrl);
    
    let token: string | null = null;
    
    if (isConditionalAuthEndpoint && method === "GET") {
      // For these specific endpoints, only send token if user is logged in
      const userLoggedIn = isUserLoggedIn();
      if (userLoggedIn) {
        token = getAuthToken(fullUrl, needsAdminToken);
      } else {
        // Explicitly remove Authorization header if user is not logged in
        if (config.headers) {
          delete config.headers.Authorization;
        }
      }
    } else {
      // For all other endpoints, use existing logic
      token = getAuthToken(fullUrl, needsAdminToken);
    }
    
    // Add Authorization header only if token exists
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Debug logging in development
    if (process.env.NODE_ENV === "development") {
      console.log(`[API Request] ${method} ${fullUrl}`, {
        isAdmin: needsAdminToken,
        isConditionalAuth: isConditionalAuthEndpoint,
        userLoggedIn: isConditionalAuthEndpoint ? isUserLoggedIn() : undefined,
        tokenType: needsAdminToken ? "admin_token" : "auth_token",
        hasToken: !!token,
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

