import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../../api/client";

interface LargeTransaction {
  transaction_id: string;
  type: string;
  status: string;
  amount: number;
  created_at: string;
  source_user_id?: string;
  source_name: string;
  destination_name: string;
}

interface LargeTransactionsResponse {
  data: LargeTransaction[];
  min_amount_paise: number;
  window_minutes: number;
  generated_at: string;
}

export const LargeTransactionsPage: React.FC = () => {
  const [minAmount, setMinAmount] = useState(1_000_000);
  const [params, setParams] = useState({ min_amount: 1_000_000 });

  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ["risk-large-txns", params],
    queryFn: async () =>
      apiClient.get<LargeTransactionsResponse>(
        `/risk/large-transactions?min_amount=${params.min_amount}`
      ),
    refetchInterval: 60_000
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-white tracking-tight">Large Transactions</h1>
          <p className="text-sm text-slate-400 max-w-lg">
            Monitor significant value transfers. Shows transactions exceeding the configured threshold in the last 24h.
          </p>
        </div>
        <form
          className="flex flex-col sm:flex-row gap-3 w-full md:w-auto"
          onSubmit={(e) => {
            e.preventDefault();
            setParams({ min_amount: minAmount });
          }}
        >
          <div className="relative">
            <input
              className="input pl-3 bg-slate-900/50 border-slate-800 w-full sm:w-48"
              type="number"
              min={500000}
              step={100000}
              value={minAmount}
              onChange={(e) => setMinAmount(Number(e.target.value))}
              placeholder="Min Amount (paise)"
            />
            <span className="absolute right-3 top-2.5 text-xs text-slate-500 pointer-events-none">paise</span>
          </div>
          <button className="btn-primary whitespace-nowrap" type="submit">
            Update Threshold
          </button>
        </form>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm">
          {(error as Error).message}
        </div>
      )}

      <div className="card overflow-hidden border-slate-800/60 bg-slate-900/40 backdrop-blur-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/60 bg-slate-900/20">
          <div className="flex items-center gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary-500"></span>
              <span>Window: <span className="text-slate-200 font-medium">{data?.window_minutes ?? 1440}m</span></span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <span>Min Amount: <span className="text-slate-200 font-medium">
                {((data?.min_amount_paise ?? params.min_amount) / 100).toLocaleString("en-IN", {
                  style: "currency",
                  currency: "INR"
                })}
              </span></span>
            </div>
          </div>
          <button
            className="text-xs text-primary-400 hover:text-primary-300 transition-colors flex items-center gap-1"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <svg className={`w-3 h-3 ${isFetching ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {isFetching ? "Refreshing..." : "Refresh Now"}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-slate-900/40 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                <th className="px-6 py-4">Transaction Details</th>
                <th className="px-6 py-4">Source</th>
                <th className="px-6 py-4">Destination</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Date & Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {isLoading && (
                <tr>
                  <td className="px-6 py-12 text-center text-slate-400" colSpan={5}>
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-5 w-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                      <span>Scanning for large transactions...</span>
                    </div>
                  </td>
                </tr>
              )}
              {!isLoading && !error && data?.data.length === 0 && (
                <tr>
                  <td className="px-6 py-12 text-center text-slate-400" colSpan={5}>
                    <div className="flex flex-col items-center gap-2">
                      <svg className="w-8 h-8 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>No transactions found above this threshold.</span>
                    </div>
                  </td>
                </tr>
              )}
              {data?.data.map((txn) => (
                <tr key={txn.transaction_id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-slate-200 font-medium font-mono text-xs bg-slate-800/50 px-1.5 py-0.5 rounded border border-slate-700/50 w-fit">
                        {txn.transaction_id.slice(0, 8)}...
                      </span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-slate-400">{txn.type}</span>
                        <span className="text-xs text-slate-600">•</span>
                        <span className={`text-xs font-medium ${txn.status === 'SUCCESSFUL' ? 'text-emerald-400' : 'text-slate-400'
                          }`}>{txn.status}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-slate-200 text-sm">{txn.source_name}</span>
                      <span className="text-xs text-slate-500 font-mono mt-0.5">
                        {txn.source_user_id || "System"}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-slate-200 text-sm">{txn.destination_name}</span>
                  </td>
                  <td className="px-6 py-4 font-mono text-amber-400/90 font-medium">
                    {(txn.amount / 100).toLocaleString("en-IN", { style: "currency", currency: "INR" })}
                  </td>
                  <td className="px-6 py-4 text-slate-400 text-xs">
                    {new Date(txn.created_at).toLocaleString(undefined, {
                      dateStyle: 'medium',
                      timeStyle: 'short'
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};





