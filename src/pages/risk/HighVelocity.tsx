import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../../api/client";

interface HighVelocityUser {
  user_id: string;
  email: string;
  full_name: string;
  peak_hourly_count: number;
  peak_hour_time: string;
  peak_hourly_amount: number;
}

interface HighVelocityResponse {
  data: HighVelocityUser[];
  window_minutes: number;
  threshold: number;
  generated_at: string;
}

export const HighVelocityPage: React.FC = () => {
  const [intervalMinutes, setIntervalMinutes] = useState(60);
  const [threshold, setThreshold] = useState(10);
  const [params, setParams] = useState({ interval: 60, threshold: 10 });

  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ["risk-high-velocity", params],
    queryFn: async () =>
      apiClient.get<HighVelocityResponse>(
        `/risk/high-velocity?interval_minutes=${params.interval}&txn_threshold=${params.threshold}`
      ),
    refetchInterval: 60_000
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-white tracking-tight">High-Velocity Risk</h1>
          <p className="text-sm text-slate-400 max-w-lg">
            Monitor accounts exceeding transaction frequency thresholds in a rolling window.
          </p>
        </div>
        <form
          className="flex flex-col sm:flex-row gap-3 w-full md:w-auto"
          onSubmit={(e) => {
            e.preventDefault();
            setParams({ interval: intervalMinutes, threshold });
          }}
        >
          <div className="relative">
            <input
              className="input pl-3 bg-slate-900/50 border-slate-800 w-full sm:w-32"
              type="number"
              min={15}
              value={intervalMinutes}
              onChange={(e) => setIntervalMinutes(Number(e.target.value))}
              placeholder="Interval (m)"
            />
            <span className="absolute right-3 top-2.5 text-xs text-slate-500 pointer-events-none">min</span>
          </div>
          <div className="relative">
            <input
              className="input pl-3 bg-slate-900/50 border-slate-800 w-full sm:w-32"
              type="number"
              min={5}
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              placeholder="Threshold"
            />
            <span className="absolute right-3 top-2.5 text-xs text-slate-500 pointer-events-none">txns</span>
          </div>
          <button className="btn-primary whitespace-nowrap" type="submit">
            Update Filters
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
              <span>Window: <span className="text-slate-200 font-medium">{data?.window_minutes ?? params.interval}m</span></span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              <span>Threshold: <span className="text-slate-200 font-medium">{data?.threshold ?? params.threshold} txns</span></span>
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
                <th className="px-6 py-4">User Details</th>
                <th className="px-6 py-4">Peak Count</th>
                <th className="px-6 py-4">Peak Amount</th>
                <th className="px-6 py-4">Peak Hour</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {isLoading && (
                <tr>
                  <td className="px-6 py-12 text-center text-slate-400" colSpan={4}>
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-5 w-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                      <span>Analyzing transaction velocity...</span>
                    </div>
                  </td>
                </tr>
              )}
              {!isLoading && !error && data?.data.length === 0 && (
                <tr>
                  <td className="px-6 py-12 text-center text-slate-400" colSpan={4}>
                    <div className="flex flex-col items-center gap-2">
                      <svg className="w-8 h-8 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>No users exceeding the threshold in the current window.</span>
                    </div>
                  </td>
                </tr>
              )}
              {data?.data.map((item) => (
                <tr key={item.user_id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-slate-200 font-medium">{item.full_name || "Unknown User"}</span>
                      <span className="text-xs text-slate-500 font-mono mt-0.5">{item.email}</span>
                      <span className="text-[10px] text-slate-600 font-mono mt-0.5">{item.user_id}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
                      {item.peak_hourly_count} txns
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono text-slate-200">
                    {(item.peak_hourly_amount / 100).toLocaleString("en-IN", {
                      style: "currency",
                      currency: "INR"
                    })}
                  </td>
                  <td className="px-6 py-4 text-slate-400 text-xs">
                    {new Date(item.peak_hour_time).toLocaleString(undefined, {
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





