import type { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package,
  ArrowUpToLine,
  ArrowDownToLine,
  ClipboardCheck,
  ChevronRight,
  Search,
  AlertTriangle,
  HandHelping,
  Fingerprint,
  Calendar,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const mainEntries = [
  { icon: Package, title: '收货', subtitle: '扫码/预约', path: '/receive/scan' },
  { icon: ArrowUpToLine, title: '上架', subtitle: '任务/执行', path: '/putaway/task' },
  { icon: ArrowDownToLine, title: '拣货', subtitle: '任务/扫描', path: '/pick/task' },
  { icon: ClipboardCheck, title: '巡检', subtitle: '执行/记录', path: '/inspect/task' },
];

const quickTools = [
  { icon: Search, label: '盘点', path: '/recount' },
  { icon: AlertTriangle, label: '异常', path: '/exceptions' },
  { icon: HandHelping, label: '移交', path: '/problem/handover' },
  { icon: Fingerprint, label: '溯源', path: '/trace/verify' },
  { icon: Calendar, label: '预约', path: '/receive/appointment' },
  { icon: Settings, label: '设置', path: '/mine' },
];

const PDHome: FC = () => {
  const navigate = useNavigate();

  return (
    <div className="h-full bg-primary pb-4">
      {/* Welcome */}
      <div className="px-4 pt-3">
        <h1 className="text-lg font-semibold text-text-primary">早上好，张师傅</h1>
        <p className="mt-1 text-xs text-text-muted">今日已处理 24 单</p>
      </div>

      {/* 2x2 Main Grid */}
      <div className="mt-4 grid grid-cols-2 gap-2 px-4">
        {mainEntries.map((entry) => {
          const Icon = entry.icon;
          return (
            <button
              key={entry.title}
              onClick={() => navigate(entry.path)}
              className={cn(
                'flex flex-col items-start rounded-lg border border-border bg-white p-4 text-left transition-all',
                'active:scale-[0.97] active:border-info'
              )}
              style={{ height: '120px' }}
            >
              <div className="flex w-full items-center justify-between">
                <Icon className="h-6 w-6 text-info" />
                <ChevronRight className="h-3.5 w-3.5 text-text-muted" />
              </div>
              <span className="mt-2 text-base font-semibold text-text-primary">{entry.title}</span>
              <span className="mt-1 text-xs text-text-muted">{entry.subtitle}</span>
            </button>
          );
        })}
      </div>

      {/* Quick Tools */}
      <div className="mt-4 px-4">
        <h3 className="mb-2 text-sm font-semibold text-text-primary">快捷功能</h3>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {quickTools.map((tool) => {
            const Icon = tool.icon;
            return (
              <button
                key={tool.label}
                onClick={() => navigate(tool.path)}
                className={cn(
                  'flex shrink-0 flex-col items-center justify-center rounded-lg border border-border bg-white p-2 text-center transition-all active:scale-95',
                )}
                style={{ width: '80px', height: '64px' }}
              >
                <Icon className="h-5 w-5 text-info" />
                <span className="mt-1 text-[10px] text-text-muted">{tool.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Today Stats */}
      <div className="mx-4 mt-4 rounded-lg bg-white p-3">
        <div className="flex justify-around">
          <div className="text-center">
            <div className="font-data text-base font-bold text-text-primary">24</div>
            <div className="mt-0.5 text-[10px] text-text-muted">已处理</div>
          </div>
          <div className="text-center">
            <div className="font-data text-base font-bold text-warning">3</div>
            <div className="mt-0.5 text-[10px] text-text-muted">待确认</div>
          </div>
          <div className="text-center">
            <div className="font-data text-base font-bold text-accent">¥1.2万</div>
            <div className="mt-0.5 text-[10px] text-text-muted">拦截价值</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PDHome;
