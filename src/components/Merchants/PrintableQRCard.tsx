import React, { useRef } from "react";
import { useReactToPrint } from "react-to-print";

export interface MerchantCardInfo {
  id: string;
  name: string;
  category: string;
}

interface PrintableQRCardProps {
  merchant: MerchantCardInfo;
  qrImageUrl: string;
}

export const PrintableQRCard: React.FC<PrintableQRCardProps> = ({ merchant, qrImageUrl }) => {
  const cardRef = useRef<HTMLDivElement | null>(null);

  const handlePrint = useReactToPrint({
    content: () => cardRef.current,
    documentTitle: `merchant-${merchant.id}-qr-card`
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-sm font-semibold text-slate-100">QR Preview</h2>
        <button className="btn-primary" type="button" onClick={handlePrint}>
          Print QR Card
        </button>
      </div>

      <div ref={cardRef} className="qr-card">
        <div className="qr-card-header">
          <span className="qr-card-brand">Sandbox Pay</span>
          <span className="qr-card-label">Merchant QR</span>
        </div>
        <div className="qr-card-body">
          <img src={qrImageUrl} alt={`QR for ${merchant.name}`} className="qr-card-image" />
          <div className="qr-card-details">
            <div className="qr-card-merchant-name">{merchant.name}</div>
            <div className="qr-card-meta-row">
              <span className="qr-card-meta-label">Merchant ID</span>
              <span className="qr-card-meta-value">{merchant.id}</span>
            </div>
            <div className="qr-card-meta-row">
              <span className="qr-card-meta-label">Category</span>
              <span className="qr-card-meta-value">{merchant.category}</span>
            </div>
          </div>
        </div>
        <div className="qr-card-footer">
          Scan with Baft App · Sandbox Environment · Do not use in production
        </div>
      </div>
    </div>
  );
};


