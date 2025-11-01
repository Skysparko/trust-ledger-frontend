import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import { SwrKeys, adminFetchers } from "../swr-fetcher";
import type {
  AdminStats,
  AdminUserRecord,
  AdminTransaction,
  AdminDocument,
  AdminFilters,
} from "@/api/admin.api";
import { AdminApi } from "@/api/admin.api";

/**
 * Hook for fetching admin statistics
 */
export function useAdminStats() {
  const { data, error, isLoading, mutate } = useSWR<AdminStats>(
    SwrKeys.admin.stats(),
    () => AdminApi.getStats(),
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
 * Hook for fetching admin users
 */
export function useAdminUsers(filters?: AdminFilters) {
  const key = SwrKeys.admin.users(filters);
  const { data, error, isLoading, mutate } = useSWR<AdminUserRecord[]>(
    key,
    ([endpoint, filters]) => AdminApi.getUsers(filters),
    {
      revalidateOnFocus: false,
    }
  );

  return {
    users: data ?? [],
    isLoading,
    isError: !!error,
    error,
    mutate,
  };
}

/**
 * Hook for fetching a single admin user
 */
export function useAdminUser(id: string | null) {
  const { data, error, isLoading, mutate } = useSWR<AdminUserRecord>(
    id ? SwrKeys.admin.user(id) : null,
    (key: string) => {
      const id = key.split("/").pop() || "";
      return AdminApi.getUser(id);
    },
    {
      revalidateOnFocus: false,
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

/**
 * Hook for fetching admin transactions
 */
export function useAdminTransactions(filters?: AdminFilters) {
  const key = SwrKeys.admin.transactions(filters);
  const { data, error, isLoading, mutate } = useSWR<AdminTransaction[]>(
    key,
    ([endpoint, filters]) => AdminApi.getTransactions(filters),
    {
      revalidateOnFocus: false,
    }
  );

  return {
    transactions: data ?? [],
    isLoading,
    isError: !!error,
    error,
    mutate,
  };
}

/**
 * Hook for fetching a single admin transaction
 */
export function useAdminTransaction(id: string | null) {
  const { data, error, isLoading, mutate } = useSWR<AdminTransaction>(
    id ? SwrKeys.admin.transaction(id) : null,
    (key: string) => {
      const id = key.split("/").pop() || "";
      return AdminApi.getTransaction(id);
    },
    {
      revalidateOnFocus: false,
    }
  );

  return {
    transaction: data,
    isLoading,
    isError: !!error,
    error,
    mutate,
  };
}

/**
 * Hook for fetching admin documents
 */
export function useAdminDocuments(filters?: AdminFilters) {
  const key = SwrKeys.admin.documents(filters);
  const { data, error, isLoading, mutate } = useSWR<AdminDocument[]>(
    key,
    ([endpoint, filters]) => AdminApi.getDocuments(filters),
    {
      revalidateOnFocus: false,
    }
  );

  return {
    documents: data ?? [],
    isLoading,
    isError: !!error,
    error,
    mutate,
  };
}

/**
 * Hook for updating user status (admin)
 */
export function useUpdateUserStatus() {
  const { trigger, isMutating, error } = useSWRMutation(
    SwrKeys.admin.users(),
    async (_, { arg }: { arg: { id: string; status: { isActive?: boolean; kycStatus?: AdminUserRecord["kycStatus"] } } }) => {
      return AdminApi.updateUserStatus(arg.id, arg.status);
    }
  );

  return {
    updateUserStatus: trigger,
    isUpdating: isMutating,
    error,
  };
}

/**
 * Hook for updating transaction status (admin)
 */
export function useUpdateTransactionStatus() {
  const { trigger, isMutating, error } = useSWRMutation(
    SwrKeys.admin.transactions(),
    async (_, { arg }: { arg: { id: string; status: AdminTransaction["status"] } }) => {
      return AdminApi.updateTransactionStatus(arg.id, arg.status);
    }
  );

  return {
    updateTransactionStatus: trigger,
    isUpdating: isMutating,
    error,
  };
}

/**
 * Hook for uploading document (admin)
 */
export function useUploadDocument() {
  const { trigger, isMutating, error } = useSWRMutation(
    SwrKeys.admin.documents(),
    async (_, { arg }: { arg: FormData }) => {
      return AdminApi.uploadDocument(arg);
    }
  );

  return {
    uploadDocument: trigger,
    isUploading: isMutating,
    error,
  };
}

