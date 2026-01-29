import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { campaignsApi } from "../../../api/campaigns";
import { Campaign } from "../../../api/types";

export const CampaignsListPage: React.FC = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data: campaigns, isLoading } = useQuery({
        queryKey: ["campaigns"],
        queryFn: campaignsApi.list
    });

    const deleteMutation = useMutation({
        mutationFn: campaignsApi.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["campaigns"] });
        }
    });

    const handleDelete = (id: string) => {
        if (window.confirm("Are you sure you want to delete this campaign?")) {
            deleteMutation.mutate(id);
        }
    };

    const getStatusColor = (status: Campaign["status"]) => {
        switch (status) {
            case "ACTIVE": return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
            case "PAUSED": return "bg-amber-500/10 text-amber-400 border-amber-500/20";
            case "EXPIRED": return "bg-slate-500/10 text-slate-400 border-slate-500/20";
            case "DRAFT": return "bg-indigo-500/10 text-indigo-400 border-indigo-500/20";
            default: return "bg-slate-500/10 text-slate-400";
        }
    };

    const formatCurrency = (amount: number) => {
        return amount.toLocaleString("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Campaigns</h1>
                    <p className="text-sm text-slate-400 mt-1">
                        Manage global reward programs effectively.
                    </p>
                </div>
                <button
                    onClick={() => navigate("/rewards/campaigns/new")}
                    className="btn-primary flex items-center gap-2 self-start sm:self-auto"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    New Campaign
                </button>
            </div>

            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-900/50 text-slate-400 uppercase tracking-wider text-xs font-semibold">
                            <tr>
                                <th className="px-6 py-4">Campaign Name</th>
                                <th className="px-6 py-4">ID</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Budget</th>
                                <th className="px-6 py-4 text-right">Burned</th>
                                <th className="px-6 py-4 text-center">Priority</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {isLoading ? (
                                Array.from({ length: 3 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-6 py-4"><div className="h-4 w-32 bg-slate-800 rounded"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 w-16 bg-slate-800 rounded"></div></td>
                                        <td className="px-6 py-4"><div className="h-6 w-16 bg-slate-800 rounded-full"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 w-12 bg-slate-800 rounded ml-auto"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 w-12 bg-slate-800 rounded ml-auto"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 w-8 bg-slate-800 rounded mx-auto"></div></td>
                                        <td className="px-6 py-4"><div className="h-8 w-8 bg-slate-800 rounded ml-auto"></div></td>
                                    </tr>
                                ))
                            ) : (
                                campaigns?.map((camp) => (
                                    <tr key={camp.id} className="hover:bg-slate-800/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <a
                                                href={`http://localhost:8000/api/admin/campaigns/${camp.id}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-left font-medium text-slate-200 hover:text-primary-400 transition-colors"
                                            >
                                                {camp.name}
                                            </a>
                                            <div className="text-xs text-slate-500 mt-0.5 font-mono">{camp.type}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(camp.status)}`}>
                                                {camp.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right font-mono text-slate-300">
                                            {formatCurrency(camp.totalBudget)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="font-mono text-slate-300">{formatCurrency(camp.burnedAmount)}</div>
                                            <div className="text-[10px] text-slate-500">
                                                {Math.round((camp.burnedAmount / camp.totalBudget) * 100)}% utilized
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-slate-800 text-xs font-bold text-slate-400">
                                                {camp.priority}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleDelete(camp.id)}
                                                className="p-2 hover:bg-red-500/10 rounded-lg text-slate-400 hover:text-red-500 transition-colors"
                                                title="Delete Campaign"
                                            >
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                    {!isLoading && campaigns?.length === 0 && (
                        <div className="p-12 text-center text-slate-500">
                            No campaigns found. Create one to get started.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
