import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth.store';

const ROLE_LANDING: Record<string, string> = {
  OWNER: '/dashboard',
  ADMIN: '/admin/users',
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
    const landing = ROLE_LANDING[role] ?? '/dashboard';
    return <Navigate to={landing} replace />;
  }
  return <Outlet />;
}
