import React from "react";
import { useQuery } from "@tanstack/react-query";
import { analyticsApi } from "../../api/analytics";

export const FraudMonitorPage: React.FC = () => {
    const { data: riskData, isLoading } = useQuery({
        queryKey: ["risk-monitor"],
        queryFn: analyticsApi.getRiskMonitor
    });

    if (isLoading) {
        return <div className="p-12 text-center text-slate-500">Loading fraud intelligence...</div>;
    }

    const suspiciousUsers = riskData?.suspicious_users || [];
    const riskDist = riskData?.risk_distribution || { low: 0, medium: 0, high: 0 };
    const totalRisk = (riskDist.low || 0) + (riskDist.medium || 0) + (riskDist.high || 0) || 1;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-white tracking-tight">Fraud & Abuse Monitor</h1>
                <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-bold border border-indigo-500/20">
                    Intelligence Mode: ACTIVE
                </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="col-span-1 lg:col-span-2 card p-0 overflow-hidden">
                    <div className="p-4 border-b border-slate-800 font-semibold text-white">Top Suspicious Users</div>
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-900/50 text-slate-400 text-xs font-semibold">
                            <tr>
                                <th className="px-4 py-3">User</th>
                                <th className="px-4 py-3">Risk Score</th>
                                <th className="px-4 py-3">Reason</th>
                                <th className="px-4 py-3 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {suspiciousUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                                        No suspicious activity detected.
                                    </td>
                                </tr>
                            ) : (
                                suspiciousUsers.map((user: any) => (
                                    <tr key={user.user_id} className="hover:bg-slate-800/30">
                                        <td className="px-4 py-3 font-mono text-slate-300">{user.user_id}</td>
                                        <td className="px-4 py-3">
                                            <span className={`font-bold ${user.risk_score > 80 ? 'text-red-400' : 'text-amber-400'}`}>
                                                {user.risk_score}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-red-300 text-xs">{user.reason}</td>
                                        <td className="px-4 py-3 text-right">
                                            <button className="text-xs text-indigo-400 hover:text-indigo-300">Investigate</button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="card p-6 space-y-6">
                    <h3 className="font-semibold text-white">Risk Distribution</h3>
                    <div className="space-y-4">
                        <div className="text-sm">
                            <div className="flex justify-between text-slate-400 mb-1">
                                <span>High Risk</span>
                                <span className="text-red-400">{riskDist.high} users</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-800 rounded-full">
                                <div 
                                    className="h-full bg-red-500 rounded-full" 
                                    style={{ width: `${(riskDist.high / totalRisk) * 100}%` }}
                                ></div>
                            </div>
                        </div>
                        <div className="text-sm">
                            <div className="flex justify-between text-slate-400 mb-1">
                                <span>Medium Risk</span>
                                <span className="text-amber-400">{riskDist.medium} users</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-800 rounded-full">
                                <div 
                                    className="h-full bg-amber-500 rounded-full" 
                                    style={{ width: `${(riskDist.medium / totalRisk) * 100}%` }}
                                ></div>
                            </div>
                        </div>
                        <div className="text-sm">
                            <div className="flex justify-between text-slate-400 mb-1">
                                <span>Low Risk</span>
                                <span className="text-emerald-400">{riskDist.low} users</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-800 rounded-full">
                                <div 
                                    className="h-full bg-emerald-500 rounded-full" 
                                    style={{ width: `${(riskDist.low / totalRisk) * 100}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
