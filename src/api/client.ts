import type { ApiError } from "../types";

const API_BASE_URL =
  (import.meta as any).env?.VITE_ADMIN_API_BASE_URL ||
  (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_API_BASE_URL) ||
  "/api/admin";

export class ApiClient {
  private getAccessToken(): string | null {
    return window.localStorage.getItem("baft_admin_access_token");
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const optionsHeaders = (options.headers as Record<string, string>) || {};
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...optionsHeaders
    };

    // Only use localStorage token if Authorization header wasn't explicitly provided
    if (!optionsHeaders.Authorization) {
      const token = this.getAccessToken();
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    }

    let res = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers
    });

    // Handle 401 Unauthorized - Attempt Refresh
    if (res.status === 401 && !path.includes("/auth/login") && !path.includes("/auth/refresh")) {
      const refreshToken = window.localStorage.getItem("baft_admin_refresh_token");
      if (refreshToken) {
        try {
          // Try to refresh the token
          const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken })
          });

          if (refreshRes.ok) {
            const data = await refreshRes.json();
            // Update local storage with new tokens
            window.localStorage.setItem("baft_admin_access_token", data.accessToken);
            window.localStorage.setItem("baft_admin_refresh_token", data.refreshToken);

            // Retry the original request with the new token
            headers.Authorization = `Bearer ${data.accessToken}`;
            res = await fetch(`${API_BASE_URL}${path}`, {
              ...options,
              headers
            });
          } else {
            // Refresh failed, clear tokens and let the error propagate (or redirect)
            // The AuthContext will likely pick this up or the user will be redirected on next nav
            window.localStorage.removeItem("baft_admin_access_token");
            window.localStorage.removeItem("baft_admin_refresh_token");
            window.localStorage.removeItem("baft_admin_profile");
            window.location.href = "/login";
            throw new Error("Session expired. Please login again.");
          }
        } catch (e) {
          window.localStorage.removeItem("baft_admin_access_token");
          window.localStorage.removeItem("baft_admin_refresh_token");
          window.localStorage.removeItem("baft_admin_profile");
          window.location.href = "/login";
          throw e;
        }
      }
    }

    if (!res.ok) {
      let errorBody: ApiError | undefined;
      try {
        errorBody = (await res.json()) as ApiError;
      } catch {
        // ignore
      }
      const error = new Error(errorBody?.message || "Request failed");
      (error as any).code = errorBody?.error_code;
      (error as any).status = res.status;
      throw error;
    }

    if (res.status === 204) {
      return {} as T;
    }

    return (await res.json()) as T;
  }

  get<T>(path: string, init?: RequestInit) {
    return this.request<T>(path, { ...(init || {}), method: "GET" });
  }

  post<T>(path: string, body?: unknown, init?: RequestInit) {
    return this.request<T>(path, {
      ...(init || {}),
      method: "POST",
      body: body ? JSON.stringify(body) : undefined
    });
  }

  patch<T>(path: string, body?: unknown, init?: RequestInit) {
    return this.request<T>(path, {
      ...(init || {}),
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined
    });
  }
}

export const apiClient = new ApiClient();


