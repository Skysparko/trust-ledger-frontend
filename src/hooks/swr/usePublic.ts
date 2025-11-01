import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import { SwrKeys } from "../swr-fetcher";
import type {
  Post,
  PostFilters,
  Webinar,
  NewsletterSubscribePayload,
  NewsletterSubscribeResponse,
  BrochureRequestPayload,
  BrochureRequestResponse,
} from "@/api/public.api";
import { PublicApi } from "@/api/public.api";

/**
 * Hook for fetching posts
 */
export function usePosts(filters?: PostFilters) {
  const key = SwrKeys.public.posts(filters);
  const { data, error, isLoading, mutate } = useSWR<Post[]>(
    key,
    ([endpoint, filters]) => PublicApi.getPosts(filters),
    {
      revalidateOnFocus: false,
    }
  );

  return {
    posts: data ?? [],
    isLoading,
    isError: !!error,
    error,
    mutate,
  };
}

/**
 * Hook for fetching a single post
 */
export function usePost(id: string | null) {
  const { data, error, isLoading, mutate } = useSWR<Post>(
    id ? SwrKeys.public.post(id) : null,
    (key: string) => {
      const id = key.split("/").pop() || "";
      return PublicApi.getPost(id);
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
 * Hook for fetching webinars
 */
export function useWebinars() {
  const { data, error, isLoading, mutate } = useSWR<Webinar[]>(
    SwrKeys.public.webinars(),
    () => PublicApi.getWebinars(),
    {
      revalidateOnFocus: false,
    }
  );

  return {
    webinars: data ?? [],
    isLoading,
    isError: !!error,
    error,
    mutate,
  };
}

/**
 * Hook for subscribing to newsletter
 */
export function useSubscribeToNewsletter() {
  const { trigger, isMutating, error } = useSWRMutation(
    SwrKeys.public.webinars(), // Use a stable key for mutations
    async (_, { arg }: { arg: NewsletterSubscribePayload }) => {
      return PublicApi.subscribeToNewsletter(arg);
    }
  );

  return {
    subscribe: trigger,
    isSubmitting: isMutating,
    error,
  };
}

/**
 * Hook for requesting brochure
 */
export function useRequestBrochure() {
  const { trigger, isMutating, error } = useSWRMutation(
    SwrKeys.public.webinars(), // Use a stable key for mutations
    async (_, { arg }: { arg: BrochureRequestPayload }) => {
      return PublicApi.requestBrochure(arg);
    }
  );

  return {
    requestBrochure: trigger,
    isSubmitting: isMutating,
    error,
  };
}

