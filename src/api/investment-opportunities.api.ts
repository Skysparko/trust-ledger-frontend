import { BaseApi } from "./base.api";

export type InvestmentOpportunityStatus = "active" | "upcoming" | "closed" | "paused";
export type InvestmentOpportunityRiskLevel = "Low" | "Medium" | "High";
export type PaymentFrequency = "Monthly" | "Quarterly" | "Annually" | "At Maturity";

export type InvestmentOpportunityListItem = {
  id: string;
  title: string;
  company: string;
  sector: string;
  type: string;
  location: string;
  rate: number; // percentage
  minInvestment: number; // euros
  maxInvestment?: number; // euros
  termMonths: number;
  totalFundingTarget: number; // euros
  currentFunding: number; // euros
  status: InvestmentOpportunityStatus;
  startDate: string; // ISO 8601 date
  endDate?: string; // ISO 8601 date
  investorsCount: number;
  fundingProgress: number; // percentage
  riskLevel: InvestmentOpportunityRiskLevel;
  thumbnailImage?: string; // URL
  logo?: string; // URL
  isFeatured: boolean;
  createdAt: string; // ISO 8601 date
  updatedAt: string; // ISO 8601 date
};

export type InvestmentOpportunityDocument = {
  id: string;
  name: string;
  type: "pdf" | "doc" | "xls" | "other";
  url: string;
  category: "legal" | "financial" | "project" | "prospectus" | "other";
  size: number; // in bytes
  uploadedAt: string; // ISO 8601 date
};

export type InvestmentOpportunityFAQ = {
  question: string;
  answer: string;
};

export type InvestmentOpportunityMilestone = {
  date: string; // ISO 8601 date
  description: string;
  status: "completed" | "upcoming" | "pending";
};

export type InvestmentOpportunityDetail = InvestmentOpportunityListItem & {
  description: string;
  shortDescription?: string;
  paymentFrequency: PaymentFrequency;
  bondStructure?: string;
  creditRating?: string;
  earlyRedemptionAllowed: boolean;
  earlyRedemptionPenalty?: number; // percentage
  companyDescription?: string;
  companyWebsite?: string;
  companyAddress?: string;
  projectType: string;
  useOfFunds: string;
  keyHighlights: string[];
  riskFactors: string[];
  legalStructure?: string;
  jurisdiction?: string;
  documents: InvestmentOpportunityDocument[];
  images: string[];
  videoUrl?: string;
  faq?: InvestmentOpportunityFAQ[];
  averageInvestment?: number;
  medianInvestment?: number;
  largestInvestment?: number;
  milestones: InvestmentOpportunityMilestone[];
  relatedOpportunities?: string[];
  tags?: string[];
  slug?: string;
  seoTitle?: string;
  seoDescription?: string;
};

export type InvestmentOpportunityFilters = {
  status?: InvestmentOpportunityStatus;
  sector?: string;
  riskLevel?: InvestmentOpportunityRiskLevel;
  minRate?: number;
  maxRate?: number;
  location?: string;
  type?: string;
  page?: number;
  limit?: number;
  sortBy?: "createdAt" | "startDate" | "rate" | "currentFunding" | "popularity";
  sortOrder?: "asc" | "desc";
  search?: string;
};

export type CreateInvestmentOpportunityPayload = {
  title: string;
  company: string;
  sector: string;
  type: string;
  location: string;
  description: string;
  shortDescription?: string;
  rate: number;
  minInvestment: number;
  maxInvestment?: number;
  termMonths: number;
  totalFundingTarget: number;
  paymentFrequency: PaymentFrequency;
  bondStructure?: string;
  creditRating?: string;
  earlyRedemptionAllowed: boolean;
  earlyRedemptionPenalty?: number;
  status?: InvestmentOpportunityStatus;
  startDate: string;
  endDate?: string;
  riskLevel: InvestmentOpportunityRiskLevel;
  companyDescription?: string;
  companyWebsite?: string;
  companyAddress?: string;
  projectType: string;
  useOfFunds: string;
  keyHighlights: string[];
  riskFactors: string[];
  legalStructure?: string;
  jurisdiction?: string;
  thumbnailImage?: string;
  logo?: string;
  images?: string[];
  videoUrl?: string;
  isFeatured?: boolean;
  faq?: InvestmentOpportunityFAQ[];
  milestones?: Omit<InvestmentOpportunityMilestone, "status">[];
  tags?: string[];
  slug?: string;
  seoTitle?: string;
  seoDescription?: string;
};

