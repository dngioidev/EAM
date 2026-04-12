import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, PowerOff, Store } from 'lucide-react';
import { fetchStores, createStore, deactivateStore, type Store as StoreType } from '@/lib/stores';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

// ─── Form schema ──────────────────────────────────────────────────────────────

const createStoreSchema = z.object({
  name: z.string().min(1, 'Tên cửa hàng không được để trống'),
  taxCode: z
    .string()
    .regex(/^\d{10}(-\d{3})?$/, 'Mã số thuế phải gồm 10 chữ số (hoặc 10-3 chữ số)'),
  address: z.string().optional(),
});

type CreateStoreFormData = z.infer<typeof createStoreSchema>;

// ─── AdminStoresPage ──────────────────────────────────────────────────────────

export default function AdminStoresPage() {
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [deactivateTarget, setDeactivateTarget] = useState<StoreType | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  // ── Queries ──────────────────────────────────────────────────────────────
  const { data: stores = [], isLoading } = useQuery({
    queryKey: ['admin', 'stores'],
    queryFn: fetchStores,
  });

  // ── Create mutation ───────────────────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: createStore,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'stores'] });
      setCreateOpen(false);
      resetCreate();
    },
    onError: (err: unknown) => {
      const msg =
        err instanceof Error ? err.message : 'Tạo cửa hàng thất bại. Vui lòng thử lại.';
      setApiError(msg);
    },
  });

  // ── Deactivate mutation ───────────────────────────────────────────────────
  const deactivateMutation = useMutation({
    mutationFn: (id: string) => deactivateStore(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'stores'] });
      setDeactivateTarget(null);
    },
  });

  // ── Form ──────────────────────────────────────────────────────────────────
  const {
    register: registerCreate,
    handleSubmit: handleCreateSubmit,
    formState: { errors: createErrors, isSubmitting: isCreating },
    reset: resetCreate,
  } = useForm<CreateStoreFormData>({ resolver: zodResolver(createStoreSchema) });

  const onCreateSubmit = (data: CreateStoreFormData) => {
    setApiError(null);
    createMutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Quản lý cửa hàng</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Tạo và quản lý các cửa hàng trong hệ thống
          </p>
        </div>
        <Button onClick={() => { setApiError(null); setCreateOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Tạo cửa hàng
        </Button>
      </div>

      {/* Stores table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Danh sách cửa hàng ({stores.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 text-center text-sm text-muted-foreground">Đang tải…</div>
          ) : stores.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">
              <Store className="h-8 w-8 mx-auto mb-2 opacity-30" />
              Chưa có cửa hàng nào. Hãy tạo cửa hàng đầu tiên.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Tên</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">MST</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Địa chỉ</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Trạng thái</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Ngày tạo</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {stores.map((store) => (
                    <tr key={store.id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">{store.name}</td>
                      <td className="px-4 py-3 font-mono text-xs">{store.taxCode}</td>
                      <td className="px-4 py-3 text-muted-foreground">{store.address ?? '—'}</td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                            store.isActive
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-600',
                          )}
                        >
                          {store.isActive ? 'Hoạt động' : 'Đã vô hiệu'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {new Date(store.createdAt).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {store.isActive && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => setDeactivateTarget(store)}
                            aria-label={`Vô hiệu cửa hàng ${store.name}`}
                          >
                            <PowerOff className="h-4 w-4 mr-1" />
                            Vô hiệu
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create store dialog */}
      <Dialog open={createOpen} onOpenChange={(open) => { setCreateOpen(open); if (!open) resetCreate(); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Tạo cửa hàng mới</DialogTitle>
            <DialogDescription>Điền thông tin cửa hàng. Mã số thuế không thể thay đổi sau khi tạo.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateSubmit(onCreateSubmit)} noValidate className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="store-name">Tên cửa hàng *</Label>
              <Input
                id="store-name"
                placeholder="Ví dụ: Cửa hàng A"
                {...registerCreate('name')}
                aria-invalid={!!createErrors.name}
              />
              {createErrors.name && (
                <p className="text-sm text-red-600" role="alert">{createErrors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="store-taxcode">Mã số thuế *</Label>
              <Input
                id="store-taxcode"
                placeholder="0123456789"
                {...registerCreate('taxCode')}
                aria-invalid={!!createErrors.taxCode}
              />
              {createErrors.taxCode && (
                <p className="text-sm text-red-600" role="alert">{createErrors.taxCode.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="store-address">Địa chỉ</Label>
              <Input
                id="store-address"
                placeholder="Số 1 Nguyễn Huệ, Quận 1, TP.HCM"
                {...registerCreate('address')}
              />
            </div>

            {apiError && (
              <p className="text-sm text-red-600 bg-red-50 rounded-md px-3 py-2" role="alert">
                {apiError}
              </p>
            )}

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                Hủy
              </Button>
              <Button type="submit" disabled={isCreating}>
                {isCreating ? 'Đang tạo…' : 'Tạo cửa hàng'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Deactivate confirm dialog */}
      <Dialog open={!!deactivateTarget} onOpenChange={(open) => { if (!open) setDeactivateTarget(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Vô hiệu cửa hàng?</DialogTitle>
            <DialogDescription>
              Cửa hàng <strong>{deactivateTarget?.name}</strong> sẽ bị vô hiệu và tất cả phiên đăng nhập của nhân viên sẽ bị thu hồi ngay lập tức.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-2">
            <Button variant="outline" onClick={() => setDeactivateTarget(null)}>
              Hủy
            </Button>
            <Button
              variant="destructive"
              disabled={deactivateMutation.isPending}
              onClick={() => deactivateTarget && deactivateMutation.mutate(deactivateTarget.id)}
            >
              {deactivateMutation.isPending ? 'Đang xử lý…' : 'Xác nhận vô hiệu'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
