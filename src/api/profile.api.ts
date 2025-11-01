import { BaseApi } from "./base.api";

export type UserProfile = {
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
  walletNetwork?: string;
};

export type UpdateProfilePayload = Partial<UserProfile>;

export type UploadKycDocumentPayload = {
  file: File;
};

/**
 * Profile API
 * Handles user profile operations
 */
export class ProfileApi extends BaseApi {
  /**
   * Get current user profile
   */
  static async getProfile(): Promise<UserProfile> {
    return this.get<UserProfile>("/profile");
  }

  /**
   * Update profile
   */
  static async updateProfile(payload: UpdateProfilePayload): Promise<UserProfile> {
    return this.put<UserProfile>("/profile", payload);
  }

  /**
   * Upload KYC document
   */
  static async uploadKycDocument(payload: UploadKycDocumentPayload): Promise<{
    documentName: string;
    status: "pending" | "approved" | "rejected";
  }> {
    const formData = new FormData();
    formData.append("file", payload.file);
    return this.postFormData("/profile/kyc", formData);
  }

  /**
   * Sign agreement
   */
  static async signAgreement(): Promise<void> {
    return this.post<void>("/profile/agreement/sign");
  }

  /**
   * Toggle two-factor authentication
   */
  static async toggleTwoFactor(enabled: boolean): Promise<{ twoFactorEnabled: boolean }> {
    return this.post<{ twoFactorEnabled: boolean }>("/profile/two-factor", { enabled });
  }

  /**
   * Update wallet address
   */
  static async updateWallet(payload: {
    address: string;
    network: string;
  }): Promise<UserProfile> {
    return this.post<UserProfile>("/profile/wallet", payload);
  }
}

