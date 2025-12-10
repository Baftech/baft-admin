import React from "react";
import { Link } from "react-router-dom";

export const ForbiddenPage: React.FC = () => {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="card px-8 py-6 max-w-md text-center space-y-3">
        <div className="text-xs font-semibold text-red-400 tracking-wide uppercase">
          Access restricted
        </div>
        <h1 className="text-lg font-semibold text-slate-50">You don&apos;t have this role.</h1>
        <p className="text-xs text-slate-400">
          Your admin role does not allow you to access this section of the console. If you believe
          this is an error, contact a SUPERADMIN to review your permissions.
        </p>
        <Link
          className="btn-primary inline-flex mt-2"
          to="/"
        >
          Back to overview
        </Link>
      </div>
    </div>
  );
};





