import { BaseApi } from "./base.api";

export type AuthUser = {
  id: string;
  type: "individual" | "business";
  email: string;
  name: string;
  token?: string;
  emailVerified?: boolean;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type SignupPayload = {
  type: "individual" | "business";
  name: string;
  email: string;
  password: string;
};

export type ResetPasswordPayload = {
  email: string;
};

export type ResetPasswordConfirmPayload = {
  token: string;
  newPassword: string;
};

export type ChangePasswordPayload = {
  currentPassword: string;
  newPassword: string;
};

export type VerifyEmailPayload = {
  token: string;
};

export type ResendVerificationPayload = {
  email: string;
};

/**
 * Authentication API
 * Handles user authentication operations
 */
export class AuthApi extends BaseApi {
  /**
   * Login user
   */
  static async login(payload: LoginPayload): Promise<AuthUser> {
    return this.post<AuthUser>("/auth/login", payload);
  }

  /**
   * Signup user
   */
  static async signup(payload: SignupPayload): Promise<AuthUser> {
    return this.post<AuthUser>("/auth/signup", payload);
  }

  /**
   * Logout user
   */
  static async logout(): Promise<void> {
    return this.post<void>("/auth/logout");
  }

  /**
   * Get current user
   */
  static async getCurrentUser(): Promise<AuthUser> {
    return this.get<AuthUser>("/auth/me");
  }

  /**
   * Verify email
   */
  static async verifyEmail(payload: VerifyEmailPayload): Promise<{ success: boolean }> {
    return this.post<{ success: boolean }>("/auth/verify-email", payload);
  }

  /**
   * Resend verification email
   */
  static async resendVerification(payload: ResendVerificationPayload): Promise<{ message: string }> {
    return this.post<{ message: string }>("/auth/resend-verification", payload);
  }

  /**
   * Request password reset
   */
  static async requestPasswordReset(payload: ResetPasswordPayload): Promise<{ message: string }> {
    return this.post<{ message: string }>("/auth/reset-password", payload);
  }

  /**
   * Confirm password reset
   */
  static async confirmPasswordReset(payload: ResetPasswordConfirmPayload): Promise<{ success: boolean }> {
    return this.post<{ success: boolean }>("/auth/reset-password-confirm", payload);
  }

  /**
   * Change password (authenticated)
   */
  static async changePassword(payload: ChangePasswordPayload): Promise<{ success: boolean }> {
    return this.post<{ success: boolean }>("/auth/change-password", payload);
  }

  /**
   * Refresh token
   */
  static async refreshToken(): Promise<{ token: string }> {
    return this.post<{ token: string }>("/auth/refresh");
  }
}

