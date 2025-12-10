import React from "react";
import { Link } from "react-router-dom";

export const NotFoundPage: React.FC = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="card px-8 py-6 max-w-md text-center space-y-3">
      <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide">404</div>
      <h1 className="text-lg font-semibold text-slate-50">Page not found</h1>
      <p className="text-xs text-slate-400">
        The admin console route you requested does not exist or has moved.
      </p>
      <Link className="btn-primary inline-flex mt-2" to="/">
        Go home
      </Link>
    </div>
  </div>
);





