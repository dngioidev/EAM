import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '@/pages/LoginPage';
import ProductListPage from '@/pages/ProductListPage';
import ProductFormPage from '@/pages/ProductFormPage';
import PosPage from '@/pages/pos/PosPage';
import OrdersPage from '@/pages/orders/OrdersPage';
import InvoicesPage from '@/pages/invoices/InvoicesPage';
import InvoiceDetailPage from '@/pages/invoices/InvoiceDetailPage';
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

        {/* POS — cashier + store-manager */}
        <Route path="/pos" element={<PosPage />} />

        {/* Order history — all authenticated roles */}
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/orders/:orderId/invoice" element={<InvoiceDetailPage />} />

        {/* Invoices — accountant + store-manager + admin */}
        <Route path="/invoices" element={<InvoicesPage />} />
        <Route path="/invoices/:id" element={<InvoiceDetailPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/products" replace />} />
    </Routes>
  );
}
