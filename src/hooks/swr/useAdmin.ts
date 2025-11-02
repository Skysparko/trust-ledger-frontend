import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import { SwrKeys, adminFetchers } from "../swr-fetcher";
import type {
  AdminStats,
  AdminUserRecord,
  AdminTransaction,
  AdminDocument,
  AdminFilters,
  AdminIssuance,
  AdminProject,
  AdminWebinar,
  AdminPost,
  CreateAdminIssuancePayload,
  UpdateAdminIssuancePayload,
  CreateAdminProjectPayload,
  UpdateAdminProjectPayload,
  CreateAdminWebinarPayload,
  UpdateAdminWebinarPayload,
  CreateAdminPostPayload,
  UpdateAdminPostPayload,
  UpdateUserKycStatusPayload,
  UpdateUserStatusPayload,
} from "@/api/admin.api";
import { AdminApi } from "@/api/admin.api";

/**
 * Hook for fetching admin statistics
 */
export function useAdminStats() {
  const key = SwrKeys.admin.stats();
  console.log("[useAdminStats] SWR Key:", key);
  
  const { data, error, isLoading, mutate } = useSWR<AdminStats>(
    key,
    async () => {
      console.log("[useAdminStats] Fetching admin stats");
      try {
        const result = await AdminApi.getStats();
        console.log("[useAdminStats] API Response:", result);
        return result;
      } catch (err) {
        console.error("[useAdminStats] API Error:", err);
        throw err;
      }
    },
    {
      revalidateOnFocus: false,
    }
  );
  
  console.log("[useAdminStats] SWR State:", { isLoading, hasData: !!data, error: error?.message });

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
  console.log("[useAdminUsers] SWR Key:", key, "Filters:", filters);
  
  const { data, error, isLoading, mutate } = useSWR<AdminUserRecord[]>(
    key,
    async ([endpoint, filters]) => {
      console.log("[useAdminUsers] Fetcher called with:", { endpoint, filters });
      console.log("[useAdminUsers] Calling AdminApi.getUsers with filters:", filters);
      try {
        const result = await AdminApi.getUsers(filters);
        console.log("[useAdminUsers] API Response:", result);
        return result;
      } catch (err) {
        console.error("[useAdminUsers] API Error:", err);
        throw err;
      }
    },
    {
      revalidateOnFocus: false,
    }
  );
  
  console.log("[useAdminUsers] SWR State:", { isLoading, hasData: !!data, dataLength: Array.isArray(data) ? data.length : 'not array', error: error?.message });

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
  console.log("[useAdminTransactions] SWR Key:", key, "Filters:", filters);
  
  const { data, error, isLoading, mutate } = useSWR<AdminTransaction[]>(
    key,
    async ([endpoint, filters]) => {
      console.log("[useAdminTransactions] Fetcher called with:", { endpoint, filters });
      console.log("[useAdminTransactions] Calling AdminApi.getTransactions with filters:", filters);
      try {
        const result = await AdminApi.getTransactions(filters);
        console.log("[useAdminTransactions] API Response:", result);
        return result;
      } catch (err) {
        console.error("[useAdminTransactions] API Error:", err);
        throw err;
      }
    },
    {
      revalidateOnFocus: false,
    }
  );
  
  console.log("[useAdminTransactions] SWR State:", { isLoading, hasData: !!data, dataLength: Array.isArray(data) ? data.length : 'not array', error: error?.message });

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
  console.log("[useAdminDocuments] SWR Key:", key, "Filters:", filters);
  
  const { data, error, isLoading, mutate } = useSWR<AdminDocument[]>(
    key,
    async ([endpoint, filters]) => {
      console.log("[useAdminDocuments] Fetcher called with:", { endpoint, filters });
      console.log("[useAdminDocuments] Calling AdminApi.getDocuments with filters:", filters);
      try {
        const result = await AdminApi.getDocuments(filters);
        console.log("[useAdminDocuments] API Response:", result);
        return result;
      } catch (err) {
        console.error("[useAdminDocuments] API Error:", err);
        throw err;
      }
    },
    {
      revalidateOnFocus: false,
    }
  );
  
  console.log("[useAdminDocuments] SWR State:", { isLoading, hasData: !!data, dataLength: Array.isArray(data) ? data.length : 'not array', error: error?.message });

  return {
    documents: data ?? [],
    isLoading,
    isError: !!error,
    error,
    mutate,
  };
}

/**
 * Hook for updating user KYC status (admin)
 */
