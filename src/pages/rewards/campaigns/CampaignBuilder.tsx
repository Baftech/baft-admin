import React, { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router-dom";
import { campaignsApi } from "../../../api/campaigns";
import { CampaignType, CampaignStatus } from "../../../api/types";

// Local form state matches component inputs (camelCase)
interface CampaignFormState {
    name: string;
    type: CampaignType;
    status: CampaignStatus;
    startDate: string;
    endDate: string;
    totalBudget: number;
    dailyBudget: number;
    perUserCap: number;
    priority: number;
    rules: any;
}

export const CampaignBuilderPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const isEdit = !!id;

    const { data: campaign, isLoading: isLoadingCampaign } = useQuery({
        queryKey: ["campaign", id],
        queryFn: () => campaignsApi.get(id!),
        enabled: isEdit,
    });

    const [formData, setFormData] = useState<CampaignFormState>({
        name: "",
        type: "CASHBACK",
        status: "PAUSED",
        startDate: new Date().toISOString().split("T")[0],
        endDate: "",
        totalBudget: 0,
        dailyBudget: 0,
        perUserCap: 0,
        priority: 0,
        rules: {
            min_amount: 100,
            cashback_type: "PERCENTAGE",
            cashback_percent: 5,
            max_reward_amount: 50
        }
    });

    const [jsonError, setJsonError] = useState<string | null>(null);
    const [rulesJson, setRulesJson] = useState<string>(JSON.stringify(formData.rules, null, 2));

    useEffect(() => {
        if (campaign) {
            setFormData({
                name: campaign.name,
                type: campaign.type,
                status: campaign.status,
                startDate: campaign.startDate ? campaign.startDate.split("T")[0] : "",
                endDate: campaign.endDate ? campaign.endDate.split("T")[0] : "",
                totalBudget: campaign.totalBudget,
                dailyBudget: 0, // Not in API
                perUserCap: campaign.perUserCap,
                priority: campaign.priority,
                rules: campaign.rules
            });
            setRulesJson(JSON.stringify(campaign.rules, null, 2));
        }
    }, [campaign]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === "number" ? Number(value) : value
        }));
    };

    const handleJsonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newVal = e.target.value;
        setRulesJson(newVal);
        try {
            const parsed = JSON.parse(newVal);
            setFormData(prev => ({ ...prev, rules: parsed }));
            setJsonError(null);
        } catch (err) {
            setJsonError((err as Error).message);
        }
    };

    const hasStarted = campaign && new Date(campaign.startDate) <= new Date();

    const mutation = useMutation({
        mutationFn: async (data: CampaignFormState) => {
            const toISO = (d: string, end = false) => {
                if (!d) return "";
                if (d.includes("T")) return d;
                return end ? `${d}T23:59:59Z` : `${d}T00:00:00Z`;
            };

            const payload: any = {
                name: data.name,
                type: data.type,
                status: data.status,
                end_date: toISO(data.endDate, true),
                total_budget: data.totalBudget,
                per_user_cap: data.perUserCap,
                priority: data.priority,
                rules: data.rules
            };

            // Only include start_date if it hasn't started or we are creating
            if (!isEdit || !hasStarted) {
                payload.start_date = toISO(data.startDate);
            }

            if (isEdit && id) {
                return campaignsApi.update(id, payload);
            } else {
                return campaignsApi.create(payload);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["campaigns"] });
            navigate("/rewards/campaigns");
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (jsonError) return;
        mutation.mutate(formData);
    };

    if (isEdit && isLoadingCampaign) {
        return <div className="p-12 text-center text-slate-400">Loading campaign...</div>;
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-12">
            <div className="flex items-center justify-between">
                <div>
                    <Link to="/rewards/campaigns" className="text-sm text-slate-400 hover:text-white mb-1 inline-flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Campaigns
                    </Link>
                    <h1 className="text-2xl font-bold text-white tracking-tight">
                        {isEdit ? "Edit Campaign" : "Create New Campaign"}
                    </h1>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Core Details Card */}
                <div className="card p-6 space-y-6">
                    <h2 className="text-lg font-semibold text-white border-b border-slate-800 pb-4">Core Details</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-400">Campaign Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                required
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-100 focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 outline-none transition-all"
                                placeholder="e.g. Summer Cashback 2024"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-400">Campaign Type</label>
                            <select
                                name="type"
                                value={formData.type}
                                onChange={handleInputChange}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-100 focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 outline-none transition-all"
                            >
                                <option value="CASHBACK">Cashback</option>
                                <option value="REFERRAL">Referral</option>
                                <option value="GOAL">Goal / Milestone</option>
                                <option value="GAMIFIED">Gamified</option>
                                <option value="COUPON">Coupon</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-400">Status</label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleInputChange}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-100 focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 outline-none transition-all"
                            >
                                <option value="DRAFT">Draft</option>
                                <option value="ACTIVE">Active</option>
                                <option value="PAUSED">Paused</option>
                                <option value="EXPIRED">Expired</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-400">Priority (1-100)</label>
                            <input
                                type="number"
                                name="priority"
                                value={formData.priority}
                                onChange={handleInputChange}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-100 focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-400">Start Date</label>
                            <input
                                type="date"
                                name="startDate"
                                value={formData.startDate}
                                onChange={handleInputChange}
                                disabled={isEdit && hasStarted}
                                className={`w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-100 focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 outline-none transition-all ${isEdit && hasStarted ? 'opacity-50 cursor-not-allowed' : ''}`}
                            />
                            {isEdit && hasStarted && (
                                <p className="text-xs text-amber-500">Cannot change start date after campaign has started.</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-400">End Date</label>
                            <input
                                type="date"
                                name="endDate"
                                value={formData.endDate}
                                onChange={handleInputChange}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-100 focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 outline-none transition-all"
                            />
                        </div>
                    </div>
                </div>

                {/* Budgets Card */}
                <div className="card p-6 space-y-6">
                    <h2 className="text-lg font-semibold text-white border-b border-slate-800 pb-4">Budgets & Caps</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-400">Total Budget</label>
                            <div className="relative">
                                <span className="absolute left-3 top-2.5 text-slate-500">₹</span>
                                <input
                                    type="number"
                                    name="totalBudget"
                                    value={formData.totalBudget}
                                    onChange={handleInputChange}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-8 pr-4 py-2.5 text-slate-100 focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 outline-none transition-all"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-400">Daily Budget (Optional)</label>
                            <div className="relative">
                                <span className="absolute left-3 top-2.5 text-slate-500">₹</span>
                                <input
                                    type="number"
                                    name="dailyBudget"
                                    value={formData.dailyBudget}
                                    onChange={handleInputChange}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-8 pr-4 py-2.5 text-slate-100 focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 outline-none transition-all"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-400">Per User Cap</label>
                            <div className="relative">
                                <span className="absolute left-3 top-2.5 text-slate-500">₹</span>
                                <input
                                    type="number"
                                    name="perUserCap"
                                    value={formData.perUserCap}
                                    onChange={handleInputChange}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-8 pr-4 py-2.5 text-slate-100 focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 outline-none transition-all"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Rules Editor Card */}
                <div className="card p-6 space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                        <h2 className="text-lg font-semibold text-white">Rule Configuration</h2>
                        <div className="text-xs text-slate-500">
                            Configure logic as JSON.
                        </div>
                    </div>

                    <div className="relative">
                        <textarea
                            value={rulesJson}
                            onChange={handleJsonChange}
                            rows={12}
                            className={`w-full bg-slate-950 font-mono text-sm border rounded-lg p-4 outline-none transition-all
                ${jsonError ? "border-red-500 focus:ring-2 focus:ring-red-500/20" : "border-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-indigo-100"}`}
                        />
                        {jsonError && (
                            <div className="absolute bottom-4 right-4 text-xs text-red-400 bg-red-500/10 px-2 py-1 rounded border border-red-500/20">
                                Invalid JSON: {jsonError}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                    <button
                        type="button"
                        onClick={() => navigate("/rewards/campaigns")}
                        className="px-6 py-2.5 rounded-lg border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={mutation.isPending || !!jsonError}
                        className="btn-primary"
                    >
                        {mutation.isPending ? "Saving..." : "Save Campaign"}
                    </button>
                </div>
            </form>
        </div>
    );
};
