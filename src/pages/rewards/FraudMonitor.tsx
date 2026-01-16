import React from "react";

export const FraudMonitorPage: React.FC = () => {
    const suspiciousUsers = [
        { id: "usr_999xxx", score: 92, reason: "Device ID reuse (5 accs)", earned: 5000 },
        { id: "usr_888xxx", score: 85, reason: "Velocity: 10 txns/min", earned: 1200 },
        { id: "usr_777xxx", score: 78, reason: "Referral cycling", earned: 450 },
    ];

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
                                <th className="px-4 py-3">Flags</th>
                                <th className="px-4 py-3 text-right">Lifetime Earned</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {suspiciousUsers.map(user => (
                                <tr key={user.id} className="hover:bg-slate-800/30">
                                    <td className="px-4 py-3 font-mono text-slate-300">{user.id}</td>
                                    <td className="px-4 py-3">
                                        <span className="text-red-400 font-bold">{user.score}</span>
                                    </td>
                                    <td className="px-4 py-3 text-red-300 text-xs">{user.reason}</td>
                                    <td className="px-4 py-3 text-right font-mono text-slate-300">₹{user.earned}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="card p-6 space-y-6">
                    <h3 className="font-semibold text-white">Global Patterns</h3>
                    <div className="space-y-4">
                        <div className="text-sm">
                            <div className="flex justify-between text-slate-400 mb-1">
                                <span>Referral Clusters</span>
                                <span className="text-red-400">3 detected</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-800 rounded-full">
                                <div className="h-full bg-red-500 w-[30%] rounded-full"></div>
                            </div>
                        </div>
                        <div className="text-sm">
                            <div className="flex justify-between text-slate-400 mb-1">
                                <span>Merchant Cycling</span>
                                <span className="text-amber-400">12 detected</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-800 rounded-full">
                                <div className="h-full bg-amber-500 w-[60%] rounded-full"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
