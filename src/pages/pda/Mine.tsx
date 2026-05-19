import type { FC } from 'react';
import {
  User,
  ChevronRight,
  History,
  Bell,
  Settings,
  HelpCircle,
  LogOut,
  Wifi,
  Battery,
  Smartphone,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const menuItems = [
  { icon: History, label: '操作记录' },
  { icon: Bell, label: '消息通知', badge: 3 },
  { icon: Settings, label: '设置' },
  { icon: HelpCircle, label: '帮助' },
  { icon: LogOut, label: '退出登录' },
];

const Mine: FC = () => {

  return (
    <div className="h-full bg-primary px-4 pt-3 pb-4">
      {/* User Info Card */}
      <div className="rounded-lg bg-white p-4">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-border">
            <User className="h-6 w-6 text-text-muted" />
          </div>
          <div className="flex-1">
            <div className="text-lg font-semibold text-text-primary">张师傅</div>
            <div className="font-data text-xs text-text-muted">WH-001247</div>
          </div>
          <span className="rounded bg-info/15 px-2 py-0.5 text-[11px] font-semibold text-info">收货员</span>
        </div>
      </div>

      {/* Device Status */}
      <div className="mt-4 rounded-lg bg-white p-3">
        <h3 className="mb-2 text-sm font-semibold text-text-primary">设备状态</h3>
        <div className="grid grid-cols-3 gap-3">
          <div className="flex flex-col items-center gap-1">
            <Wifi className="h-5 w-5 text-success" />
            <span className="text-[10px] text-text-muted">WiFi</span>
            <span className="text-[10px] text-success">已连接</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Battery className="h-5 w-5 text-success" />
            <span className="text-[10px] text-text-muted">电量</span>
            <span className="font-data text-[10px] text-success">78%</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Smartphone className="h-5 w-5 text-info" />
            <span className="text-[10px] text-text-muted">PDA</span>
            <span className="text-[10px] text-info">在线</span>
          </div>
        </div>
      </div>

      {/* Today Stats */}
      <div className="mt-4 rounded-lg bg-white p-3">
        <h3 className="mb-2 text-sm font-semibold text-text-primary">今日统计</h3>
        <div className="flex justify-around">
          <div className="text-center">
            <div className="font-data text-base font-bold text-text-primary">24</div>
            <div className="mt-0.5 text-[10px] text-text-muted">处理单数</div>
          </div>
          <div className="text-center">
            <div className="font-data text-base font-bold text-warning">5</div>
            <div className="mt-0.5 text-[10px] text-text-muted">异常数</div>
          </div>
          <div className="text-center">
            <div className="font-data text-base font-bold text-accent">¥1.2万</div>
            <div className="mt-0.5 text-[10px] text-text-muted">拦截价值</div>
          </div>
        </div>
      </div>

      {/* Menu List */}
      <div className="mt-4 space-y-0 rounded-lg bg-white overflow-hidden">
        {menuItems.map((item, idx) => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              className={cn('flex w-full items-center px-4 py-3 text-left transition-all active:bg-primary',
                idx < menuItems.length - 1 && 'border-b border-border'
              )}
            >
              <Icon className="h-5 w-5 text-text-muted" />
              <span className="ml-3 flex-1 text-sm text-text-primary">{item.label}</span>
              {'badge' in item && item.badge && (
                <span className="mr-2 flex h-5 w-5 items-center justify-center rounded-full bg-danger text-[10px] font-bold text-white">
                  {item.badge}
                </span>
              )}
              <ChevronRight className="h-4 w-4 text-text-muted" />
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Mine;
