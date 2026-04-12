import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth.store';

/** Landing route per role (BR-NAV role_landing_map) */
const ROLE_LANDING: Record<string, string> = {
  cashier: '/pos',
  accountant: '/invoices',
  'store-manager': '/dashboard',
  admin: '/admin/stores',
};

/** Redirects to /login if no access token is present */
export function RequireAuth() {
  const token = useAuthStore((s) => s.accessToken);
  if (!token) return <Navigate to="/login" replace />;
  return <Outlet />;
}

/** Redirects to role landing page if already logged in */
export function RedirectIfAuth() {
  const token = useAuthStore((s) => s.accessToken);
  const role = useAuthStore((s) => s.user?.role ?? '');
  if (token) {
    const landing = ROLE_LANDING[role] ?? '/products';
    return <Navigate to={landing} replace />;
  }
  return <Outlet />;
}

