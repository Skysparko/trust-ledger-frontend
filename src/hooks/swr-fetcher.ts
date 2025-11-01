import { Fetcher } from "swr";
import { AuthApi } from "@/api/auth.api";
import { InvestmentApi } from "@/api/investment.api";
import { IssuanceApi } from "@/api/issuance.api";
import { ProjectApi } from "@/api/project.api";
import { AdminApi } from "@/api/admin.api";
import { ProfileApi } from "@/api/profile.api";
import { PublicApi } from "@/api/public.api";

/**
 * SWR Key Patterns
 * Centralized mapping of SWR keys to their corresponding API methods
 */
export const SwrKeys = {
  // Auth
  auth: {
    currentUser: () => "/auth/me",
  },

  // Investments
  investments: {
    all: (filters?: any) => ["/investments", filters],
    detail: (id: string) => `/investments/${id}`,
    stats: () => "/investments/stats",
  },

  // Issuances
  issuances: {
    all: (filters?: any) => ["/issuances", filters],
    detail: (id: string) => `/issuances/${id}`,
    open: () => ["/issuances", { status: "open" }],
    upcoming: () => ["/issuances", { status: "upcoming" }],
  },

  // Projects
  projects: {
    all: (filters?: any) => ["/projects", filters],
    detail: (id: string) => `/projects/${id}`,
  },

  // Profile
  profile: {
    current: () => "/profile",
  },

  // Admin
  admin: {
    stats: () => "/admin/stats",
    users: (filters?: any) => ["/admin/users", filters],
    user: (id: string) => `/admin/users/${id}`,
    transactions: (filters?: any) => ["/admin/transactions", filters],
    transaction: (id: string) => `/admin/transactions/${id}`,
    documents: (filters?: any) => ["/admin/documents", filters],
  },

  // Public
  public: {
    posts: (filters?: any) => ["/posts", filters],
    post: (id: string) => `/posts/${id}`,
    webinars: () => "/webinars",
  },
} as const;

/**
 * SWR Fetcher Functions
 * Maps SWR keys to their corresponding API methods
 */

// Auth fetchers
export const authFetchers = {
  currentUser: (() => AuthApi.getCurrentUser()) as Fetcher<any>,
};

// Investment fetchers
export const investmentFetchers = {
  all: ((key: string, filters?: any) => InvestmentApi.getInvestments(filters)) as Fetcher<any, [string, any?]>,
  detail: ((key: string) => {
    const id = key.split("/").pop() || "";
    return InvestmentApi.getInvestment(id);
  }) as Fetcher<any, string>,
  stats: (() => InvestmentApi.getInvestmentStats()) as Fetcher<any>,
};

// Issuance fetchers
export const issuanceFetchers = {
  all: ((key: string | [string, any?]) => {
    const [endpoint, filters] = Array.isArray(key) ? key : [key, undefined];
    return IssuanceApi.getIssuances(filters);
  }) as Fetcher<any, string | [string, any?]>,
  detail: ((key: string) => {
    const id = key.split("/").pop() || "";
    return IssuanceApi.getIssuance(id);
  }) as Fetcher<any, string>,
  open: (() => IssuanceApi.getOpenIssuances()) as Fetcher<any>,
  upcoming: (() => IssuanceApi.getUpcomingIssuances()) as Fetcher<any>,
};

// Project fetchers
export const projectFetchers = {
  all: ((key: string | [string, any?]) => {
    const [endpoint, filters] = Array.isArray(key) ? key : [key, undefined];
    return ProjectApi.getProjects(filters);
  }) as Fetcher<any, string | [string, any?]>,
  detail: ((key: string) => {
    const id = key.split("/").pop() || "";
    return ProjectApi.getProject(id);
  }) as Fetcher<any, string>,
};

// Profile fetchers
export const profileFetchers = {
  current: (() => ProfileApi.getProfile()) as Fetcher<any>,
};

