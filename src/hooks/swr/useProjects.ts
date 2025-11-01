import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import { SwrKeys, projectFetchers } from "../swr-fetcher";
import type { Project, ProjectFilters, CreateProjectPayload, UpdateProjectPayload } from "@/api/project.api";
import { ProjectApi } from "@/api/project.api";

/**
 * Hook for fetching projects
 */
export function useProjects(filters?: ProjectFilters) {
  const key = SwrKeys.projects.all(filters);
  const { data, error, isLoading, mutate } = useSWR<Project[]>(
    key,
    ([endpoint, filters]) => ProjectApi.getProjects(filters),
    {
      revalidateOnFocus: false,
    }
  );

  return {
    projects: data ?? [],
    isLoading,
    isError: !!error,
    error,
    mutate,
  };
}

/**
 * Hook for fetching a single project
 */
export function useProject(id: string | null) {
  const { data, error, isLoading, mutate } = useSWR<Project>(
    id ? SwrKeys.projects.detail(id) : null,
    (key: string) => {
      const id = key.split("/").pop() || "";
      return ProjectApi.getProject(id);
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
 * Hook for creating a project (admin)
 */
export function useCreateProject() {
  const { trigger, isMutating, error } = useSWRMutation(
    SwrKeys.projects.all(),
    async (_, { arg }: { arg: CreateProjectPayload }) => {
      return ProjectApi.createProject(arg);
    }
  );

  return {
    createProject: trigger,
    isCreating: isMutating,
    error,
  };
}

/**
 * Hook for updating a project (admin)
 */
export function useUpdateProject() {
  const { trigger, isMutating, error } = useSWRMutation(
    SwrKeys.projects.all(),
    async (_, { arg }: { arg: { id: string; payload: UpdateProjectPayload } }) => {
      return ProjectApi.updateProject(arg.id, arg.payload);
    }
  );

  return {
    updateProject: trigger,
    isUpdating: isMutating,
    error,
  };
}

