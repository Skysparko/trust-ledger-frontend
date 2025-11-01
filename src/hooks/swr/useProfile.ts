import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import { SwrKeys, profileFetchers } from "../swr-fetcher";
import type { UserProfile, UpdateProfilePayload } from "@/api/profile.api";
import { ProfileApi } from "@/api/profile.api";

/**
 * Hook for fetching user profile
 */
export function useProfile() {
  const { data, error, isLoading, mutate } = useSWR<UserProfile>(
    SwrKeys.profile.current(),
    () => ProfileApi.getProfile(),
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
 * Hook for updating profile
 */
export function useUpdateProfile() {
  const { trigger, isMutating, error } = useSWRMutation(
    SwrKeys.profile.current(),
    async (_, { arg }: { arg: UpdateProfilePayload }) => {
      return ProfileApi.updateProfile(arg);
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
export function useUploadKycDocument() {
  const { trigger, isMutating, error } = useSWRMutation(
    SwrKeys.profile.current(),
    async (_, { arg }: { arg: { file: File } }) => {
      return ProfileApi.uploadKycDocument(arg);
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
export function useSignAgreement() {
  const { trigger, isMutating, error } = useSWRMutation(
    SwrKeys.profile.current(),
    async () => {
      return ProfileApi.signAgreement();
    }
  );

  return {
    signAgreement: trigger,
    isSigning: isMutating,
    error,
  };
}

