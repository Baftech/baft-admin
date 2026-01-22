import { apiClient } from "./client";
import { AnalyticsGlobal, AnalyticsCampaign, AnalyticsPool, AnalyticsRisk } from "./types";

export const analyticsApi = {
    getGlobal: async (): Promise<AnalyticsGlobal[]> => {
        return apiClient.get<AnalyticsGlobal[]>("/analytics/global");
    },
    getCampaign: async (id: string): Promise<AnalyticsCampaign> => {
        return apiClient.get<AnalyticsCampaign>(`/analytics/campaign/${id}`);
    },
    getPoolHealth: async (): Promise<AnalyticsPool> => {
        return apiClient.get<AnalyticsPool>("/analytics/pool");
    },
    getRiskMonitor: async (): Promise<AnalyticsRisk> => {
        return apiClient.get<AnalyticsRisk>("/analytics/risk");
    }
};
