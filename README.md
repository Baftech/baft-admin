# Baft Admin Dashboard

React + TypeScript admin console for Baft operations, finance, support, and superadmin teams. It implements the flows described in the “Admin Frontend Guide”.

## Stack

- Vite + React 18 + TypeScript
- React Router 6
- React Query for data fetching / cache
- TailwindCSS for styling

## Getting Started

```bash
pnpm install   # or npm install / yarn
pnpm dev       # launches http://localhost:5173
```

Create a `.env` file for the frontend (no secrets):

```bash
VITE_ADMIN_API_BASE_URL="https://71n4j9vt-8000.inc1.devtunnels.ms/api/admin"
```

Your backend-only secrets like `ADMIN_DB_SERVICE_ROLE_KEY`, `ADMIN_JWT_SECRET`, and `MFA_ENCRYPTION_KEY` must **stay on the server** and must **not** be exposed as `VITE_` variables.

## Modules

- **Authentication**: MFA-aware login, refresh/logout handlers, role-based gating.
- **Users**: Search + pagination, profile detail with wallets & recent transactions, status actions (freeze, flag, etc.) gated to OPS/SUPERADMIN.
- **System balances**: Auto-refreshing cards for escrow & pool accounts.
- **Transactions**: Search/list plus detailed view with participants and ledger entries.
- **Risk Dashboards**: High-velocity and large-transactions feeds with adjustable thresholds.
- **Maintenance Mode**: SUPERADMIN-only toggle with audit-friendly messaging.

## Role-Based Access

`ProtectedRoute` is used per section to mirror backend role rules (OPS, SUPPORT, FINANCE, SUPERADMIN). SUPERADMIN inherits all views.

## Testing

Run `pnpm dev`, sign in via `/login`, and verify endpoints using browser DevTools or mocked API responses (e.g., MSW) as needed.
