import { apiClient } from "./client";
import { ApiReward, LedgerEntry, PendingReward, RewardActionRequest } from "./types";

// Helper to map ApiReward to LedgerEntry
const mapRewardToLedger = (r: ApiReward): LedgerEntry => ({
    id: r.reward_id,
    userId: r.user?.raw_user_meta_data?.full_name || "Unknown",
    campaignId: "unknown",
    campaignName: r.campaign?.name || "Unknown",
    amount: r.amount,
    status: r.status,
    triggerEvent: "TXN_SUCCESS", // Placeholder
    referenceId: "N/A", // Placeholder
    createdAt: new Date().toISOString() // Placeholder, ideally API returns this
});

// Helper for PendingReward
const mapRewardToPending = (r: ApiReward): PendingReward => ({
    ...mapRewardToLedger(r),
    riskScore: r.risk_score || 0,
    holdReason: r.hold_reason || "Unknown"
});

export const rewardsApi = {
    getLedger: async (): Promise<LedgerEntry[]> => {
        const res = await apiClient.get<{ data: ApiReward[], total: number }>("/rewards?page=1&limit=100");
        return res.data.map(mapRewardToLedger);
    },

    getPendingRewards: async (): Promise<PendingReward[]> => {
        // Fetching rewards. Ideally we should filter by status=HELD on backend
        const res = await apiClient.get<{ data: ApiReward[], total: number }>("/rewards?page=1&limit=100");
        return res.data
            .filter(r => r.status === "HELD")
            .map(mapRewardToPending);
    },

    actionReward: async (id: string, action: "APPROVE" | "REJECT" | "ESCALATE"): Promise<void> => {
        await apiClient.patch(`/rewards/${id}`, { action, note: "Actioned via Admin" });
    }
};

export type { LedgerEntry, PendingReward, Campaign } from "./types";
