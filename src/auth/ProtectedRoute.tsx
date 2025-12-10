import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./AuthContext";
import type { AdminRole } from "../types";

interface Props {
  allowedRoles?: AdminRole | AdminRole[];
}

export const ProtectedRoute: React.FC<Props> = ({ allowedRoles }) => {
  const { isAuthenticated, hasRole } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !hasRole(allowedRoles)) {
    return <Navigate to="/forbidden" replace />;
  }

  return <Outlet />;
};





