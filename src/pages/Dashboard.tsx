import React from "react";
import { useAuth } from "../auth/AuthContext";
import { Link } from "react-router-dom";

export const DashboardPage: React.FC = () => {
  const { admin } = useAuth();

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-slate-50">
            Welcome back{admin?.fullName ? `, ${admin.fullName}` : ""}.
          </h1>
          <p className="text-xs text-slate-400">
            Use the left navigation to jump into users, transactions, risk and configuration.
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-4 space-y-3">
          <div className="text-xs text-slate-400">User operations</div>
          <div className="text-sm text-slate-100">
            Search users, inspect wallets and recent transactions, and manage freezes/flags.
          </div>
          <Link
            to="/users"
            className="inline-flex text-[11px] text-primary-300 hover:text-primary-200 underline"
          >
            Open Users module →
          </Link>
        </div>
        <div className="card p-4 space-y-3">
          <div className="text-xs text-slate-400">Financial health</div>
          <div className="text-sm text-slate-100">
            Monitor system balances and high-value flows across escrow and settlement pools.
          </div>
          <div className="flex gap-3 text-[11px]">
            <Link
              to="/balances"
              className="text-primary-300 hover:text-primary-200 underline"
            >
              View balances →
            </Link>
            <Link
              to="/transactions"
              className="text-primary-300 hover:text-primary-200 underline"
            >
              View transactions →
            </Link>
          </div>
        </div>
        <div className="card p-4 space-y-3">
          <div className="text-xs text-slate-400">Risk & maintenance</div>
          <div className="text-sm text-slate-100">
            Watch for high-velocity users and large payouts, and toggle maintenance when required.
          </div>
          <div className="flex flex-wrap gap-3 text-[11px]">
            <Link
              to="/risk/high-velocity"
              className="text-primary-300 hover:text-primary-200 underline"
            >
              High-velocity feed →
            </Link>
            <Link
              to="/risk/large"
              className="text-primary-300 hover:text-primary-200 underline"
            >
              Large txns feed →
            </Link>
            <Link
              to="/config/maintenance"
              className="text-primary-300 hover:text-primary-200 underline"
            >
              Maintenance toggle →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};


