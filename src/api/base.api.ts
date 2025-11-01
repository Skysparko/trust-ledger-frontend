import axiosInstance from "@/lib/axios";
import { AxiosError } from "axios";

// Standardized API response format
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// Error response format
export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}

/**
 * Abstract base class for all API services
 * Provides common HTTP methods with unified error handling
 */
export abstract class BaseApi {
  /**
   * GET request
   */
  protected static async get<T>(url: string, config?: any): Promise<T> {
    try {
      const response = await axiosInstance.get<ApiResponse<T>>(url, config);
      return this.extractData(response.data);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * POST request
   */
  protected static async post<T>(url: string, data?: any, config?: any): Promise<T> {
    try {
      const response = await axiosInstance.post<ApiResponse<T>>(url, data, config);
      return this.extractData(response.data);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * PUT request
   */
  protected static async put<T>(url: string, data?: any, config?: any): Promise<T> {
    try {
      const response = await axiosInstance.put<ApiResponse<T>>(url, data, config);
      return this.extractData(response.data);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * DELETE request
   */
  protected static async delete<T>(url: string, config?: any): Promise<T> {
    try {
      const response = await axiosInstance.delete<ApiResponse<T>>(url, config);
      return this.extractData(response.data);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * PATCH request
   */
  protected static async patch<T>(url: string, data?: any, config?: any): Promise<T> {
    try {
      const response = await axiosInstance.patch<ApiResponse<T>>(url, data, config);
      return this.extractData(response.data);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Extract data from standardized API response format
   * Handles both { success, data, message } and direct data responses
   */
  private static extractData<T>(response: ApiResponse<T> | T): T {
    // If response already matches expected format, extract data
    if (response && typeof response === "object" && "success" in response) {
      if (response.success && "data" in response) {
        return response.data;
      }
      // If success is false, throw error
      if (!response.success) {
        throw new Error((response as any).message || "Request failed");
      }
    }
    // Otherwise, return response as-is (for non-standardized APIs)
    return response as T;
  }

  /**
   * Unified error handling
   */
  private static handleError(error: unknown): Error {
    if (error instanceof AxiosError) {
      const message = 
        (error.response?.data as any)?.message ||
        (error.response?.data as any)?.error ||
        error.message ||
        "An unexpected error occurred";
      
      const apiError = new Error(message);
      (apiError as any).status = error.response?.status;
      (apiError as any).data = error.response?.data;
      return apiError;
    }
    
    if (error instanceof Error) {
      return error;
    }
    
    return new Error("An unexpected error occurred");
  }

  /**
   * Handle FormData for file uploads
   */
  protected static async postFormData<T>(
    url: string,
    formData: FormData,
    onUploadProgress?: (progressEvent: any) => void
  ): Promise<T> {
    try {
      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress,
      };
      
      const response = await axiosInstance.post<ApiResponse<T>>(url, formData, config);
      return this.extractData(response.data);
    } catch (error) {
      throw this.handleError(error);
    }
  }
}

