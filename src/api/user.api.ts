import { BaseApi } from "./base.api";

/**
 * User Profile Types
 */
export type UserApiProfile = {
  name: string;
  email: string;
  phone?: string;
  bank?: {
    iban?: string;
    accountName?: string;
    bic?: string;
  };
  kycDocumentName?: string;
  kycStatus?: "pending" | "approved" | "rejected";
  agreementSigned?: boolean;
  twoFactorEnabled?: boolean;
  walletAddress?: string;
  walletNetwork?: "ethereum" | "polygon" | "binance" | "arbitrum";
};

export type UpdateUserProfilePayload = Partial<UserApiProfile>;

export type ToggleTwoFactorPayload = {
  enabled: boolean;
};

export type UpdateWalletPayload = {
  network: "ethereum" | "polygon" | "binance" | "arbitrum";
  address: string;
};

/**
 * Investment Types
 */
export type UserInvestment = {
  id: string;
  issuanceId: string;
  bonds: number;
  amount: number;
  paymentMethod: "bank_transfer" | "credit_card" | "sepa";
  status: "pending" | "confirmed" | "failed" | "refunded";
  createdAt: string;
  updatedAt: string;
};

export type CreateUserInvestmentPayload = {
  investmentOpportunityId: string;
  bonds: number;
  paymentMethod: "bank_transfer" | "credit_card" | "sepa";
};

/**
 * Transaction Types
 */
export type UserTransaction = {
  id: string;
  type: "investment" | "withdrawal" | "deposit" | "refund";
  status: "pending" | "confirmed" | "failed" | "cancelled";
  amount: number;
  currency: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
};

export type TransactionFilters = {
  type?: "investment" | "withdrawal" | "deposit" | "refund" | "all";
  status?: "pending" | "confirmed" | "failed" | "cancelled" | "all";
};

/**
 * Asset Types
 */
export type UserAsset = {
  id: string;
  userId: string;
  name: string;
  type: string;
  quantity: number;
  value: number;
  dateAcquired: string;
  investmentOpportunityId: string;
  createdAt: string;
  // Legacy fields for backwards compatibility (optional)
  issuanceId?: string;
  issuanceName?: string;
  bonds?: number;
  totalValue?: number;
  purchaseDate?: string;
  status?: "active" | "matured" | "cancelled";
};

/**
 * Notification Types
 */
export type UserNotification = {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  read: boolean;
  createdAt: string;
};

/**
 * User API
 * Handles all user-related operations
 * All endpoints require JWT authentication
 */
export class UserApi extends BaseApi {
  /**
   * Profile Management
   */

  /**
   * Get user profile
   * GET /api/user/profile
   */
  static async getProfile(): Promise<UserApiProfile> {
    return this.get<UserApiProfile>("/user/profile");
  }

  /**
   * Update user profile
   * PUT /api/user/profile
   * All fields are optional - include only what you want to update
   */
  static async updateProfile(payload: UpdateUserProfilePayload): Promise<UserApiProfile> {
    return this.put<UserApiProfile>("/user/profile", payload);
  }

  /**
   * Upload KYC document
   * POST /api/user/kyc-upload
   * Supported file types: JPEG, PNG, PDF (max 10MB)
   */
  static async uploadKycDocument(file: File): Promise<{
    documentName: string;
    status: "pending" | "approved" | "rejected";
  }> {
    const formData = new FormData();
    formData.append("file", file);
    return this.postFormData("/user/kyc-upload", formData);
  }

  /**
   * Sign agreement
   * PUT /api/user/agreement-sign
   */
  static async signAgreement(): Promise<{ success: boolean }> {
    return this.put<{ success: boolean }>("/user/agreement-sign");
  }

  /**
   * Toggle two-factor authentication
   * PUT /api/user/two-factor
   */
  static async toggleTwoFactor(payload: ToggleTwoFactorPayload): Promise<{
    twoFactorEnabled: boolean;
  }> {
    return this.put<{ twoFactorEnabled: boolean }>("/user/two-factor", payload);
  }

  /**
   * Update wallet address and network
   * PUT /api/user/wallet
   */
  static async updateWallet(payload: UpdateWalletPayload): Promise<UserApiProfile> {
    return this.put<UserApiProfile>("/user/wallet", payload);
  }

  /**
   * Investments
   */

  /**
   * Get all investments for current user
   * GET /api/user/investments
   */
  static async getInvestments(): Promise<UserInvestment[]> {
    return this.get<UserInvestment[]>("/user/investments");
  }

  /**
   * Create new investment
   * POST /api/user/investments
   * Note: amount is calculated as bonds * 100 ($100 per bond)
   * Investment must meet minimum and maximum investment requirements of the investment opportunity
   */
  static async createInvestment(payload: CreateUserInvestmentPayload): Promise<UserInvestment> {
    return this.post<UserInvestment>("/user/investments", payload);
  }

  /**
   * Transactions
   */

  /**
   * Get all transactions for current user
   * GET /api/user/transactions
   * Optional query parameters: type, status
   */
  static async getTransactions(filters?: TransactionFilters): Promise<UserTransaction[]> {
    const params = new URLSearchParams();
    
    if (filters?.type && filters.type !== "all") {
      params.append("type", filters.type);
    }
    
    if (filters?.status && filters.status !== "all") {
      params.append("status", filters.status);
    }
    
    const queryString = params.toString();
    return this.get<UserTransaction[]>(
      `/user/transactions${queryString ? `?${queryString}` : ""}`
    );
  }

  /**
   * Assets
   */

  /**
   * Get all assets (owned bonds) for current user
   * GET /api/user/assets
   */
  static async getAssets(): Promise<UserAsset[]> {
    return this.get<UserAsset[]>("/user/assets");
  }

  /**
   * Notifications
   */

  /**
   * Get all notifications for current user
   * GET /api/user/notifications
   */
  static async getNotifications(): Promise<UserNotification[]> {
    return this.get<UserNotification[]>("/user/notifications");
  }

  /**
   * Mark notification as read
   * PUT /api/user/notifications/{id}/read
   */
  static async markNotificationAsRead(notificationId: string): Promise<{
    success: boolean;
  }> {
    return this.put<{ success: boolean }>(`/user/notifications/${notificationId}/read`);
  }

  /**
   * Mark all notifications as read
   * PUT /api/user/notifications/read-all
   */
  static async markAllNotificationsAsRead(): Promise<{
    success: boolean;
    count: number;
  }> {
    return this.put<{ success: boolean; count: number }>("/user/notifications/read-all");
  }
}
