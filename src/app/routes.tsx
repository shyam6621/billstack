import { Navigate, Route, Routes, BrowserRouter } from 'react-router-dom';
import { AdminRoute, UserRoute } from '@/components/ProtectedRoute';
import AdminLayout from '@/components/layout/AdminLayout';
import UserLayout from '@/components/layout/UserLayout';
import Index from '@/pages/Index';
import Login from '@/features/auth/Login';
import Register from '@/features/auth/Register';
import Dashboard from '@/features/dashboard/Dashboard';
import Bills from '@/features/bills/BillsPage';
import BillCalendar from '@/features/bills/BillCalendarPage';
import PayBills from '@/features/payments/PayBills';
import PaymentHistory from '@/features/payments/PaymentHistory';
import AuditLogs from '@/pages/AuditLogs';
import Notifications from '@/pages/Notifications';
import AdminDashboard from '@/features/admin/AdminDashboard';
import UsersPage from '@/features/admin/UsersPage';
import BillsManagementPage from '@/features/admin/BillsManagementPage';
import TransactionsPage from '@/features/admin/TransactionsPage';
import RevenueAnalyticsPage from '@/features/admin/RevenueAnalyticsPage';
import AdminFraudAlerts from '@/pages/admin/AdminFraudAlerts';
import NotFound from '@/pages/NotFound';

export const AppRoutes = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/login" element={<Navigate to="/" replace />} />
      <Route path="/login/admin" element={<Login expectedRole="ADMIN" />} />
      <Route path="/login/user" element={<Login expectedRole="USER" />} />
      <Route path="/register" element={<Register />} />

      <Route element={<UserRoute><UserLayout /></UserRoute>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/bills" element={<Bills />} />
        <Route path="/bills/calendar" element={<BillCalendar />} />
        <Route path="/payments" element={<PayBills />} />
        <Route path="/history" element={<PaymentHistory />} />
        <Route path="/activity" element={<AuditLogs />} />
        <Route path="/notifications" element={<Notifications />} />
      </Route>

      <Route element={<AdminRoute><AdminLayout /></AdminRoute>}>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<UsersPage />} />
        <Route path="/admin/bills" element={<BillsManagementPage />} />
        <Route path="/admin/transactions" element={<TransactionsPage />} />
        <Route path="/admin/revenue" element={<RevenueAnalyticsPage />} />
        <Route path="/admin/fraud" element={<AdminFraudAlerts />} />
        <Route path="/admin/notifications" element={<Notifications />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  </BrowserRouter>
);
