import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { rewardsApi, LedgerEntry } from "../../api/rewards";

export const RewardLedgerPage: React.FC = () => {
    const [filterStatus, setFilterStatus] = useState<string>("ALL");

    const { data: ledger, isLoading } = useQuery({
        queryKey: ["ledger"],
        queryFn: rewardsApi.getLedger
    });

    const getStatusColor = (status: LedgerEntry["status"]) => {
        switch (status) {
            case "PAID": return "text-emerald-400 bg-emerald-500/10";
            case "PENDING": return "text-amber-400 bg-amber-500/10";
            case "HELD": return "text-red-400 bg-red-500/10";
            case "REVERSED": return "text-slate-400 bg-slate-500/10 line-through";
            case "REJECTED": return "text-red-500 bg-red-500/10";
            default: return "text-slate-400";
        }
    };

    const filteredLedger = filterStatus === "ALL"
        ? ledger
        : ledger?.filter(l => l.status === filterStatus);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Reward Ledger</h1>
                    <p className="text-sm text-slate-400">
                        Immutable audit log of all reward events.
                    </p>
                </div>
                <button className="btn-secondary text-sm">
                    Export CSV
                </button>
            </div>

            <div className="card">
                <div className="p-4 border-b border-slate-800 flex gap-4">
                    <select
                        className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-200 outline-none focus:border-primary-500"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <option value="ALL">All Statuses</option>
                        <option value="PAID">Paid</option>
                        <option value="PENDING">Pending</option>
                        <option value="HELD">Held</option>
                        <option value="REVERSED">Reversed</option>
                    </select>
                    <input
                        type="text"
                        placeholder="Search User ID or Ref ID..."
                        className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-200 outline-none focus:border-primary-500 w-64"
                    />
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-900/50 text-slate-400 uppercase tracking-wider text-xs font-semibold">
                            <tr>
                                <th className="px-6 py-4">Timestamp</th>
                                <th className="px-6 py-4">User ID (Masked)</th>
                                <th className="px-6 py-4">Campaign</th>
                                <th className="px-6 py-4">Trigger</th>
                                <th className="px-6 py-4 text-right">Amount</th>
                                <th className="px-6 py-4 text-center">Status</th>
                                <th className="px-6 py-4 text-right">Reference</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {isLoading ? (
                                <tr><td colSpan={7} className="p-8 text-center text-slate-500">Loading ledger...</td></tr>
                            ) : (
                                filteredLedger?.map((entry) => (
                                    <tr key={entry.id} className="hover:bg-slate-800/30 transition-colors">
                                        <td className="px-6 py-4 text-slate-400 font-mono text-xs">
                                            {new Date(entry.createdAt).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 font-mono text-slate-300">
                                            {entry.userId}
                                        </td>
                                        <td className="px-6 py-4 text-slate-300">
                                            {entry.campaignName}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                                                {entry.triggerEvent}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right font-mono font-medium text-slate-200">
                                            ₹{entry.amount}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-bold ${getStatusColor(entry.status)}`}>
                                                {entry.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right text-xs font-mono text-slate-500">
                                            {entry.referenceId}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
