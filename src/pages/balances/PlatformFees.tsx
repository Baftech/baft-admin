import React from "react";
import { useNavigate } from "react-router-dom";

export const PlatformFeesPage: React.FC = () => {
    const navigate = useNavigate();

    const fees = [
        {
            name: "Loading Fees (Credit/Debit Card)",
            value: "0.5%",
            iconPath: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        },
        {
            name: "Transaction Fee",
            value: "1.2%",
            iconPath: "M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
        },
        {
            name: "Bill Payment Fees",
            value: "₹ 15.00",
            iconPath: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
        }
    ];

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate("/balances")}
                    className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
                >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                </button>
                <h1 className="text-2xl font-bold text-white tracking-tight">Fee Types</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {fees.map((fee, idx) => (
                    <div key={idx} className="card p-6 relative overflow-hidden group hover:border-indigo-500/50 transition-colors">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <svg className="w-16 h-16 text-indigo-500" fill="currentColor" viewBox="0 0 24 24">
                                <path d={fee.iconPath} />
                            </svg>
                        </div>

                        <div className="relative z-10 space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                    Platform Fee
                                </div>
                                <div className="h-2 w-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)] animate-pulse"></div>
                            </div>

                            <div>
                                <div className="text-sm text-slate-300 mb-1">{fee.name}</div>
                                <div className="text-3xl font-bold text-white tracking-tight font-mono">
                                    {fee.value}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
