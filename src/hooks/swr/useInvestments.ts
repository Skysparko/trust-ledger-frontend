import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import { SwrKeys } from "../swr-fetcher";
import type { Investment, InvestmentFilters, CreateInvestmentPayload } from "@/api/investment.api";
import { InvestmentApi } from "@/api/investment.api";

/**
 * Hook for fetching investments
 */
export function useInvestments(filters?: InvestmentFilters) {
  const key = SwrKeys.investments.all(filters);
  const { data, error, isLoading, mutate } = useSWR<Investment[]>(
    key,
    ([endpoint, filters]) => InvestmentApi.getInvestments(filters),
    {
      revalidateOnFocus: false,
    }
  );

  return {
    investments: data ?? [],
    isLoading,
    isError: !!error,
    error,
    mutate,
  };
}

/**
 * Hook for fetching a single investment
 */
export function useInvestment(id: string | null) {
  const { data, error, isLoading, mutate } = useSWR<Investment>(
    id ? SwrKeys.investments.detail(id) : null,
    (key: string) => {
      const id = key.split("/").pop() || "";
      return InvestmentApi.getInvestment(id);
    },
    {
      revalidateOnFocus: false,
    }
  );

  return {
    investment: data,
    isLoading,
    isError: !!error,
    error,
    mutate,
  };
}

/**
 * Hook for fetching investment statistics
 */
export function useInvestmentStats() {
  const { data, error, isLoading, mutate } = useSWR(
    SwrKeys.investments.stats(),
    () => InvestmentApi.getInvestmentStats(),
    {
      revalidateOnFocus: false,
    }
  );

  return {
    stats: data,
    isLoading,
    isError: !!error,
    error,
    mutate,
  };
}

/**
 * Hook for creating a new investment
 */
export function useCreateInvestment() {
  const { trigger, isMutating, error } = useSWRMutation(
    SwrKeys.investments.all(),
    async (_, { arg }: { arg: CreateInvestmentPayload }) => {
      return InvestmentApi.createInvestment(arg);
    }
  );

  return {
    createInvestment: trigger,
    isCreating: isMutating,
    error,
  };
}

/**
 * Hook for canceling an investment
 */
export function useCancelInvestment() {
  const { trigger, isMutating, error } = useSWRMutation(
    SwrKeys.investments.all(),
    async (_, { arg }: { arg: string }) => {
      await InvestmentApi.cancelInvestment(arg);
      return arg;
    }
  );

  return {
    cancelInvestment: trigger,
    isCanceling: isMutating,
    error,
  };
}

