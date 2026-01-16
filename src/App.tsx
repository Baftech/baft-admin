import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import { ProtectedRoute } from "./auth/ProtectedRoute";
import { Shell } from "./components/Layout/Shell";
import { LoginPage } from "./pages/Login";
import { DashboardPage } from "./pages/Dashboard";
import { ForbiddenPage } from "./pages/Forbidden";
import { UsersListPage } from "./pages/users/UsersList";
import { UserDetailPage } from "./pages/users/UserDetail";
import { SystemBalancesPage } from "./pages/balances/SystemBalances";
import { PlatformFeesPage } from "./pages/balances/PlatformFees";
import { RewardsLayout } from "./pages/rewards/RewardsLayout";
import { RewardsDashboard } from "./pages/rewards/RewardsDashboard";
import { CampaignsListPage } from "./pages/rewards/campaigns/CampaignsList";
import { CampaignBuilderPage } from "./pages/rewards/campaigns/CampaignBuilder";
import { RewardLedgerPage } from "./pages/rewards/RewardLedger";
import { PendingQueuePage } from "./pages/rewards/PendingQueue";
import { PoolHealthPage } from "./pages/rewards/PoolHealth";
import { FraudMonitorPage } from "./pages/rewards/FraudMonitor";
import { TransactionsListPage } from "./pages/transactions/TransactionsList";
import { TransactionDetailPage } from "./pages/transactions/TransactionDetail";
import { HighVelocityPage } from "./pages/risk/HighVelocity";
import { LargeTransactionsPage } from "./pages/risk/LargeTransactions";
import { MaintenanceModePage } from "./pages/config/MaintenanceMode";
import { NotFoundPage } from "./pages/NotFound";
import { GenerateQrCodePage } from "./pages/GenerateQrCode";

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forbidden" element={<ForbiddenPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<Shell />}>
            <Route index element={<DashboardPage />} />

            <Route element={<ProtectedRoute allowedRoles={["OPS", "SUPPORT", "SUPERADMIN"]} />}>
              <Route path="users" element={<UsersListPage />} />
              <Route path="users/:id" element={<UserDetailPage />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={["OPS", "FINANCE", "SUPERADMIN"]} />}>
              <Route path="balances" element={<SystemBalancesPage />} />
              <Route path="balances/fees" element={<PlatformFeesPage />} />

              <Route path="rewards" element={<RewardsLayout />}>
                <Route index element={<RewardsDashboard />} />
                <Route path="campaigns" element={<CampaignsListPage />} />
                <Route path="campaigns/new" element={<CampaignBuilderPage />} />
                <Route path="campaigns/:id" element={<CampaignBuilderPage />} />
                <Route path="ledger" element={<RewardLedgerPage />} />
                <Route path="pending" element={<PendingQueuePage />} />
                <Route path="pool" element={<PoolHealthPage />} />
                <Route path="fraud" element={<FraudMonitorPage />} />
              </Route>

              <Route path="transactions" element={<TransactionsListPage />} />
              <Route path="transactions/:id" element={<TransactionDetailPage />} />
              <Route path="risk/large" element={<LargeTransactionsPage />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={["OPS", "SUPPORT", "SUPERADMIN"]} />}>
              <Route path="risk/high-velocity" element={<HighVelocityPage />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles="SUPERADMIN" />}>
              <Route path="config/maintenance" element={<MaintenanceModePage />} />
              <Route path="merchants" element={<GenerateQrCodePage />} />
            </Route>

            <Route path="forbidden" element={<ForbiddenPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AuthProvider>
  );
};

export default App;