// Admin fetchers
export const adminFetchers = {
  stats: (() => AdminApi.getStats()) as Fetcher<any>,
  users: ((key: string | [string, any?]) => {
    const [endpoint, filters] = Array.isArray(key) ? key : [key, undefined];
    return AdminApi.getUsers(filters);
  }) as Fetcher<any, string | [string, any?]>,
  user: ((key: string) => {
    const id = key.split("/").pop() || "";
    return AdminApi.getUser(id);
  }) as Fetcher<any, string>,
  transactions: ((key: string | [string, any?]) => {
    const [endpoint, filters] = Array.isArray(key) ? key : [key, undefined];
    return AdminApi.getTransactions(filters);
  }) as Fetcher<any, string | [string, any?]>,
  transaction: ((key: string) => {
    const id = key.split("/").pop() || "";
    return AdminApi.getTransaction(id);
  }) as Fetcher<any, string>,
  documents: ((key: string | [string, any?]) => {
    const [endpoint, filters] = Array.isArray(key) ? key : [key, undefined];
    return AdminApi.getDocuments(filters);
  }) as Fetcher<any, string | [string, any?]>,
};

// Public fetchers
export const publicFetchers = {
  posts: ((key: string | [string, any?]) => {
    const [endpoint, filters] = Array.isArray(key) ? key : [key, undefined];
    return PublicApi.getPosts(filters);
  }) as Fetcher<any, string | [string, any?]>,
  post: ((key: string) => {
    const id = key.split("/").pop() || "";
    return PublicApi.getPost(id);
  }) as Fetcher<any, string>,
  webinars: (() => PublicApi.getWebinars()) as Fetcher<any>,
};

/**
 * Generic SWR fetcher
 * Automatically determines which fetcher to use based on the key
 */
export const swrFetcher: Fetcher<any, string | [string, any?]> = async (key: string | [string, any?]) => {
  const endpoint = Array.isArray(key) ? key[0] : key;
  const filters = Array.isArray(key) ? key[1] : undefined;

  // Auth endpoints
  if (endpoint === "/auth/me") {
    return authFetchers.currentUser();
  }

  // Investment endpoints
  if (endpoint === "/investments" || endpoint.startsWith("/investments/")) {
    if (endpoint === "/investments") {
      return investmentFetchers.all(endpoint, filters);
    }
    if (endpoint === "/investments/stats") {
      return investmentFetchers.stats();
    }
    return investmentFetchers.detail(endpoint);
  }

  // Issuance endpoints
  if (endpoint === "/issuances" || endpoint.startsWith("/issuances/")) {
    if (endpoint.startsWith("/issuances/") && !endpoint.endsWith("/open") && !endpoint.endsWith("/upcoming")) {
      return issuanceFetchers.detail(endpoint);
    }
    return issuanceFetchers.all(endpoint, filters);
  }

  // Project endpoints
  if (endpoint === "/projects" || endpoint.startsWith("/projects/")) {
    if (endpoint.startsWith("/projects/")) {
      return projectFetchers.detail(endpoint);
    }
    return projectFetchers.all(endpoint, filters);
  }

  // Profile endpoints
  if (endpoint === "/profile") {
    return profileFetchers.current();
  }

  // Admin endpoints
  if (endpoint.startsWith("/admin/")) {
    if (endpoint === "/admin/stats") {
      return adminFetchers.stats();
    }
    if (endpoint === "/admin/users" || endpoint.startsWith("/admin/users/")) {
      if (endpoint.startsWith("/admin/users/") && endpoint !== "/admin/users") {
        return adminFetchers.user(endpoint);
      }
      return adminFetchers.users(endpoint, filters);
    }
    if (endpoint === "/admin/transactions" || endpoint.startsWith("/admin/transactions/")) {
      if (endpoint.startsWith("/admin/transactions/") && endpoint !== "/admin/transactions") {
        return adminFetchers.transaction(endpoint);
      }
      return adminFetchers.transactions(endpoint, filters);
    }
    if (endpoint === "/admin/documents" || endpoint.startsWith("/admin/documents/")) {
      return adminFetchers.documents(endpoint, filters);
    }
  }

  // Public endpoints
  if (endpoint === "/posts" || endpoint.startsWith("/posts/")) {
    if (endpoint.startsWith("/posts/") && endpoint !== "/posts") {
      return publicFetchers.post(endpoint);
    }
    return publicFetchers.posts(endpoint, filters);
  }

  if (endpoint === "/webinars") {
    return publicFetchers.webinars();
  }

  throw new Error(`Unknown SWR key: ${endpoint}`);
};

