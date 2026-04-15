import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, UserX, Users } from 'lucide-react';
import {
  fetchUsers,
  fetchAdminStats,
  createUser,
  setUserStatus,
  type AdminUser,
  type UserRole,
} from '@/lib/users';
import { fetchStores } from '@/lib/stores';
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
import { Select } from '@/components/ui/select';
import { cn } from '@/lib/utils';

// ─── Form schema ──────────────────────────────────────────────────────────────

const ROLES: { value: UserRole; label: string }[] = [
  { value: 'cashier', label: 'Thu ngân' },
  { value: 'accountant', label: 'Kế toán' },
  { value: 'store-manager', label: 'Quản lý cửa hàng' },
  { value: 'admin', label: 'Quản trị viên' },
  { value: 'viewer', label: 'Xem' },
];

const ROLE_LABELS: Record<string, string> = Object.fromEntries(
  ROLES.map((r) => [r.value, r.label]),
);

const PAGE_LIMIT = 50;

const createUserSchema = z
  .object({
    email: z.string().email('Email không hợp lệ'),
    password: z.string().min(8, 'Mật khẩu tối thiểu 8 ký tự'),
    name: z.string().min(1, 'Tên không được để trống'),
    role: z.enum(['admin', 'store-manager', 'cashier', 'accountant', 'viewer'] as const),
    storeId: z.string(),
  })
  .refine(
    (data) => data.role === 'admin' || data.storeId.length > 0,
    { message: 'Vui lòng chọn cửa hàng cho vai trò này', path: ['storeId'] },
  );

type CreateUserFormData = z.infer<typeof createUserSchema>;

