import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart2, FileDown, RefreshCw } from 'lucide-react';
import {
  fetchDailyReport,
  fetchMonthlyReport,
  buildCsvExportUrl,
  type DailyReport,
  type MonthlyReport,
} from '@/lib/reports';
import { useAuthStore } from '@/stores/auth.store';
import { Navigate } from 'react-router-dom';

// ── Utils ─────────────────────────────────────────────────────────────────────

const ALLOWED_ROLES = ['admin', 'accountant', 'store-manager'];

function formatVnd(amount: number) {
  return amount.toLocaleString('vi-VN') + ' ₫';
}

function todayDate() {
  return new Date().toISOString().split('T')[0];
}

function currentYearMonth() {
  const d = new Date();
  return { year: d.getFullYear(), month: d.getMonth() + 1 };
}

// ── DailyPanel ────────────────────────────────────────────────────────────────

function DailyPanel() {
  const [date, setDate] = useState(todayDate());

  const { data, isLoading, isError, refetch } = useQuery<DailyReport>({
    queryKey: ['reports', 'daily', date],
    queryFn: () => fetchDailyReport(date),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-gray-700" htmlFor="daily-date">
          Ngày
        </label>
        <input
          id="daily-date"
          type="date"
          className="border rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={date}
          max={todayDate()}
          onChange={(e) => setDate(e.target.value)}
        />
        <button
          onClick={() => refetch()}
          className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Làm mới
        </button>
      </div>

      {isLoading && <p className="text-sm text-gray-500">Đang tải...</p>}
      {isError && <p className="text-sm text-red-500">Không thể tải báo cáo.</p>}

      {data && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <StatCard label="Số hóa đơn" value={String(data.invoiceCount)} />
          <StatCard label="Doanh thu gộp" value={formatVnd(data.grossRevenueVnd)} />
          <StatCard label="Thuế VAT" value={formatVnd(data.totalTaxVnd)} />
          <StatCard label="Doanh thu thuần" value={formatVnd(data.netRevenueVnd)} highlight />
          {data.byTaxRate.map((r) => (
            <StatCard
              key={r.rate}
              label={`Thuế ${r.rate}%`}
              value={formatVnd(r.taxVnd)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── MonthlyPanel ──────────────────────────────────────────────────────────────

function MonthlyPanel() {
  const { year: initYear, month: initMonth } = currentYearMonth();
  const [year, setYear] = useState(initYear);
  const [month, setMonth] = useState(initMonth);
  const [fromDate, setFromDate] = useState(`${initYear}-${String(initMonth).padStart(2, '0')}-01`);
  const [toDate, setToDate] = useState(todayDate());

  const { data, isLoading, isError } = useQuery<MonthlyReport>({
    queryKey: ['reports', 'monthly', year, month],
    queryFn: () => fetchMonthlyReport(year, month),
  });

  const csvUrl = buildCsvExportUrl(fromDate, toDate);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <label className="text-sm font-medium text-gray-700">Tháng</label>
        <input
          type="number"
          min={1}
          max={12}
          className="w-20 border rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={month}
          onChange={(e) => setMonth(Number(e.target.value))}
        />
        <label className="text-sm font-medium text-gray-700">Năm</label>
        <input
          type="number"
          min={2020}
          max={new Date().getFullYear()}
          className="w-24 border rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
        />
      </div>

      {isLoading && <p className="text-sm text-gray-500">Đang tải...</p>}
      {isError && <p className="text-sm text-red-500">Không thể tải báo cáo.</p>}

      {data && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <StatCard label="Số hóa đơn" value={String(data.invoiceCount)} />
          <StatCard label="Doanh thu gộp" value={formatVnd(data.grossRevenueVnd)} />
          <StatCard label="Thuế VAT" value={formatVnd(data.totalTaxVnd)} />
          <StatCard label="Doanh thu thuần" value={formatVnd(data.netRevenueVnd)} highlight />
        </div>
      )}

      {/* CSV Export — BR-RPT-04 */}
      <div className="pt-4 border-t">
        <p className="text-sm font-medium text-gray-700 mb-2">Xuất hóa đơn (CSV)</p>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Từ</label>
            <input
              type="date"
              className="border rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Đến</label>
            <input
              type="date"
              className="border rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={toDate}
              max={todayDate()}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>
          <a
            href={csvUrl}
            download
            className="inline-flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
          >
            <FileDown className="h-4 w-4" /> Tải CSV
          </a>
        </div>
      </div>
    </div>
  );
}

// ── StatCard ──────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-lg border p-4 ${
        highlight ? 'bg-blue-50 border-blue-200' : 'bg-white'
      }`}
    >
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p
        className={`text-lg font-semibold ${
          highlight ? 'text-blue-700' : 'text-gray-900'
        }`}
      >
        {value}
      </p>
    </div>
  );
}

// ── ReportsPage ───────────────────────────────────────────────────────────────

type TabId = 'daily' | 'monthly';

export default function ReportsPage() {
  const role = useAuthStore((s) => s.user?.role ?? '');
  const [tab, setTab] = useState<TabId>('daily');

  // T037: Route guard — only accountant, store-manager, admin
  if (!ALLOWED_ROLES.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <BarChart2 className="h-6 w-6 text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-900">Báo cáo doanh thu</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b">
        {(['daily', 'monthly'] as TabId[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              tab === t
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            {t === 'daily' ? 'Theo ngày' : 'Theo tháng'}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border p-6 shadow-sm">
        {tab === 'daily' ? <DailyPanel /> : <MonthlyPanel />}
      </div>
    </div>
  );
}
