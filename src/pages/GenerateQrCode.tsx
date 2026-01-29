import React, { useState, useEffect } from "react";
import { apiClient } from "../api/client";
import { PrintableQRCard, type MerchantCardInfo } from "../components/Merchants/PrintableQRCard";

const MERCHANT_CATEGORIES = [
  "Shopping",
  "Groceries",
  "Food & dining",
  "Transport",
  "Bills & recharges",
  "Transfers",
  "Medical",
  "Travel",
  "Repayments",
  "Personal",
  "Services",
  "Insurance",
  "Entertainment",
  "Gaming",
  "Small shops",
  "Rent",
  "Logistics",
  "Subscription",
  "Investment",
  "Fitness",
  "Pet",
  "Miscellaneous",
  "Tea Stall",
  "Coffee Shop",
  "Bakery",
  "Juice Centre",
  "Street Food",
  "Convenience Store",
  "Mobile Accessories",
  "Salon",
  "Gym"
] as const;

interface Merchant {
  id?: string; // Database ID for API calls
  merchant_id: string; // Display ID
  name: string;
  category: string;
  risk_profile?: "LOW" | "MEDIUM" | "HIGH";
  qr_image?: string; // base64 data URL
  destination_account?: string;
  config?: {
    simulate_failure?: boolean;
  };
  created_at?: string;
  account?: {
    id: string;
    account_number: string;
    balance: number;
    currency: string;
  };
  transactions?: any[];
  qr_payload?: string;
}

interface UpdateMerchantRequest {
  risk_profile?: "LOW" | "MEDIUM" | "HIGH";
  config?: {
    simulate_failure?: boolean;
  };
}