// ─── AdminUsersPage ───────────────────────────────────────────────────────────

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [deactivateTarget, setDeactivateTarget] = useState<AdminUser | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  // ── Queries ──────────────────────────────────────────────────────────────
  const { data: usersPage, isLoading: usersLoading } = useQuery({
    queryKey: ['admin', 'users', page],
    queryFn: () => fetchUsers(page, PAGE_LIMIT),
  });

  const users = usersPage?.items ?? [];
  const total = usersPage?.total ?? 0;
  const totalPages = usersPage?.totalPages ?? 1;

  const { data: stats } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: fetchAdminStats,
  });

  const { data: stores = [] } = useQuery({
    queryKey: ['admin', 'stores'],
    queryFn: fetchStores,
  });

  const storeMap = Object.fromEntries(stores.map((s) => [s.id, s.name]));

  // ── Create mutation ───────────────────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
      setCreateOpen(false);
      resetCreate();
    },
    onError: (err: unknown) => {
      const msg =
        err instanceof Error ? err.message : 'Tạo người dùng thất bại. Vui lòng thử lại.';
      setApiError(msg);
    },
  });

  // ── Deactivate mutation ───────────────────────────────────────────────────
  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'ACTIVE' | 'DISABLED' }) =>
      setUserStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
      setDeactivateTarget(null);
    },
  });

  // ── Form ──────────────────────────────────────────────────────────────────
  const {
    register: registerCreate,
    handleSubmit: handleCreateSubmit,
    watch,
    formState: { errors: createErrors, isSubmitting: isCreating },
    reset: resetCreate,
  } = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: { storeId: '', role: 'cashier' },
  });

  const selectedRole = watch('role');
  const storeRequired = selectedRole !== 'admin';

  const onCreateSubmit = (data: CreateUserFormData) => {
    setApiError(null);
    createMutation.mutate({ ...data, storeId: data.storeId || null });
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Quản lý người dùng</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Tạo tài khoản nhân viên và phân công vai trò
          </p>
        </div>
        <Button onClick={() => { setApiError(null); setCreateOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Tạo người dùng
        </Button>
      </div>

      {/* Users table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Danh sách người dùng ({total})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {usersLoading ? (
            <div className="p-6 text-center text-sm text-muted-foreground">Đang tải…</div>
          ) : users.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">
              <Users className="h-8 w-8 mx-auto mb-2 opacity-30" />
              Chưa có người dùng nào.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Email</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Tên</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Vai trò</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Ngày đăng ký</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Cửa hàng</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Trạng thái</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="px-4 py-3">{user.email}</td>
                      <td className="px-4 py-3 font-medium">{user.name}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                          {ROLE_LABELS[user.role] ?? user.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {user.storeId ? (storeMap[user.storeId] ?? user.storeId) : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                            user.isActive
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-600',
                          )}
                        >
                          {user.isActive ? 'Hoạt động' : 'Đã vô hiệu'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {user.isActive ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => setDeactivateTarget(user)}
                            aria-label={`Vô hiệu tài khoản ${user.email}`}
                          >
                            <UserX className="h-4 w-4 mr-1" />
                            Vô hiệu
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={statusMutation.isPending}
                            onClick={() => statusMutation.mutate({ id: user.id, status: 'ACTIVE' })}
                            aria-label={`Kích hoạt tài khoản ${user.email}`}
                          >
                            Kích hoạt
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex items-center justify-between border-t px-4 py-3">
            <p className="text-xs text-muted-foreground">
              Trang {page}/{totalPages}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              >
                Trước
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              >
                Sau
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Platform stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Tổng người dùng</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats?.totalUsers ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Người dùng bị khóa</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">{stats?.disabledUsers ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Tổng sản phẩm</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats?.totalProducts ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Tổng giao dịch</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats?.totalTransactions ?? 0}</p>
          </CardContent>
        </Card>
      </div>

      {/* Create user dialog */}
      <Dialog
        open={createOpen}
        onOpenChange={(open) => { setCreateOpen(open); if (!open) resetCreate(); }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Tạo người dùng mới</DialogTitle>
            <DialogDescription>
              Tạo tài khoản nhân viên và phân công vai trò cho cửa hàng.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateSubmit(onCreateSubmit)} noValidate className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="user-name">Họ và tên *</Label>
              <Input
                id="user-name"
                placeholder="Nguyễn Văn A"
                {...registerCreate('name')}
                aria-invalid={!!createErrors.name}
              />
              {createErrors.name && (
                <p className="text-sm text-red-600" role="alert">{createErrors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="user-email">Email *</Label>
              <Input
                id="user-email"
                type="email"
                placeholder="nhanvien@store.vn"
                {...registerCreate('email')}
                aria-invalid={!!createErrors.email}
              />
              {createErrors.email && (
                <p className="text-sm text-red-600" role="alert">{createErrors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="user-password">Mật khẩu *</Label>
              <Input
                id="user-password"
                type="password"
                placeholder="Tối thiểu 8 ký tự"
                {...registerCreate('password')}
                aria-invalid={!!createErrors.password}
              />
              {createErrors.password && (
                <p className="text-sm text-red-600" role="alert">{createErrors.password.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="user-role">Vai trò *</Label>
              <Select
                id="user-role"
                aria-invalid={!!createErrors.role}
                {...registerCreate('role')}
              >
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </Select>
              {createErrors.role && (
                <p className="text-sm text-red-600" role="alert">{createErrors.role.message}</p>
              )}
            </div>

            {storeRequired && (
              <div className="space-y-2">
                <Label htmlFor="user-store">Cửa hàng *</Label>
                <Select
                  id="user-store"
                  aria-invalid={!!createErrors.storeId}
                  {...registerCreate('storeId')}
                >
                  <option value="">— Chọn cửa hàng —</option>
                  {stores.filter((s) => s.isActive).map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </Select>
                {createErrors.storeId && (
                  <p className="text-sm text-red-600" role="alert">
                    {createErrors.storeId.message}
                  </p>
                )}
              </div>
            )}

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
                {isCreating ? 'Đang tạo…' : 'Tạo người dùng'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Deactivate confirm dialog */}
      <Dialog
        open={!!deactivateTarget}
        onOpenChange={(open) => { if (!open) setDeactivateTarget(null); }}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Vô hiệu tài khoản?</DialogTitle>
            <DialogDescription>
              Tài khoản <strong>{deactivateTarget?.email}</strong> sẽ bị vô hiệu và phiên đăng nhập hiện tại sẽ bị thu hồi. Hành động này có thể hoàn tác bởi quản trị viên.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-2">
            <Button variant="outline" onClick={() => setDeactivateTarget(null)}>
              Hủy
            </Button>
            <Button
              variant="destructive"
              disabled={statusMutation.isPending}
              onClick={() =>
                deactivateTarget &&
                statusMutation.mutate({ id: deactivateTarget.id, status: 'DISABLED' })
              }
            >
              {statusMutation.isPending ? 'Đang xử lý…' : 'Xác nhận vô hiệu'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
