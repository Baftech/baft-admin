import { apiClient } from "./client";
import { ApiCampaign, Campaign, CreateCampaignRequest, UpdateCampaignRequest } from "./types";

const mapCampaign = (api: ApiCampaign): Campaign => ({
    id: api.id,
    name: api.name,
    type: api.type,
    status: api.status,
    startDate: api.start_date,
    endDate: api.end_date,
    totalBudget: api.total_budget,
    perUserCap: api.per_user_cap,
    burnedAmount: api.burned || 0,
    remainingAmount: api.remaining_budget || (api.total_budget - (api.burned || 0)),
    priority: api.priority,
    rules: api.rules,
    createdAt: api.created_at,
    updatedAt: api.updated_at
});

export const campaignsApi = {
    list: async (): Promise<Campaign[]> => {
        const res = await apiClient.get<ApiCampaign[]>("/campaigns");
        return res.map(mapCampaign);
    },

    get: async (id: string): Promise<Campaign> => {
        const res = await apiClient.get<ApiCampaign>(`/campaigns/${id}`);
        return mapCampaign(res);
    },

    create: async (data: CreateCampaignRequest): Promise<Campaign> => {
        const res = await apiClient.post<ApiCampaign>("/campaigns", data);
        return mapCampaign(res);
    },

    update: async (id: string, data: UpdateCampaignRequest): Promise<Campaign> => {
        const res = await apiClient.patch<ApiCampaign>(`/campaigns/${id}`, data);
        return mapCampaign(res);
    },

    delete: async (id: string): Promise<void> => {
        await apiClient.delete(`/campaigns/${id}`);
    }
};
