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
  raw_error?: string;
}

export interface ExternalSource {
  type: 'BANK' | 'UPI' | 'CARD' | 'WALLET';
  institution_name?: string;
  account_last_four?: string;
  vpa_handle?: string;
}

export interface Party {
  account_id: string;
  user_id: string | null;
  name: string;
  vpa_handle?: string;
  type: string;
  external_source?: ExternalSource;
}


