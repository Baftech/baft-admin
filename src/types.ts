export type AdminRole = "OPS" | "SUPPORT" | "FINANCE" | "SUPERADMIN" | "SUPER_ADMIN";

export interface Admin {
  id: string;
  email: string;
  // Raw role string from backend (e.g. "OPS", "SUPPORT", "FINANCE", "SUPERADMIN", "SUPER_ADMIN")
  role: string;
  fullName?: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages?: number;
}

export interface ApiError {
  error_code: string;
  message: string;
}


