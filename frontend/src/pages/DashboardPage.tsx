import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Package, AlertTriangle, XCircle, Plus } from 'lucide-react';
import { fetchDashboard, type DashboardItem } from '@/lib/dashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// ── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon: Icon,
  variant = 'default',
}: {
  label: string;
  value: number;
  icon: React.FC<{ className?: string }>;
  variant?: 'default' | 'warning' | 'danger';
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Icon
            className={cn('h-4 w-4', {
              'text-muted-foreground': variant === 'default',
              'text-amber-500': variant === 'warning',
              'text-red-500': variant === 'danger',
            })}
          />
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p
          className={cn('text-2xl font-bold', {
            'text-foreground': variant === 'default',
            'text-amber-600': variant === 'warning',
            'text-red-600': variant === 'danger',
          })}
        >
          {value}
        </p>
      </CardContent>
    </Card>
  );
}

// ── Stock list ────────────────────────────────────────────────────────────────

function StockList({
  items,
  emptyText,
  variant,
}: {
  items: DashboardItem[];
  emptyText: string;
  variant: 'warning' | 'danger';
}) {
  if (items.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-4 text-center">{emptyText}</p>
    );
  }

  return (
    <ul className="divide-y text-sm">
      {items.map((item) => (
        <li key={item.id} className="flex items-center justify-between py-2">
          <div>
            <Link
              to={`/products/${item.id}/edit`}
              className="font-medium hover:underline"
            >
              {item.name}
            </Link>
            {item.sku && (
              <span className="ml-2 text-xs text-muted-foreground font-mono">{item.sku}</span>
            )}
          </div>
          <span
            className={cn('text-xs font-semibold px-2 py-0.5 rounded-full', {
              'bg-amber-100 text-amber-700': variant === 'warning',
              'bg-red-100 text-red-700': variant === 'danger',
            })}
          >
            {variant === 'danger' ? 'Hết hàng' : `Còn ${item.quantity} / ngưỡng ${item.threshold}`}
          </span>
        </li>
      ))}
    </ul>
  );
}

// ── DashboardPage ─────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['dashboard'],
    queryFn: fetchDashboard,
    staleTime: 30_000,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-sm text-muted-foreground">
        Đang tải tổng quan…
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex items-center justify-center h-64 text-sm text-muted-foreground">
        Không thể tải dữ liệu. Vui lòng thử lại.
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Tổng quan kho hàng</h1>
        <Button asChild size="sm">
          <Link to="/products/new">
            <Plus className="h-4 w-4 mr-1" />
            Thêm sản phẩm
          </Link>
        </Button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Tổng sản phẩm"
          value={data.totalProducts}
          icon={Package}
        />
        <StatCard
          label="Sắp hết hàng"
          value={data.lowStock.length}
          icon={AlertTriangle}
          variant="warning"
        />
        <StatCard
          label="Hết hàng"
          value={data.outOfStock.length}
          icon={XCircle}
          variant="danger"
        />
      </div>

      {/* Stock lists */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              Sắp hết hàng ({data.lowStock.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <StockList
              items={data.lowStock}
              emptyText="Không có sản phẩm sắp hết hàng."
              variant="warning"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-500" />
              Hết hàng ({data.outOfStock.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <StockList
              items={data.outOfStock}
              emptyText="Không có sản phẩm hết hàng."
              variant="danger"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
