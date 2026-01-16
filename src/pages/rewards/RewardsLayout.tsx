import React from "react";
import { Link, Outlet, useLocation } from "react-router-dom";

export const RewardsLayout: React.FC = () => {
    const location = useLocation();

    const tabs = [
        { to: "/rewards", label: "Overview", exact: true },
        { to: "/rewards/campaigns", label: "Campaigns" },
        { to: "/rewards/ledger", label: "Ledger" },
        { to: "/rewards/pending", label: "Pending Review" },
        { to: "/rewards/pool", label: "Pool Health" },
        { to: "/rewards/fraud", label: "Fraud Monitor" },
    ];

    return (
        <div className="space-y-6">
            <div className="border-b border-slate-800">
                <nav className="-mb-px flex space-x-6 overflow-x-auto">
                    {tabs.map((tab) => {
                        const isActive = tab.exact
                            ? location.pathname === tab.to
                            : location.pathname.startsWith(tab.to);

                        return (
                            <Link
                                key={tab.to}
                                to={tab.to}
                                className={`
                  whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors
                  ${isActive
                                        ? "border-primary-500 text-primary-400"
                                        : "border-transparent text-slate-400 hover:text-slate-300 hover:border-slate-700"}
                `}
                            >
                                {tab.label}
                            </Link>
                        );
                    })}
                </nav>
            </div>
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                <Outlet />
            </div>
        </div>
    );
};
