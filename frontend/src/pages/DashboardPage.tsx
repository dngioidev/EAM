import { useQuery } from '@tanstack/react-query';
import { LayoutDashboard } from 'lucide-react';
import { fetchWeeklyRevenue, type WeeklyDay } from '@/lib/reports';
import { useAuthStore } from '@/stores/auth.store';
import { Navigate } from 'react-router-dom';

const ALLOWED_ROLES = ['admin', 'accountant', 'store-manager'];

// ── Mini SVG bar chart ────────────────────────────────────────────────────────

function RevenueBarChart({ days }: { days: WeeklyDay[] }) {
  if (days.length === 0) {
    return (
      <p className="text-sm text-gray-400 text-center py-8">
        Chưa có dữ liệu doanh thu tuần này.
      </p>
    );
  }

  const W = 520;
  const H = 160;
  const PAD_L = 60;
  const PAD_B = 32;
  const PAD_T = 16;
  const chartW = W - PAD_L - 16;
  const chartH = H - PAD_B - PAD_T;

  const maxRevenue = Math.max(...days.map((d) => d.revenueVnd), 1);
  const barW = Math.floor(chartW / days.length) - 8;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      aria-label="Biểu đồ doanh thu 7 ngày"
      role="img"
      className="w-full"
    >
      {/* Y-axis grid lines */}
      {[0, 0.5, 1].map((frac) => {
        const y = PAD_T + chartH - chartH * frac;
        return (
          <g key={frac}>
            <line
              x1={PAD_L}
              y1={y}
              x2={W - 16}
              y2={y}
              stroke="#e5e7eb"
              strokeWidth={1}
            />
            <text
              x={PAD_L - 6}
              y={y + 4}
              fontSize={10}
              fill="#9ca3af"
              textAnchor="end"
            >
              {((maxRevenue * frac) / 1_000_000).toFixed(1)}M
            </text>
          </g>
        );
      })}

      {/* Bars */}
      {days.map((d, i) => {
        const barH = Math.max(2, (d.revenueVnd / maxRevenue) * chartH);
        const x = PAD_L + i * (chartW / days.length) + 4;
        const y = PAD_T + chartH - barH;
        const label = d.date.slice(5); // MM-DD

        return (
          <g key={d.date}>
            <rect
              x={x}
              y={y}
              width={barW}
              height={barH}
              rx={3}
              fill="#3b82f6"
              opacity={0.85}
            />
            <text
              x={x + barW / 2}
              y={H - 8}
              fontSize={10}
              fill="#6b7280"
              textAnchor="middle"
            >
              {label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ── DashboardPage ─────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const role = useAuthStore((s) => s.user?.role ?? '');
  const user = useAuthStore((s) => s.user);

  if (!ALLOWED_ROLES.includes(role)) {
    return <Navigate to="/" replace />;
  }

  const { data: weeklyDays = [], isLoading } = useQuery<WeeklyDay[]>({
    queryKey: ['reports', 'dashboard', 'weekly'],
    queryFn: fetchWeeklyRevenue,
    // Admin has no storeId — skip query
    enabled: !!user?.storeId,
  });

  const totalWeekRevenue = weeklyDays.reduce((s, d) => s + d.revenueVnd, 0);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <LayoutDashboard className="h-6 w-6 text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-900">Tổng quan</h1>
      </div>

      <div className="bg-white rounded-xl border p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-800">
            Doanh thu 7 ngày qua
          </h2>
          <span className="text-sm text-gray-500">
            Tổng:{' '}
            <span className="font-medium text-blue-600">
              {totalWeekRevenue.toLocaleString('vi-VN')} ₫
            </span>
          </span>
        </div>

        {!user?.storeId ? (
          <p className="text-sm text-gray-400">
            Tài khoản admin không thuộc cửa hàng. Chọn cửa hàng để xem dữ liệu.
          </p>
        ) : isLoading ? (
          <p className="text-sm text-gray-400">Đang tải...</p>
        ) : (
          <RevenueBarChart days={weeklyDays} />
        )}
      </div>
    </div>
  );
}
