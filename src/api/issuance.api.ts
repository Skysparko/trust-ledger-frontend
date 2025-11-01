import { BaseApi } from "./base.api";

export type Issuance = {
  id: string;
  title: string;
  type: string;
  location: string;
  rate: number; // percentage
  termMonths: number;
  minInvestment: number; // euros
  maxInvestment?: number; // euros
  totalFundingTarget: number; // euros
  currentFunding: number; // euros
  investorsCount: number;
  description: string;
  company: string;
  status: "open" | "closed" | "upcoming";
  startDate: string; // ISO date
  endDate?: string; // ISO date
  riskLevel: "Low" | "Medium" | "High";
  creditRating?: string;
  paymentFrequency: "Monthly" | "Quarterly" | "Annually" | "At Maturity";
  bondStructure: string;
  sector: string;
};

export type IssuanceFilters = {
  status?: Issuance["status"];
  type?: string; // e.g., "Wind", "Solar"
  location?: string; // e.g., "California"
  sector?: string;
  riskLevel?: Issuance["riskLevel"];
  minRate?: number;
  maxRate?: number;
};

export type CreateIssuancePayload = Omit<Issuance, "id" | "currentFunding" | "investorsCount">;
export type UpdateIssuancePayload = Partial<Omit<Issuance, "id">>;

/**
 * Issuance API
 * Handles bond issuance operations
 */
export class IssuanceApi extends BaseApi {
  /**
   * Get all issuances
   */
  static async getIssuances(filters?: IssuanceFilters): Promise<Issuance[]> {
    const params = filters ? new URLSearchParams(filters as any).toString() : "";
    return this.get<Issuance[]>(`/issuances${params ? `?${params}` : ""}`);
  }

  /**
   * Get issuance by ID
   */
  static async getIssuance(id: string): Promise<Issuance> {
    return this.get<Issuance>(`/issuances/${id}`);
  }

  /**
   * Get featured/open issuances
   */
  static async getOpenIssuances(): Promise<Issuance[]> {
    return this.get<Issuance[]>("/issuances?status=open");
  }

  /**
   * Get upcoming issuances
   */
  static async getUpcomingIssuances(): Promise<Issuance[]> {
    return this.get<Issuance[]>("/issuances?status=upcoming");
  }

  /**
   * Create issuance (admin only)
   */
  static async createIssuance(payload: CreateIssuancePayload): Promise<Issuance> {
    return this.post<Issuance>("/issuances", payload);
  }

  /**
   * Update issuance (admin only)
   */
  static async updateIssuance(id: string, payload: UpdateIssuancePayload): Promise<Issuance> {
    return this.put<Issuance>(`/issuances/${id}`, payload);
  }

  /**
   * Delete issuance (admin only)
   */
  static async deleteIssuance(id: string): Promise<void> {
    return this.delete<void>(`/issuances/${id}`);
  }
}

