import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ArrowLeft,
  ArrowDownToLine,
  ArrowUpFromLine,
  Pencil,
  X,
  Check,
  PackageSearch,
} from 'lucide-react';
import { fetchProduct, updateProduct } from '@/lib/products';
import { importStock, exportStock, fetchTransactions } from '@/lib/inventory';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

// ── Types ──────────────────────────────────────────────────────────────────────

type StockStatus = 'OUT_OF_STOCK' | 'LOW_STOCK' | 'IN_STOCK';

function getStatus(quantity: number, threshold: number): StockStatus {
  if (quantity === 0) return 'OUT_OF_STOCK';
  if (threshold > 0 && quantity <= threshold) return 'LOW_STOCK';
  return 'IN_STOCK';
}

const STATUS_LABELS: Record<StockStatus, string> = {
  OUT_OF_STOCK: 'Hết hàng',
  LOW_STOCK: 'Sắp hết',
  IN_STOCK: 'Còn hàng',
};

const STATUS_CLASSES: Record<StockStatus, string> = {
  OUT_OF_STOCK: 'bg-red-100 text-red-700',
  LOW_STOCK: 'bg-amber-100 text-amber-700',
  IN_STOCK: 'bg-green-100 text-green-700',
};

// ── Edit form ──────────────────────────────────────────────────────────────────

const editSchema = z.object({
  name: z.string().min(1, 'Tên không được trống').max(255),
  threshold: z.coerce.number().int().min(0, 'Ngưỡng không được âm'),
});
type EditFormData = z.infer<typeof editSchema>;

// ── Stock modal ────────────────────────────────────────────────────────────────

const stockSchema = z.object({
  quantity: z.coerce.number().int().min(1, 'Số lượng phải > 0'),
  note: z.string().max(500).optional(),
});
type StockFormData = z.infer<typeof stockSchema>;

type ModalMode = 'import' | 'export' | null;

