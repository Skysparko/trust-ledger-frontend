import { BaseApi } from "./base.api";

export type AuthUser = {
  id: string;
  type: "individual" | "business";
  email: string;
  name: string;
  token?: string;
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

export type ChangePasswordPayload = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
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
  static async verifyEmail(token: string): Promise<void> {
    return this.post<void>("/auth/verify", { token });
  }

  /**
   * Request password reset
   */
  static async requestPasswordReset(payload: ResetPasswordPayload): Promise<void> {
    return this.post<void>("/auth/reset-password", payload);
  }

  /**
   * Change password
   */
  static async changePassword(payload: ChangePasswordPayload): Promise<void> {
    return this.post<void>("/auth/change-password", payload);
  }

  /**
   * Refresh token
   */
  static async refreshToken(): Promise<{ token: string }> {
    return this.post<{ token: string }>("/auth/refresh");
  }
}

