import useSWR from "swr";
import { SwrKeys } from "../swr-fetcher";
import { AuthApi } from "@/api/auth.api";
import type { AuthUser } from "@/api/auth.api";

/**
 * Hook for fetching current authenticated user
 */
export function useAuth() {
  const { data, error, isLoading, mutate } = useSWR<AuthUser>(
    SwrKeys.auth.currentUser(),
    () => AuthApi.getCurrentUser(),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  );

  return {
    user: data,
    isLoading,
    isError: !!error,
    error,
    mutate,
  };
}

