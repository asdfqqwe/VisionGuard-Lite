import type { FC } from 'react';
import { useState } from 'react';
import {
  Truck,
  AlertTriangle,
  Eye,
  ClipboardList,
  Shield,
  TrendingUp,
  BarChart3,
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { PageHeader } from '@/components/admin/PageHeader';
import { StatusBadge } from '@/components/admin/StatusBadge';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const trendData = [
  { month: '1月', 江南华盛: 2.1, 北方能源: 1.5, 精工汽配: 0.8, 环球物流: 0.3 },
  { month: '2月', 江南华盛: 2.5, 北方能源: 1.8, 精工汽配: 0.6, 环球物流: 0.5 },
  { month: '3月', 江南华盛: 3.8, 北方能源: 2.2, 精工汽配: 1.0, 环球物流: 0.4 },
];

const categoryData = [
  { name: '关键零部件', value: 45, color: '#3B82F6' },
  { name: '标准包装物资', value: 30, color: '#22C55E' },
  { name: '低风险日用品', value: 15, color: '#EAB308' },
  { name: '特殊库物资', value: 10, color: '#DC2626' },
];

const similarAnomalies = [
  { type: '型号不符', supplier: '江南华盛', count: 3, recent: '2024-03-15' },
  { type: '标签缺失', supplier: '精工汽配', count: 2, recent: '2024-03-12' },
  { type: '多模态异常', supplier: '北方能源', count: 1, recent: '2024-03-10' },
  { type: '库存差异', supplier: '环球物流', count: 1, recent: '2024-03-08' },
];

export const AdminSuppliers: FC = () => {
  const { suppliers } = useData();
  const [, setSelectedSupplier] = useState(suppliers[0]);

  const jiangnan = suppliers.find((s) => s.supplierName === '江南华盛');

  return (
    <div className="p-6">
      <PageHeader title="供应商分析" breadcrumbs={[{ label: '配置' }, { label: '供应商分析' }]} />

      {/* KPI Cards */}
      <div className="mb-6 grid grid-cols-3 gap-4">
        <div className="rounded-lg bg-gray-100 p-5">
          <div className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-info" />
            <span className="text-2xl font-bold text-text-primary font-data">{suppliers.length}</span>
          </div>
          <p className="mt-1 text-xs text-text-muted">合作供应商</p>
        </div>
        <div className="rounded-lg bg-gray-100 p-5">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            <span className="text-2xl font-bold text-warning font-data">3.2%</span>
          </div>
          <p className="mt-1 text-xs text-text-muted">平均缺陷率</p>
        </div>
        <div className="rounded-lg bg-gray-100 p-5">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-danger" />
            <span className="text-lg font-bold text-danger">{jiangnan?.supplierName || '江南华盛'}</span>
          </div>
          <p className="mt-1 text-xs text-text-muted">缺陷率最高 · {jiangnan?.anomalyIn7Days || 3}次/7日</p>
        </div>
      </div>

      {/* Supplier Ranking Table */}
      <div className="mb-6 rounded-lg bg-gray-100 p-5">
        <h3 className="mb-4 text-sm font-semibold text-text-primary">异常率排名</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border-light">
              <th className="px-3 py-2 text-left text-xs font-semibold text-text-muted">排名</th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-text-muted">供应商</th>
              <th className="px-3 py-2 text-right text-xs font-semibold text-text-muted">送货次数</th>
              <th className="px-3 py-2 text-right text-xs font-semibold text-text-muted">缺陷率</th>
              <th className="px-3 py-2 text-right text-xs font-semibold text-text-muted">L1拦截</th>
              <th className="px-3 py-2 text-right text-xs font-semibold text-text-muted">L2警示</th>
              <th className="px-3 py-2 text-center text-xs font-semibold text-text-muted">评级</th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-text-muted">操作</th>
            </tr>
          </thead>
          <tbody>
            {suppliers
              .sort((a, b) => b.anomalyCount / b.totalDeliveries - a.anomalyCount / a.totalDeliveries)
              .map((supplier, i) => {
                const defectRate = ((supplier.anomalyCount / supplier.totalDeliveries) * 100).toFixed(1);
                const l1Count = supplier.anomalyIn7Days;
                const isJiangnan = supplier.supplierName === '江南华盛';
                return (
                  <tr
                    key={supplier.supplierCode}
                    className={`border-b border-border-light/30 transition-colors hover:bg-primary ${
                      isJiangnan ? 'bg-danger/5' : ''
                    }`}
                  >
                    <td className="px-3 py-3 text-xs font-data text-text-muted">{i + 1}</td>
                    <td className="px-3 py-3 text-xs font-medium text-text-primary">
                      {supplier.supplierName}
                      {isJiangnan && (
                        <span className="ml-2 rounded bg-danger px-1.5 py-0.5 text-[9px] font-bold text-white">
                          异常高发
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-right text-xs font-data text-text-primary">
                      {supplier.totalDeliveries}
                    </td>
                    <td className="px-3 py-3 text-right text-xs font-data">
                      <span className={Number(defectRate) > 3 ? 'text-danger' : Number(defectRate) > 1.5 ? 'text-warning' : 'text-success'}>
                        {defectRate}%
                      </span>
                    </td>
                    <td className="px-3 py-3 text-right text-xs font-data text-danger">{l1Count}</td>
                    <td className="px-3 py-3 text-right text-xs font-data text-warning">
                      {supplier.anomalyCount - l1Count}
                    </td>
                    <td className="px-3 py-3 text-center">
                      <StatusBadge status={supplier.riskLevel} />
                    </td>
                    <td className="px-3 py-3">
                      <button
                        onClick={() => setSelectedSupplier(supplier)}
                        className="rounded p-1 text-text-muted transition-colors hover:bg-primary hover:text-info"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      {/* Charts Row */}
      <div className="mb-6 grid grid-cols-2 gap-6">
        {/* Material Category Distribution */}
        <div className="rounded-lg bg-gray-100 p-5">
          <h3 className="mb-4 text-sm font-semibold text-text-primary">物资分类分布</h3>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" outerRadius={75} dataKey="value" stroke="none" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {categoryData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '6px', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 30-day Trend */}
        <div className="rounded-lg bg-gray-100 p-5">
          <h3 className="mb-4 text-sm font-semibold text-text-primary">近30天缺陷率趋势</h3>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="month" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} unit="%" />
                <Tooltip contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '6px', fontSize: '12px' }} />
                <Line type="monotone" dataKey="江南华盛" stroke="#DC2626" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="北方能源" stroke="#D97706" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="精工汽配" stroke="#22C55E" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="环球物流" stroke="#3B82F6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Similar Anomalies + Suggested Actions */}
      <div className="mb-6 grid grid-cols-2 gap-6">
        {/* Similar Anomaly List */}
        <div className="rounded-lg bg-gray-100 p-5">
          <h3 className="mb-4 text-sm font-semibold text-text-primary">相似异常列表</h3>
          <div className="space-y-2">
            {similarAnomalies.map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-md bg-gray-100/40 px-3 py-2"
              >
                <div>
                  <p className="text-xs font-medium text-text-primary">{item.type}</p>
                  <p className="text-[10px] text-text-muted">{item.supplier} · 最近 {item.recent}</p>
                </div>
                <div className="flex items-center gap-1">
                  <BarChart3 className="h-3.5 w-3.5 text-text-muted" />
                  <span className="text-xs font-data text-text-secondary">{item.count}次</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Suggested Actions */}
        <div className="rounded-lg bg-gray-100 p-5">
          <h3 className="mb-4 text-sm font-semibold text-text-primary">建议动作</h3>
          <div className="space-y-3">
            {jiangnan && jiangnan.anomalyIn7Days >= 3 && (
              <div className="rounded-md border-l-[3px] border-l-danger bg-danger/5 p-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-danger" />
                  <p className="text-xs font-semibold text-danger">建议提高关注</p>
                </div>
                <p className="mt-1 text-[11px] text-text-secondary">
                  供应商【江南华盛】近7日第{jiangnan.anomalyIn7Days}次型号异常，建议提高关注等级
                </p>
              </div>
            )}
            <div className="rounded-md border-l-[3px] border-l-warning bg-warning/5 p-3">
              <div className="flex items-center gap-2">
                <ClipboardList className="h-4 w-4 text-warning" />
                <p className="text-xs font-semibold text-warning">建议复查最近批次</p>
              </div>
              <p className="mt-1 text-[11px] text-text-secondary">
                对该供应商最近3个批次进行全面复查
              </p>
            </div>
            <div className="rounded-md border-l-[3px] border-l-info bg-info/5 p-3">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-info" />
                <p className="text-xs font-semibold text-info">建议将某规则从预警改为拦截</p>
              </div>
              <p className="mt-1 text-[11px] text-text-secondary">
                针对型号不符规则，建议从L2警示升级为L1强拦截
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSuppliers;
