import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../../api/client";

interface Party {
  account_id: string;
  user_id: string | null;
  name: string;
  vpa_handle?: string;
  type: string;
}

interface TransactionDetail {
  id: string;
  type: string;
  status: string;
  amount: number;
  description?: string;
  created_at: string;
  source: Party;
  destination: Party;
}

interface LedgerEntry {
  id: string;
  account: string;
  debit: number;
  credit: number;
  currency: string;
  created_at: string;
}

interface TransactionDetailResponse {
  transaction: TransactionDetail;
  ledgerEntries: LedgerEntry[];
}

export const TransactionDetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, error } = useQuery({
    queryKey: ["transaction", id],
    enabled: Boolean(id),
    queryFn: async () => apiClient.get<TransactionDetailResponse>(`/transactions/${id}`)
  });

  const txn = data?.transaction;

  const formatAmount = (amountInMinor: number | string, currency: string) => {
    const numeric = Number(amountInMinor);
    if (!Number.isFinite(numeric)) return "—";
    const value = numeric / 100;
    try {
      // Try ISO currency formatting first
      return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency
      }).format(value);
    } catch {
      // Fallback for sandbox/test currencies like BCOIN
      return `${currency || "N/A"} ${value.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}`;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/transactions")}
            className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Transaction Details</h1>
            {txn && (
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <span className="font-mono text-xs bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                  {txn.id}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${txn.status === "SUCCESSFUL"
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    : txn.status === "PENDING"
                      ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                      : "bg-red-500/10 text-red-400 border-red-500/20"
                  }`}>
                  {txn.status}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="h-6 w-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm">
          {(error as Error).message}
        </div>
      )}

      {txn && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Overview Card */}
          <div className="card p-6 space-y-4 lg:col-span-1 h-fit">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Overview</h3>
            <div className="space-y-4">
              <div className="p-4 bg-slate-950/50 rounded-lg border border-slate-800/50">
                <div className="text-xs text-slate-500 mb-1">Amount</div>
                <div className="text-3xl font-bold text-white font-mono tracking-tight">
                  {(() => {
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
                    return hasValidAmount
                      ? (amountInPaise / 100).toLocaleString("en-IN", {
                          style: "currency",
                          currency: "INR"
                        })
                      : "₹0.00";
                  })()}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-950/50 rounded-lg border border-slate-800/50">
                  <div className="text-xs text-slate-500 mb-1">Type</div>
                  <div className="text-slate-200 font-medium">{txn.type}</div>
                </div>
                <div className="p-3 bg-slate-950/50 rounded-lg border border-slate-800/50">
                  <div className="text-xs text-slate-500 mb-1">Created</div>
                  <div className="text-slate-200 font-medium text-xs">
                    {new Date(txn.created_at).toLocaleString(undefined, {
                      dateStyle: 'medium',
                      timeStyle: 'short'
                    })}
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-950/50 rounded-lg border border-slate-800/50">
                <div className="text-xs text-slate-500 mb-1">Description</div>
                <div className="text-slate-200 text-sm">{txn.description || "No description provided"}</div>
              </div>
            </div>
          </div>

          {/* Participants Card */}
          <div className="card p-6 space-y-4 lg:col-span-2 h-fit">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Participants</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
              {/* Connector Line (Desktop) */}
              <div className="hidden md:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                <div className="bg-slate-800 rounded-full p-2 border border-slate-700 shadow-xl">
                  <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </div>
              </div>

              {/* Source */}
              <div className="group relative p-5 rounded-xl bg-slate-950/50 border border-slate-800/50 hover:border-slate-700 transition-all">
                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                  <svg className="w-12 h-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="text-xs font-bold text-slate-500 uppercase mb-3 tracking-wider">Source</div>
                <div className="space-y-2">
                  <div className="text-lg font-semibold text-white">{txn.source.name}</div>
                  <div className="text-xs text-slate-400 font-mono bg-slate-900/50 px-2 py-1 rounded inline-block border border-slate-800">
                    {txn.source.account_id}
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase">Type</div>
                      <div className="text-xs text-slate-300">{txn.source.type}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase">User ID</div>
                      <div className="text-xs text-slate-300 truncate" title={txn.source.user_id || "System"}>
                        {txn.source.user_id || "System"}
                      </div>
                    </div>
                  </div>
                  {txn.source.vpa_handle && (
                    <div className="pt-2 border-t border-slate-800/50 mt-2">
                      <div className="text-[10px] text-slate-500 uppercase">VPA</div>
                      <div className="text-xs text-slate-300">{txn.source.vpa_handle}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Destination */}
              <div className="group relative p-5 rounded-xl bg-slate-950/50 border border-slate-800/50 hover:border-slate-700 transition-all">
                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                  <svg className="w-12 h-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <div className="text-xs font-bold text-slate-500 uppercase mb-3 tracking-wider">Destination</div>
                <div className="space-y-2">
                  <div className="text-lg font-semibold text-white">{txn.destination.name}</div>
                  <div className="text-xs text-slate-400 font-mono bg-slate-900/50 px-2 py-1 rounded inline-block border border-slate-800">
                    {txn.destination.account_id}
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase">Type</div>
                      <div className="text-xs text-slate-300">{txn.destination.type}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase">User ID</div>
                      <div className="text-xs text-slate-300 truncate" title={txn.destination.user_id || "System"}>
                        {txn.destination.user_id || "System"}
                      </div>
                    </div>
                  </div>
                  {txn.destination.vpa_handle && (
                    <div className="pt-2 border-t border-slate-800/50 mt-2">
                      <div className="text-[10px] text-slate-500 uppercase">VPA</div>
                      <div className="text-xs text-slate-300">{txn.destination.vpa_handle}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {data?.ledgerEntries && (
        <div className="card overflow-hidden border-slate-800/60 bg-slate-900/40 backdrop-blur-sm">
          <div className="px-6 py-4 border-b border-slate-800/60 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Ledger Entries</h3>
            <span className="text-xs text-slate-500 bg-slate-900/50 px-2 py-1 rounded border border-slate-800">
              {data.ledgerEntries.length} entries
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-slate-900/40 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  <th className="px-6 py-3">Account</th>
                  <th className="px-6 py-3">Debit</th>
                  <th className="px-6 py-3">Credit</th>
                  <th className="px-6 py-3">Currency</th>
                  <th className="px-6 py-3">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {data.ledgerEntries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-slate-200 font-medium">{entry.account}</span>
                        <span className="text-xs text-slate-500 font-mono mt-0.5">{entry.id}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-emerald-400/90">
                      {formatAmount(entry.debit, entry.currency)}
                    </td>
                    <td className="px-6 py-4 font-mono text-rose-400/90">
                      {formatAmount(entry.credit, entry.currency)}
                    </td>
                    <td className="px-6 py-4 text-slate-400 text-xs">{entry.currency}</td>
                    <td className="px-6 py-4 text-slate-400 text-xs">
                      {new Date(entry.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};





