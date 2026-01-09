import React from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";

const navItems = [
  { to: "/users", label: "Users", roles: ["OPS", "SUPPORT", "SUPERADMIN"] },
  { to: "/transactions", label: "Transactions", roles: ["OPS", "FINANCE", "SUPERADMIN"] },
  { to: "/balances", label: "System Balances", roles: ["OPS", "FINANCE", "SUPERADMIN"] },
  { to: "/risk/high-velocity", label: "High Velocity", roles: ["OPS", "SUPPORT", "SUPERADMIN"] },
  { to: "/risk/large", label: "Large Txns", roles: ["OPS", "FINANCE", "SUPERADMIN"] },
  { to: "/config/maintenance", label: "Maintenance", roles: ["SUPERADMIN"] },
  { to: "/config/generate-qrcode", label: "Generate QR", roles: ["SUPERADMIN"] }
] as const;

export const Shell: React.FC = () => {
  const { admin, logout, hasRole } = useAuth();
  const location = useLocation();

  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-100">
      <aside className="w-64 border-r border-slate-800 bg-slate-950/80 backdrop-blur-xl hidden md:flex flex-col">
        <div className="h-16 flex items-center px-4 border-b border-slate-800">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-primary-600 flex items-center justify-center text-xs font-bold">
              B
            </div>
            <div>
              <div className="text-sm font-semibold tracking-wide">Baft Admin</div>
              <div className="text-[11px] text-slate-400">Operations Console</div>
            </div>
          </Link>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1 text-sm">
          {navItems
            .filter((item) => hasRole(item.roles as any))
            .map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  [
                    "flex items-center gap-2 px-3 py-2 rounded-lg transition-colors",
                    isActive
                      ? "bg-primary-600/20 text-primary-100"
                      : "text-slate-300 hover:bg-slate-800/80 hover:text-slate-50"
                  ].join(" ")
                }
              >
                <span className="w-1 h-1 rounded-full bg-slate-500" />
                <span>{item.label}</span>
              </NavLink>
            ))}
        </nav>
        <div className="border-t border-slate-800 px-4 py-3 text-xs text-slate-400">
          {admin && (
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-slate-200">{admin.fullName || admin.email}</div>
                <div className="uppercase tracking-wide text-[10px] text-slate-400">
                  {admin.role}
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  void logout();
                }}
                className="text-[11px] text-slate-400 hover:text-red-400"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </aside>
      <div className="flex-1 flex flex-col">
        <header className="h-16 border-b border-slate-800 flex items-center px-4 md:px-6 bg-slate-950/70 backdrop-blur-xl">
          <div className="flex-1 text-sm text-slate-400 truncate">
            {location.pathname === "/" ? "Overview" : location.pathname}
          </div>
          {admin && (
            <div className="flex items-center gap-3 text-xs text-slate-300">
              <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full bg-slate-800/80 border border-slate-700">
                Role: {admin.role}
              </span>
            </div>
          )}
        </header>
        <main className="flex-1 p-4 md:p-6 bg-gradient-to-b from-slate-950 to-slate-900">
          <Outlet />
        </main>
      </div>
    </div>
  );
};





