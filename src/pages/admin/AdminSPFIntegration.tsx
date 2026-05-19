import type { FC } from 'react';
import { useState } from 'react';
import {
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Link2,
} from 'lucide-react';
import { PageHeader } from '@/components/admin/PageHeader';
import { StatusBadge } from '@/components/admin/StatusBadge';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const syncLog = [
  { id: 'SYNC-001', type: '全量', status: '成功', records: 1245, time: '09:00', errors: 0, idempotent: true },
  { id: 'SYNC-002', type: '增量', status: '成功', records: 23, time: '10:00', errors: 0, idempotent: true },
  { id: 'SYNC-003', type: '异常同步', status: '成功', records: 8, time: '10:30', errors: 0, idempotent: true },
  { id: 'SYNC-004', type: '全量', status: '失败', records: 0, time: '11:00', errors: 3, idempotent: false },
  { id: 'SYNC-005', type: '增量', status: '成功', records: 15, time: '11:30', errors: 0, idempotent: true },
];

const deviationData = [
  { category: '关键零部件', planned: 120, actual: 135, diff: 15 },
  { category: '标准包装', planned: 200, actual: 185, diff: -15 },
  { category: '低风险日用品', planned: 80, actual: 78, diff: -2 },
  { category: '特殊库物资', planned: 15, actual: 20, diff: 5 },
];

const suggestedAdjustments = [
  { id: 1, item: '发动机线束', action: '增加采购量', reason: '近3个月异常率偏高', value: '+15%' },
  { id: 2, item: '矿泉水', action: '减少采购量', reason: '库存积压', value: '-10%' },
  { id: 3, item: '动力电池组', action: '增加安全库存', reason: '特殊库物资需保障', value: '+20%' },
];

const orderStatusLog = [
  { orderNo: 'PO-007', status: '已完结', lastSync: '2024-03-15 16:30', nextSync: '—' },
  { orderNo: 'PO-008', status: '已收货', lastSync: '2024-03-16 10:00', nextSync: '2024-03-17 10:00' },
  { orderNo: 'PO-009', status: '待到货', lastSync: '2024-03-14 09:00', nextSync: '2024-03-18 09:00' },
];

