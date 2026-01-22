import React from "react";
import { useQuery } from "@tanstack/react-query";
import { analyticsApi } from "../../api/analytics";

export const PoolHealthPage: React.FC = () => {
    const { data: poolHealth, isLoading } = useQuery({
        queryKey: ["pool-health"],
        queryFn: analyticsApi.getPoolHealth
    });

    if (isLoading) {
        return <div className="p-12 text-center text-slate-500">Loading pool health...</div>;
    }

    const isCritical = poolHealth?.status === "CRITICAL";

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-white tracking-tight">Reward Pool Health</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="card p-6 space-y-4">
                    <h2 className="text-lg font-semibold text-white">Reward Pool Status</h2>
                    <div className={`text-3xl font-mono font-bold ${isCritical ? 'text-red-400' : 'text-emerald-400'}`}>
                        ₹{poolHealth?.current_balance?.toLocaleString() ?? "0"}
                    </div>
                    <div className="text-sm text-slate-400">
                        Runway: <span className="text-white font-bold">{poolHealth?.runway_days ?? 0} Days</span> (at current burn)
                    </div>
                    
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                        {/* Visual indicator of health, assuming 30 days is "full" safety buffer */}
                        <div 
                            className={`h-full ${isCritical ? 'bg-red-500' : 'bg-emerald-500'}`} 
                            style={{ width: `${Math.min(((poolHealth?.runway_days || 0) / 30) * 100, 100)}%` }}
                        ></div>
                    </div>
                    
                    <div className="flex justify-between text-xs text-slate-500">
                        <span>Status: <span className={`font-bold ${isCritical ? 'text-red-400' : 'text-emerald-400'}`}>{poolHealth?.status || "UNKNOWN"}</span></span>
                        <span>Safe Buffer: 30 Days</span>
                    </div>
                </div>

                <div className="card p-6 space-y-4">
                    <h2 className="text-lg font-semibold text-white">Disbursement Health</h2>
                    <div className="space-y-3">
                        {/* Static data as placeholder since API doesn't provide this yet */}
                        <div className="flex justify-between items-center text-sm p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-200">
                            <span>Failed Payouts (Last 24h)</span>
                            <span className="font-bold">0</span>
                        </div>
                        <div className="flex justify-between items-center text-sm p-3 bg-slate-800 rounded-lg">
                            <span>Pending Batch Size</span>
                            <span className="font-mono text-white">--</span>
                        </div>
                        <div className="flex justify-between items-center text-sm p-3 bg-slate-800 rounded-lg">
                            <span>Last Top-up</span>
                            <span className="text-slate-400">Unknown</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
