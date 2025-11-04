import { BaseApi } from "./base.api";

export type Project = {
  id: string;
  title: string;
  type: string;
  location: string;
  status: "ACTIVE" | "CANCELLED" | "COMPLETED";
  description?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type ProjectFilters = {
  status?: Project["status"];
  type?: string;
  location?: string;
};

export type CreateProjectPayload = Omit<Project, "id" | "createdAt" | "updatedAt">;
export type UpdateProjectPayload = Partial<Omit<Project, "id" | "createdAt">>;

/**
 * Project API
 * Handles project operations
 */
export class ProjectApi extends BaseApi {
  /**
   * Get all projects
   */
  static async getProjects(filters?: ProjectFilters): Promise<Project[]> {
    const params = filters ? new URLSearchParams(filters as any).toString() : "";
    return this.get<Project[]>(`/projects${params ? `?${params}` : ""}`);
  }

  /**
   * Get project by ID
   */
  static async getProject(id: string): Promise<Project> {
    return this.get<Project>(`/projects/${id}`);
  }

  /**
   * Create project (admin only)
   */
  static async createProject(payload: CreateProjectPayload): Promise<Project> {
    return this.post<Project>("/projects", payload);
  }

  /**
   * Update project (admin only)
   */
  static async updateProject(id: string, payload: UpdateProjectPayload): Promise<Project> {
    return this.put<Project>(`/projects/${id}`, payload);
  }

  /**
   * Delete project (admin only)
   */
  static async deleteProject(id: string): Promise<void> {
    return this.delete<void>(`/projects/${id}`);
  }
}

