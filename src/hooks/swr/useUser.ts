import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import { SwrKeys } from "../swr-fetcher";
import type {
  UserApiProfile,
  UpdateUserProfilePayload,
  ToggleTwoFactorPayload,
  UpdateWalletPayload,
  UserInvestment,
  CreateUserInvestmentPayload,
  UserTransaction,
  TransactionFilters,
  UserAsset,
  UserNotification,
} from "@/api/user.api";
import { UserApi } from "@/api/user.api";

/**
 * Profile Hooks
 */

/**
 * Hook for fetching user profile
 */
export function useUserProfile() {
  const { data, error, isLoading, mutate } = useSWR<UserApiProfile>(
    SwrKeys.user.profile(),
    () => UserApi.getProfile(),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  );

  return {
    profile: data,
    isLoading,
    isError: !!error,
    error,
    mutate,
  };
}

/**
 * Hook for updating user profile
 */
export function useUpdateUserProfile() {
  const { trigger, isMutating, error } = useSWRMutation(
    SwrKeys.user.profile(),
    async (_, { arg }: { arg: UpdateUserProfilePayload }) => {
      return UserApi.updateProfile(arg);
    }
  );

  return {
    updateProfile: trigger,
    isUpdating: isMutating,
    error,
  };
}

/**
 * Hook for uploading KYC document
 */
export function useUserUploadKycDocument() {
  const { trigger, isMutating, error } = useSWRMutation(
    SwrKeys.user.profile(),
    async (_, { arg }: { arg: File }) => {
      return UserApi.uploadKycDocument(arg);
    }
  );

  return {
    uploadKycDocument: trigger,
    isUploading: isMutating,
    error,
  };
}

/**
 * Hook for signing agreement
 */
export function useUserSignAgreement() {
  const { trigger, isMutating, error } = useSWRMutation(
    SwrKeys.user.profile(),
    async () => {
      return UserApi.signAgreement();
    }
  );

  return {
    signAgreement: trigger,
    isSigning: isMutating,
    error,
  };
}

/**
 * Hook for toggling two-factor authentication
 */
export function useToggleTwoFactor() {
  const { trigger, isMutating, error } = useSWRMutation(
    SwrKeys.user.profile(),
    async (_, { arg }: { arg: ToggleTwoFactorPayload }) => {
      return UserApi.toggleTwoFactor(arg);
    }
  );

  return {
    toggleTwoFactor: trigger,
    isUpdating: isMutating,
    error,
  };
}

/**
 * Hook for updating wallet
 */
export function useUpdateWallet() {
  const { trigger, isMutating, error } = useSWRMutation(
    SwrKeys.user.profile(),
    async (_, { arg }: { arg: UpdateWalletPayload }) => {
      return UserApi.updateWallet(arg);
    }
  );

  return {
    updateWallet: trigger,
    isUpdating: isMutating,
    error,
  };
}

/**
 * Investment Hooks
 */

/**
 * Hook for fetching user investments
 */
export function useUserInvestments() {
  const { data, error, isLoading, mutate } = useSWR<UserInvestment[]>(
    SwrKeys.user.investments(),
    () => UserApi.getInvestments(),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  );

  return {
    investments: data,
    isLoading,
    isError: !!error,
    error,
    mutate,
  };
}

/**
 * Hook for creating investment
 */
export function useUserCreateInvestment() {
  const { trigger, isMutating, error } = useSWRMutation(
    SwrKeys.user.investments(),
    async (_, { arg }: { arg: CreateUserInvestmentPayload }) => {
      return UserApi.createInvestment(arg);
    }
  );

  return {
    createInvestment: trigger,
    isCreating: isMutating,
    error,
  };
}

/**
 * Transaction Hooks
 */

/**
 * Hook for fetching user transactions
 */
export function useUserTransactions(filters?: TransactionFilters) {
  const { data, error, isLoading, mutate } = useSWR<UserTransaction[]>(
    SwrKeys.user.transactions(filters),
    () => UserApi.getTransactions(filters),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  );

  return {
    transactions: data,
    isLoading,
    isError: !!error,
    error,
    mutate,
  };
}

/**
 * Asset Hooks
 */

/**
 * Hook for fetching user assets
 */
export function useUserAssets() {
  const { data, error, isLoading, mutate } = useSWR<UserAsset[]>(
    SwrKeys.user.assets(),
    () => UserApi.getAssets(),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  );

  return {
    assets: data,
    isLoading,
    isError: !!error,
    error,
    mutate,
  };
}

/**
 * Notification Hooks
 */

/**
 * Hook for fetching user notifications
 */
export function useUserNotifications() {
  const { data, error, isLoading, mutate } = useSWR<UserNotification[]>(
    SwrKeys.user.notifications(),
    () => UserApi.getNotifications(),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  );

  return {
    notifications: data,
    isLoading,
    isError: !!error,
    error,
    mutate,
  };
}

/**
 * Hook for marking notification as read
 */
export function useMarkNotificationAsRead() {
  const { trigger, isMutating, error } = useSWRMutation(
    SwrKeys.user.notifications(),
    async (_, { arg }: { arg: string }) => {
      return UserApi.markNotificationAsRead(arg);
    }
  );

  return {
    markAsRead: trigger,
    isUpdating: isMutating,
    error,
  };
}

/**
 * Hook for marking all notifications as read
 */
export function useMarkAllNotificationsAsRead() {
  const { trigger, isMutating, error } = useSWRMutation(
    SwrKeys.user.notifications(),
    async () => {
      return UserApi.markAllNotificationsAsRead();
    }
  );

  return {
    markAllAsRead: trigger,
    isUpdating: isMutating,
    error,
  };
}
