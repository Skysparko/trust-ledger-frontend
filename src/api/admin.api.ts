import { BaseApi } from "./base.api";

export type AdminUser = {
  id: string;
  email: string;
  name: string;
  role: "admin" | "super_admin";
  token?: string;
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
  issuanceId: string;
  issuanceTitle: string;
  amount: number;
  status: "pending" | "confirmed" | "failed" | "refunded";
  paymentMethod: "bank_transfer" | "credit_card" | "sepa";
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
  category: "legal" | "financial" | "project" | "other";
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

  /**
   * Get all users (admin)
   */
  static async getUsers(filters?: AdminFilters): Promise<AdminUserRecord[]> {
    const params = filters ? new URLSearchParams(filters as any).toString() : "";
    return this.get<AdminUserRecord[]>(`/admin/users${params ? `?${params}` : ""}`);
  }

  /**
   * Get user by ID (admin)
   */
  static async getUser(id: string): Promise<AdminUserRecord> {
    return this.get<AdminUserRecord>(`/admin/users/${id}`);
  }

  /**
   * Update user status (admin)
   */
  static async updateUserStatus(
    id: string,
    status: { isActive?: boolean; kycStatus?: AdminUserRecord["kycStatus"] }
  ): Promise<AdminUserRecord> {
    return this.patch<AdminUserRecord>(`/admin/users/${id}`, status);
  }

  /**
   * Get all transactions (admin)
   */
  static async getTransactions(filters?: AdminFilters): Promise<AdminTransaction[]> {
    const params = filters ? new URLSearchParams(filters as any).toString() : "";
    return this.get<AdminTransaction[]>(`/admin/transactions${params ? `?${params}` : ""}`);
  }

  /**
   * Get transaction by ID (admin)
   */
  static async getTransaction(id: string): Promise<AdminTransaction> {
    return this.get<AdminTransaction>(`/admin/transactions/${id}`);
  }

  /**
   * Update transaction status (admin)
   */
  static async updateTransactionStatus(
    id: string,
    status: AdminTransaction["status"]
  ): Promise<AdminTransaction> {
    return this.patch<AdminTransaction>(`/admin/transactions/${id}`, { status });
  }

  /**
   * Get all documents (admin)
   */
  static async getDocuments(filters?: AdminFilters): Promise<AdminDocument[]> {
    const params = filters ? new URLSearchParams(filters as any).toString() : "";
    return this.get<AdminDocument[]>(`/admin/documents${params ? `?${params}` : ""}`);
  }

  /**
   * Upload document (admin)
   */
  static async uploadDocument(formData: FormData): Promise<AdminDocument> {
    return this.postFormData<AdminDocument>("/admin/documents", formData);
  }

  /**
   * Delete document (admin)
   */
  static async deleteDocument(id: string): Promise<void> {
    return this.delete<void>(`/admin/documents/${id}`);
  }
}

