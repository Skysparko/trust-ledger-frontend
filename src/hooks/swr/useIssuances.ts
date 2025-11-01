import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import { SwrKeys, issuanceFetchers } from "../swr-fetcher";
import type { Issuance, IssuanceFilters, CreateIssuancePayload, UpdateIssuancePayload } from "@/api/issuance.api";
import { IssuanceApi } from "@/api/issuance.api";

/**
 * Hook for fetching issuances
 */
export function useIssuances(filters?: IssuanceFilters) {
  const key = SwrKeys.issuances.all(filters);
  const { data, error, isLoading, mutate } = useSWR<Issuance[]>(
    key,
    ([endpoint, filters]) => IssuanceApi.getIssuances(filters),
    {
      revalidateOnFocus: false,
    }
  );

  return {
    issuances: data ?? [],
    isLoading,
    isError: !!error,
    error,
    mutate,
  };
}

/**
 * Hook for fetching a single issuance
 */
export function useIssuance(id: string | null) {
  const { data, error, isLoading, mutate } = useSWR<Issuance>(
    id ? SwrKeys.issuances.detail(id) : null,
    (key: string) => {
      const id = key.split("/").pop() || "";
      return IssuanceApi.getIssuance(id);
    },
    {
      revalidateOnFocus: false,
    }
  );

  return {
    issuance: data,
    isLoading,
    isError: !!error,
    error,
    mutate,
  };
}

/**
 * Hook for fetching open issuances
 */
export function useOpenIssuances() {
  const { data, error, isLoading, mutate } = useSWR<Issuance[]>(
    SwrKeys.issuances.open(),
    () => IssuanceApi.getOpenIssuances(),
    {
      revalidateOnFocus: false,
    }
  );

  return {
    issuances: data ?? [],
    isLoading,
    isError: !!error,
    error,
    mutate,
  };
}

/**
 * Hook for fetching upcoming issuances
 */
export function useUpcomingIssuances() {
  const { data, error, isLoading, mutate } = useSWR<Issuance[]>(
    SwrKeys.issuances.upcoming(),
    () => IssuanceApi.getUpcomingIssuances(),
    {
      revalidateOnFocus: false,
    }
  );

  return {
    issuances: data ?? [],
    isLoading,
    isError: !!error,
    error,
    mutate,
  };
}

/**
 * Hook for creating an issuance (admin)
 */
export function useCreateIssuance() {
  const { trigger, isMutating, error } = useSWRMutation(
    SwrKeys.issuances.all(),
    async (_, { arg }: { arg: CreateIssuancePayload }) => {
      return IssuanceApi.createIssuance(arg);
    }
  );

  return {
    createIssuance: trigger,
    isCreating: isMutating,
    error,
  };
}

/**
 * Hook for updating an issuance (admin)
 */
export function useUpdateIssuance() {
  const { trigger, isMutating, error } = useSWRMutation(
    SwrKeys.issuances.all(),
    async (_, { arg }: { arg: { id: string; payload: UpdateIssuancePayload } }) => {
      return IssuanceApi.updateIssuance(arg.id, arg.payload);
    }
  );

  return {
    updateIssuance: trigger,
    isUpdating: isMutating,
    error,
  };
}

