import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Package, Plus } from 'lucide-react';
import { fetchProducts, type Product, type StockStatus } from '@/lib/products';
import { useAuthStore } from '@/stores/auth.store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const STATUS_LABEL: Record<StockStatus, string> = {
  OUT_OF_STOCK: 'Hết hàng',
  LOW_STOCK: 'Sắp hết',
  IN_STOCK: 'Còn hàng',
};

const STATUS_CLASS: Record<StockStatus, string> = {
  OUT_OF_STOCK: 'bg-red-100 text-red-700',
  LOW_STOCK: 'bg-amber-100 text-amber-700',
  IN_STOCK: 'bg-green-100 text-green-700',
};

export default function ProductListPage() {
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const limit = 20;
  const user = useAuthStore((s) => s.user);
  const canWrite = user?.role === 'OWNER';

  const { data, isLoading, isError } = useQuery({
    queryKey: ['products', q, page],
    queryFn: () => fetchProducts({ q: q || undefined, page, limit }),
    placeholderData: (prev) => prev,
  });

  const totalPages = data ? Math.ceil(data.total / limit) : 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Sản phẩm</h1>
        {canWrite && (
          <Button asChild className="min-h-[44px]">
            <Link to="/products/new">
              <Plus className="h-4 w-4 mr-2" />
              Thêm sản phẩm
            </Link>
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="flex gap-2">
        <Input
          placeholder="Tìm theo tên hoặc mã SKU…"
          value={q}
          onChange={(e) => { setQ(e.target.value); setPage(1); }}
          className="max-w-sm min-h-[44px]"
        />
        {q && (
          <Button variant="ghost" size="sm" className="min-h-[44px]" onClick={() => { setQ(''); setPage(1); }}>
            Xoá
          </Button>
        )}
      </div>

      {/* States */}
      {isLoading && (
        <p className="text-sm text-muted-foreground">Đang tải…</p>
      )}
      {isError && (
        <p className="text-sm text-red-600">Không thể tải danh sách sản phẩm. Vui lòng thử lại.</p>
      )}

      {data && (
        <>
          {data.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
              <Package className="h-12 w-12 text-muted-foreground opacity-40" />
              <div>
                <p className="font-medium text-muted-foreground">
                  {q ? 'Không tìm thấy sản phẩm nào.' : 'Chưa có sản phẩm nào.'}
                </p>
                {!q && canWrite && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Bắt đầu bằng cách thêm sản phẩm đầu tiên.
                  </p>
                )}
              </div>
              {!q && canWrite && (
                <Button asChild className="min-h-[44px]">
                  <Link to="/products/new">
                    <Plus className="h-4 w-4 mr-2" />
                    Thêm sản phẩm
                  </Link>
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto rounded-lg border bg-white">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium text-gray-500">Tên sản phẩm</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-500">SKU</th>
                      <th className="px-4 py-3 text-right font-medium text-gray-500">Số lượng</th>
                      <th className="px-4 py-3 text-right font-medium text-gray-500">Ngưỡng</th>
                      <th className="px-4 py-3 text-center font-medium text-gray-500">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {data.items.map((p: Product) => (
                      <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 font-medium">
                          <Link
                            to={`/products/${p.id}`}
                            className="hover:underline text-blue-700"
                          >
                            {p.name}
                          </Link>
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-gray-500">
                          {p.sku ?? '—'}
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums font-semibold">
                          {p.quantity}
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums text-gray-500">
                          {p.threshold}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={cn(
                              'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                              STATUS_CLASS[p.status],
                            )}
                          >
                            {STATUS_LABEL[p.status]}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Tổng: {data.total} sản phẩm</span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="min-h-[44px]"
                    disabled={page <= 1}
                    onClick={() => setPage(page - 1)}
                  >
                    ← Trước
                  </Button>
                  <span className="flex items-center px-2">
                    {page} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="min-h-[44px]"
                    disabled={page >= totalPages}
                    onClick={() => setPage(page + 1)}
                  >
                    Sau →
                  </Button>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
