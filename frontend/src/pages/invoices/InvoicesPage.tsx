import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { fetchInvoices, cancelInvoice, type InvoiceStatus } from '@/lib/invoices';
import { formatVnd } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth.store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const STATUS_LABELS: Record<InvoiceStatus, string> = {
  draft: 'Nháp',
  issued: 'Đã phát hành',
  cancelled: 'Đã huỷ',
};

const STATUS_COLORS: Record<InvoiceStatus, string> = {
  draft: 'bg-yellow-100 text-yellow-800',
  issued: 'bg-green-100 text-green-800',
  cancelled: 'bg-gray-100 text-gray-500',
};

const CANCEL_ROLES = ['accountant', 'admin'];

export default function InvoicesPage() {
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>('issued');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [page, setPage] = useState(1);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const limit = 20;

  const canCancel = user && CANCEL_ROLES.includes(user.role);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['invoices', statusFilter, from, to, page],
    queryFn: () =>
      fetchInvoices({
        status: (statusFilter as 'issued' | 'cancelled') || undefined,
        from: from || undefined,
        to: to || undefined,
        page,
        limit,
      }),
    placeholderData: (prev) => prev,
  });

  const cancelMutation = useMutation({
    mutationFn: cancelInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
    onError: (err: Error) => {
      setErrorMsg('Không thể huỷ hoá đơn: ' + err.message);
    },
  });

  const totalPages = data ? Math.ceil(data.total / limit) : 1;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b px-6 py-3 flex items-center justify-between">
        <h1 className="text-lg font-semibold">Danh sách hoá đơn</h1>
        <span className="text-sm text-muted-foreground">{user?.email}</span>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {errorMsg && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-800 rounded px-4 py-3 flex justify-between">
            <span>{errorMsg}</span>
            <button onClick={() => setErrorMsg(null)}>&times;</button>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg border p-4 mb-6 flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Trạng thái</label>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="">Tất cả</option>
              <option value="issued">Đã phát hành</option>
              <option value="cancelled">Đã huỷ</option>
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

          {(statusFilter || from || to) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setStatusFilter(''); setFrom(''); setTo(''); setPage(1); }}
            >
              Xoá lọc
            </Button>
          )}
        </div>

        {/* Table */}
        {isLoading && <p className="text-muted-foreground">Đang tải…</p>}
        {isError && <p className="text-red-600">Không thể tải danh sách hoá đơn.</p>}

        {data && (
          <>
            <div className="bg-white rounded-lg border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium">Số hoá đơn</th>
                    <th className="text-left px-4 py-3 font-medium">Trạng thái</th>
                    <th className="text-right px-4 py-3 font-medium">Tổng tiền</th>
                    <th className="text-left px-4 py-3 font-medium">Ngày phát hành</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {data.items.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-xs font-semibold">
                        {invoice.invoiceNumber}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[invoice.status]}`}
                        >
                          {STATUS_LABELS[invoice.status]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-medium">
                        {formatVnd(invoice.totalVnd)}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {invoice.issuedAt
                          ? new Date(invoice.issuedAt).toLocaleString('vi-VN')
                          : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 justify-end">
                          <Link
                            to={`/invoices/${invoice.id}`}
                            className="text-blue-600 hover:underline text-xs"
                          >
                            Chi tiết
                          </Link>
                          {canCancel && invoice.status === 'issued' && (
                            <button
                              onClick={() => cancelMutation.mutate(invoice.id)}
                              disabled={cancelMutation.isPending}
                              className="text-xs text-red-600 hover:underline disabled:opacity-50"
                            >
                              Huỷ
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}

                  {data.items.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                        Không có hoá đơn nào.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="mt-4 flex justify-center items-center gap-2">
                <Button variant="ghost" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
                  ‹ Trước
                </Button>
                <span className="text-sm text-muted-foreground">Trang {page} / {totalPages}</span>
                <Button variant="ghost" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
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
