import type { FC } from 'react';
import { useState } from 'react';
import {
  Settings,
  Play,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { PageHeader } from '@/components/admin/PageHeader';
import { StatusBadge } from '@/components/admin/StatusBadge';

type StrategyType = '动碰' | '静态' | '重点库位';

interface Strategy {
  type: StrategyType;
  enabled: boolean;
  triggerThreshold: number;
  cycle: string;
  scope: string;
  tolerance: number;
}

const initialStrategies: Strategy[] = [
  { type: '动碰', enabled: true, triggerThreshold: 3, cycle: '实时', scope: '有出入库记录库位', tolerance: 0 },
  { type: '静态', enabled: false, triggerThreshold: 0, cycle: '月度', scope: '全仓', tolerance: 2 },
  { type: '重点库位', enabled: true, triggerThreshold: 2, cycle: '周度', scope: '高风险库位', tolerance: 0 },
];

const focusLocations = [
  { code: 'A-03-05', reason: '近7日3次出入库', lastCount: '2024-03-10', status: '已配置' },
  { code: 'B-01-03', reason: '高风险供应商物料', lastCount: '2024-03-08', status: '已配置' },
  { code: 'B-07-01', reason: '温控隔离区', lastCount: '2024-03-12', status: '已配置' },
];

const historyData = [
  { batch: 'RC-2024-001', area: 'A-01区', systemQty: 120, actualQty: 118, diff: -2, status: '差异', date: '2024-03-10' },
  { batch: 'RC-2024-002', area: 'A-03区', systemQty: 85, actualQty: 85, diff: 0, status: '一致', date: '2024-03-11' },
  { batch: 'RC-2024-003', area: 'B-01区', systemQty: 95, actualQty: 94, diff: -1, status: '差异', date: '2024-03-12' },
  { batch: 'RC-2024-004', area: 'B-07区', systemQty: 12, actualQty: 12, diff: 0, status: '一致', date: '2024-03-13' },
];

export const AdminRecountStrategy: FC = () => {
  const [strategies, setStrategies] = useState<Strategy[]>(initialStrategies);
  const [expanded, setExpanded] = useState<StrategyType>('动碰');

  const toggleStrategy = (type: StrategyType) => {
    setStrategies((prev) =>
      prev.map((s) => (s.type === type ? { ...s, enabled: !s.enabled } : s))
    );
  };

  const genTodayTasks = () => {
    alert(`已生成今日盘点任务 ${focusLocations.length} 条`);
  };

  return (
    <div className="p-6">
      <PageHeader title="盘点策略" breadcrumbs={[{ label: '运营' }, { label: '盘点策略' }]} />

      {/* Strategy Overview */}
      <div className="mb-6 grid grid-cols-3 gap-4">
        {strategies.map((s) => (
          <div key={s.type} className="rounded-lg bg-gray-100 p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-text-primary">{s.type}盘点</span>
              <button
                onClick={() => toggleStrategy(s.type)}
                className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold transition-colors ${
                  s.enabled ? 'bg-success/20 text-success' : 'bg-text-muted/20 text-text-muted'
                }`}
              >
                {s.enabled ? '已启用' : '已停用'}
              </button>
            </div>
            <div className="mt-3 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-text-muted">触发条件</span>
                <span className="text-text-primary">
                  {s.type === '动碰' ? `近7日出入库≥${s.triggerThreshold}次` :
                   s.type === '静态' ? '周期触发' :
                   `异常≥${s.triggerThreshold}次`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">盘点周期</span>
                <span className="text-text-primary">{s.cycle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">盘点范围</span>
                <span className="text-text-primary">{s.scope}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Strategy Configuration */}
      <div className="mb-6 rounded-lg bg-gray-100 p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-text-primary">策略配置</h3>
          <button
            onClick={genTodayTasks}
            className="flex items-center gap-1.5 rounded-md bg-accent px-3 py-1.5 text-xs font-medium text-primary-dark transition-colors hover:bg-accent-dark"
          >
            <Play className="h-3.5 w-3.5" />
            生成今日盘点任务
          </button>
        </div>
        <div className="space-y-2">
          {strategies.map((s) => (
            <div key={s.type} className="rounded-md border border-border-light">
              <button
                onClick={() => setExpanded(expanded === s.type ? ('' as StrategyType) : s.type)}
                className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-primary"
              >
                <div className="flex items-center gap-3">
                  <span className={`inline-block h-2.5 w-2.5 rounded-full ${s.enabled ? 'bg-success' : 'bg-text-muted'}`} />
                  <span className="text-sm font-medium text-text-primary">{s.type}盘点策略</span>
                  <StatusBadge status={s.enabled ? '在线' : '离线'} />
                </div>
                {expanded === s.type ? (
                  <ChevronUp className="h-4 w-4 text-text-muted" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-text-muted" />
                )}
              </button>
              {expanded === s.type && (
                <div className="border-t border-border-light px-4 py-3">
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <label className="mb-1 block text-[10px] text-text-muted">异常率阈值 (%)</label>
                      <input
                        type="number"
                        defaultValue={s.triggerThreshold}
                        className="h-8 w-full rounded-md border border-border-light bg-[#F1F5F9] px-2 text-xs text-text-primary outline-none focus:border-info"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-[10px] text-text-muted">盘点范围</label>
                      <select
                        defaultValue={s.scope}
                        className="h-8 w-full rounded-md border border-border-light bg-[#F1F5F9] px-2 text-xs text-text-primary outline-none"
                      >
                        <option>全仓</option>
                        <option>指定区域</option>
                        <option>指定品类</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-[10px] text-text-muted">差异容忍度 (%)</label>
                      <input
                        type="number"
                        defaultValue={s.tolerance}
                        className="h-8 w-full rounded-md border border-border-light bg-[#F1F5F9] px-2 text-xs text-text-primary outline-none focus:border-info"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-[10px] text-text-muted">自动调整</label>
                      <select className="h-8 w-full rounded-md border border-border-light bg-[#F1F5F9] px-2 text-xs text-text-primary outline-none">
                        <option>关闭</option>
                        <option>开启</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Focus Locations + History */}
      <div className="grid grid-cols-2 gap-6">
        {/* Focus Locations */}
        <div className="rounded-lg bg-gray-100 p-5">
          <h3 className="mb-4 text-sm font-semibold text-text-primary">重点库位设置</h3>
          <div className="space-y-2">
            {focusLocations.map((loc) => (
              <div key={loc.code} className="flex items-center justify-between rounded-md bg-gray-100/40 px-3 py-2.5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-data text-xs font-bold text-info">{loc.code}</span>
                    <StatusBadge status="成功" />
                  </div>
                  <p className="text-[10px] text-text-muted">{loc.reason} · 上次盘点 {loc.lastCount}</p>
                </div>
                <button className="rounded p-1 text-text-muted hover:bg-primary hover:text-info">
                  <Settings className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* History Data */}
        <div className="rounded-lg bg-gray-100 p-5">
          <h3 className="mb-4 text-sm font-semibold text-text-primary">历史差异数据</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-light">
                <th className="px-2 py-2 text-left text-[10px] font-semibold text-text-muted">批次</th>
                <th className="px-2 py-2 text-left text-[10px] font-semibold text-text-muted">区域</th>
                <th className="px-2 py-2 text-right text-[10px] font-semibold text-text-muted">系统</th>
                <th className="px-2 py-2 text-right text-[10px] font-semibold text-text-muted">实际</th>
                <th className="px-2 py-2 text-right text-[10px] font-semibold text-text-muted">差异</th>
                <th className="px-2 py-2 text-left text-[10px] font-semibold text-text-muted">状态</th>
              </tr>
            </thead>
            <tbody>
              {historyData.map((h) => (
                <tr key={h.batch} className="border-b border-border-light/30 transition-colors hover:bg-primary">
                  <td className="px-2 py-2 text-[10px] font-data text-info">{h.batch}</td>
                  <td className="px-2 py-2 text-[10px] text-text-secondary">{h.area}</td>
                  <td className="px-2 py-2 text-right text-[10px] font-data text-text-primary">{h.systemQty}</td>
                  <td className="px-2 py-2 text-right text-[10px] font-data text-text-primary">{h.actualQty}</td>
                  <td className="px-2 py-2 text-right text-[10px] font-data">
                    <span className={h.diff !== 0 ? 'text-danger' : 'text-success'}>
                      {h.diff > 0 ? '+' : ''}{h.diff}
                    </span>
                  </td>
                  <td className="px-2 py-2">
                    <StatusBadge status={h.status as '差异' | '一致'} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminRecountStrategy;
