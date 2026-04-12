import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { fetchProducts, deactivateProduct, type Product } from '@/lib/products';
import { formatVnd } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth.store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { logout } from '@/lib/auth';
import { useNavigate } from 'react-router-dom';

const WRITE_ROLES = ['admin', 'store-manager'];
const TAX_LABELS: Record<number, string> = { 0: '0%', 5: '5%', 8: '8%', 10: '10%' };

export default function ProductListPage() {
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const limit = 20;
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const canWrite = user && WRITE_ROLES.includes(user.role);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['products', q, page],
    queryFn: () => fetchProducts({ q: q || undefined, page, limit }),
    placeholderData: (prev) => prev,
  });

  const deactivate = useMutation({
    mutationFn: (id: string) => deactivateProduct(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  });

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const totalPages = data ? Math.ceil(data.total / limit) : 1;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">V-Smart Ledger — Sản phẩm</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">{user?.email}</span>
          {canWrite && (
            <Button asChild size="sm">
              <Link to="/products/new">+ Thêm sản phẩm</Link>
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            Đăng xuất
          </Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Search */}
        <div className="mb-6 flex gap-2">
          <Input
            placeholder="Tìm theo tên (có dấu/không dấu) hoặc mã SKU…"
            value={q}
            onChange={(e) => { setQ(e.target.value); setPage(1); }}
            className="max-w-sm"
          />
          {q && (
            <Button variant="ghost" size="sm" onClick={() => { setQ(''); setPage(1); }}>
              Xoá
            </Button>
          )}
        </div>

        {/* Table */}
        {isLoading && <p className="text-muted-foreground">Đang tải…</p>}
        {isError && <p className="text-red-600">Không thể tải danh sách sản phẩm.</p>}

        {data && (
          <>
            <div className="overflow-x-auto rounded-lg border bg-white">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">SKU</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Tên sản phẩm</th>
                    <th className="px-4 py-3 text-right font-medium text-gray-500">Giá (VNĐ)</th>
                    <th className="px-4 py-3 text-center font-medium text-gray-500">Thuế</th>
                    <th className="px-4 py-3 text-center font-medium text-gray-500">Trạng thái</th>
                    {canWrite && <th className="px-4 py-3 text-right font-medium text-gray-500">Thao tác</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.data.length === 0 && (
                    <tr>
                      <td colSpan={canWrite ? 6 : 5} className="px-4 py-8 text-center text-muted-foreground">
                        Không có sản phẩm nào.
                      </td>
                    </tr>
                  )}
                  {data.data.map((p: Product) => (
                    <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-gray-700">{p.sku}</td>
                      <td className="px-4 py-3 font-medium">
                        <Link to={`/products/${p.id}/edit`} className="hover:underline text-blue-700">
                          {p.name}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">{formatVnd(p.priceVnd)}</td>
                      <td className="px-4 py-3 text-center">{TAX_LABELS[p.taxRatePercent] ?? p.taxRatePercent}</td>
                      <td className="px-4 py-3 text-center">
                        {p.isActive ? (
                          <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
                            Đang bán
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                            Ngừng bán
                          </span>
                        )}
                      </td>
                      {canWrite && (
                        <td className="px-4 py-3 text-right space-x-2">
                          <Button asChild variant="outline" size="sm">
                            <Link to={`/products/${p.id}/edit`}>Sửa</Link>
                          </Button>
                          {p.isActive && (
                            <Button
                              variant="destructive"
                              size="sm"
                              disabled={deactivate.isPending}
                              onClick={() => deactivate.mutate(p.id)}
                            >
                              Ngừng bán
                            </Button>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
              <span>Tổng: {data.total} sản phẩm</span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                  ← Trước
                </Button>
                <span className="flex items-center px-2">
                  Trang {page} / {totalPages}
                </span>
                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                  Sau →
                </Button>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