// ── Main component ─────────────────────────────────────────────────────────────

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [isEditing, setIsEditing] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [stockError, setStockError] = useState<string | null>(null);

  const { data: product, isLoading, isError } = useQuery({
    queryKey: ['product', id],
    queryFn: () => fetchProduct(id!),
    enabled: !!id,
  });

  const { data: txData } = useQuery({
    queryKey: ['transactions', id],
    queryFn: () => fetchTransactions(id!, 1, 50),
    enabled: !!id,
  });

  const editForm = useForm<EditFormData>({
    resolver: zodResolver(editSchema),
    values: product
      ? { name: product.name, threshold: (product as { threshold?: number }).threshold ?? 0 }
      : undefined,
  });

  const stockForm = useForm<StockFormData>({
    resolver: zodResolver(stockSchema),
    defaultValues: { quantity: 1, note: '' },
  });

  const updateMutation = useMutation({
    mutationFn: (data: EditFormData) => updateProduct(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product', id] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setIsEditing(false);
    },
  });

  const stockMutation = useMutation({
    mutationFn: (data: StockFormData) => {
      if (modalMode === 'import') {
        return importStock({ productId: id!, ...data });
      }
      return exportStock({ productId: id!, ...data });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product', id] });
      queryClient.invalidateQueries({ queryKey: ['transactions', id] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setModalMode(null);
      stockForm.reset({ quantity: 1, note: '' });
      setStockError(null);
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      const msg = err?.response?.data?.message ?? 'Có lỗi xảy ra. Vui lòng thử lại.';
      setStockError(msg);
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <p className="text-muted-foreground">Đang tải...</p>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] gap-4">
        <PackageSearch className="h-12 w-12 text-muted-foreground" />
        <p className="text-muted-foreground">Không tìm thấy sản phẩm.</p>
        <Button variant="outline" onClick={() => navigate('/products')}>
          Quay lại danh sách
        </Button>
      </div>
    );
  }

  const threshold = (product as { threshold?: number }).threshold ?? 0;
  const quantity = (product as { quantity?: number }).quantity ?? 0;
  const status: StockStatus = getStatus(quantity, threshold);

  const handleStockSubmit = (data: StockFormData) => {
    setStockError(null);
    stockMutation.mutate(data);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      {/* Back link */}
      <Link
        to="/products"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Danh sách sản phẩm
      </Link>

      {/* Product info card */}
      <Card>
        <CardHeader className="flex flex-row items-start justify-between pb-2">
          <div className="space-y-1">
            {isEditing ? null : (
              <>
                <CardTitle className="text-xl">{product.name}</CardTitle>
                {(product as { sku?: string }).sku && (
                  <p className="text-sm text-muted-foreground">
                    SKU: {(product as { sku?: string }).sku}
                  </p>
                )}
              </>
            )}
          </div>
          {!isEditing && (
            <Button
              variant="ghost"
              size="sm"
              className="min-h-[44px] min-w-[44px]"
              onClick={() => setIsEditing(true)}
            >
              <Pencil className="h-4 w-4" />
              <span className="ml-1">Sửa</span>
            </Button>
          )}
        </CardHeader>

        <CardContent className="space-y-4">
          {isEditing ? (
            <form
              onSubmit={editForm.handleSubmit((data) => updateMutation.mutate(data))}
              className="space-y-4"
            >
              <div className="space-y-1">
                <Label htmlFor="edit-name">Tên sản phẩm</Label>
                <Input id="edit-name" {...editForm.register('name')} />
                {editForm.formState.errors.name && (
                  <p className="text-xs text-destructive">
                    {editForm.formState.errors.name.message}
                  </p>
                )}
              </div>
              <div className="space-y-1">
                <Label htmlFor="edit-threshold">Ngưỡng cảnh báo sắp hết hàng</Label>
                <Input
                  id="edit-threshold"
                  type="number"
                  min={0}
                  {...editForm.register('threshold')}
                />
                <p className="text-xs text-muted-foreground">
                  Để 0 nếu không cần cảnh báo sắp hết hàng.
                </p>
                {editForm.formState.errors.threshold && (
                  <p className="text-xs text-destructive">
                    {editForm.formState.errors.threshold.message}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  type="submit"
                  size="sm"
                  className="min-h-[44px]"
                  disabled={updateMutation.isPending}
                >
                  <Check className="h-4 w-4 mr-1" />
                  Lưu
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="min-h-[44px]"
                  onClick={() => {
                    setIsEditing(false);
                    editForm.reset();
                  }}
                >
                  <X className="h-4 w-4 mr-1" />
                  Huỷ
                </Button>
              </div>
            </form>
          ) : (
            <div className="flex flex-wrap gap-6">
              <div>
                <p className="text-sm text-muted-foreground">Số lượng hiện tại</p>
                <p className="text-3xl font-bold">{quantity}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ngưỡng cảnh báo</p>
                <p className="text-3xl font-bold">{threshold}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Trạng thái</p>
                <span
                  className={cn(
                    'mt-1 inline-block rounded-full px-3 py-1 text-sm font-medium',
                    STATUS_CLASSES[status],
                  )}
                >
                  {STATUS_LABELS[status]}
                </span>
              </div>
            </div>
          )}

          {/* Import / Export buttons */}
          {!isEditing && (
            <div className="flex gap-3 pt-2">
              <Button
                className="min-h-[44px] flex-1"
                onClick={() => {
                  setModalMode('import');
                  stockForm.reset({ quantity: 1, note: '' });
                  setStockError(null);
                }}
              >
                <ArrowDownToLine className="h-4 w-4 mr-2" />
                Nhập hàng
              </Button>
              <Button
                variant="outline"
                className="min-h-[44px] flex-1"
                onClick={() => {
                  setModalMode('export');
                  stockForm.reset({ quantity: 1, note: '' });
                  setStockError(null);
                }}
              >
                <ArrowUpFromLine className="h-4 w-4 mr-2" />
                Xuất hàng
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transaction history */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Lịch sử giao dịch</CardTitle>
        </CardHeader>
        <CardContent>
          {!txData || txData.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 gap-2">
              <PackageSearch className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Chưa có giao dịch nào.</p>
              <Button
                size="sm"
                className="mt-2 min-h-[44px]"
                onClick={() => {
                  setModalMode('import');
                  stockForm.reset({ quantity: 1, note: '' });
                  setStockError(null);
                }}
              >
                Nhập hàng đầu tiên
              </Button>
            </div>
          ) : (
            <div className="divide-y">
              {txData.items.map((tx) => (
                <div key={tx.id} className="py-3 flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        'rounded-full px-2.5 py-0.5 text-xs font-semibold',
                        tx.type === 'IMPORT'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-orange-100 text-orange-700',
                      )}
                    >
                      {tx.type === 'IMPORT' ? 'Nhập' : 'Xuất'}
                    </span>
                    <div>
                      <p className="text-sm font-medium">
                        {tx.type === 'IMPORT' ? '+' : '−'}
                        {tx.quantity} đơn vị
                      </p>
                      {tx.note && (
                        <p className="text-xs text-muted-foreground">{tx.note}</p>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(tx.createdAt).toLocaleDateString('vi-VN', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Import / Export modal */}
      <Dialog open={modalMode !== null} onOpenChange={(open) => !open && setModalMode(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {modalMode === 'import' ? 'Nhập hàng' : 'Xuất hàng'}
            </DialogTitle>
          </DialogHeader>

          <div className="text-sm text-muted-foreground mb-2">
            Tồn kho hiện tại:{' '}
            <span className="font-semibold text-foreground">{quantity}</span>
          </div>

          <form onSubmit={stockForm.handleSubmit(handleStockSubmit)} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="stock-quantity">Số lượng</Label>
              <Input
                id="stock-quantity"
                type="number"
                min={1}
                className="min-h-[44px]"
                {...stockForm.register('quantity')}
              />
              {stockForm.formState.errors.quantity && (
                <p className="text-xs text-destructive">
                  {stockForm.formState.errors.quantity.message}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="stock-note">Ghi chú (tuỳ chọn)</Label>
              <Input
                id="stock-note"
                className="min-h-[44px]"
                placeholder="VD: Nhập từ nhà cung cấp A"
                {...stockForm.register('note')}
              />
            </div>

            {stockError && (
              <p className="text-sm text-destructive">{stockError}</p>
            )}

            <DialogFooter className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1 min-h-[44px]"
                onClick={() => setModalMode(null)}
              >
                Huỷ
              </Button>
              <Button
                type="submit"
                className="flex-1 min-h-[44px]"
                disabled={stockMutation.isPending}
              >
                {stockMutation.isPending ? 'Đang xử lý...' : 'Xác nhận'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
