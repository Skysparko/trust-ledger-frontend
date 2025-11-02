import useSWR from "swr";
import { SwrKeys } from "../swr-fetcher";
import type {
  InvestmentOpportunityListItem,
  InvestmentOpportunityDetail,
  InvestmentOpportunityFilters,
  InvestmentOpportunitiesResponse,
} from "@/api/investment-opportunities.api";
import { InvestmentOpportunitiesApi } from "@/api/investment-opportunities.api";

/**
 * Hook for fetching investment opportunities (list view)
 */
export function useInvestmentOpportunities(filters?: InvestmentOpportunityFilters) {
  const key = SwrKeys.investmentOpportunities.all(filters);
  const { data, error, isLoading, mutate } = useSWR<InvestmentOpportunitiesResponse>(
    key,
    async ([endpoint, filters]) => {
      try {
        const result = await InvestmentOpportunitiesApi.getInvestmentOpportunities(filters);
        console.log("[useInvestmentOpportunities] API Response:", result);
        return result;
      } catch (err) {
        console.error("[useInvestmentOpportunities] API Error:", err);
        throw err;
      }
    },
    {
      revalidateOnFocus: false,
      onError: (err) => {
        console.error("[useInvestmentOpportunities] SWR Error:", err);
      },
    }
  );

  // Debug the response structure
  if (data && typeof window !== "undefined") {
    console.log("[useInvestmentOpportunities] Parsed data:", {
      data,
      opportunities: data?.opportunities,
      opportunitiesCount: data?.opportunities?.length,
      pagination: data?.pagination,
      isArray: Array.isArray(data),
      hasOpportunities: "opportunities" in data,
      hasData: "data" in data,
    });
  }

  // Handle different response formats
  let opportunities: InvestmentOpportunityListItem[] = [];
  let paginationData = data?.pagination;

  if (data) {
    // Check if response is in the expected format { opportunities, pagination }
    if ("opportunities" in data && Array.isArray(data.opportunities)) {
      opportunities = data.opportunities;
      paginationData = data.pagination;
    }
    // Check if response is an array directly
    else if (Array.isArray(data)) {
      opportunities = data;
    }
    // Check if response has a data wrapper
    else if ("data" in data && Array.isArray((data as any).data)) {
      opportunities = (data as any).data;
    }
    // Check if response has data.opportunities
    else if ("data" in data && (data as any).data && "opportunities" in (data as any).data) {
      opportunities = (data as any).data.opportunities;
      paginationData = (data as any).data.pagination;
    }
  }

  return {
    opportunities,
    pagination: paginationData,
    isLoading,
    isError: !!error,
    error,
    mutate,
  };
}

/**
 * Hook for fetching a single investment opportunity
 */
export function useInvestmentOpportunity(id: string | null) {
  const { data, error, isLoading, mutate } = useSWR<InvestmentOpportunityDetail>(
    id ? SwrKeys.investmentOpportunities.detail(id) : null,
    async (key: string) => {
      try {
        const opportunityId = key.split("/").pop() || "";
        console.log("[useInvestmentOpportunity] Fetching opportunity with ID:", opportunityId);
        const result = await InvestmentOpportunitiesApi.getInvestmentOpportunity(opportunityId);
        console.log("[useInvestmentOpportunity] API Response:", result);
        return result;
      } catch (err) {
        console.error("[useInvestmentOpportunity] API Error:", err);
        throw err;
      }
    },
    {
      revalidateOnFocus: false,
      onError: (err) => {
        console.error("[useInvestmentOpportunity] SWR Error:", err);
      },
    }
  );

  // Debug logging
  if (typeof window !== "undefined") {
    console.log("[useInvestmentOpportunity] Hook state:", {
      id,
      hasData: !!data,
      isLoading,
      isError: !!error,
      error: error?.message,
    });
  }

  return {
    opportunity: data,
    isLoading,
    isError: !!error,
    error,
    mutate,
  };
}

/**
 * Hook for fetching featured investment opportunities
 */
export function useFeaturedInvestmentOpportunities(limit?: number) {
  const { data, error, isLoading, mutate } = useSWR<InvestmentOpportunityListItem[]>(
    SwrKeys.investmentOpportunities.featured(limit),
    () => InvestmentOpportunitiesApi.getFeaturedOpportunities(limit),
    {
      revalidateOnFocus: false,
    }
  );

  return {
    opportunities: data ?? [],
    isLoading,
    isError: !!error,
    error,
    mutate,
  };
}

