import { BaseApi } from "./base.api";

export type Investment = {
  id: string;
  issuance: string;
  issuanceId: string;
  date: string;
  amount: number;
  bonds: number;
  status: "pending" | "confirmed" | "failed" | "refunded";
  documentUrl?: string;
  paymentMethod?: "bank_transfer" | "credit_card" | "sepa";
  transactionId?: string;
};

export type CreateInvestmentPayload = {
  issuanceId: string;
  bonds: number;
  amount: number;
  paymentMethod: "bank_transfer" | "credit_card" | "sepa";
};

export type InvestmentFilters = {
  status?: Investment["status"];
  issuanceId?: string;
  startDate?: string;
  endDate?: string;
};

/**
 * Investment API
 * Handles investment operations
 */
export class InvestmentApi extends BaseApi {
  /**
   * Get all investments for current user
   */
  static async getInvestments(filters?: InvestmentFilters): Promise<Investment[]> {
    const params = filters ? new URLSearchParams(filters as any).toString() : "";
    return this.get<Investment[]>(`/investments${params ? `?${params}` : ""}`);
  }

  /**
   * Get investment by ID
   */
  static async getInvestment(id: string): Promise<Investment> {
    return this.get<Investment>(`/investments/${id}`);
  }

  /**
   * Create new investment
   */
  static async createInvestment(payload: CreateInvestmentPayload): Promise<Investment> {
    return this.post<Investment>("/investments", payload);
  }

  /**
   * Cancel investment
   */
  static async cancelInvestment(id: string): Promise<void> {
    return this.delete<void>(`/investments/${id}`);
  }

  /**
   * Get investment statistics
   */
  static async getInvestmentStats(): Promise<{
    totalInvested: number;
    totalBonds: number;
    confirmedInvestments: number;
    pendingInvestments: number;
  }> {
    return this.get("/investments/stats");
  }
}