export const GenerateQrCodePage: React.FC = () => {
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showUpdateForm, setShowUpdateForm] = useState(false);

  // Update form state
  const [updateRiskProfile, setUpdateRiskProfile] = useState<"LOW" | "MEDIUM" | "HIGH">("LOW");
  const [updateSimulateFailure, setUpdateSimulateFailure] = useState(false);

  // Filter state
  const [filterCategory, setFilterCategory] = useState<string>("");
  const [filterRiskProfile, setFilterRiskProfile] = useState<string>("");
  const [filterName, setFilterName] = useState<string>("");

  // Load all merchants on mount
  useEffect(() => {
    loadMerchants();
  }, []);

  const loadMerchants = async () => {
    setLoading(true);
    setError(null);
    try {
      // Check token before making request
      const token = window.localStorage.getItem("baft_admin_access_token");
      if (!token) {
        console.error(" [Merchants] No admin access token found!");
        console.error("   Please login first to get a valid token");
        setError("Authentication required. Please login first.");
        return;
      }
      console.log(" [Merchants] Token found, loading merchants...");
      // Admin list: GET /api/admin/merchants
      const res = await apiClient.get<Merchant[]>("/merchants");
      console.log(" [Merchants] Loaded", res.length, "merchants");
      setMerchants(res);
    } catch (err) {
      console.error(" [Merchants] Failed to load merchants:", err);
      setError((err as Error).message || "Failed to load merchants");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectMerchant = async (merchantId: string) => {
    setLoading(true);
    setError(null);
    try {
      console.log("[Merchants] Merchant clicked:", merchantId);

      let merchantFromList = merchants.find((m) => m.merchant_id === merchantId);

      // If not found (e.g. after an update), refresh the list once and try again
      if (!merchantFromList) {
        console.log("[Merchants] Merchant not in current list, reloading list from backend...");
        await loadMerchants();
        merchantFromList = merchants.find((m) => m.merchant_id === merchantId);
      }

      if (!merchantFromList) {
        console.error("[Merchants] Merchant still not found after reload:", merchantId);
        setError("Merchant not found in current list");
        return;
      }

      // Fetch detailed merchant information including QR image
      console.log("[Merchants] Fetching detailed merchant info for:", merchantId);
      const detailedMerchant = await apiClient.get<Merchant>(`/merchants/${merchantFromList.id}`);

      console.log("[Merchants] Selected merchant with details:", {
        id: detailedMerchant.merchant_id,
        name: detailedMerchant.name,
        hasQr: Boolean(detailedMerchant.qr_image)
      });

      setSelectedMerchant(detailedMerchant);
      setShowUpdateForm(false);
    } catch (err) {
      setError((err as Error).message || "Failed to load merchant details");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateMerchant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMerchant) return;

    setLoading(true);
    setError(null);

    try {
      const payload: UpdateMerchantRequest = {
        risk_profile: updateRiskProfile,
        config: {
          simulate_failure: updateSimulateFailure
        }
      };
      // Update: PATCH /api/admin/merchants/:id
      await apiClient.patch(`/merchants/${selectedMerchant.id}`, payload);
      // Reload merchants and selected merchant
      await loadMerchants();
      await handleSelectMerchant(selectedMerchant.merchant_id);
      setShowUpdateForm(false);
    } catch (err) {
      setError((err as Error).message || "Failed to update merchant");
    } finally {
      setLoading(false);
    }
  };

  const openUpdateForm = (merchant: Merchant) => {
    setSelectedMerchant(merchant);
    setUpdateRiskProfile(merchant.risk_profile || "LOW");
    setUpdateSimulateFailure(merchant.config?.simulate_failure || false);
    setShowUpdateForm(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-slate-50">Merchant Management</h1>
          <p className="text-xs text-slate-400">
            Create sandbox merchants, generate QR codes, manage merchant settings, and print payment standee cards.
          </p>
        </div>
        <button
          className="btn-primary text-sm"
          type="button"
          onClick={() => {
            setShowUpdateForm(true);
            setShowUpdateForm(false);
            setSelectedMerchant(null);
          }}
        >
          + Create Merchant
        </button>
      </div>

      {error && (
        <div className="card p-3 bg-red-950/30 border-red-800">
          <p className="text-xs text-red-400">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Merchants List */}
        <div className="card p-4 md:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-100">Sandbox Merchants</h2>
            <button
              className="text-xs text-primary-300 hover:text-primary-200"
              type="button"
              onClick={loadMerchants}
              disabled={loading}
            >
              Refresh
            </button>
          </div>

          {/* Filter Section */}
          <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700/50">
            <h3 className="text-sm font-medium text-slate-200 mb-3 flex items-center gap-2">
              <svg className="w-4 h-4 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filters
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-300">Category</label>
                <select
                  className="select"
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                >
                  <option value="">All Categories</option>
                  {MERCHANT_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-300">Risk Profile</label>
                <select
                  className="select"
                  value={filterRiskProfile}
                  onChange={(e) => setFilterRiskProfile(e.target.value)}
                >
                  <option value="">All Risk Profiles</option>
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </div>
              <div className="space-y-1 sm:col-span-2 lg:col-span-1">
                <label className="block text-xs font-medium text-slate-300">Search Name</label>
                <div className="relative">
                  <input
                    className="input text-sm pl-9"
                    type="text"
                    placeholder="Search by name..."
                    value={filterName}
                    onChange={(e) => setFilterName(e.target.value)}
                  />
                  <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Filtered Merchants */}
          {(() => {
            const filteredMerchants = merchants.filter((m) => {
              const matchesCategory = !filterCategory || m.category === filterCategory;
              const matchesRisk = !filterRiskProfile || m.risk_profile === filterRiskProfile;
              const matchesName = !filterName || m.name.toLowerCase().includes(filterName.toLowerCase());
              return matchesCategory && matchesRisk && matchesName;
            });

            return loading && merchants.length === 0 ? (
            <p className="text-xs text-slate-400">Loading merchants...</p>
          ) : merchants.length === 0 ? (
            <p className="text-xs text-slate-400">No merchants found. Create one to get started.</p>
          ) : (
            <div className="space-y-2">
              {filteredMerchants.map((m) => (
                <div
                  key={m.merchant_id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedMerchant?.merchant_id === m.merchant_id
                      ? "bg-primary-600/20 border-primary-600"
                      : "bg-slate-800/50 border-slate-700 hover:bg-slate-800"
                  }`}
                  onClick={() => handleSelectMerchant(m.merchant_id)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-slate-100 truncate">{m.name}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{m.merchant_id}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700 text-slate-300">
                          {m.category}
                        </span>
                        {m.risk_profile && (
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded ${
                              m.risk_profile === "HIGH"
                                ? "bg-red-900/50 text-red-300"
                                : m.risk_profile === "MEDIUM"
                                  ? "bg-yellow-900/50 text-yellow-300"
                                  : "bg-green-900/50 text-green-300"
                            }`}
                          >
                            {m.risk_profile}
                          </span>
                        )}
                        {m.config?.simulate_failure && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-900/50 text-red-300">
                            Failure Mode
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      className="text-xs text-primary-300 hover:text-primary-200 px-2 py-1"
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openUpdateForm(m);
                      }}
                    >
                      Update
                    </button>
                  </div>
                </div>
              ))}
            </div>
          );
        })()}
        </div>

        {/* QR Preview / Update Form */}
        <div className="card p-4 md:p-6 space-y-4">
          {showUpdateForm && selectedMerchant ? (
            <div>
              <h2 className="text-sm font-semibold text-slate-100 mb-4">
                Update Merchant: {selectedMerchant.name}
              </h2>
              <form onSubmit={handleUpdateMerchant} className="space-y-3">
                <div>
                  <label className="block text-xs mb-1 text-slate-300">Risk Profile</label>
                  <select
                    className="input"
                    value={updateRiskProfile}
                    onChange={(e) =>
                      setUpdateRiskProfile(e.target.value as "LOW" | "MEDIUM" | "HIGH")
                    }
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="simulateFailure"
                    checked={updateSimulateFailure}
                    onChange={(e) => setUpdateSimulateFailure(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-primary-600"
                  />
                  <label htmlFor="simulateFailure" className="text-xs text-slate-300">
                    Force Transaction Failure (Chaos Control)
                  </label>
                </div>
                {error && <p className="text-xs text-red-400">{error}</p>}
                <div className="flex gap-2">
                  <button className="btn-primary flex-1" type="submit" disabled={loading}>
                    {loading ? "Updating..." : "Update"}
                  </button>
                  <button
                    className="btn-secondary"
                    type="button"
                    onClick={() => {
                      setShowUpdateForm(false);
                      if (selectedMerchant) {
                        handleSelectMerchant(selectedMerchant.merchant_id);
                      }
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          ) : selectedMerchant && selectedMerchant.qr_image ? (
            <PrintableQRCard
              merchant={{
                id: selectedMerchant.merchant_id,
                name: selectedMerchant.name,
                category: selectedMerchant.category
              }}
              qrImageUrl={selectedMerchant.qr_image}
            />
          ) : selectedMerchant ? (
            <div className="text-center py-8">
              <p className="text-xs text-slate-400">No QR code available for this merchant.</p>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-xs text-slate-400">
                Select a merchant from the list to view its QR code.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
