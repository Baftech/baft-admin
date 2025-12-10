import React, { useState } from "react";
import { useAuth } from "../../auth/AuthContext";
import { useParams, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../api/client";

interface Wallet {
  account_id: string;
  account_category: string;
  balance: number;
}

interface Transaction {
  id: string;
  type: string;
  status: string;
  amount: number;
  description?: string;
  created_at: string;
}

interface UserProfile {
  id: string;
  email: string;
  status: string;
  fullName?: string;
}

interface UserDetailResponse {
  profile: UserProfile;
  wallets: Wallet[];
  recentTransactions: Transaction[];
}

type StatusAction = "FREEZE" | "UNFREEZE" | "FLAG" | "UNFLAG";

export const UserDetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [modalAction, setModalAction] = useState<StatusAction | null>(null);
  const [reason, setReason] = useState("");
  const { hasRole } = useAuth();
  const canManageUsers = hasRole(["OPS", "SUPERADMIN"]);

  const { data, isLoading, error } = useQuery({
    queryKey: ["user", id],
    enabled: Boolean(id),
    queryFn: async () => apiClient.get<UserDetailResponse>(`/users/${id}`)
  });

  const statusMutation = useMutation({
    mutationFn: async () => {
      if (!id || !modalAction) return;
      return apiClient.patch(`/users/${id}/status`, {
        status: modalAction,
        reason: reason || undefined
      });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["user", id] });
      setModalAction(null);
      setReason("");
    }
  });

  const profile = data?.profile;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/users")}
            className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              {profile?.fullName || profile?.email || "User Details"}
            </h1>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <span className="font-mono text-xs bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                {profile?.id}
              </span>
              {profile && (
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${profile.status === "ACTIVE"
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  : profile.status === "BANNED" || profile.status === "FREEZE"
                    ? "bg-red-500/10 text-red-400 border-red-500/20"
                    : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                  }`}>
                  {profile.status}
                </span>
              )}
            </div>
          </div>
        </div>

        {profile && canManageUsers && (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="px-4 py-2 rounded-lg border border-amber-500/30 text-amber-400 hover:bg-amber-500/10 transition-colors text-sm font-medium"
              onClick={() => setModalAction("FREEZE")}
            >
              Freeze
            </button>
            <button
              type="button"
              className="px-4 py-2 rounded-lg border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 transition-colors text-sm font-medium"
              onClick={() => setModalAction("UNFREEZE")}
            >
              Unfreeze
            </button>
            <button
              type="button"
              className="px-4 py-2 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors text-sm font-medium"
              onClick={() => setModalAction("FLAG")}
            >
              Flag
            </button>
            <button
              type="button"
              className="px-4 py-2 rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-800 transition-colors text-sm font-medium"
              onClick={() => setModalAction("UNFLAG")}
            >
              Unflag
            </button>
          </div>
        )}
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="h-6 w-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm">
          {(error as Error).message}
        </div>
      )}

      {data && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="card p-6 space-y-4 lg:col-span-1 h-fit">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Profile Information</h3>
            <div className="space-y-4">
              <div className="p-3 bg-slate-950/50 rounded-lg border border-slate-800/50">
                <div className="text-xs text-slate-500 mb-1">Email Address</div>
                <div className="text-slate-200 font-medium">{profile?.email}</div>
              </div>
              <div className="p-3 bg-slate-950/50 rounded-lg border border-slate-800/50">
                <div className="text-xs text-slate-500 mb-1">Account Status</div>
                <div className="text-slate-200 font-medium">{profile?.status}</div>
              </div>
            </div>
          </div>

          {/* Wallets Card */}
          <div className="card p-6 space-y-4 lg:col-span-1 h-fit">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Wallets</h3>
            <div className="space-y-3">
              {data.wallets.length === 0 && (
                <div className="text-slate-500 text-sm italic">No wallets found.</div>
              )}
              {data.wallets.map((w) => (
                <div
                  key={w.account_id}
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-950/50 border border-slate-800/50 hover:border-slate-700 transition-colors"
                >
                  <div>
                    <div className="text-slate-200 text-sm font-medium">{w.account_category}</div>
                    <div className="text-xs text-slate-500 font-mono mt-0.5">
                      {w.account_id.slice(0, 8)}...
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-white">
                      {(w.balance / 100).toLocaleString("en-IN", {
                        style: "currency",
                        currency: "INR"
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Transactions Card */}
          <div className="card p-6 space-y-4 lg:col-span-1 h-fit">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Recent Activity</h3>
              <span className="text-xs text-slate-500">Last 10</span>
            </div>
            <div className="space-y-3">
              {data.recentTransactions.length === 0 && (
                <div className="text-slate-500 text-sm italic">No recent transactions.</div>
              )}
              {data.recentTransactions.map((t) => {
                const rawAmount =
                  (t as any).amount ??
                  (t as any).signed_amount ??
                  (t as any).amount_paise ??
                  (t as any).amountPaise ??
                  (t as any).amount_paisa ??
                  (t as any).amount_in_paise ??
                  (t as any).amountInPaise ??
                  (t as any).amountInPaisa;

                const amountInPaise = Number(rawAmount);
                const hasValidAmount = Number.isFinite(amountInPaise);
                const displayAmount = hasValidAmount
                  ? (amountInPaise / 100).toLocaleString("en-IN", {
                      style: "currency",
                      currency: "INR"
                    })
                  : "₹0.00";

                return (
                <div
                  key={t.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-950/50 border border-slate-800/50 hover:border-slate-700 transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-200 text-sm font-medium">{t.type}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${t.status === "SUCCESSFUL"
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : "bg-slate-800 text-slate-400 border-slate-700"
                        }`}>
                        {t.status}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      {new Date(t.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-white">
                      {displayAmount}
                    </div>
                  </div>
                </div>
              );
            })}
            </div>
          </div>
        </div>
      )}

      {/* Action Modal */}
      {modalAction && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
          <div className="card max-w-md w-full p-6 space-y-6 m-4 bg-slate-900 border-slate-700 shadow-2xl">
            <div>
              <h3 className="text-lg font-bold text-white mb-2">
                Confirm {modalAction.toLowerCase()}
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                This action takes effect immediately and may block or flag the user's access.
                It will be recorded in the audit log.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Reason (optional)</label>
              <textarea
                className="input min-h-[100px] resize-none"
                placeholder="Enter a reason for this action..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>

            {statusMutation.isError && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {(statusMutation.error as Error).message || "Failed to update status."}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                className="px-4 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors text-sm font-medium"
                onClick={() => {
                  setModalAction(null);
                  setReason("");
                }}
                disabled={statusMutation.isPending}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={() => statusMutation.mutate()}
                disabled={statusMutation.isPending}
              >
                {statusMutation.isPending ? "Applying..." : "Confirm Action"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};





