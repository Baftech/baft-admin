import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Admin, AdminRole } from "../types";
import { apiClient } from "../api/client";

interface AuthState {
  admin: Admin | null;
  accessToken: string | null;
  refreshToken: string | null;
}

interface LoginResponse {
  admin: Admin;
  accessToken: string;
  refreshToken: string;
}

interface AuthContextValue extends AuthState {
  isAuthenticated: boolean;
  loginWithFinalToken: (payload: LoginResponse) => void;
  logout: () => Promise<void>;
  hasRole: (role: AdminRole | AdminRole[]) => boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const ACCESS_KEY = "baft_admin_access_token";
const REFRESH_KEY = "baft_admin_refresh_token";
const ADMIN_KEY = "baft_admin_profile";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const [state, setState] = useState<AuthState>(() => {
    const accessToken = window.localStorage.getItem(ACCESS_KEY);
    const refreshToken = window.localStorage.getItem(REFRESH_KEY);
    const adminRaw = window.localStorage.getItem(ADMIN_KEY);
    const admin = adminRaw ? (JSON.parse(adminRaw) as Admin) : null;
    return { admin, accessToken, refreshToken };
  });

  // Token refresh is now handled by the API client interceptor on 401 errors.
  // We don't need a proactive interval here anymore, or we could keep it as a backup.
  // For now, removing it to rely on the reactive 401 handling.

  const persist = (next: AuthState) => {
    setState(next);
    if (next.accessToken) {
      window.localStorage.setItem(ACCESS_KEY, next.accessToken);
    } else {
      window.localStorage.removeItem(ACCESS_KEY);
    }
    if (next.refreshToken) {
      window.localStorage.setItem(REFRESH_KEY, next.refreshToken);
    } else {
      window.localStorage.removeItem(REFRESH_KEY);
    }
    if (next.admin) {
      window.localStorage.setItem(ADMIN_KEY, JSON.stringify(next.admin));
    } else {
      window.localStorage.removeItem(ADMIN_KEY);
    }
  };

  const refreshTokens = async () => {
    if (!state.refreshToken) return;
    try {
      const res = await apiClient.post<LoginResponse>("/auth/refresh", {
        refreshToken: state.refreshToken
      });
      persist({
        admin: res.admin,
        accessToken: res.accessToken,
        refreshToken: res.refreshToken
      });
    } catch {
      await logout();
    }
  };

  const loginWithFinalToken = (payload: LoginResponse) => {
    persist({
      admin: payload.admin,
      accessToken: payload.accessToken,
      refreshToken: payload.refreshToken
    });
    navigate("/");
  };

  const logout = async () => {
    try {
      if (state.refreshToken) {
        await apiClient.post("/auth/logout", { refreshToken: state.refreshToken });
      }
    } catch {
      // ignore
    } finally {
      persist({ admin: null, accessToken: null, refreshToken: null });
      navigate("/login");
    }
  };

  const hasRole = (roles: AdminRole | AdminRole[]) => {
    if (!state.admin) return false;
    const current = (state.admin.role || "").toUpperCase();

    const list = (Array.isArray(roles) ? roles : [roles]).map((r) => r.toUpperCase());

    // Any variant of SUPERADMIN gets full access
    if (current.includes("SUPER")) return true;

    return list.includes(current);
  };

  const value: AuthContextValue = {
    ...state,
    isAuthenticated: Boolean(state.accessToken),
    loginWithFinalToken,
    logout,
    hasRole
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
};


