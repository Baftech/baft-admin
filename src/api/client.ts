import type { ApiError } from "../types";

// Always call the backend via the Vite proxy at /api/admin
const API_BASE_URL = "/api/admin";
const ACCESS_KEY_PRIMARY = "baft_admin_access_token";
const ACCESS_KEY_ALT = "admin_access_token";

export class ApiClient {
  private getAccessToken(): string | null {
    // Prefer the key used by this frontend, but also support the docs' {{admin_access_token}} name.
    const primary = window.localStorage.getItem(ACCESS_KEY_PRIMARY);
    const alt = window.localStorage.getItem(ACCESS_KEY_ALT);
    const token = primary || alt;

    if (!token) {
      console.warn("[API Client] Admin access token is missing from localStorage");
      console.warn("  Checked keys:", ACCESS_KEY_PRIMARY, "and", ACCESS_KEY_ALT);
      console.warn("  Please login to get a valid token");
    } else {
      console.log("[API Client] Admin access token found", token.substring(0, 20) + "...");
    }

    return token;
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
        console.log("[API Client] Adding Bearer token to request:", path);
      } else {
        console.error("[API Client] No token available for request:", path);
        console.error("  Request will be sent without Authorization header");
      }
    } else {
      console.log("[API Client] Using provided Authorization header for:", path);
    }

    const fullUrl = `${API_BASE_URL}${path}`;
    console.log("[API Client] Making request:", options.method || "GET", fullUrl);

    let res = await fetch(fullUrl, {
      ...options,
      headers
    });

    console.log(
      "[API Client] Response status:",
      res.status,
      res.statusText,
      "for",
      path
    );

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
            res = await fetch(fullUrl, {
              ...options,
              headers
            });
          } else {
            // Refresh failed, clear tokens and let the error propagate (or redirect)
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


