import { apiClient } from "./client";

export type CampaignType = "CASHBACK" | "REFERRAL" | "GOAL" | "GAMIFIED" | "COUPON";
export type CampaignStatus = "ACTIVE" | "PAUSED" | "EXPIRED" | "DRAFT";

export interface Campaign {
    id: string;
    name: string;
    type: CampaignType;
    status: CampaignStatus;
    startDate: string;
    endDate: string;
    totalBudget: number;
    dailyBudget: number;
    perUserCap: number;
    burnedAmount: number;
    remainingAmount: number;
    priority: number;
    createdAt: string;
    updatedAt: string;
    rules: Record<string, any>;
}

export interface CreateCampaignRequest extends Omit<Campaign, "id" | "burnedAmount" | "remainingAmount" | "createdAt" | "updatedAt"> { }

export type RewardStatus = "PENDING" | "PAID" | "HELD" | "REVERSED" | "REJECTED";

export interface LedgerEntry {
    id: string;
    userId: string;
    campaignId: string;
    campaignName: string;
    amount: number;
    status: RewardStatus;
    triggerEvent: "TXN_SUCCESS" | "GOAL_COMPLETED" | "REFERRAL_COMPLETED";
    referenceId: string;
    createdAt: string;
}

export interface PendingReward extends LedgerEntry {
    riskScore: number;
    holdReason: string;
}

// --- MOCK DATA ---

const MOCK_CAMPAIGNS: Campaign[] = [
    {
        id: "camp_001",
        name: "Weekend Coffee Cashback",
        type: "CASHBACK",
        status: "ACTIVE",
        startDate: "2024-01-01T00:00:00Z",
        endDate: "2024-03-31T23:59:59Z",
        totalBudget: 50000,
        dailyBudget: 2000,
        perUserCap: 500,
        burnedAmount: 12500,
        remainingAmount: 37500,
        priority: 10,
        createdAt: "2023-12-25T10:00:00Z",
        updatedAt: "2024-01-15T08:30:00Z",
        rules: { min_txn: 100, cashback_percent: 5, max_cashback: 50 }
    },
    {
        id: "camp_002",
        name: "Referral Bonanza Q1",
        type: "REFERRAL",
        status: "PAUSED",
        startDate: "2024-01-01T00:00:00Z",
        endDate: "2024-03-31T23:59:59Z",
        totalBudget: 100000,
        dailyBudget: 5000,
        perUserCap: 1000,
        burnedAmount: 45000,
        remainingAmount: 55000,
        priority: 5,
        createdAt: "2023-12-20T10:00:00Z",
        updatedAt: "2024-01-10T14:20:00Z",
        rules: { referrer_reward: 50, referee_reward: 25, condition: "FIRST_TXN_ABOVE_200" }
    },
    {
        id: "camp_003",
        name: "Bill Payment Slabs",
        type: "GOAL",
        status: "EXPIRED",
        startDate: "2023-11-01T00:00:00Z",
        endDate: "2023-12-31T23:59:59Z",
        totalBudget: 200000,
        dailyBudget: 10000,
        perUserCap: 200,
        burnedAmount: 198000,
        remainingAmount: 2000,
        priority: 1,
        createdAt: "2023-10-15T09:00:00Z",
        updatedAt: "2024-01-01T00:00:01Z",
        rules: { slabs: [{ min: 500, reward: 10 }, { min: 1000, reward: 25 }, { min: 5000, reward: 100 }] }
    }
];

const MOCK_LEDGER: LedgerEntry[] = Array.from({ length: 20 }).map((_, i) => ({
    id: `rew_${1000 + i}`,
    userId: `usr_${Math.floor(Math.random() * 1000)}xxx`,
    campaignId: "camp_001",
    campaignName: "Weekend Coffee Cashback",
    amount: Math.floor(Math.random() * 50) + 10,
    status: i % 5 === 0 ? "HELD" : i % 3 === 0 ? "PENDING" : "PAID",
    triggerEvent: "TXN_SUCCESS",
    referenceId: `txn_${Date.now() - i * 10000}`,
    createdAt: new Date(Date.now() - i * 3600000).toISOString()
}));

const MOCK_PENDING: PendingReward[] = [
    {
        id: "rew_999",
        userId: "usr_888xxx",
        campaignId: "camp_002",
        campaignName: "Referral Bonanza Q1",
        amount: 50,
        status: "HELD",
        triggerEvent: "REFERRAL_COMPLETED",
        referenceId: "ref_pair_123",
        createdAt: new Date().toISOString(),
        riskScore: 85,
        holdReason: "High Velocity Referral"
    },
    {
        id: "rew_998",
        userId: "usr_777xxx",
        campaignId: "camp_001",
        campaignName: "Weekend Coffee Cashback",
        amount: 250,
        status: "PENDING",
        triggerEvent: "TXN_SUCCESS",
        referenceId: "txn_big_1",
        createdAt: new Date().toISOString(),
        riskScore: 60,
        holdReason: "Large Amount"
    }
];

export const rewardsApi = {
    getCampaigns: async (): Promise<Campaign[]> => {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 600));
        return MOCK_CAMPAIGNS;
    },

    getCampaign: async (id: string): Promise<Campaign | undefined> => {
        await new Promise(resolve => setTimeout(resolve, 400));
        return MOCK_CAMPAIGNS.find(c => c.id === id);
    },

    createCampaign: async (data: CreateCampaignRequest): Promise<Campaign> => {
        await new Promise(resolve => setTimeout(resolve, 800));
        const newCamp: Campaign = {
            ...data,
            id: `camp_${Date.now()}`,
            burnedAmount: 0,
            remainingAmount: data.totalBudget,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        MOCK_CAMPAIGNS.push(newCamp);
        return newCamp;
    },

    getLedger: async (): Promise<LedgerEntry[]> => {
        await new Promise(resolve => setTimeout(resolve, 500));
        return MOCK_LEDGER;
    },

    getPendingRewards: async (): Promise<PendingReward[]> => {
        await new Promise(resolve => setTimeout(resolve, 500));
        return MOCK_PENDING;
    },

    actionReward: async (id: string, action: "APPROVE" | "REJECT" | "ESCALATE"): Promise<void> => {
        await new Promise(resolve => setTimeout(resolve, 800));
        console.log(`Reward ${id} actioned: ${action}`);
    }
};
