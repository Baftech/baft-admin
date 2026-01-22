import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { campaignsApi } from "../../api/campaigns";
import { rewardsApi } from "../../api/rewards";
import { analyticsApi } from "../../api/analytics";

export const RewardsDashboard: React.FC = () => {
    const navigate = useNavigate();

    // Parallel queries for dashboard data
    const { data: campaigns } = useQuery({
        queryKey: ["campaigns"],
        queryFn: campaignsApi.list
    });

    const { data: poolHealth } = useQuery({
        queryKey: ["pool-health"],
        queryFn: analyticsApi.getPoolHealth
    });

    const { data: pendingRewards } = useQuery({
        queryKey: ["pending-rewards"],
        queryFn: rewardsApi.getPendingRewards
    });

    const { data: globalAnalytics } = useQuery({
        queryKey: ["global-analytics"],
        queryFn: analyticsApi.getGlobal
    });

    const activeCampaigns = campaigns?.filter(c => c.status === "ACTIVE") || [];
    
    // Calculate aggregate stats
    const paidToday = globalAnalytics?.reduce((acc, curr) => acc + (curr.paid_today || 0), 0) || 0;
    const pendingCount = pendingRewards?.length || 0;
    const poolBalance = poolHealth?.current_balance || 0;

    const stats = [
        { label: "Active Campaigns", value: activeCampaigns.length, color: "text-emerald-400" },
        { label: "Rewards Paid Today", value: `₹${paidToday.toLocaleString()}`, color: "text-white" },
        { label: "Pending Review", value: pendingCount, color: "text-amber-400" },
        { label: "Pool Balance", value: `₹${(poolBalance / 100000).toFixed(2)}L`, color: "text-indigo-400" },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Top Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, i) => (
                    <div key={i} className="card p-5">
                        <div className="text-sm text-slate-400 font-medium">{stat.label}</div>
                        <div className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</div>
                    </div>
                ))}
            </div>

            {/* Active Campaign Monitor */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-white">Active Campaign Monitor</h2>
                    <Link to="/rewards/campaigns" className="text-sm text-primary-400 hover:text-primary-300">View All</Link>
                </div>

                <div className="grid gap-4">
                    {activeCampaigns.map(camp => (
                        <div key={camp.id} className="card p-6">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="text-base font-semibold text-white truncate">{camp.name}</h3>
                                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20">LIVE</span>
                                    </div>
                                    <div className="text-xs text-slate-500 flex gap-4">
                                        <span>ID: {camp.id}</span>
                                        <span>Type: {camp.type}</span>
                                    </div>
                                </div>

                                {/* Mini Widgets */}
                                <div className="flex gap-8 text-sm">
                                    <div>
                                        <div className="text-slate-500 text-xs">Burned</div>
                                        <div className="font-mono text-slate-200">₹{camp.burnedAmount.toLocaleString()}</div>
                                    </div>
                                    <div>
                                        <div className="text-slate-500 text-xs">Remaining</div>
                                        <div className="font-mono text-slate-200">₹{camp.remainingAmount.toLocaleString()}</div>
                                    </div>
                                    <div>
                                        <div className="text-slate-500 text-xs">Utilization</div>
                                        <div className="font-mono text-emerald-400">
                                            {camp.totalBudget > 0 ? Math.round((camp.burnedAmount / camp.totalBudget) * 100) : 0}%
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="mt-4 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-emerald-500 rounded-full"
                                    style={{ width: `${camp.totalBudget > 0 ? (camp.burnedAmount / camp.totalBudget) * 100 : 0}%` }}
                                ></div>
                            </div>
                        </div>
                    ))}

                    {activeCampaigns.length === 0 && (
                        <div className="p-8 text-center border-2 border-dashed border-slate-800 rounded-xl text-slate-500">
                            No active campaigns running.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
