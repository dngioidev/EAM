import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { fetchOrders, type OrderStatus } from '@/lib/orders';
import { formatVnd } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth.store';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Chờ xử lý',
  processing: 'Đang xử lý',
  completed: 'Hoàn thành',
  cancelled: 'Đã huỷ',
  refunded: 'Hoàn tiền',
};

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-gray-100 text-gray-600',
  refunded: 'bg-red-100 text-red-700',
};

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'Tất cả trạng thái' },
  { value: 'pending', label: 'Chờ xử lý' },
  { value: 'processing', label: 'Đang xử lý' },
  { value: 'completed', label: 'Hoàn thành' },
  { value: 'cancelled', label: 'Đã huỷ' },
];

export default function OrdersPage() {
  const user = useAuthStore((s) => s.user);
  const [status, setStatus] = useState<string>('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data, isLoading, isError } = useQuery({
    queryKey: ['orders', status, from, to, page],
    queryFn: () =>
      fetchOrders({
        status: (status as OrderStatus) || undefined,
        from: from || undefined,
        to: to || undefined,
        page,
        limit,
      }),
    placeholderData: (prev) => prev,
  });

  const totalPages = data ? Math.ceil(data.total / limit) : 1;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b px-6 py-3 flex items-center justify-between">
        <h1 className="text-lg font-semibold">Lịch sử đơn hàng</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">{user?.email}</span>
          {(user?.role === 'cashier' || user?.role === 'store-manager') && (
            <Button asChild size="sm">
              <Link to="/pos">POS</Link>
            </Button>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Filters */}
        <div className="bg-white rounded-lg border p-4 mb-6 flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Trạng thái</label>
            <select
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm"
            >
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-muted-foreground mb-1">Từ ngày</label>
            <Input
              type="date"
              value={from}
              onChange={(e) => { setFrom(e.target.value); setPage(1); }}
              className="w-36"
            />
          </div>

          <div>
            <label className="block text-xs text-muted-foreground mb-1">Đến ngày</label>
            <Input
              type="date"
              value={to}
              onChange={(e) => { setTo(e.target.value); setPage(1); }}
              className="w-36"
            />
          </div>

          {(status || from || to) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setStatus(''); setFrom(''); setTo(''); setPage(1); }}
            >
              Xoá lọc
            </Button>
          )}
        </div>

        {/* Table */}
        {isLoading && <p className="text-muted-foreground">Đang tải…</p>}
        {isError && <p className="text-red-600">Không thể tải danh sách đơn hàng.</p>}

        {data && (
          <>
            <div className="bg-white rounded-lg border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium">Mã đơn hàng</th>
                    <th className="text-left px-4 py-3 font-medium">Trạng thái</th>
                    <th className="text-right px-4 py-3 font-medium">Tổng tiền</th>
                    <th className="text-left px-4 py-3 font-medium">Thanh toán</th>
                    <th className="text-left px-4 py-3 font-medium">Thời gian</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {data.items.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-xs">{order.orderNumber}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[order.status]}`}
                        >
                          {STATUS_LABELS[order.status]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-medium">
                        {formatVnd(order.totalVnd)}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {order.paymentMethod === 'cash'
                          ? 'Tiền mặt'
                          : order.paymentMethod === 'card'
                          ? 'Thẻ'
                          : '—'}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {new Date(order.createdAt).toLocaleString('vi-VN')}
                      </td>
                      <td className="px-4 py-3">
                        {order.status === 'completed' && (
                          <Link
                            to={`/orders/${order.id}/invoice`}
                            className="text-blue-600 hover:underline text-xs"
                          >
                            Xem hoá đơn
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))}

                  {data.items.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                        Không có đơn hàng nào.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-4 flex justify-center items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  ‹ Trước
                </Button>
                <span className="text-sm text-muted-foreground">
                  Trang {page} / {totalPages}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Sau ›
                </Button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
