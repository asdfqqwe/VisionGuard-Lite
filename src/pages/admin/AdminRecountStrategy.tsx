import type { FC } from 'react';
import { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  FileText,
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

const dispatchTasks = [
  {
    id: 'RC-001',
    location: 'A-03-05',
    material: '矿泉水',
    frequency: '重点库位 · 周度',
    executor: 'PDA-07 王工',
    method: 'PDA 扫库位码 / 货物码',
    status: '执行中',
  },
  {
    id: 'RC-002',
    location: 'A-01-02',
    material: '前轮轴承',
    frequency: '动碰 · 实时',
    executor: 'PDA-03 李工',
    method: 'PDA 扫码点数',
    status: '已完成',
  },
  {
    id: 'RC-003',
    location: 'B-02-04',
    material: '5W-40 机油',
    frequency: '静态 · 月度',
    executor: 'PDA-11 周工',
    method: 'PDA 拍照留存',
    status: '待下发',
  },
];

const resultReports = [
  { id: 'RC-RPT-001', task: 'RC-002', result: '一致', lastCountDate: '2026-05-21', report: '已生成' },
  { id: 'RC-RPT-002', task: 'RC-001', result: '差异', lastCountDate: '待确认', report: '待复核' },
];

const diffActions = [
  { issue: '漏盘 2 箱', material: '矿泉水', owner: '仓库主管-王', action: '核查移库、领用和报损记录', status: '处理中' },
  { issue: '库位复点', material: '矿泉水', owner: '巡检员-王', action: 'PDA 复扫 A-03-05', status: '待处理' },
];

export const AdminRecountStrategy: FC = () => {
  const [strategies, setStrategies] = useState<Strategy[]>(initialStrategies);
  const [expanded, setExpanded] = useState<StrategyType>('动碰');
  const [generated, setGenerated] = useState(false);

  const toggleStrategy = (type: StrategyType) => {
    setStrategies((prev) =>
      prev.map((s) => (s.type === type ? { ...s, enabled: !s.enabled } : s))
    );
  };

  const genTodayTasks = () => {
    setGenerated(true);
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

      <div className="mb-6 grid grid-cols-3 gap-4">
        <div className="rounded-lg bg-gray-100 p-4">
          <div className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4 text-info" />
            <span className="text-sm font-semibold text-text-primary">今日任务</span>
          </div>
          <p className="mt-2 font-data text-2xl font-bold text-info">{dispatchTasks.length}</p>
          <p className="mt-1 text-xs text-text-muted">{generated ? '已重新生成并下发' : '按当前策略生成'}</p>
        </div>
        <div className="rounded-lg bg-gray-100 p-4">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-success" />
            <span className="text-sm font-semibold text-text-primary">盘点报告</span>
          </div>
          <p className="mt-2 font-data text-2xl font-bold text-success">2</p>
          <p className="mt-1 text-xs text-text-muted">一致结果自动写入日期</p>
        </div>
        <div className="rounded-lg bg-gray-100 p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-warning" />
            <span className="text-sm font-semibold text-text-primary">待处理差异</span>
          </div>
          <p className="mt-2 font-data text-2xl font-bold text-warning">{diffActions.length}</p>
          <p className="mt-1 text-xs text-text-muted">账实不符待核查</p>
        </div>
      </div>

      <div className="mb-6 rounded-lg bg-gray-100 p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-text-primary">任务下发与执行状态</h3>
          <span className="text-xs text-text-muted">Admin 下发，PDA 现场执行</span>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border-light">
              {['任务', '库位', '物资', '频次', '执行人', '现场方式', '状态'].map((head) => (
                <th key={head} className="px-2 py-2 text-left text-[10px] font-semibold text-text-muted">{head}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dispatchTasks.map((task) => (
              <tr key={task.id} className="border-b border-border-light/30">
                <td className="px-2 py-2 font-data text-xs text-info">{task.id}</td>
                <td className="px-2 py-2 font-data text-xs text-text-primary">{task.location}</td>
                <td className="px-2 py-2 text-xs text-text-secondary">{task.material}</td>
                <td className="px-2 py-2 text-xs text-text-secondary">{task.frequency}</td>
                <td className="px-2 py-2 text-xs text-text-secondary">{task.executor}</td>
                <td className="px-2 py-2 text-xs text-text-secondary">{task.method}</td>
                <td className="px-2 py-2">
                  <StatusBadge status={task.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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

      <div className="mt-6 grid grid-cols-2 gap-6">
        <div className="rounded-lg bg-gray-100 p-5">
          <div className="mb-4 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-success" />
            <h3 className="text-sm font-semibold text-text-primary">盘点报告写入</h3>
          </div>
          <div className="space-y-2">
            {resultReports.map((report) => (
              <div key={report.id} className="grid grid-cols-4 gap-2 rounded bg-white px-3 py-2 text-xs">
                <span className="font-data text-info">{report.id}</span>
                <span className="font-data text-text-secondary">{report.task}</span>
                <span className={report.result === '一致' ? 'text-success' : 'text-warning'}>{report.result}</span>
                <span className="font-data text-text-primary">{report.lastCountDate}</span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-text-muted">一致项自动生成报告，并写入库位最新盘点日期；差异项先进入人工复核。</p>
        </div>

        <div className="rounded-lg bg-gray-100 p-5">
          <div className="mb-4 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-warning" />
            <h3 className="text-sm font-semibold text-text-primary">盘点差异处理</h3>
          </div>
          <div className="space-y-2">
            {diffActions.map((item) => (
              <div key={`${item.issue}-${item.material}`} className="rounded bg-white px-3 py-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-text-primary">{item.material}</span>
                  <StatusBadge status={item.status} />
                </div>
                <div className="mt-1 grid grid-cols-3 gap-2 text-[11px] text-text-secondary">
                  <span>{item.issue}</span>
                  <span>{item.owner}</span>
                  <span>{item.action}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminRecountStrategy;
