import React from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../../api/client";

interface Balance {
  accType: string;
  displayName: string;
  currency: string;
  balance: number;
  lastUpdatedAt: string;
}

interface BalancesResponse {
  data: Balance[];
}

export const SystemBalancesPage: React.FC = () => {
  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ["system-balances"],
    queryFn: async () => apiClient.get<BalancesResponse>("/system/balances"),
    refetchInterval: 30_000
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-white tracking-tight">System Balances</h1>
          <p className="text-sm text-slate-400 max-w-lg">
            Real-time overview of escrow, settlement pools, and platform reserves.
          </p>
        </div>
        <button
          className="btn-primary flex items-center gap-2"
          onClick={() => refetch()}
          disabled={isFetching}
        >
          <svg
            className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {isFetching ? "Refreshing..." : "Refresh Now"}
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm">
          {(error as Error).message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {isLoading &&
          Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="card p-6 animate-pulse space-y-4">
              <div className="h-4 w-1/3 bg-slate-800 rounded"></div>
              <div className="h-8 w-2/3 bg-slate-800 rounded"></div>
              <div className="h-3 w-1/4 bg-slate-800 rounded"></div>
            </div>
          ))}

        {data?.data.map((balance) => (
          <div key={balance.accType} className="card p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <svg className="w-16 h-16 text-primary-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39h-2.01c-.06-.89-.71-1.94-2.72-1.94-1.44 0-2.43.81-2.43 1.58 0 .84.47 1.43 2.67 1.97 2.45.61 4.13 1.72 4.13 3.67 0 1.82-1.27 2.95-3.11 3.26z" />
              </svg>
            </div>

            <div className="relative z-10 space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  {balance.accType}
                </div>
                <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse"></div>
              </div>

              <div>
                <div className="text-sm text-slate-300 mb-1">{balance.displayName}</div>
                <div className="text-3xl font-bold text-white tracking-tight font-mono">
                  {(balance.balance / 100).toLocaleString("en-IN", {
                    style: "currency",
                    currency: balance.currency || "INR"
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800/50 flex items-center gap-2 text-xs text-slate-500">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Updated {new Date(balance.lastUpdatedAt).toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};





