import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchInvoice } from '@/lib/invoices';
import { fetchOrderInvoice } from '@/lib/orders';
import { formatVnd } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export default function InvoiceDetailPage() {
  const { id, orderId } = useParams<{ id?: string; orderId?: string }>();

  // This page is reused by both /invoices/:id and /orders/:orderId/invoice
  const { data: invoice, isLoading, isError } = useQuery({
    queryKey: ['invoice', id ?? `order:${orderId}`],
    queryFn: () =>
      id ? fetchInvoice(id) : fetchOrderInvoice(orderId!),
    enabled: !!(id || orderId),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-muted-foreground">Đang tải hoá đơn…</p>
      </div>
    );
  }

  if (isError || !invoice) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
        <p className="text-red-600">Không thể tải hoá đơn.</p>
        <Button asChild variant="ghost">
          <Link to="/invoices">← Quay lại</Link>
        </Button>
      </div>
    );
  }

  const grandTotal = invoice.lines.reduce((sum, l) => sum + l.lineTotalVnd, 0);
  const totalVat = invoice.vatSubtotals.reduce((sum, v) => sum + v.vatVnd, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-6 py-3 flex items-center gap-4">
        <Button asChild variant="ghost" size="sm">
          <Link to={orderId ? `/orders` : `/invoices`}>← Quay lại</Link>
        </Button>
        <h1 className="text-lg font-semibold">
          Hoá đơn #{invoice.invoiceNumber}
        </h1>
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
            invoice.status === 'issued'
              ? 'bg-green-100 text-green-800'
              : invoice.status === 'cancelled'
              ? 'bg-gray-100 text-gray-500'
              : 'bg-yellow-100 text-yellow-800'
          }`}
        >
          {invoice.status === 'issued'
            ? 'Đã phát hành'
            : invoice.status === 'cancelled'
            ? 'Đã huỷ'
            : 'Nháp'}
        </span>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg border p-6 space-y-6">
          {/* Meta */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground text-xs mb-1">Số hoá đơn</p>
              <p className="font-mono font-semibold">{invoice.invoiceNumber}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs mb-1">Ngày phát hành</p>
              <p>
                {invoice.issuedAt
                  ? new Date(invoice.issuedAt).toLocaleString('vi-VN')
                  : '—'}
              </p>
            </div>
          </div>

          {/* Line items */}
          <div>
            <h2 className="text-sm font-medium mb-3 border-b pb-2">Chi tiết sản phẩm</h2>
            <table className="w-full text-sm">
              <thead className="text-xs text-muted-foreground">
                <tr>
                  <th className="text-left pb-2 font-medium">Sản phẩm</th>
                  <th className="text-center pb-2 font-medium w-16">SL</th>
                  <th className="text-right pb-2 font-medium w-24">Đơn giá</th>
                  <th className="text-right pb-2 font-medium w-24">Thành tiền</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {invoice.lines.map((line, idx) => (
                  <tr key={idx}>
                    <td className="py-2">
                      <p className="font-medium">{line.productName}</p>
                      <p className="text-xs text-muted-foreground">{line.sku} · VAT {line.taxRatePercent}%</p>
                    </td>
                    <td className="py-2 text-center">{line.quantity}</td>
                    <td className="py-2 text-right">{formatVnd(line.unitPriceVnd)}</td>
                    <td className="py-2 text-right font-medium">{formatVnd(line.lineTotalVnd)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* VAT subtotals */}
          {invoice.vatSubtotals.length > 0 && (
            <div>
              <h2 className="text-sm font-medium mb-3 border-b pb-2">Thuế VAT</h2>
              <table className="w-full text-sm">
                <tbody className="divide-y">
                  {invoice.vatSubtotals.map((vat, idx) => (
                    <tr key={idx}>
                      <td className="py-2 text-muted-foreground">
                        Thuế suất {vat.rate}%
                      </td>
                      <td className="py-2 text-right text-muted-foreground">
                        Chịu thuế: {formatVnd(vat.taxableVnd)}
                      </td>
                      <td className="py-2 text-right font-medium">
                        {formatVnd(vat.vatVnd)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Totals summary */}
          <div className="border-t pt-4 space-y-2 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Tổng trước thuế</span>
              <span>{formatVnd(grandTotal)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Tổng VAT</span>
              <span>{formatVnd(totalVat)}</span>
            </div>
            <div className="flex justify-between font-semibold text-base border-t pt-2">
              <span>Tổng thanh toán</span>
              <span className="text-blue-700">{formatVnd(invoice.totalVnd)}</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
