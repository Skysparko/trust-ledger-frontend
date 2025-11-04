import { BaseApi } from "./base.api";

export type AdminUser = {
  id: string;
  email: string;
  name: string;
  role: "admin" | "super_admin";
  token?: string;
  access_token?: string;
};

export type AdminStats = {
  totalUsers: number;
  totalInvestments: number;
  amountRaised: number;
  activeIssuances: number;
};

export type AdminUserRecord = {
  id: string;
  email: string;
  name: string;
  type: "individual" | "business";
  kycStatus: "pending" | "approved" | "rejected";
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
};

export type AdminTransaction = {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  investmentOpportunityId: string;
  investmentOpportunityTitle: string;
  amount: number;
  status: "pending" | "confirmed" | "failed" | "refunded" | "COMPLETED" | "PENDING" | "FAILED";
  paymentMethod: "bank_transfer" | "credit_card" | "sepa" | "BANK_TRANSFER" | "CREDIT_CARD" | "SEPA";
  date: string;
  bonds?: number;
};

export type AdminDocument = {
  id: string;
  name: string;
  type: "pdf" | "doc" | "xls" | "other";
  size: number;
  uploadedAt: string;
  uploadedBy: string;
  category: "BROCHURE" | "REPORT" | "CERTIFICATE" | "OTHER" | "legal" | "financial" | "project" | "other";
};

export type AdminIssuance = {
  id: string;
  title: string;
  type: "BOND" | "DEBT" | "EQUITY";
  location: string;
  rate: number;
  termMonths: number;
  minInvestment: number;
  maxInvestment?: number;
  totalFundingTarget: number;
  currentFunding?: number;
  investorsCount?: number;
  description: string;
  company: string;
  status: "DRAFT" | "ACTIVE" | "CLOSED" | "CANCELLED" | "open" | "closed" | "upcoming";
  startDate: string;
  endDate?: string;
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "Low" | "Medium" | "High";
  creditRating?: string;
  paymentFrequency: "MONTHLY" | "QUARTERLY" | "SEMI_ANNUAL" | "ANNUAL" | "Monthly" | "Quarterly" | "Annually" | "At Maturity";
  bondStructure?: string;
  sector?: string;
};

export type AdminProject = {
  id: string;
  title: string;
  name?: string; // Keep for backward compatibility
  description?: string;
  location: string;
  type: string;
  sector?: string; // Keep for backward compatibility
  status: "ACTIVE" | "COMPLETED" | "CANCELLED" | "In development" | "Live" | "Completed";
  createdAt?: string;
  updatedAt?: string;
};

