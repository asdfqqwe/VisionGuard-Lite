import type { FC } from 'react';
import {
  BarChart3,
  Clock,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Info,
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { PageHeader } from '@/components/admin/PageHeader';
import { StatCard } from '@/components/admin/StatCard';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from 'recharts';

const trendData = [
  { date: '03-01', pass: 42, intercept: 2 },
  { date: '03-02', pass: 38, intercept: 5 },
  { date: '03-03', pass: 45, intercept: 1 },
  { date: '03-04', pass: 50, intercept: 3 },
  { date: '03-05', pass: 35, intercept: 4 },
  { date: '03-06', pass: 48, intercept: 2 },
  { date: '03-07', pass: 40, intercept: 6 },
  { date: '03-08', pass: 55, intercept: 1 },
  { date: '03-09', pass: 42, intercept: 3 },
  { date: '03-10', pass: 38, intercept: 5 },
  { date: '03-11', pass: 46, intercept: 2 },
  { date: '03-12', pass: 52, intercept: 3 },
  { date: '03-13', pass: 41, intercept: 4 },
  { date: '03-14', pass: 48, intercept: 2 },
  { date: '03-15', pass: 44, intercept: 5 },
  { date: '03-16', pass: 39, intercept: 6 },
  { date: '03-17', pass: 50, intercept: 3 },
  { date: '03-18', pass: 43, intercept: 2 },
  { date: '03-19', pass: 47, intercept: 4 },
  { date: '03-20', pass: 41, intercept: 3 },
  { date: '03-21', pass: 45, intercept: 2 },
  { date: '03-22', pass: 38, intercept: 5 },
  { date: '03-23', pass: 52, intercept: 1 },
  { date: '03-24', pass: 46, intercept: 3 },
  { date: '03-25', pass: 40, intercept: 4 },
  { date: '03-26', pass: 48, intercept: 2 },
  { date: '03-27', pass: 44, intercept: 3 },
  { date: '03-28', pass: 50, intercept: 2 },
  { date: '03-29', pass: 42, intercept: 4 },
  { date: '03-30', pass: 46, intercept: 3 },
];

const efficiencyData = [
  { name: '检测时间(秒)', manual: 45, aiAssist: 12 },
  { name: '准确率(%)', manual: 82, aiAssist: 99.7 },
  { name: '漏检率(%)', manual: 18, aiAssist: 0.3 },
];

const aiVsHumanColumns = [
  { key: 'metric', header: '指标' },
  { key: 'manual', header: '人工纯检' },
  { key: 'aiAssist', header: 'AI辅助' },
  { key: 'change', header: '变化' },
];

const aiVsHumanData = [
  { metric: '平均耗时/件', manual: '45秒', aiAssist: '12秒', change: '-73%' },
  { metric: '拦截率', manual: '82%', aiAssist: '113%（+31%）', change: '+31个百分点' },
  { metric: '错误率', manual: '万分之一（按单）', aiAssist: '百万分之一（按单）', change: '-90%' },
  { metric: '本月拦截起数', manual: '—', aiAssist: '20起', change: '—' },
  { metric: '预估挽回成本', manual: '—', aiAssist: '¥23.6万', change: '—' },
];

const sampleCheckColumns = [
  { key: 'sampleId', header: '样本ID', width: '80px' },
  { key: 'orderNo', header: '运单号', width: '90px' },
  { key: 'aiResult', header: 'AI判定', width: '80px' },
  { key: 'humanResult', header: '人工判定', width: '80px' },
  { key: 'match', header: '一致', width: '60px' },
  { key: 'confidence', header: '置信度', width: '80px' },
  { key: 'checkTime', header: '复核时间', width: '80px' },
];

const sampleCheckData = [
  { sampleId: 'SP-2401', orderNo: 'PKG-001', aiResult: '通过', humanResult: '通过', match: '✓', confidence: '98.2%', checkTime: '09:32' },
  { sampleId: 'SP-2402', orderNo: 'PKG-002', aiResult: 'L2警示', humanResult: 'L2警示', match: '✓', confidence: '85.3%', checkTime: '09:45' },
  { sampleId: 'SP-2403', orderNo: 'PKG-003', aiResult: 'L1拦截', humanResult: 'L1拦截', match: '✓', confidence: '99.1%', checkTime: '10:02' },
  { sampleId: 'SP-2404', orderNo: 'PKG-004', aiResult: '通过', humanResult: 'L2警示', match: '✗', confidence: '72.1%', checkTime: '10:15' },
];

const warehouseZones = [
  { zone: 'A-01区', total: 120, pass: 110, intercept: 5, alert: 5 },
  { zone: 'A-02区', total: 85, pass: 78, intercept: 4, alert: 3 },
  { zone: 'B-01区', total: 95, pass: 90, intercept: 3, alert: 2 },
  { zone: 'B-02区', total: 60, pass: 55, intercept: 3, alert: 2 },
  { zone: '温控隔离区', total: 12, pass: 10, intercept: 1, alert: 1 },
];

export const AdminDashboard: FC = () => {
  const { dashboardData } = useData();

  return (
    <div className="p-6">
      <PageHeader title="数据看板" breadcrumbs={[{ label: '作业' }, { label: '数据看板' }]} />

      {/* KPI Cards */}
      <div className="mb-6 grid grid-cols-4 gap-4">
        <StatCard
          label="AI识别准确率"
          value={`${dashboardData.aiAccuracy}%`}
          subtitle="较上月+0.3%"
          color="success"
          icon={<CheckCircle className="h-5 w-5 text-success" />}
          trend="up"
          trendValue="+0.3%"
        />
        <StatCard
          label="本月拦截件数"
          value={dashboardData.todayInterceptCount.toLocaleString()}
          subtitle="较上月+8.5%"
          color="accent"
          icon={<BarChart3 className="h-5 w-5 text-accent" />}
          trend="up"
          trendValue="+8.5%"
        />
        <StatCard
          label="本月拦截价值"
          value="¥386万"
          subtitle="较上月+15.2%"
          color="accent"
          icon={<DollarSign className="h-5 w-5 text-accent" />}
          trend="up"
          trendValue="+15.2%"
        />
        <StatCard
          label="平均检测耗时"
          value="12.5ms"
          subtitle="较上月-2.1ms"
          color="info"
          icon={<Clock className="h-5 w-5 text-info" />}
          trend="down"
          trendValue="-2.1ms"
        />
      </div>

      {/* AI vs Human Table (MANDATORY) */}
      <div className="mb-6 rounded-lg bg-gray-100 p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-text-primary">AI vs 人工对照样本</h3>
          <div className="flex items-center gap-1 text-xs text-danger">
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>数据来自样本，不代表实时计算</span>
          </div>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border-light bg-primary">
              {aiVsHumanColumns.map((col) => (
                <th key={col.key} className="px-4 py-2.5 text-left text-xs font-semibold text-text-muted">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {aiVsHumanData.map((row, i) => (
              <tr key={i} className="border-b border-border-light/30 hover:bg-primary transition-colors">
                <td className="px-4 py-3 text-xs font-medium text-text-primary">{row.metric}</td>
                <td className="px-4 py-3 text-xs text-text-secondary font-data">{row.manual}</td>
                <td className="px-4 py-3 text-xs text-info font-data">{row.aiAssist}</td>
                <td className="px-4 py-3 text-xs font-data">
                  {row.change.startsWith('+') ? (
                    <span className="text-success">{row.change}</span>
                  ) : row.change.startsWith('-') ? (
                    <span className="text-success">{row.change}</span>
                  ) : (
                    <span className="text-text-muted">{row.change}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Charts Row */}
      <div className="mb-6 grid grid-cols-2 gap-6">
        {/* Trend Chart */}
        <div className="rounded-lg bg-gray-100 p-5">
          <h3 className="mb-4 text-sm font-semibold text-text-primary">近30天检测趋势</h3>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="passGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22C55E" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="intGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#DC2626" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#DC2626" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" stroke="#64748B" fontSize={10} />
                <YAxis stroke="#64748B" fontSize={10} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '6px', fontSize: '12px' }}
                  labelStyle={{ color: '#94A3B8' }}
                />
                <Area type="monotone" dataKey="pass" name="通过" stroke="#22C55E" fill="url(#passGrad)" strokeWidth={2} />
                <Area type="monotone" dataKey="intercept" name="拦截" stroke="#DC2626" fill="url(#intGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Efficiency Comparison */}
        <div className="rounded-lg bg-gray-100 p-5">
          <h3 className="mb-4 text-sm font-semibold text-text-primary">检测效率对比</h3>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={efficiencyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#64748B" fontSize={10} />
                <YAxis stroke="#64748B" fontSize={10} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '6px', fontSize: '12px' }}
                  labelStyle={{ color: '#94A3B8' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="manual" name="人工检测" fill="#94A3B8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="aiAssist" name="AI辅助" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Sample Check Table + Warehouse Zones */}
      <div className="mb-6 grid grid-cols-2 gap-6">
        {/* AI vs Human Sample Check */}
        <div className="rounded-lg bg-gray-100 p-5">
          <h3 className="mb-4 text-sm font-semibold text-text-primary">AI vs 人工对照样本</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-light bg-primary">
                {sampleCheckColumns.map((col) => (
                  <th key={col.key} className="px-2 py-2 text-left text-[10px] font-semibold text-text-muted" style={{ width: col.width }}>
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sampleCheckData.map((row, i) => (
                <tr key={i} className={`border-b border-border-light/30 transition-colors hover:bg-primary ${row.match === '✗' ? 'bg-danger/10' : ''}`}>
                  <td className="px-2 py-2 font-data text-[10px] text-info">{row.sampleId}</td>
                  <td className="px-2 py-2 font-data text-[10px] text-text-secondary">{row.orderNo}</td>
                  <td className="px-2 py-2 text-[10px] text-text-primary">{row.aiResult}</td>
                  <td className="px-2 py-2 text-[10px] text-text-primary">{row.humanResult}</td>
                  <td className="px-2 py-2 text-[10px] font-bold">
                    {row.match === '✓' ? (
                      <span className="text-success">{row.match}</span>
                    ) : (
                      <span className="text-danger">{row.match}</span>
                    )}
                  </td>
                  <td className="px-2 py-2 font-data text-[10px] text-text-secondary">{row.confidence}</td>
                  <td className="px-2 py-2 font-data text-[10px] text-text-muted">{row.checkTime}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Warehouse Zone Summary */}
        <div className="rounded-lg bg-gray-100 p-5">
          <h3 className="mb-4 text-sm font-semibold text-text-primary">仓区检测摘要</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-light bg-primary">
                <th className="px-3 py-2 text-left text-xs font-semibold text-text-muted">仓区</th>
                <th className="px-3 py-2 text-right text-xs font-semibold text-text-muted">总数</th>
                <th className="px-3 py-2 text-right text-xs font-semibold text-text-muted">通过</th>
                <th className="px-3 py-2 text-right text-xs font-semibold text-text-muted">拦截</th>
                <th className="px-3 py-2 text-right text-xs font-semibold text-text-muted">警示</th>
              </tr>
            </thead>
            <tbody>
              {warehouseZones.map((zone, i) => (
                <tr key={i} className="border-b border-border-light/30 transition-colors hover:bg-primary">
                  <td className="px-3 py-2.5 text-xs font-medium text-text-primary">{zone.zone}</td>
                  <td className="px-3 py-2.5 text-right text-xs font-data text-text-primary">{zone.total}</td>
                  <td className="px-3 py-2.5 text-right text-xs font-data text-success">{zone.pass}</td>
                  <td className="px-3 py-2.5 text-right text-xs font-data text-danger">{zone.intercept}</td>
                  <td className="px-3 py-2.5 text-right text-xs font-data text-warning">{zone.alert}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="flex items-center gap-2 rounded-lg border border-warning/30 bg-warning/5 px-4 py-3">
        <Info className="h-4 w-4 text-warning" />
        <p className="text-xs text-warning">
          数据来自样本，不代表实时计算。AI对照数据基于历史抽检样本统计，实际生产环境数据可能有所不同。
        </p>
      </div>
    </div>
  );
};

export default AdminDashboard;
