import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '@/pages/LoginPage';
import ProductListPage from '@/pages/ProductListPage';
import ProductFormPage from '@/pages/ProductFormPage';
import ProductDetailPage from '@/pages/ProductDetailPage';
import PosPage from '@/pages/pos/PosPage';
import OrdersPage from '@/pages/orders/OrdersPage';
import InvoicesPage from '@/pages/invoices/InvoicesPage';
import InvoiceDetailPage from '@/pages/invoices/InvoiceDetailPage';
import AdminStoresPage from '@/pages/admin/AdminStoresPage';
import AdminUsersPage from '@/pages/admin/AdminUsersPage';
import ReportsPage from '@/pages/reports/ReportsPage';
import DashboardPage from '@/pages/DashboardPage';
import AppLayout from '@/components/AppLayout';
import { RequireAuth, RedirectIfAuth } from '@/components/RouteGuards';
import { useAuthStore } from '@/stores/auth.store';

const ROLE_LANDING: Record<string, string> = {
  cashier: '/pos',
  accountant: '/invoices',
  'store-manager': '/dashboard',
  admin: '/admin/stores',
};

function RoleFallback() {
  const role = useAuthStore((s) => s.user?.role ?? '');
  return <Navigate to={ROLE_LANDING[role] ?? '/products'} replace />;
}

export default function App() {
  return (
    <Routes>
      {/* Public — redirect to role landing if already authed */}
      <Route element={<RedirectIfAuth />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>

      {/* Protected — all wrapped in AppLayout */}
      <Route element={<RequireAuth />}>
        <Route element={<AppLayout />}>
          <Route path="/products" element={<ProductListPage />} />
          <Route path="/products/new" element={<ProductFormPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/products/:id/edit" element={<ProductFormPage />} />

          {/* POS — cashier + store-manager */}
          <Route path="/pos" element={<PosPage />} />

          {/* Orders — all authenticated roles */}
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/orders/:orderId/invoice" element={<InvoiceDetailPage />} />

          {/* Invoices — accountant + store-manager + admin */}
          <Route path="/invoices" element={<InvoicesPage />} />
          <Route path="/invoices/:id" element={<InvoiceDetailPage />} />

          {/* Reports — accountant + store-manager + admin (T034-T039) */}
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />

          {/* Admin */}
          <Route path="/admin/stores" element={<AdminStoresPage />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
        </Route>
      </Route>

      {/* Fallback — redirect to role landing for authenticated users */}
      <Route path="*" element={<RequireAuth />}>
        <Route path="*" element={<RoleFallback />} />
      </Route>
    </Routes>
  );
}
