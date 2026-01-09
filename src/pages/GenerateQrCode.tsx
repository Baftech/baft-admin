import React, { useState } from "react";
import { apiClient } from "../api/client";
import { PrintableQRCard, type MerchantCardInfo } from "../components/Merchants/PrintableQRCard";

interface MerchantQrResponse {
  id: string;
  name: string;
  category: string;
  qrImageUrl: string; // URL or data:image/png;base64,... returned by backend
}

export const GenerateQrCodePage: React.FC = () => {
  const [merchantId, setMerchantId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [merchant, setMerchant] = useState<MerchantCardInfo | null>(null);
  const [qrImageUrl, setQrImageUrl] = useState<string | null>(null);

  const handleFetchQr = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!merchantId.trim()) return;

    setLoading(true);
    setError(null);
    setMerchant(null);
    setQrImageUrl(null);

    try {
      const res = await apiClient.get<MerchantQrResponse>(
        `/merchants/${encodeURIComponent(merchantId.trim())}/qr`
      );
      setMerchant({
        id: res.id,
        name: res.name,
        category: res.category
      });
      setQrImageUrl(res.qrImageUrl);
    } catch (err) {
      setError((err as Error).message || "Failed to fetch QR code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold text-slate-50">Generate / View Merchant QR</h1>
        <p className="text-xs text-slate-400">
          Enter a Sandbox Merchant ID to fetch its QR code and print a payment standee card.
        </p>
      </div>

      <div className="card p-4 md:p-6 space-y-4 max-w-xl">
        <form onSubmit={handleFetchQr} className="space-y-3">
          <div>
            <label className="block text-xs mb-1 text-slate-300">Merchant ID</label>
            <input
              className="input"
              type="text"
              placeholder="e.g. mch_12345"
              value={merchantId}
              onChange={(e) => setMerchantId(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-xs text-red-400">{error}</p>}
          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? "Fetching QR..." : "View / Generate QR"}
          </button>
        </form>
      </div>

      {merchant && qrImageUrl && (
        <div className="card p-4 md:p-6 inline-block">
          <PrintableQRCard merchant={merchant} qrImageUrl={qrImageUrl} />
        </div>
      )}
    </div>
  );
};