/**
 * Hook for fetching upcoming investment opportunities
 */
export function useUpcomingInvestmentOpportunities() {
  const { data, error, isLoading, mutate } = useSWR<InvestmentOpportunityListItem[]>(
    SwrKeys.investmentOpportunities.upcoming(),
    () => InvestmentOpportunitiesApi.getUpcomingOpportunities(),
    {
      revalidateOnFocus: false,
    }
  );

  return {
    opportunities: data ?? [],
    isLoading,
    isError: !!error,
    error,
    mutate,
  };
}

/**
 * Hook for fetching investment opportunities for dropdown (lightweight, returns only id and title)
 */
export function useInvestmentOpportunitiesDropdown(
  filters?: { status?: string; search?: string }
) {
  const { data, error, isLoading, mutate } = useSWR(
    SwrKeys.investmentOpportunities.dropdown(filters),
    async ([endpoint, filters]) => {
      try {
        const result = await InvestmentOpportunitiesApi.getInvestmentOpportunitiesDropdown(filters);
        return result;
      } catch (err) {
        console.error("[useInvestmentOpportunitiesDropdown] API Error:", err);
        throw err;
      }
    },
    {
      revalidateOnFocus: false,
    }
  );

  return {
    opportunities: data?.opportunities ?? [],
    isLoading,
    isError: !!error,
    error,
    mutate,
  };
}

/**
 * Hook for fetching all opportunities (without filters) to extract unique values for dropdowns
 * Fetches ALL pages to get complete unique values
 */
export function useAllInvestmentOpportunitiesForDropdowns() {
  const { data, error, isLoading } = useSWR<InvestmentOpportunitiesResponse>(
    SwrKeys.investmentOpportunities.all({ limit: 100 }), // Use max allowed limit per page
    async () => {
      try {
        // Fetch first page with max limit
        const firstPage = await InvestmentOpportunitiesApi.getInvestmentOpportunities({ limit: 100, page: 1 });
        const allOpportunities = [...(firstPage.opportunities || [])];
        
        // Fetch all remaining pages if they exist
        const totalPages = firstPage.pagination?.totalPages || 1;
        if (totalPages > 1) {
          // Fetch all remaining pages in parallel
          const remainingPages = await Promise.all(
            Array.from({ length: totalPages - 1 }, (_, i) => 
              InvestmentOpportunitiesApi.getInvestmentOpportunities({ limit: 100, page: i + 2 })
            )
          );
          
          // Combine all opportunities from all pages
          remainingPages.forEach(page => {
            if (page.opportunities) {
              allOpportunities.push(...page.opportunities);
            }
          });
        }
        
        return {
          opportunities: allOpportunities,
          pagination: {
            ...firstPage.pagination,
            total: allOpportunities.length, // Update total to reflect all fetched items
          },
        };
      } catch (err) {
        console.error("[useAllInvestmentOpportunitiesForDropdowns] API Error:", err);
        throw err;
      }
    },
    {
      revalidateOnFocus: false,
    }
  );

  // Extract unique values from opportunities
  const opportunities = data?.opportunities ?? [];
  
  const uniqueSectors = Array.from(new Set(opportunities.map(opp => opp.sector).filter(Boolean)));
  const uniqueTypes = Array.from(new Set(opportunities.map(opp => opp.type).filter(Boolean)));
  const uniqueLocations = Array.from(new Set(opportunities.map(opp => opp.location).filter(Boolean)));
  const uniqueStatuses = Array.from(new Set(opportunities.map(opp => opp.status).filter(Boolean)));
  const uniqueRiskLevels = Array.from(new Set(opportunities.map(opp => opp.riskLevel).filter(Boolean)));
  
  // For payment frequency and other detail fields, we need to fetch full details
  // For now, we'll return the standard options as fallback
  const uniquePaymentFrequencies = Array.from(new Set(
    opportunities
      .map(opp => (opp as any).paymentFrequency)
      .filter(Boolean)
  ));

  return {
    uniqueSectors: uniqueSectors.sort(),
    uniqueTypes: uniqueTypes.sort(),
    uniqueLocations: uniqueLocations.sort(),
    uniqueStatuses: uniqueStatuses.sort(),
    uniqueRiskLevels: uniqueRiskLevels.sort(),
    uniquePaymentFrequencies: uniquePaymentFrequencies.length > 0 
      ? uniquePaymentFrequencies.sort() 
      : ["Monthly", "Quarterly", "Annually", "At Maturity"], // Fallback to standard options
    isLoading,
    isError: !!error,
  };
}

