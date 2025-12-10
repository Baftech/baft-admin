import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../../api/client";
import type { Pagination } from "../../types";

interface UserSummary {
  id: string;
  email: string;
  phone?: string;
  fullName?: string;
  status: string;
  createdAt: string;
  lastSignInAt?: string;
}

interface UsersListResponse {
  data: UserSummary[];
  pagination: Pagination;
}

export const UsersListPage: React.FC = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");

  const { data, isLoading, error } = useQuery({
    queryKey: ["users", page, search],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", "25");
      if (search) params.set("q", search);
      return apiClient.get<UsersListResponse>(`/users?${params.toString()}`);
    },
    placeholderData: (previousData) => previousData
  });

  const totalPages = data?.pagination.totalPages ?? 1;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-white tracking-tight">Users</h1>
          <p className="text-sm text-slate-400 max-w-lg">
            Manage user accounts, view balances, and monitor activity.
          </p>
        </div>
        <form
          className="relative w-full md:w-80"
          onSubmit={(e) => {
            e.preventDefault();
            setPage(1);
            setSearch(query);
          }}
        >
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            className="input pl-10 bg-slate-900/50 border-slate-800 focus:border-primary-500/50"
            placeholder="Search by email, phone or name..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </form>
      </div>

      <div className="card overflow-hidden border-slate-800/60 bg-slate-900/40 backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800/60 bg-slate-900/40 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Joined</th>
                <th className="px-6 py-4">Last Active</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {isLoading && (
                <tr>
                  <td className="px-6 py-12 text-center text-slate-400" colSpan={5}>
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-5 w-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                      <span>Loading users...</span>
                    </div>
                  </td>
                </tr>
              )}
              {error && !isLoading && (
                <tr>
                  <td className="px-6 py-12 text-center text-red-400" colSpan={5}>
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 inline-block">
                      {(error as Error).message}
                    </div>
                  </td>
                </tr>
              )}
              {!isLoading && !error && data?.data.length === 0 && (
                <tr>
                  <td className="px-6 py-12 text-center text-slate-400" colSpan={5}>
                    No users found matching "{search}".
                  </td>
                </tr>
              )}
              {data?.data.map((u) => (
                <tr
                  key={u.id}
                  className="group hover:bg-slate-800/30 transition-colors cursor-pointer"
                  onClick={() => navigate(`/users/${u.id}`)}
                >
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-slate-200 font-medium group-hover:text-primary-400 transition-colors">
                        {u.fullName || "Unknown Name"}
                      </span>
                      <span className="text-xs text-slate-500 font-mono mt-0.5">{u.email}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${u.status === "ACTIVE"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : u.status === "BANNED" || u.status === "FREEZE"
                            ? "bg-red-500/10 text-red-400 border-red-500/20"
                            : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                        }`}
                    >
                      {u.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-400 text-xs">
                    {new Date(u.createdAt).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric"
                    })}
                  </td>
                  <td className="px-6 py-4 text-slate-400 text-xs">
                    {u.lastSignInAt
                      ? new Date(u.lastSignInAt).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      })
                      : "Never"}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-primary-500 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      View Details →
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800/60 bg-slate-900/20">
          <span className="text-xs text-slate-500">
            Page <span className="text-slate-300 font-medium">{page}</span> of{" "}
            <span className="text-slate-300 font-medium">{totalPages}</span>
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </button>
            <button
              type="button"
              className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


