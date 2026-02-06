import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../../api/client";
import type { Pagination } from "../../types";

interface TransactionSummary {
  id: string;
  type: string;
  status: string;
  amount: number;
  description?: string;
  created_at: string;
  source_account_id: string;
  destination_account_id: string;
  source_name?: string;
  destination_name?: string;
}

interface TransactionsListResponse {
  data: TransactionSummary[];
  pagination: Pagination;
}

export const TransactionsListPage: React.FC = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [userId, setUserId] = useState("");
  const [txnId, setTxnId] = useState("");
  const [filters, setFilters] = useState({ user_id: "", transaction_id: "" });

  const { data, isLoading, error } = useQuery({
    queryKey: ["transactions", page, filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", "25");
      if (filters.user_id) params.set("user_id", filters.user_id);
      if (filters.transaction_id) params.set("transaction_id", filters.transaction_id);
      return apiClient.get<TransactionsListResponse>(`/transactions?${params.toString()}`);
    },
    placeholderData: (previousData) => previousData
  });

  const totalPages = data?.pagination.totalPages ?? 1;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-white tracking-tight">Transactions</h1>
          <p className="text-sm text-slate-400 max-w-lg">
            Global ledger search. Filter by transaction ID or user ID across source/destination.
          </p>
        </div>
        <form
          className="flex flex-col sm:flex-row gap-3 w-full md:w-auto"
          onSubmit={(e) => {
            e.preventDefault();
            setPage(1);
            setFilters({
              user_id: userId.trim(),
              transaction_id: txnId.trim()
            });
          }}
        >
          <div className="relative">
            <input
              className="input pl-9 bg-slate-900/50 border-slate-800 w-full sm:w-48"
              placeholder="Transaction ID"
              value={txnId}
              onChange={(e) => setTxnId(e.target.value)}
            />
            <svg className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
            </svg>
          </div>
          <div className="relative">
            <input
              className="input pl-9 bg-slate-900/50 border-slate-800 w-full sm:w-48"
              placeholder="User ID"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
            />
            <svg className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <button className="btn-primary" type="submit">
            Apply Filters
          </button>
        </form>
      </div>

      <div className="card overflow-hidden border-slate-800/60 bg-slate-900/40 backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800/60 bg-slate-900/40 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                <th className="px-6 py-4">Transaction Details</th>
                <th className="px-6 py-4">Source</th>
                <th className="px-6 py-4">Destination</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date & Time</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {isLoading && (
                <tr>
                  <td className="px-6 py-12 text-center text-slate-400" colSpan={7}>
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-5 w-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                      <span>Loading transactions...</span>
                    </div>
                  </td>
                </tr>
              )}
              {error && !isLoading && (
                <tr>
                  <td className="px-6 py-12 text-center text-red-400" colSpan={7}>
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 inline-block">
                      {(error as Error).message}
                    </div>
                  </td>
                </tr>
              )}
              {!isLoading && !error && data?.data.length === 0 && (
                <tr>
                  <td className="px-6 py-12 text-center text-slate-400" colSpan={7}>
                    No transactions found matching your filters.
                  </td>
                </tr>
              )}
              {data?.data.map((txn) => {
                const rawAmount =
                  (txn as any).amount ??
                  (txn as any).amount_paise ??
                  (txn as any).amountPaise ??
                  (txn as any).amount_paisa ??
                  (txn as any).amount_in_paise ??
                  (txn as any).amountInPaise ??
                  (txn as any).amountInPaisa;
                const amountInPaise = Number(rawAmount);
                const hasValidAmount = Number.isFinite(amountInPaise);
                const displayAmount = hasValidAmount
                  ? (amountInPaise / 100).toLocaleString("en-IN", {
                      style: "currency",
                      currency: "INR"
                    })
                  : "₹0.00";

                return (
                  <tr
                    key={txn.id}
                    className="group hover:bg-slate-800/30 transition-colors cursor-pointer"
                    onClick={() => navigate(`/transactions/${txn.id}`)}
                  >
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-200 font-medium font-mono text-xs bg-slate-800/50 px-1.5 py-0.5 rounded border border-slate-700/50">
                          {txn.id.slice(0, 8)}...
                        </span>
                        <span className="text-xs text-slate-400">• {txn.type}</span>
                      </div>
                      <span className="text-xs text-slate-500 mt-1">
                        {txn.description || "No description"}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col max-w-[200px]">
                      <span className="text-slate-200 text-sm truncate" title={txn.source_name || txn.source_account_id}>
                        {txn.source_name || txn.source_account_id}
                      </span>
                      <span className="text-xs text-slate-500 font-mono truncate" title={txn.source_account_id}>
                        {txn.source_account_id.slice(0, 12)}...
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col max-w-[200px]">
                      <span className="text-slate-200 text-sm truncate" title={txn.destination_name || txn.destination_account_id}>
                        {txn.destination_name || txn.destination_account_id}
                      </span>
                      <span className="text-xs text-slate-500 font-mono truncate" title={txn.destination_account_id}>
                        {txn.destination_account_id.slice(0, 12)}...
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-slate-200 font-medium font-mono">
                      {displayAmount}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${txn.status === "SUCCESSFUL"
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : txn.status === "PENDING"
                          ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                          : "bg-red-500/10 text-red-400 border-red-500/20"
                      }`}>
                      {txn.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-400 text-xs">
                    {new Date(txn.created_at).toLocaleString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-primary-500 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      View Details →
                    </span>
                  </td>
                    </tr>
                  );
                })}
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





