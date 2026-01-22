export type CampaignType = "CASHBACK" | "REFERRAL" | "GOAL" | "GAMIFIED";
export type CampaignStatus = "ACTIVE" | "PAUSED" | "EXPIRED" | "DRAFT"; // Added DRAFT just in case, though API says PAUSED is default
export type CashbackType = "FIXED" | "PERCENTAGE";
export type KycStatus = "VERIFIED" | "PENDING" | "REJECTED" | "NONE";

export interface Slab {
    min: number;
    max?: number;
    reward: number | [number, number]; // Fixed or range
}

export interface CampaignRules {
    // Predicates
    min_amount?: number;
    max_amount?: number;
    allowed_categories?: string[];
    blocked_categories?: string[];
    happy_hour_start?: string; // HH:MM
    happy_hour_end?: string; // HH:MM
    req_kyc_status?: KycStatus;
    daily_cap?: number;

    // Calculators
    cashback_type?: CashbackType;
    cashback_value?: number; // For FIXED
    cashback_percent?: number; // For PERCENTAGE
    max_reward_amount?: number; // For PERCENTAGE
    slabs?: Slab[]; // For Slabs
}

export interface ApiCampaign {
    id: string; // or _id
    name: string;
    type: CampaignType;
    status: CampaignStatus;
    start_date: string;
    end_date: string;
    total_budget: number;
    priority: number;
    per_user_cap: number;
    rules: CampaignRules;
    
    // Response only fields
    burned?: number; // "Includes burned"
    remaining_budget?: number;
    created_at?: string;
    updated_at?: string;
}

export interface CreateCampaignRequest {
    name: string;
    type: CampaignType;
    status?: CampaignStatus;
    start_date: string;
    end_date: string;
    total_budget: number;
    priority?: number;
    per_user_cap?: number;
    rules: CampaignRules;
}

export interface UpdateCampaignRequest {
    name?: string;
    status?: CampaignStatus;
    total_budget?: number;
    priority?: number;
    per_user_cap?: number;
    end_date?: string;
    rules?: CampaignRules;
}

export interface ApiReward {
    reward_id: string;
    amount: number;
    status: "PENDING" | "PAID" | "HELD" | "REVERSED" | "REJECTED";
    campaign: {
        name: string;
    };
    user: {
        raw_user_meta_data: {
            full_name: string;
        };
    };
    // Details
    risk_score?: number;
    hold_reason?: string;
    // ...
}

export interface RewardActionRequest {
    action: "APPROVE" | "REJECT" | "ESCALATE";
    note: string;
}

export interface AnalyticsGlobal {
    name: string;
    burn_rate_per_hour: number;
    paid_today: number;
}

export interface AnalyticsCampaign {
    conversion_rate: number;
    avg_reward_per_user: number;
    fraud_held_percent: number;
}

export interface AnalyticsPool {
    current_balance: number;
    runway_days: number;
    status: "HEALTHY" | "CRITICAL";
}

export interface AnalyticsRisk {
    top_earners: any[];
    suspicious_users: any[];
    risk_distribution: any;
}

// --- Frontend Interfaces (Mapped from API) ---

export interface Campaign {
    id: string;
    name: string;
    type: CampaignType;
    status: CampaignStatus;
    startDate: string;
    endDate: string;
    totalBudget: number;
    perUserCap: number;
    burnedAmount: number;
    remainingAmount: number;
    priority: number;
    createdAt?: string;
    updatedAt?: string;
    rules: CampaignRules;
}

export type RewardStatus = "PENDING" | "PAID" | "HELD" | "REVERSED" | "REJECTED";

export interface LedgerEntry {
    id: string;
    userId: string; // from user.raw_user_meta_data.full_name or just ID? API returns nested user object.
    campaignId: string; // Not explicitly in API response "campaign": { "name": "..." }. Maybe we need to fetch it or it's there.
    campaignName: string;
    amount: number;
    status: RewardStatus;
    triggerEvent?: "TXN_SUCCESS" | "GOAL_COMPLETED" | "REFERRAL_COMPLETED"; // API doesn't mention this
    referenceId?: string; // API doesn't mention this
    createdAt?: string; // API doesn't mention this
}

export interface PendingReward extends LedgerEntry {
    riskScore: number;
    holdReason: string;
}