export const AdminSPFIntegration: FC = () => {
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState('2024-03-16 11:30');
  const [syncFreq] = useState('30分钟');

  const handleSync = () => {
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
      setLastSync(new Date().toLocaleString('zh-CN'));
    }, 2000);
  };

  const spfOnline = true;

  return (
    <div className="p-6">
      <PageHeader title="采购计划对接" breadcrumbs={[{ label: '分析' }, { label: '采购计划对接' }]} />

      {/* Status Cards */}
      <div className="mb-6 grid grid-cols-3 gap-4">
        <div className="rounded-lg bg-gray-100 p-5">
          <div className="flex items-center gap-2">
            <Link2 className="h-5 w-5 text-success" />
            <div>
              <p className="text-sm font-semibold text-text-primary">SPF系统连接状态</p>
              <div className="mt-1 flex items-center gap-1.5">
                <span className="inline-block h-2 w-2 rounded-full bg-success" />
                <span className="text-xs text-success">{spfOnline ? '在线' : '离线'}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="rounded-lg bg-gray-100 p-5">
          <p className="text-[10px] text-text-muted">最后同步时间</p>
          <p className="mt-1 text-sm font-data text-text-primary">{lastSync}</p>
          <p className="text-[10px] text-text-muted">同步频率: {syncFreq}</p>
        </div>
        <div className="rounded-lg bg-gray-100 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] text-text-muted">Idempotent同步</p>
              <p className="mt-1 text-sm text-success">已启用</p>
            </div>
            <CheckCircle className="h-5 w-5 text-success" />
          </div>
          <p className="text-[10px] text-text-muted">重复同步不产生副作用</p>
        </div>
      </div>

      {/* Sync Button + Data Dashboard */}
      <div className="mb-6 rounded-lg bg-gray-100 p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-text-primary">拦截数据看板</h3>
          <button
            onClick={handleSync}
            disabled={syncing}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              syncing
                ? 'bg-info/50 text-white cursor-wait'
                : 'bg-info text-white hover:bg-info/80'
            }`}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? '同步中...' : '手动同步'}
          </button>
        </div>
        <div className="grid grid-cols-4 gap-4">
          <div className="rounded-md bg-gray-100/50 p-4 text-center">
            <p className="text-2xl font-bold text-accent font-data">1,247</p>
            <p className="mt-1 text-[10px] text-text-muted">本月拦截件数</p>
          </div>
          <div className="rounded-md bg-gray-100/50 p-4 text-center">
            <p className="text-2xl font-bold text-danger font-data">20</p>
            <p className="mt-1 text-[10px] text-text-muted">异常起数</p>
          </div>
          <div className="rounded-md bg-gray-100/50 p-4 text-center">
            <p className="text-2xl font-bold text-warning font-data">¥23.6万</p>
            <p className="mt-1 text-[10px] text-text-muted">预估挽回成本</p>
          </div>
          <div className="rounded-md bg-gray-100/50 p-4 text-center">
            <p className="text-2xl font-bold text-success font-data">99.2%</p>
            <p className="mt-1 text-[10px] text-text-muted">同步成功率</p>
          </div>
        </div>
      </div>

      {/* Deviation Chart + Suggested Adjustments */}
      <div className="mb-6 grid grid-cols-2 gap-6">
        {/* Deviation Analysis */}
        <div className="rounded-lg bg-gray-100 p-5">
          <h3 className="mb-4 text-sm font-semibold text-text-primary">采购计划偏差分析</h3>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deviationData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="category" stroke="#64748B" fontSize={10} />
                <YAxis stroke="#64748B" fontSize={10} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '6px', fontSize: '12px' }}
                  labelStyle={{ color: '#94A3B8' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="planned" name="计划采购" fill="#94A3B8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="actual" name="实际到货" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Suggested Adjustments */}
        <div className="rounded-lg bg-gray-100 p-5">
          <h3 className="mb-4 text-sm font-semibold text-text-primary">建议调整项</h3>
          <div className="space-y-3">
            {suggestedAdjustments.map((adj) => (
              <div key={adj.id} className="rounded-md border-l-[3px] border-l-info bg-info/5 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-text-primary">{adj.item}</span>
                  <span className={`text-xs font-bold font-data ${
                    adj.value.startsWith('+') ? 'text-danger' : 'text-success'
                  }`}>
                    {adj.value}
                  </span>
                </div>
                <p className="mt-1 text-[10px] text-text-muted">
                  建议<span className="text-info">{adj.action}</span> · {adj.reason}
                </p>
              </div>
            ))}
          </div>

          {/* Auto-push Log */}
          <div className="mt-4">
            <h4 className="mb-2 text-xs font-semibold text-text-primary">自动推送记录</h4>
            <div className="space-y-1.5">
              {[
                { time: '10:30', msg: '自动推送异常报告至SPF系统', status: '成功' },
                { time: '09:00', msg: '采购计划偏差同步完成', status: '成功' },
                { time: '08:30', msg: '拦截数据日报推送', status: '成功' },
              ].map((log, i) => (
                <div key={i} className="flex items-center gap-2 text-[10px]">
                  <span className="w-10 text-text-muted font-data">{log.time}</span>
                  <span className="text-text-secondary">{log.msg}</span>
                  <StatusBadge status="成功" className="ml-auto" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Sync Log Table */}
      <div className="mb-6 rounded-lg bg-gray-100 p-5">
        <h3 className="mb-4 text-sm font-semibold text-text-primary">采购订单状态同步日志</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border-light">
              <th className="px-3 py-2 text-left text-xs font-semibold text-text-muted">同步ID</th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-text-muted">类型</th>
              <th className="px-3 py-2 text-center text-xs font-semibold text-text-muted">状态</th>
              <th className="px-3 py-2 text-right text-xs font-semibold text-text-muted">记录数</th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-text-muted">时间</th>
              <th className="px-3 py-2 text-right text-xs font-semibold text-text-muted">错误</th>
              <th className="px-3 py-2 text-center text-xs font-semibold text-text-muted">幂等</th>
            </tr>
          </thead>
          <tbody>
            {syncLog.map((log) => (
              <tr key={log.id} className="border-b border-border-light/30 transition-colors hover:bg-primary">
                <td className="px-3 py-2.5 font-data text-xs text-info">{log.id}</td>
                <td className="px-3 py-2.5 text-xs text-text-primary">{log.type}</td>
                <td className="px-3 py-2.5 text-center">
                  <StatusBadge status={log.status as '成功' | '失败'} />
                </td>
                <td className="px-3 py-2.5 text-right font-data text-xs text-text-primary">{log.records}</td>
                <td className="px-3 py-2.5 text-xs text-text-muted">{log.time}</td>
                <td className="px-3 py-2.5 text-right font-data text-xs">
                  <span className={log.errors > 0 ? 'text-danger' : 'text-text-muted'}>{log.errors}</span>
                </td>
                <td className="px-3 py-2.5 text-center">
                  {log.idempotent ? (
                    <CheckCircle className="mx-auto h-4 w-4 text-success" />
                  ) : (
                    <AlertTriangle className="mx-auto h-4 w-4 text-warning" />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Purchase Order Status */}
      <div className="rounded-lg bg-gray-100 p-5">
        <h3 className="mb-4 text-sm font-semibold text-text-primary">采购订单状态</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border-light">
              <th className="px-3 py-2 text-left text-xs font-semibold text-text-muted">采购单号</th>
              <th className="px-3 py-2 text-center text-xs font-semibold text-text-muted">同步状态</th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-text-muted">最后同步</th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-text-muted">下次同步</th>
            </tr>
          </thead>
          <tbody>
            {orderStatusLog.map((order) => (
              <tr key={order.orderNo} className="border-b border-border-light/30 transition-colors hover:bg-primary">
                <td className="px-3 py-2.5 font-data text-xs text-info">{order.orderNo}</td>
                <td className="px-3 py-2.5 text-center">
                  <StatusBadge status={order.status as '已完结' | '已收货' | '待到货'} />
                </td>
                <td className="px-3 py-2.5 text-xs text-text-muted">{order.lastSync}</td>
                <td className="px-3 py-2.5 text-xs text-text-muted">{order.nextSync}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminSPFIntegration;