export type UpdateInvestmentOpportunityPayload = Partial<CreateInvestmentOpportunityPayload>;

export type InvestmentOpportunitiesResponse = {
  opportunities: InvestmentOpportunityListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type InvestmentOpportunityDropdownItem = {
  id: string;
  title: string;
};

export type InvestmentOpportunityDropdownResponse = {
  opportunities: InvestmentOpportunityDropdownItem[];
};

export type InvestmentOpportunityDropdownFilters = {
  status?: string; // Comma-separated statuses like "active,upcoming,paused"
  search?: string;
};

/**
 * Investment Opportunities API
 * Handles investment opportunity operations
 */
export class InvestmentOpportunitiesApi extends BaseApi {
  /**
   * Get all investment opportunities
   */
  static async getInvestmentOpportunities(
    filters?: InvestmentOpportunityFilters
  ): Promise<InvestmentOpportunitiesResponse> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params.append(key, String(value));
        }
      });
    }
    const queryString = params.toString();
    return this.get<InvestmentOpportunitiesResponse>(
      `/investment-opportunities${queryString ? `?${queryString}` : ""}`
    );
  }

  /**
   * Get investment opportunity by ID
   */
  static async getInvestmentOpportunity(id: string): Promise<InvestmentOpportunityDetail> {
    return this.get<InvestmentOpportunityDetail>(`/investment-opportunities/${id}`);
  }

  /**
   * Get featured investment opportunities
   */
  static async getFeaturedOpportunities(limit?: number): Promise<InvestmentOpportunityListItem[]> {
    const params = limit ? `?limit=${limit}` : "";
    return this.get<InvestmentOpportunityListItem[]>(`/investment-opportunities/featured${params}`);
  }

  /**
   * Get upcoming investment opportunities
   */
  static async getUpcomingOpportunities(): Promise<InvestmentOpportunityListItem[]> {
    return this.get<InvestmentOpportunityListItem[]>("/investment-opportunities/upcoming");
  }

  /**
   * Create investment opportunity (super admin only)
   */
  static async createInvestmentOpportunity(
    payload: CreateInvestmentOpportunityPayload
  ): Promise<InvestmentOpportunityDetail> {
    return this.post<InvestmentOpportunityDetail>("/investment-opportunities", payload);
  }

  /**
   * Update investment opportunity (super admin only)
   */
  static async updateInvestmentOpportunity(
    id: string,
    payload: UpdateInvestmentOpportunityPayload
  ): Promise<InvestmentOpportunityDetail> {
    return this.put<InvestmentOpportunityDetail>(`/investment-opportunities/${id}`, payload);
  }

  /**
   * Delete investment opportunity (super admin only)
   */
  static async deleteInvestmentOpportunity(id: string): Promise<void> {
    return this.delete<void>(`/investment-opportunities/${id}`);
  }

  /**
   * Upload document for investment opportunity (super admin only)
   */
  static async uploadDocument(
    opportunityId: string,
    formData: FormData
  ): Promise<InvestmentOpportunityDocument> {
    return this.postFormData<InvestmentOpportunityDocument>(
      `/investment-opportunities/${opportunityId}/documents`,
      formData
    );
  }

  /**
   * Delete document (super admin only)
   */
  static async deleteDocument(opportunityId: string, documentId: string): Promise<void> {
    return this.delete<void>(`/investment-opportunities/${opportunityId}/documents/${documentId}`);
  }

  /**
   * Get investment opportunities for dropdown (lightweight, returns only id and title)
   */
  static async getInvestmentOpportunitiesDropdown(
    filters?: InvestmentOpportunityDropdownFilters
  ): Promise<InvestmentOpportunityDropdownResponse> {
    const params = new URLSearchParams();
    if (filters) {
      if (filters.status) {
        params.append("status", filters.status);
      }
      if (filters.search) {
        params.append("search", filters.search);
      }
    }
    const queryString = params.toString();
    return this.get<InvestmentOpportunityDropdownResponse>(
      `/investment-opportunities/dropdown${queryString ? `?${queryString}` : ""}`
    );
  }
}

