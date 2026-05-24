import type { FC } from 'react';
import { useLocation, useNavigate, Outlet, useSearchParams } from 'react-router-dom';
import {
  LayoutDashboard,
  Bot,
  ClipboardList,
  BarChart3,
  SlidersHorizontal,
  Truck,
  Image,
  BookOpen,
  ShieldAlert,
  FileText,
  Calculator,
  Video,
  ShoppingCart,
  ClipboardCheck,
  PackageCheck,
  RotateCcw,
  User,
  ChevronRight,
  Home,
} from 'lucide-react';
import { EntrySidebar } from '@/components/layout/EntrySidebar';

interface MenuItem {
  label: string;
  path: string;
  icon: typeof LayoutDashboard;
}

const menuItems: MenuItem[] = [
  { label: '首页工作台', path: '/admin', icon: LayoutDashboard },
  { label: 'Agent协作台', path: '/admin/agents', icon: Bot },
  { label: '工单中心', path: '/admin/workorders', icon: ClipboardList },
  { label: '数据看板', path: '/admin/dashboard', icon: BarChart3 },
  { label: '规则配置', path: '/admin/rules', icon: SlidersHorizontal },
  { label: '供应商分析', path: '/admin/suppliers', icon: Truck },
  { label: '异常案例库', path: '/admin/gallery', icon: Image },
  { label: '质量标准库', path: '/admin/standards', icon: BookOpen },
  { label: '隔离区', path: '/admin/quarantine', icon: ShieldAlert },
  { label: '索赔协同', path: '/admin/claims', icon: FileText },
  { label: '盘点策略', path: '/admin/recount', icon: Calculator },
  { label: '视频分析', path: '/admin/videoanalysis', icon: Video },
  { label: '采购对接', path: '/admin/spf', icon: ShoppingCart },
  { label: '入库质检配置', path: '/admin/inbound-config', icon: ClipboardCheck },
  { label: '出库复核配置', path: '/admin/outbound-config', icon: PackageCheck },
  { label: '生产退料入库', path: '/admin/return-inbound', icon: RotateCcw },
];

export const AdminFrame: FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isPurchaseGuide =
    location.pathname === '/admin/inbound-config' &&
    searchParams.get('scenario') === 'purchase-receive';
  const pageTitle = isPurchaseGuide
    ? '采购到货确认'
    : menuItems.find((m) => m.path === location.pathname)?.label || '管理后台';

  return (
    <div className="flex h-[100dvh] overflow-hidden bg-primary">
      <EntrySidebar />
      {/* Left Sidebar */}
      <aside className="fixed left-16 top-0 z-40 flex h-[100dvh] w-[220px] flex-col border-r border-border-light bg-[#F1F5F9]">
        {/* Logo */}
        <div className="flex h-14 items-center gap-2.5 px-4 border-b border-border-light">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-accent">
            <BarChart3 className="h-4 w-4 text-primary-dark" />
          </div>
          <div>
            <span className="text-sm font-bold text-white">智见-仓储质检</span>
            <span className="block text-[10px] text-text-muted">Admin</span>
          </div>
        </div>

        {/* Menu */}
        <nav className="flex-1 overflow-y-auto py-3">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`group relative flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-xs font-medium transition-all duration-150 ${
                  isActive
                    ? 'text-info'
                    : 'text-text-muted hover:text-text-secondary'
                }`}
              >
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 h-6 w-0.5 -translate-y-1/2 rounded-r bg-info" />
                )}
                <Icon className={`h-4 w-4 transition-colors ${isActive ? 'text-info' : 'text-text-muted group-hover:text-text-secondary'}`} />
                <span>{item.label}</span>
                {isActive && <ChevronRight className="ml-auto h-3 w-3 text-info" />}
              </button>
            );
          })}
        </nav>

        {/* User section */}
        <div className="border-t border-border-light px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-info/20 text-info">
              <User className="h-3.5 w-3.5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-[11px] font-medium text-text-primary">admin@zhijian</p>
              <p className="text-[10px] text-text-muted">系统管理员</p>
            </div>
            <button
              onClick={() => navigate('/')}
              className="rounded-md bg-accent/10 p-1.5 text-accent transition-colors hover:bg-accent/20"
              title="返回首页"
            >
              <Home className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-[284px] flex h-[100dvh] min-w-0 flex-1 flex-col overflow-hidden">
        {/* Header bar */}
        <header className="z-30 flex h-14 shrink-0 items-center justify-between border-b border-border-light bg-primary/90 px-6 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-medium text-text-primary">
              {pageTitle}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-text-muted">
              上次同步: 2026年5月20日 14:32:18
            </span>
            <div className="flex items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-1">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-success" />
              <span className="text-[10px] text-success">正常</span>
            </div>
            <span className="text-[10px] text-text-muted">admin</span>
          </div>
        </header>

        {/* Content */}
        <div className="min-h-0 flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminFrame;
