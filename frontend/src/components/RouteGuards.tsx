import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth.store';

/** Redirects to /login if no access token is present */
export function RequireAuth() {
  const token = useAuthStore((s) => s.accessToken);
  if (!token) return <Navigate to="/login" replace />;
  return <Outlet />;
}

/** Redirects to /products if already logged in */
export function RedirectIfAuth() {
  const token = useAuthStore((s) => s.accessToken);
  if (token) return <Navigate to="/products" replace />;
  return <Outlet />;
}
