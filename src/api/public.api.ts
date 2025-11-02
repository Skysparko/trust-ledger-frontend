import { BaseApi } from "./base.api";

// Post types
export type Post = {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  category: "News" | "Knowledge";
  content?: string; // Full content for detailed view
  createdAt?: string;
  updatedAt?: string;
};

export type PostFilters = {
  category?: Post["category"];
};

// Webinar types
export type Webinar = {
  id: string;
  title: string;
  date: string;
  speaker: string;
  description?: string;
  registrationUrl?: string;
  createdAt?: string;
  updatedAt?: string;
};

// Newsletter subscription
export type NewsletterSubscribePayload = {
  email: string;
};

export type NewsletterSubscribeResponse = {
  success: boolean;
  message?: string;
};

// Brochure request
export type BrochureRequestPayload = {
  name: string;
  email: string;
  interest: string; // Dynamic interest based on project types
};

export type BrochureRequestResponse = {
  success: boolean;
  message?: string;
};

/**
 * Public API
 * Handles public-facing operations that don't require authentication
 */
export class PublicApi extends BaseApi {
  /**
   * Get all investment opportunities (public)
   * @param filters Optional filters for status, type, location
   */
  static async getInvestmentOpportunities(filters?: {
    status?: "active" | "closed" | "upcoming" | "paused";
    type?: string;
    location?: string;
    sector?: string;
    riskLevel?: "Low" | "Medium" | "High";
    minRate?: number;
    page?: number;
    limit?: number;
  }): Promise<any> {
    const params = filters ? new URLSearchParams(filters as any).toString() : "";
    return this.get<any>(`/investment-opportunities${params ? `?${params}` : ""}`);
  }

  /**
   * Get investment opportunity by ID (public)
   */
  static async getInvestmentOpportunity(id: string): Promise<any> {
    return this.get<any>(`/investment-opportunities/${id}`);
  }

  /**
   * @deprecated Use getInvestmentOpportunities instead
   * Get all issuances (public) - deprecated, use getInvestmentOpportunities
   */
  static async getIssuances(filters?: {
    status?: "open" | "closed" | "upcoming";
    type?: string;
    location?: string;
  }): Promise<any[]> {
    const params = filters ? new URLSearchParams(filters as any).toString() : "";
    return this.get<any[]>(`/investment-opportunities${params ? `?${params}` : ""}`);
  }

  /**
   * @deprecated Use getInvestmentOpportunity instead
   * Get issuance by ID (public) - deprecated, use getInvestmentOpportunity
   */
  static async getIssuance(id: string): Promise<any> {
    return this.get<any>(`/investment-opportunities/${id}`);
  }

  /**
   * Get all projects (public)
   * @param filters Optional filters for type, status, location
   */
  static async getProjects(filters?: {
    type?: string;
    status?: "In development" | "Live" | "Completed";
    location?: string;
  }): Promise<any[]> {
    const params = filters ? new URLSearchParams(filters as any).toString() : "";
    return this.get<any[]>(`/projects${params ? `?${params}` : ""}`);
  }

  /**
   * Get all posts
   * @param filters Optional category filter
   */
  static async getPosts(filters?: PostFilters): Promise<Post[]> {
    const params = filters ? new URLSearchParams(filters as any).toString() : "";
    return this.get<Post[]>(`/posts${params ? `?${params}` : ""}`);
  }

  /**
   * Get post by ID
   */
  static async getPost(id: string): Promise<Post> {
    return this.get<Post>(`/posts/${id}`);
  }

  /**
   * Get all webinars
   */
  static async getWebinars(): Promise<Webinar[]> {
    return this.get<Webinar[]>("/webinars");
  }

  /**
   * Subscribe to newsletter
   */
  static async subscribeToNewsletter(
    payload: NewsletterSubscribePayload
  ): Promise<NewsletterSubscribeResponse> {
    return this.post<NewsletterSubscribeResponse>("/newsletter/subscribe", payload);
  }

  /**
   * Request brochure
   */
  static async requestBrochure(
    payload: BrochureRequestPayload
  ): Promise<BrochureRequestResponse> {
    return this.post<BrochureRequestResponse>("/brochure/request", payload);
  }
}