export type AdminWebinar = {
  id: string;
  title: string;
  description: string;
  date: string;
  duration: number;
  link: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type AdminPost = {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  category: "NEWS" | "KNOWLEDGE" | "News" | "Knowledge";
  isPublished: boolean;
  tags?: string[];
  date?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type AdminInvestment = {
  id: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  issuanceId: string;
  issuanceTitle?: string;
  amount: number;
  bonds: number;
  status: "pending" | "confirmed" | "failed" | "refunded" | "cancelled";
  paymentMethod?: "bank_transfer" | "credit_card" | "sepa";
  date: string;
  transactionId?: string;
};

export type AdminLoginPayload = {
  email: string;
  password: string;
};

export type AdminFilters = {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  kycStatus?: AdminUserRecord["kycStatus"];
  isActive?: boolean;
  paymentMethod?: string;
  category?: string;
};

export type CreateAdminIssuancePayload = {
  title: string;
  type: "BOND" | "DEBT" | "EQUITY";
  location: string;
  rate: number;
  termMonths: number;
  minInvestment: number;
  maxInvestment?: number;
  totalFundingTarget: number;
  description: string;
  company: string;
  status: "DRAFT" | "ACTIVE" | "CLOSED" | "CANCELLED";
  startDate: string;
  endDate?: string;
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  creditRating?: string;
  paymentFrequency: "MONTHLY" | "QUARTERLY" | "SEMI_ANNUAL" | "ANNUAL";
  bondStructure?: string;
  sector?: string;
};

export type UpdateAdminIssuancePayload = Partial<CreateAdminIssuancePayload>;

export type CreateAdminProjectPayload = {
  title?: string;
  name?: string; // Keep for backward compatibility
  description?: string;
  location: string;
  type?: string;
  sector?: string; // Keep for backward compatibility
  status: "ACTIVE" | "COMPLETED" | "CANCELLED" | "In development" | "Live" | "Completed";
};

export type UpdateAdminProjectPayload = Partial<CreateAdminProjectPayload>;

export type CreateAdminWebinarPayload = {
  title: string;
  description: string;
  date: string;
  duration: number;
  link: string;
  isActive: boolean;
};

export type UpdateAdminWebinarPayload = Partial<CreateAdminWebinarPayload>;

export type CreateAdminPostPayload = {
  title: string;
  content: string;
  category: "NEWS" | "KNOWLEDGE";
  date?: string;
  excerpt?: string;
  isPublished: boolean;
  tags?: string[];
};

export type UpdateAdminPostPayload = Partial<CreateAdminPostPayload>;

export type UpdateUserKycStatusPayload = {
  status: "pending" | "approved" | "rejected";
};

export type UpdateUserStatusPayload = {
  isActive: boolean;
};

/**
 * Admin API
 * Handles admin operations
 */
export class AdminApi extends BaseApi {
  /**
   * Admin login
   */
  static async login(payload: AdminLoginPayload): Promise<AdminUser> {
    console.log("[AdminApi.login] Calling API with payload:", payload);
    return this.post<AdminUser>("/admin/login", payload);
  }

  /**
   * Admin logout
   */
  static async logout(): Promise<void> {
    return this.post<void>("/admin/auth/logout");
  }

  /**
   * Get admin statistics
   */
  static async getStats(): Promise<AdminStats> {
    return this.get<AdminStats>("/admin/stats");
  }

  // ==================== Users ====================

  /**
   * Get all users (admin)
   */
  static async getUsers(filters?: AdminFilters): Promise<AdminUserRecord[]> {
    if (!filters) {
      const response = await this.get<any>(`/admin/users`);
      // Handle paginated response: { users: [...], total, page, limit } or direct array
      return Array.isArray(response) ? response : (response?.users || response?.data || []);
    }
    
    // Filter out undefined, null, and empty string values
    const cleanFilters: Record<string, string | number | boolean> = {};
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        cleanFilters[key] = value;
      }
    });
    
    const params = new URLSearchParams(cleanFilters as any).toString();
    const response = await this.get<any>(`/admin/users${params ? `?${params}` : ""}`);
    // Handle paginated response: { users: [...], total, page, limit } or direct array
    return Array.isArray(response) ? response : (response?.users || response?.data || []);
  }

  /**
   * Get user by ID (admin)
   */
  static async getUser(id: string): Promise<AdminUserRecord> {
    return this.get<AdminUserRecord>(`/admin/users/${id}`);
  }

  /**
   * Update user KYC status (admin)
   */
  static async updateUserKycStatus(
    id: string,
    payload: UpdateUserKycStatusPayload
  ): Promise<AdminUserRecord> {
    return this.put<AdminUserRecord>(`/admin/users/${id}/kyc`, payload);
  }

  /**
   * Update user status (admin)
   */
  static async updateUserStatus(
    id: string,
    payload: UpdateUserStatusPayload
  ): Promise<AdminUserRecord> {
    return this.put<AdminUserRecord>(`/admin/users/${id}/status`, payload);
  }

  // ==================== Transactions ====================

  /**
   * Transform raw transaction data from API to AdminTransaction format
   */
  private static transformTransaction(raw: any): AdminTransaction {
    return {
      id: raw.id,
      userId: raw.userId || raw.user?.id || "",
      userName: raw.userName || raw.user?.name || "",
      userEmail: raw.userEmail || raw.user?.email || "",
      investmentOpportunityId: 
        raw.investmentOpportunityId || 
        raw.investmentOpportunity?.id || 
        raw.issuanceId || 
        raw.issuance?.id || 
        "",
      investmentOpportunityTitle: 
        raw.investmentOpportunityTitle || 
        raw.investmentOpportunity?.title || 
        raw.issuanceTitle || 
        raw.issuance?.title || 
        "",
      amount: raw.amount,
      status: raw.status,
      paymentMethod: raw.paymentMethod,
      date: raw.date,
      bonds: raw.bonds,
    };
  }

  /**
   * Get all transactions (admin)
   */
  static async getTransactions(filters?: AdminFilters): Promise<AdminTransaction[]> {
    let rawTransactions: any[];
    
    if (!filters) {
      const response = await this.get<any>(`/admin/transactions`);
      // Handle paginated response: { transactions: [...], total, page, limit } or direct array
      rawTransactions = Array.isArray(response) ? response : (response?.transactions || response?.data || []);
    } else {
      // Filter out undefined, null, and empty string values
      const cleanFilters: Record<string, string | number | boolean> = {};
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          cleanFilters[key] = value;
        }
      });
      
      const params = new URLSearchParams(cleanFilters as any).toString();
      const response = await this.get<any>(`/admin/transactions${params ? `?${params}` : ""}`);
      // Handle paginated response: { transactions: [...], total, page, limit } or direct array
      rawTransactions = Array.isArray(response) ? response : (response?.transactions || response?.data || []);
    }
    
    // Debug: Log first transaction to see actual structure
    if (rawTransactions.length > 0) {
      console.log("[AdminApi.getTransactions] Sample raw transaction:", JSON.stringify(rawTransactions[0], null, 2));
    }
    
    // Transform nested structure to flat structure
    return rawTransactions.map(transaction => this.transformTransaction(transaction));
  }

  /**
   * Get transaction by ID (admin)
   * Returns the full transaction object with nested user, investment, and investmentOpportunity data
   */
  static async getTransaction(id: string): Promise<AdminTransaction & {
    user?: any;
    investment?: any;
    investmentOpportunity?: any;
  }> {
    const raw = await this.get<any>(`/admin/transactions/${id}`);
    // Debug: Log raw transaction to see actual structure
    console.log("[AdminApi.getTransaction] Raw transaction:", JSON.stringify(raw, null, 2));
    // Transform to get the flattened structure, but also preserve nested objects
    const transformed = this.transformTransaction(raw);
    return {
      ...transformed,
      user: raw.user,
      investment: raw.investment,
      investmentOpportunity: raw.investmentOpportunity,
    };
  }

  /**
   * Export transactions (admin)
   */
  static async exportTransactions(format: "csv" | "xlsx" = "csv"): Promise<Blob> {
    // Use axiosInstance directly for blob responses
    const axiosInstance = (await import("@/lib/axios")).default;
    const response = await axiosInstance.get(`/admin/transactions/export?format=${format}`, {
      responseType: "blob",
    });
    return response.data;
  }

  // ==================== Issuances ====================

  /**
   * Get all issuances (admin)
   */
  static async getIssuances(filters?: AdminFilters): Promise<AdminIssuance[]> {
    if (!filters) {
      const response = await this.get<any>(`/admin/issuances`);
      // Handle paginated response: { issuances: [...], total, page, limit } or direct array
      return Array.isArray(response) ? response : (response?.issuances || response?.data || []);
    }
    
    // Filter out undefined, null, and empty string values
    const cleanFilters: Record<string, string | number | boolean> = {};
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        cleanFilters[key] = value;
      }
    });
    
    const params = new URLSearchParams(cleanFilters as any).toString();
    const response = await this.get<any>(`/admin/issuances${params ? `?${params}` : ""}`);
    // Handle paginated response: { issuances: [...], total, page, limit } or direct array
    return Array.isArray(response) ? response : (response?.issuances || response?.data || []);
  }

  /**
   * Get issuance by ID (admin)
   */
  static async getIssuance(id: string): Promise<AdminIssuance> {
    return this.get<AdminIssuance>(`/admin/issuances/${id}`);
  }

  /**
   * Create issuance (admin)
   */
  static async createIssuance(payload: CreateAdminIssuancePayload): Promise<AdminIssuance> {
    return this.post<AdminIssuance>("/admin/issuances", payload);
  }

  /**
   * Update issuance (admin)
   */
  static async updateIssuance(
    id: string,
    payload: UpdateAdminIssuancePayload
  ): Promise<AdminIssuance> {
    return this.put<AdminIssuance>(`/admin/issuances/${id}`, payload);
  }

  /**
   * Delete issuance (admin)
   */
  static async deleteIssuance(id: string): Promise<void> {
    return this.delete<void>(`/admin/issuances/${id}`);
  }

  // ==================== Projects ====================

  /**
   * Get all projects (admin)
   */
  static async getProjects(filters?: AdminFilters): Promise<AdminProject[]> {
    if (!filters) {
      const response = await this.get<any>(`/admin/projects`);
      // Handle paginated response: { projects: [...], total, page, limit }
      return Array.isArray(response) ? response : (response?.projects || []);
    }
    
    // Filter out undefined, null, and empty string values
    const cleanFilters: Record<string, string | number | boolean> = {};
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        cleanFilters[key] = value;
      }
    });
    
    const params = new URLSearchParams(cleanFilters as any).toString();
    const response = await this.get<any>(`/admin/projects${params ? `?${params}` : ""}`);
    // Handle paginated response: { projects: [...], total, page, limit }
    return Array.isArray(response) ? response : (response?.projects || []);
  }

  /**
   * Get project by ID (admin)
   */
  static async getProject(id: string): Promise<AdminProject> {
    return this.get<AdminProject>(`/admin/projects/${id}`);
  }

  /**
   * Create project (admin)
   */
  static async createProject(payload: CreateAdminProjectPayload): Promise<AdminProject> {
    return this.post<AdminProject>("/admin/projects", payload);
  }

  /**
   * Update project (admin)
   */
  static async updateProject(
    id: string,
    payload: UpdateAdminProjectPayload
  ): Promise<AdminProject> {
    return this.put<AdminProject>(`/admin/projects/${id}`, payload);
  }

  /**
   * Delete project (admin)
   */
  static async deleteProject(id: string): Promise<void> {
    return this.delete<void>(`/admin/projects/${id}`);
  }

  // ==================== Documents ====================

  /**
   * Get all documents (admin)
   */
  static async getDocuments(filters?: AdminFilters): Promise<AdminDocument[]> {
    if (!filters) {
      const response = await this.get<any>(`/admin/documents`);
      // Handle paginated response: { documents: [...], total, page, limit } or direct array
      return Array.isArray(response) ? response : (response?.documents || response?.data || []);
    }
    
    // Filter out undefined, null, and empty string values
    const cleanFilters: Record<string, string | number | boolean> = {};
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        cleanFilters[key] = value;
      }
    });
    
    const params = new URLSearchParams(cleanFilters as any).toString();
    const response = await this.get<any>(`/admin/documents${params ? `?${params}` : ""}`);
    // Handle paginated response: { documents: [...], total, page, limit } or direct array
    return Array.isArray(response) ? response : (response?.documents || response?.data || []);
  }

  /**
   * Get document by ID (admin)
   */
  static async getDocument(id: string): Promise<AdminDocument> {
    return this.get<AdminDocument>(`/admin/documents/${id}`);
  }

  /**
   * Upload document (admin)
   */
  static async uploadDocument(formData: FormData): Promise<AdminDocument> {
    return this.postFormData<AdminDocument>("/admin/documents", formData);
  }

  /**
   * Download document (admin)
   */
  static async downloadDocument(id: string): Promise<Blob> {
    // Use axiosInstance directly for blob responses
    const axiosInstance = (await import("@/lib/axios")).default;
    const response = await axiosInstance.get(`/admin/documents/${id}/download`, {
      responseType: "blob",
    });
    return response.data;
  }

  /**
   * Delete document (admin)
   */
  static async deleteDocument(id: string): Promise<void> {
    return this.delete<void>(`/admin/documents/${id}`);
  }

  // ==================== Webinars ====================

  /**
   * Get all webinars (admin)
   */
  static async getWebinars(filters?: AdminFilters): Promise<AdminWebinar[]> {
    if (!filters) {
      const response = await this.get<any>(`/admin/webinars`);
      // Handle paginated response: { webinars: [...], total, page, limit } or direct array
      return Array.isArray(response) ? response : (response?.webinars || response?.data || []);
    }
    
    // Filter out undefined, null, and empty string values
    const cleanFilters: Record<string, string | number | boolean> = {};
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        cleanFilters[key] = value;
      }
    });
    
    const params = new URLSearchParams(cleanFilters as any).toString();
    const response = await this.get<any>(`/admin/webinars${params ? `?${params}` : ""}`);
    // Handle paginated response: { webinars: [...], total, page, limit } or direct array
    return Array.isArray(response) ? response : (response?.webinars || response?.data || []);
  }

  /**
   * Get webinar by ID (admin)
   */
  static async getWebinar(id: string): Promise<AdminWebinar> {
    return this.get<AdminWebinar>(`/admin/webinars/${id}`);
  }

  /**
   * Create webinar (admin)
   */
  static async createWebinar(payload: CreateAdminWebinarPayload): Promise<AdminWebinar> {
    return this.post<AdminWebinar>("/admin/webinars", payload);
  }

  /**
   * Update webinar (admin)
   */
  static async updateWebinar(
    id: string,
    payload: UpdateAdminWebinarPayload
  ): Promise<AdminWebinar> {
    return this.put<AdminWebinar>(`/admin/webinars/${id}`, payload);
  }

  /**
   * Delete webinar (admin)
   */
  static async deleteWebinar(id: string): Promise<void> {
    return this.delete<void>(`/admin/webinars/${id}`);
  }

  // ==================== Posts ====================

  /**
   * Get all posts (admin)
   */
  static async getPosts(filters?: AdminFilters): Promise<AdminPost[]> {
    if (!filters) {
      const response = await this.get<any>(`/admin/posts`);
      // Handle paginated response: { posts: [...], total, page, limit } or direct array
      return Array.isArray(response) ? response : (response?.posts || response?.data || []);
    }
    
    // Filter out undefined, null, and empty string values
    const cleanFilters: Record<string, string | number | boolean> = {};
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        cleanFilters[key] = value;
      }
    });
    
    const params = new URLSearchParams(cleanFilters as any).toString();
    const response = await this.get<any>(`/admin/posts${params ? `?${params}` : ""}`);
    // Handle paginated response: { posts: [...], total, page, limit } or direct array
    return Array.isArray(response) ? response : (response?.posts || response?.data || []);
  }

  /**
   * Get post by ID (admin)
   */
  static async getPost(id: string): Promise<AdminPost> {
    return this.get<AdminPost>(`/admin/posts/${id}`);
  }

  /**
   * Create post (admin)
   */
  static async createPost(payload: CreateAdminPostPayload): Promise<AdminPost> {
    return this.post<AdminPost>("/admin/posts", payload);
  }

  /**
   * Update post (admin)
   */
  static async updatePost(id: string, payload: UpdateAdminPostPayload): Promise<AdminPost> {
    return this.put<AdminPost>(`/admin/posts/${id}`, payload);
  }

  /**
   * Delete post (admin)
   */
  static async deletePost(id: string): Promise<void> {
    return this.delete<void>(`/admin/posts/${id}`);
  }

  // ==================== Investments ====================

  /**
   * Confirm investment (admin)
   */
  static async confirmInvestment(id: string): Promise<AdminInvestment> {
    return this.put<AdminInvestment>(`/admin/investments/${id}/confirm`, {});
  }

  /**
   * Cancel investment (admin)
   */
  static async cancelInvestment(id: string): Promise<AdminInvestment> {
    return this.put<AdminInvestment>(`/admin/investments/${id}/cancel`, {});
  }

  // ==================== Blockchain ====================

  /**
   * Get all blockchain investments with contract info
   */
  static async getBlockchainInvestments(): Promise<{
    success: boolean;
    data: BlockchainInvestment[];
    totalContracts: number;
    totalInvestments: number;
  }> {
    return this.get<{
      success: boolean;
      data: BlockchainInvestment[];
      totalContracts: number;
      totalInvestments: number;
    }>("/admin/blockchain/investments");
  }
}

export type BlockchainInvestment = {
  investmentId: string;
  userId: string;
  userEmail: string;
  userName: string;
  walletAddress: string | null;
  opportunityId: string;
  opportunityTitle: string;
  company: string;
  contractAddress: string;
  contractDeploymentTx: string | null;
  mintTxHash: string | null;
  // Database values (for comparison)
  dbBonds: number;
  dbAmount: number;
  // Actual on-chain values from Sonic network
  onChainBonds: number;
  onChainTokenBalance: string;
  blockchainError: string | null;
  status: string;
  createdAt: string;
};

