import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, UserX } from 'lucide-react';
import {
  fetchUsers,
  fetchAdminStats,
  disableUser,
  enableUser,
  type AdminUser,
} from '@/lib/users';
import { Button } from '@/components/ui/button';
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

const ROLE_LABELS: Record<string, string> = {
  OWNER: 'Chủ cửa hàng',
  ADMIN: 'Quản trị viên',
};

const PAGE_LIMIT = 50;

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [disableTarget, setDisableTarget] = useState<AdminUser | null>(null);

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

  const disableMutation = useMutation({
    mutationFn: (id: string) => disableUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
      setDisableTarget(null);
    },
  });

  const enableMutation = useMutation({
    mutationFn: (id: string) => enableUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
    },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Quản lý người dùng</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Xem danh sách tài khoản và quản lý quyền truy cập
        </p>
      </div>

      {/* Platform stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Tổng người dùng</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats?.total_users ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Bị khóa</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">{stats?.disabled_users ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Tổng sản phẩm</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats?.total_products ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Tổng giao dịch</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats?.total_transactions ?? 0}</p>
          </CardContent>
        </Card>
      </div>

      {/* Users table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Danh sách tài khoản ({total})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {usersLoading ? (
            <div className="p-6 text-center text-sm text-muted-foreground">Đang tải…</div>
          ) : users.length === 0 ? (
            <div className="p-10 flex flex-col items-center gap-3 text-center">
              <Users className="h-10 w-10 text-muted-foreground opacity-30" />
              <p className="text-sm text-muted-foreground">Chưa có tài khoản nào.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Email</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Vai trò</th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">Sản phẩm</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Ngày đăng ký</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Trạng thái</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">{user.email}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                          {ROLE_LABELS[user.role] ?? user.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                        {user.product_count}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {new Date(user.created_at).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                            user.status === 'ACTIVE'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-600',
                          )}
                        >
                          {user.status === 'ACTIVE' ? 'Hoạt động' : 'Đã khóa'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {user.status === 'ACTIVE' ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 min-h-[44px]"
                            onClick={() => setDisableTarget(user)}
                            aria-label={`Khóa tài khoản ${user.email}`}
                          >
                            <UserX className="h-4 w-4 mr-1" />
                            Khóa
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            className="min-h-[44px]"
                            disabled={enableMutation.isPending}
                            onClick={() => enableMutation.mutate(user.id)}
                            aria-label={`Mở khóa tài khoản ${user.email}`}
                          >
                            Mở khóa
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t px-4 py-3">
              <p className="text-xs text-muted-foreground">
                Trang {page}/{totalPages}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="min-h-[44px]"
                  disabled={page <= 1}
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                >
                  Trước
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="min-h-[44px]"
                  disabled={page >= totalPages}
                  onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                >
                  Sau
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Disable confirm dialog */}
      <Dialog
        open={!!disableTarget}
        onOpenChange={(open) => { if (!open) setDisableTarget(null); }}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Khóa tài khoản?</DialogTitle>
            <DialogDescription>
              Tài khoản <strong>{disableTarget?.email}</strong> sẽ bị khóa và phiên đăng nhập hiện tại sẽ bị thu hồi ngay lập tức. Quản trị viên có thể mở khóa sau.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-2">
            <Button
              variant="outline"
              className="min-h-[44px]"
              onClick={() => setDisableTarget(null)}
            >
              Huỷ
            </Button>
            <Button
              variant="destructive"
              className="min-h-[44px]"
              disabled={disableMutation.isPending}
              onClick={() => disableTarget && disableMutation.mutate(disableTarget.id)}
            >
              {disableMutation.isPending ? 'Đang xử lý…' : 'Xác nhận khóa'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
