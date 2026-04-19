import { type FC, useState } from 'react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth.store';
import { logout } from '@/lib/auth';
import {
  Package,
  Users,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  to: string;
  icon: FC<{ className?: string }>;
}

const NAV_ITEMS: Record<string, NavItem[]> = {
  OWNER: [
    { label: 'Tổng quan', to: '/dashboard', icon: LayoutDashboard },
    { label: 'Sản phẩm', to: '/products', icon: Package },
  ],
  ADMIN: [
    { label: 'Tổng quan', to: '/dashboard', icon: LayoutDashboard },
    { label: 'Sản phẩm', to: '/products', icon: Package },
    { label: 'Người dùng', to: '/admin/users', icon: Users },
  ],
};

const ROLE_LABELS: Record<string, string> = {
  OWNER: 'Chủ cửa hàng',
  ADMIN: 'Quản trị viên',
};

export default function AppLayout() {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const role = user?.role ?? '';
  const navItems = NAV_ITEMS[role] ?? [];

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-30 flex w-64 flex-col bg-white border-r shadow-sm transition-transform duration-200',
          'lg:relative lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        )}
        aria-label="Sidebar navigation"
      >
        {/* Brand */}
        <div className="flex h-16 items-center justify-between px-4 border-b">
          <span className="text-lg font-bold text-primary">EAM</span>
          <button
            className="lg:hidden p-2 rounded hover:bg-gray-100 min-h-[44px] min-w-[44px] flex items-center justify-center"
            onClick={() => setSidebarOpen(false)}
            aria-label="Đóng menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto py-4 px-2" aria-label="Main navigation">
          <ul className="space-y-1" role="list">
            {navItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors min-h-[44px]',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-gray-700 hover:bg-gray-100',
                    )
                  }
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* User info + logout */}
        <div className="border-t p-3">
          <div className="flex items-center gap-2 mb-2 px-1">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-xs font-semibold text-primary uppercase">
                {user?.email?.[0] ?? '?'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate">{user?.email}</p>
              <p className="text-xs text-muted-foreground">{ROLE_LABELS[role] ?? role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors min-h-[44px]"
            aria-label="Đăng xuất"
          >
            <LogOut className="h-4 w-4" />
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        {/* Topnav */}
        <header className="flex h-16 items-center gap-3 border-b bg-white px-4 shadow-sm">
          <button
            className="lg:hidden p-2 rounded hover:bg-gray-100 min-h-[44px] min-w-[44px] flex items-center justify-center"
            onClick={() => setSidebarOpen(true)}
            aria-label="Mở menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <ChevronRight className="h-4 w-4 text-muted-foreground hidden lg:block" />
          <span className="text-sm text-muted-foreground hidden lg:block">
            {ROLE_LABELS[role] ?? role}
          </span>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
