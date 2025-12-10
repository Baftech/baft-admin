import React, { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../api/client";

interface MaintenanceConfig {
  is_enabled: boolean;
  message: string;
}

interface MaintenanceResponse {
  message: string;
  config: MaintenanceConfig;
}

export const MaintenanceModePage: React.FC = () => {
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ["maintenance-config"],
    queryFn: async () => apiClient.get<MaintenanceResponse>("/config/maintenance")
  });

  const current = data?.config;
  const [message, setMessage] = useState("");

  // Initialize message state when data loads
  useEffect(() => {
    if (current) {
      setMessage(current.message);
    }
  }, [current]);

  const mutation = useMutation({
    mutationFn: async (payload: MaintenanceConfig) =>
      apiClient.patch<MaintenanceResponse>("/config/maintenance", payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["maintenance-config"] });
    }
  });

  const handleToggle = () => {
    if (!current) return;
    mutation.mutate({
      is_enabled: !current.is_enabled,
      message: message || current.message
    });
  };

  const handleSaveMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!current) return;
    mutation.mutate({
      is_enabled: current.is_enabled,
      message: message
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-white tracking-tight">System Maintenance</h1>
          <p className="text-sm text-slate-400 max-w-lg">
            Manage global maintenance mode. When enabled, all consumer APIs will return 503 Service Unavailable.
          </p>
        </div>
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

      {current && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Status Card */}
          <div className="card p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Status Control</h3>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium border ${current.is_enabled
                    ? "bg-red-500/10 text-red-400 border-red-500/20"
                    : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  }`}
              >
                {current.is_enabled ? "Maintenance Active" : "Systems Operational"}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800/50 flex items-center justify-between gap-4">
              <div>
                <div className="text-slate-200 font-medium mb-1">Maintenance Mode</div>
                <div className="text-xs text-slate-400">
                  {current.is_enabled
                    ? "Traffic is currently blocked. Users see the maintenance message."
                    : "Traffic is flowing normally. Maintenance mode is disabled."}
                </div>
              </div>

              <button
                onClick={handleToggle}
                disabled={mutation.isPending}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${current.is_enabled ? 'bg-primary-600' : 'bg-slate-700'
                  }`}
              >
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${current.is_enabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                />
              </button>
            </div>

            {current.is_enabled && (
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-sm flex gap-3">
                <svg className="w-5 h-5 flex-shrink-0 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <p className="font-medium mb-1">Warning</p>
                  <p className="text-xs opacity-90">
                    While enabled, users cannot access the platform. Ensure you have a valid reason and estimated duration communicated in the message.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Message Configuration */}
          <div className="card p-6 space-y-6">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Maintenance Message</h3>

            <form onSubmit={handleSaveMessage} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-400 mb-2">Message shown to users</label>
                <textarea
                  className="input min-h-[120px] resize-none"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="e.g., We are performing scheduled maintenance. We will be back shortly."
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="text-xs text-slate-500">
                  {mutation.isError && (
                    <span className="text-red-400">
                      {(mutation.error as Error).message || "Failed to update."}
                    </span>
                  )}
                  {mutation.isSuccess && !mutation.isError && (
                    <span className="text-emerald-400">Configuration saved successfully.</span>
                  )}
                </div>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={mutation.isPending || message === current.message}
                >
                  {mutation.isPending ? "Saving..." : "Update Message"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};





