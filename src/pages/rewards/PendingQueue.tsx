import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { rewardsApi } from "../../api/rewards";

export const PendingQueuePage: React.FC = () => {
    const queryClient = useQueryClient();
    const { data: pendingRewards, isLoading } = useQuery({
        queryKey: ["pending-rewards"],
        queryFn: rewardsApi.getPendingRewards
    });

    const mutation = useMutation({
        mutationFn: ({ id, action }: { id: string; action: "APPROVE" | "REJECT" | "ESCALATE" }) =>
            rewardsApi.actionReward(id, action),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["pending-rewards"] });
        }
    });

    const handleAction = (id: string, action: "APPROVE" | "REJECT" | "ESCALATE") => {
        if (confirm(`Are you sure you want to ${action} this reward?`)) {
            mutation.mutate({ id, action });
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Pending Review</h1>
                    <p className="text-sm text-slate-400">
                        Review held rewards blocked by fraud rules or velocity checks.
                    </p>
                </div>
            </div>

            <div className="grid gap-4">
                {isLoading ? (
                    <div className="p-12 text-center text-slate-500">Loading queue...</div>
                ) : pendingRewards?.length === 0 ? (
                    <div className="p-12 text-center card">
                        <div className="text-slate-500">No pending rewards to review. Good job!</div>
                    </div>
                ) : (
                    pendingRewards?.map((reward) => (
                        <div key={reward.id} className="card p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 border-l-4 border-l-amber-500">
                            <div className="space-y-2 flex-1">
                                <div className="flex items-center gap-3">
                                    <span className="text-xs font-mono text-slate-500">{reward.id}</span>
                                    <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 text-xs font-bold border border-amber-500/20">
                                        Risk Score: {reward.riskScore}
                                    </span>
                                    <span className="text-xs font-semibold text-red-400 uppercase tracking-wide">
                                        {reward.holdReason}
                                    </span>
                                </div>
                                <div className="flex items-baseline gap-2">
                                    <div className="text-2xl font-bold text-white font-mono">₹{reward.amount}</div>
                                    <div className="text-sm text-slate-400">for {reward.campaignName}</div>
                                </div>
                                <div className="text-xs text-slate-500">
                                    User: <span className="text-slate-300 font-mono">{reward.userId}</span> • Ref: {reward.referenceId} • {new Date(reward.createdAt).toLocaleString()}
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => handleAction(reward.id, "REJECT")}
                                    disabled={mutation.isPending}
                                    className="px-4 py-2 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors text-sm font-medium"
                                >
                                    Reject
                                </button>
                                <button
                                    onClick={() => handleAction(reward.id, "ESCALATE")}
                                    disabled={mutation.isPending}
                                    className="px-4 py-2 rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-700 transition-colors text-sm font-medium"
                                >
                                    Escalate
                                </button>
                                <button
                                    onClick={() => handleAction(reward.id, "APPROVE")}
                                    disabled={mutation.isPending}
                                    className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 transition-all text-sm font-bold"
                                >
                                    Approve & Payout
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