export function useUpdateUserKycStatus() {
  const { trigger, isMutating, error } = useSWRMutation(
    SwrKeys.admin.users(),
    async (_, { arg }: { arg: { id: string; payload: UpdateUserKycStatusPayload } }) => {
      return AdminApi.updateUserKycStatus(arg.id, arg.payload);
    }
  );

  return {
    updateUserKycStatus: trigger,
    isUpdating: isMutating,
    error,
  };
}

/**
 * Hook for updating user status (admin)
 */
export function useUpdateUserStatus() {
  const { trigger, isMutating, error } = useSWRMutation(
    SwrKeys.admin.users(),
    async (_, { arg }: { arg: { id: string; payload: UpdateUserStatusPayload } }) => {
      return AdminApi.updateUserStatus(arg.id, arg.payload);
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
 * Hook for fetching a single admin document
 */
export function useAdminDocument(id: string | null) {
  const { data, error, isLoading, mutate } = useSWR<AdminDocument>(
    id ? SwrKeys.admin.document(id) : null,
    (key: string) => {
      const id = key.split("/").pop() || "";
      return AdminApi.getDocument(id);
    },
    {
      revalidateOnFocus: false,
    }
  );

  return {
    document: data,
    isLoading,
    isError: !!error,
    error,
    mutate,
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

/**
 * Hook for deleting document (admin)
 */
export function useDeleteDocument() {
  const { trigger, isMutating, error } = useSWRMutation(
    SwrKeys.admin.documents(),
    async (_, { arg }: { arg: { id: string } }) => {
      return AdminApi.deleteDocument(arg.id);
    }
  );

  return {
    deleteDocument: trigger,
    isDeleting: isMutating,
    error,
  };
}

// ==================== Issuances ====================

/**
 * Hook for fetching admin issuances
 */
export function useAdminIssuances(filters?: AdminFilters) {
  const key = SwrKeys.admin.issuances(filters);
  const { data, error, isLoading, mutate } = useSWR<AdminIssuance[]>(
    key,
    ([endpoint, filters]) => AdminApi.getIssuances(filters),
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
 * Hook for fetching a single admin issuance
 */
export function useAdminIssuance(id: string | null) {
  const { data, error, isLoading, mutate } = useSWR<AdminIssuance>(
    id ? SwrKeys.admin.issuance(id) : null,
    (key: string) => {
      const id = key.split("/").pop() || "";
      return AdminApi.getIssuance(id);
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
 * Hook for creating issuance (admin)
 */
export function useCreateIssuance() {
  const { trigger, isMutating, error } = useSWRMutation(
    SwrKeys.admin.issuances(),
    async (_, { arg }: { arg: CreateAdminIssuancePayload }) => {
      return AdminApi.createIssuance(arg);
    }
  );

  return {
    createIssuance: trigger,
    isCreating: isMutating,
    error,
  };
}

/**
 * Hook for updating issuance (admin)
 */
export function useUpdateIssuance() {
  const { trigger, isMutating, error } = useSWRMutation(
    SwrKeys.admin.issuances(),
    async (_, { arg }: { arg: { id: string; payload: UpdateAdminIssuancePayload } }) => {
      return AdminApi.updateIssuance(arg.id, arg.payload);
    }
  );

  return {
    updateIssuance: trigger,
    isUpdating: isMutating,
    error,
  };
}

/**
 * Hook for deleting issuance (admin)
 */
export function useDeleteIssuance() {
  const { trigger, isMutating, error } = useSWRMutation(
    SwrKeys.admin.issuances(),
    async (_, { arg }: { arg: { id: string } }) => {
      return AdminApi.deleteIssuance(arg.id);
    }
  );

  return {
    deleteIssuance: trigger,
    isDeleting: isMutating,
    error,
  };
}

// ==================== Projects ====================

/**
 * Hook for fetching admin projects
 */
export function useAdminProjects(filters?: AdminFilters) {
  const key = SwrKeys.admin.projects(filters);
  console.log("[useAdminProjects] SWR Key:", key, "Filters:", filters);
  
  const { data, error, isLoading, mutate } = useSWR<AdminProject[]>(
    key,
    async ([endpoint, filters]) => {
      console.log("[useAdminProjects] Fetcher called with:", { endpoint, filters });
      console.log("[useAdminProjects] Calling AdminApi.getProjects with filters:", filters);
      try {
        const result = await AdminApi.getProjects(filters);
        console.log("[useAdminProjects] API Response:", result);
        return result;
      } catch (err) {
        console.error("[useAdminProjects] API Error:", err);
        throw err;
      }
    },
    {
      revalidateOnFocus: false,
    }
  );
  
  console.log("[useAdminProjects] SWR State:", { isLoading, hasData: !!data, dataLength: Array.isArray(data) ? data.length : 'not array', error: error?.message });

  return {
    projects: data ?? [],
    isLoading,
    isError: !!error,
    error,
    mutate,
  };
}

/**
 * Hook for fetching a single admin project
 */
export function useAdminProject(id: string | null) {
  const { data, error, isLoading, mutate } = useSWR<AdminProject>(
    id ? SwrKeys.admin.project(id) : null,
    (key: string) => {
      const id = key.split("/").pop() || "";
      return AdminApi.getProject(id);
    },
    {
      revalidateOnFocus: false,
    }
  );

  return {
    project: data,
    isLoading,
    isError: !!error,
    error,
    mutate,
  };
}

/**
 * Hook for creating project (admin)
 */
export function useCreateProject() {
  const { trigger, isMutating, error } = useSWRMutation(
    SwrKeys.admin.projects(),
    async (_, { arg }: { arg: CreateAdminProjectPayload }) => {
      return AdminApi.createProject(arg);
    }
  );

  return {
    createProject: trigger,
    isCreating: isMutating,
    error,
  };
}

/**
 * Hook for updating project (admin)
 */
export function useUpdateProject() {
  const { trigger, isMutating, error } = useSWRMutation(
    SwrKeys.admin.projects(),
    async (_, { arg }: { arg: { id: string; payload: UpdateAdminProjectPayload } }) => {
      return AdminApi.updateProject(arg.id, arg.payload);
    }
  );

  return {
    updateProject: trigger,
    isUpdating: isMutating,
    error,
  };
}

/**
 * Hook for deleting project (admin)
 */
export function useDeleteProject() {
  const { trigger, isMutating, error } = useSWRMutation(
    SwrKeys.admin.projects(),
    async (_, { arg }: { arg: { id: string } }) => {
      return AdminApi.deleteProject(arg.id);
    }
  );

  return {
    deleteProject: trigger,
    isDeleting: isMutating,
    error,
  };
}

// ==================== Webinars ====================

/**
 * Hook for fetching admin webinars
 */
export function useAdminWebinars(filters?: AdminFilters) {
  const key = SwrKeys.admin.webinars(filters);
  console.log("[useAdminWebinars] SWR Key:", key, "Filters:", filters);
  
  const { data, error, isLoading, mutate } = useSWR<AdminWebinar[]>(
    key,
    async ([endpoint, filters]) => {
      console.log("[useAdminWebinars] Fetcher called with:", { endpoint, filters });
      console.log("[useAdminWebinars] Calling AdminApi.getWebinars with filters:", filters);
      try {
        const result = await AdminApi.getWebinars(filters);
        console.log("[useAdminWebinars] API Response:", result);
        return result;
      } catch (err) {
        console.error("[useAdminWebinars] API Error:", err);
        throw err;
      }
    },
    {
      revalidateOnFocus: false,
    }
  );
  
  console.log("[useAdminWebinars] SWR State:", { isLoading, hasData: !!data, dataLength: Array.isArray(data) ? data.length : 'not array', error: error?.message });

  return {
    webinars: data ?? [],
    isLoading,
    isError: !!error,
    error,
    mutate,
  };
}

/**
 * Hook for fetching a single admin webinar
 */
export function useAdminWebinar(id: string | null) {
  const { data, error, isLoading, mutate } = useSWR<AdminWebinar>(
    id ? SwrKeys.admin.webinar(id) : null,
    (key: string) => {
      const id = key.split("/").pop() || "";
      return AdminApi.getWebinar(id);
    },
    {
      revalidateOnFocus: false,
    }
  );

  return {
    webinar: data,
    isLoading,
    isError: !!error,
    error,
    mutate,
  };
}

/**
 * Hook for creating webinar (admin)
 */
export function useCreateWebinar() {
  const { trigger, isMutating, error } = useSWRMutation(
    SwrKeys.admin.webinars(),
    async (_, { arg }: { arg: CreateAdminWebinarPayload }) => {
      return AdminApi.createWebinar(arg);
    }
  );

  return {
    createWebinar: trigger,
    isCreating: isMutating,
    error,
  };
}

/**
 * Hook for updating webinar (admin)
 */
export function useUpdateWebinar() {
  const { trigger, isMutating, error } = useSWRMutation(
    SwrKeys.admin.webinars(),
    async (_, { arg }: { arg: { id: string; payload: UpdateAdminWebinarPayload } }) => {
      return AdminApi.updateWebinar(arg.id, arg.payload);
    }
  );

  return {
    updateWebinar: trigger,
    isUpdating: isMutating,
    error,
  };
}

/**
 * Hook for deleting webinar (admin)
 */
export function useDeleteWebinar() {
  const { trigger, isMutating, error } = useSWRMutation(
    SwrKeys.admin.webinars(),
    async (_, { arg }: { arg: { id: string } }) => {
      return AdminApi.deleteWebinar(arg.id);
    }
  );

  return {
    deleteWebinar: trigger,
    isDeleting: isMutating,
    error,
  };
}

// ==================== Posts ====================

/**
 * Hook for fetching admin posts
 */
export function useAdminPosts(filters?: AdminFilters) {
  const key = SwrKeys.admin.posts(filters);
  console.log("[useAdminPosts] SWR Key:", key, "Filters:", filters);
  
  const { data, error, isLoading, mutate } = useSWR<AdminPost[]>(
    key,
    async ([endpoint, filters]) => {
      console.log("[useAdminPosts] Fetcher called with:", { endpoint, filters });
      console.log("[useAdminPosts] Calling AdminApi.getPosts with filters:", filters);
      try {
        const result = await AdminApi.getPosts(filters);
        console.log("[useAdminPosts] API Response:", result);
        return result;
      } catch (err) {
        console.error("[useAdminPosts] API Error:", err);
        throw err;
      }
    },
    {
      revalidateOnFocus: false,
    }
  );
  
  console.log("[useAdminPosts] SWR State:", { isLoading, hasData: !!data, dataLength: Array.isArray(data) ? data.length : 'not array', error: error?.message });

  return {
    posts: data ?? [],
    isLoading,
    isError: !!error,
    error,
    mutate,
  };
}

/**
 * Hook for fetching a single admin post
 */
export function useAdminPost(id: string | null) {
  const { data, error, isLoading, mutate } = useSWR<AdminPost>(
    id ? SwrKeys.admin.post(id) : null,
    (key: string) => {
      const id = key.split("/").pop() || "";
      return AdminApi.getPost(id);
    },
    {
      revalidateOnFocus: false,
    }
  );

  return {
    post: data,
    isLoading,
    isError: !!error,
    error,
    mutate,
  };
}

/**
 * Hook for creating post (admin)
 */
export function useCreatePost() {
  const { trigger, isMutating, error } = useSWRMutation(
    SwrKeys.admin.posts(),
    async (_, { arg }: { arg: CreateAdminPostPayload }) => {
      return AdminApi.createPost(arg);
    }
  );

  return {
    createPost: trigger,
    isCreating: isMutating,
    error,
  };
}

/**
 * Hook for updating post (admin)
 */
export function useUpdatePost() {
  const { trigger, isMutating, error } = useSWRMutation(
    SwrKeys.admin.posts(),
    async (_, { arg }: { arg: { id: string; payload: UpdateAdminPostPayload } }) => {
      return AdminApi.updatePost(arg.id, arg.payload);
    }
  );

  return {
    updatePost: trigger,
    isUpdating: isMutating,
    error,
  };
}

/**
 * Hook for deleting post (admin)
 */
export function useDeletePost() {
  const { trigger, isMutating, error } = useSWRMutation(
    SwrKeys.admin.posts(),
    async (_, { arg }: { arg: { id: string } }) => {
      return AdminApi.deletePost(arg.id);
    }
  );

  return {
    deletePost: trigger,
    isDeleting: isMutating,
    error,
  };
}

// ==================== Investments ====================

/**
 * Hook for confirming investment (admin)
 */
export function useConfirmInvestment() {
  const { trigger, isMutating, error } = useSWRMutation(
    "/admin/investments",
    async (_, { arg }: { arg: { id: string } }) => {
      return AdminApi.confirmInvestment(arg.id);
    }
  );

  return {
    confirmInvestment: trigger,
    isConfirming: isMutating,
    error,
  };
}

/**
 * Hook for cancelling investment (admin)
 */
export function useCancelInvestment() {
  const { trigger, isMutating, error } = useSWRMutation(
    "/admin/investments",
    async (_, { arg }: { arg: { id: string } }) => {
      return AdminApi.cancelInvestment(arg.id);
    }
  );

  return {
    cancelInvestment: trigger,
    isCancelling: isMutating,
    error,
  };
}

/**
 * Hook for exporting transactions (admin)
 */
export function useExportTransactions() {
  const { trigger, isMutating, error } = useSWRMutation(
    SwrKeys.admin.transactions(),
    async (_, { arg }: { arg: { format?: "csv" | "xlsx" } }) => {
      return AdminApi.exportTransactions(arg.format || "csv");
    }
  );

  return {
    exportTransactions: trigger,
    isExporting: isMutating,
    error,
  };
}

