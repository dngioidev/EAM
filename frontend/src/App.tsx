import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '@/pages/LoginPage';
import ProductListPage from '@/pages/ProductListPage';
import ProductFormPage from '@/pages/ProductFormPage';
import ProductDetailPage from '@/pages/ProductDetailPage';
import AdminUsersPage from '@/pages/admin/AdminUsersPage';
import DashboardPage from '@/pages/DashboardPage';
import AppLayout from '@/components/AppLayout';
import { RequireAuth, RedirectIfAuth } from '@/components/RouteGuards';
import { useAuthStore } from '@/stores/auth.store';

const ROLE_LANDING: Record<string, string> = {
  OWNER: '/dashboard',
  ADMIN: '/admin/users',
};

function RoleFallback() {
  const role = useAuthStore((s) => s.user?.role ?? '');
  return <Navigate to={ROLE_LANDING[role] ?? '/dashboard'} replace />;
}

export default function App() {
  return (
    <Routes>
      {/* Public — redirect to role landing if already authed */}
      <Route element={<RedirectIfAuth />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<LoginPage defaultMode="register" />} />
      </Route>

      {/* Protected — all wrapped in AppLayout */}
      <Route element={<RequireAuth />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />

          <Route path="/products" element={<ProductListPage />} />
          <Route path="/products/new" element={<ProductFormPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/products/:id/edit" element={<ProductFormPage />} />

          <Route path="/admin/users" element={<AdminUsersPage />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<RequireAuth />}>
        <Route path="*" element={<RoleFallback />} />
      </Route>
    </Routes>
  );
}
