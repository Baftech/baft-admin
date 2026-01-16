import React from "react";

export const PoolHealthPage: React.FC = () => {
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-white tracking-tight">Reward Pool Health</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="card p-6 space-y-4">
                    <h2 className="text-lg font-semibold text-white">K Bank Promo Pool</h2>
                    <div className="text-3xl font-mono text-emerald-400 font-bold">₹15,42,050</div>
                    <div className="text-sm text-slate-400">Runway: 42 Days (at current burn)</div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 w-[75%]"></div>
                    </div>
                    <div className="flex justify-between text-xs text-slate-500">
                        <span>Threshold: 20%</span>
                        <span>Current: 75%</span>
                    </div>
                </div>

                <div className="card p-6 space-y-4">
                    <h2 className="text-lg font-semibold text-white">Disbursement Health</h2>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center text-sm p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-200">
                            <span>Failed Payouts (Last 24h)</span>
                            <span className="font-bold">3</span>
                        </div>
                        <div className="flex justify-between items-center text-sm p-3 bg-slate-800 rounded-lg">
                            <span>Pending Batch Size</span>
                            <span className="font-mono text-white">₹1.2L</span>
                        </div>
                        <div className="flex justify-between items-center text-sm p-3 bg-slate-800 rounded-lg">
                            <span>Last Top-up</span>
                            <span className="text-slate-400">3 days ago</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
