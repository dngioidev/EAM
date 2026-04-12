import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '@/pages/LoginPage';
import ProductListPage from '@/pages/ProductListPage';
import ProductFormPage from '@/pages/ProductFormPage';
import { RequireAuth, RedirectIfAuth } from '@/components/RouteGuards';

export default function App() {
  return (
    <Routes>
      {/* Public — redirect to /products if already authed */}
      <Route element={<RedirectIfAuth />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>

      {/* Protected */}
      <Route element={<RequireAuth />}>
        <Route path="/products" element={<ProductListPage />} />
        <Route path="/products/new" element={<ProductFormPage />} />
        <Route path="/products/:id/edit" element={<ProductFormPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/products" replace />} />
    </Routes>
  );
}
