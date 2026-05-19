import type { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bot,
  TrendingUp,
  AlertCircle,
  ClipboardList,
  BarChart3,
  SlidersHorizontal,
  Truck,
  ShieldAlert,
  FileText,
  Video,
  Bell,
  Zap,
  ArrowRight,
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { StatCard } from '@/components/admin/StatCard';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const quickLinks = [
  { icon: Bot, label: 'Agent台', path: '/admin/agents' },
  { icon: ClipboardList, label: '工单', path: '/admin/workorders' },
  { icon: BarChart3, label: '看板', path: '/admin/dashboard' },
  { icon: SlidersHorizontal, label: '规则', path: '/admin/rules' },
  { icon: Truck, label: '供应商', path: '/admin/suppliers' },
  { icon: ShieldAlert, label: '隔离区', path: '/admin/quarantine' },
  { icon: FileText, label: '索赔', path: '/admin/claims' },
  { icon: Video, label: '视频', path: '/admin/videoanalysis' },
];

const statusData = [
  { name: '通过', value: 22, color: '#22C55E' },
  { name: '拦截', value: 3, color: '#DC2626' },
  { name: '警示', value: 1, color: '#D97706' },
  { name: '处理中', value: 2, color: '#3B82F6' },
];

const recentWorkOrders = [
  { id: 'WO-2024-0032', type: '收货拦截', status: '处理中', time: '10:24', handler: '王主管' },
  { id: 'WO-2024-0031', type: '标签缺失', status: '待处理', time: '10:18', handler: '—' },
  { id: 'WO-2024-0030', type: '外观缺陷', status: '已完结', time: '09:45', handler: '李质检' },
  { id: 'WO-2024-0029', type: '库存差异', status: '处理中', time: '09:30', handler: '巡检员-王' },
  { id: 'WO-2024-0028', type: '多模态异常', status: '待处理', time: '09:15', handler: '安全主管-赵' },
];

const agentAlerts = [
  { id: 'AE-001', msg: '发动机线束型号不符', status: '待人工确认' as const },
  { id: 'AE-004', msg: '丁腈手套标签缺失', status: '待人工确认' as const },
  { id: '江南华盛', msg: '近7日第3次型号异常，建议提高关注', status: '高风险' as const, isSupplier: true },
];

export const AdminHome: FC = () => {
  const navigate = useNavigate();
  const { agentEvents } = useData();

  const pendingConfirm = agentEvents.filter(e => e.status === '待人工确认');
  const l1Count = pendingConfirm.filter(e => e.detectLevel === 'L1').length;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <nav className="mb-1 flex items-center gap-1 text-xs text-text-muted">
            <span>工作台</span>
            <span>/</span>
            <span className="text-text-secondary">首页</span>
          </nav>
          <h1 className="text-lg font-semibold text-text-primary">首页工作台</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Bell className="h-5 w-5 text-text-secondary" />
            <span className="absolute -right-1 -top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-danger text-[8px] font-bold text-white">
              3
            </span>
          </div>
          <span className="text-xs text-text-muted">admin@zhijian</span>
        </div>
      </div>

      {/* Row 1: Three stat cards */}
      <div className="mb-6 grid grid-cols-3 gap-6">
        {/* Agent Today Reminders */}
        <div className="rounded-lg bg-gray-100 p-5">
          <div className="mb-3 flex items-center gap-2">
            <Bot className="h-4 w-4 text-info" />
            <h3 className="text-sm font-semibold text-text-primary">Agent今日提醒</h3>
            <div className="ml-auto h-2 w-2 animate-pulse rounded-full bg-info" />
          </div>
          <div className="space-y-2.5">
            {agentAlerts.map((alert) => (
              <div
                key={alert.id}
                className="flex items-center justify-between rounded-md bg-[#F1F5F9]/60 px-3 py-2"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-data text-[10px] font-bold text-info">{alert.id}</span>
                    <span className="truncate text-xs text-text-secondary">{alert.msg}</span>
                  </div>
                </div>
                <StatusBadge
                  status={alert.status}
                  className="ml-2 shrink-0"
                />
              </div>
            ))}
          </div>
          <button
            onClick={() => navigate('/admin/agents')}
            className="mt-3 flex items-center gap-1 text-xs text-info hover:underline"
          >
            查看全部 <ArrowRight className="h-3 w-3" />
          </button>
        </div>

        {/* Today Intercept Value */}
        <StatCard
          label="今日拦截价值"
          value="¥23.6万"
          subtitle="较昨日 +12.3%"
          color="accent"
          trend="up"
          trendValue="拦截20起"
          icon={<TrendingUp className="h-5 w-5 text-white" />}
        />

        {/* Pending Human Confirm */}
        <div className="rounded-lg bg-gray-100 p-5">
          <div className="mb-3 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-warning" />
            <h3 className="text-sm font-semibold text-text-primary">待人工确认建议</h3>
          </div>
          <p className="text-3xl font-bold text-warning font-data">
            {pendingConfirm.length}
          </p>
          <p className="mt-1 text-xs text-text-muted">
            其中 L1 拦截 <span className="font-bold text-danger">{l1Count}</span> 件
          </p>
          <div className="mt-3 space-y-1.5">
            {pendingConfirm.slice(0, 2).map((event) => (
              <div
                key={event.eventNo}
                className="flex items-center justify-between rounded-md bg-[#F1F5F9]/60 px-3 py-2"
              >
                <span className="text-xs text-text-secondary">{event.anomalyType}</span>
                <span className="text-[10px] font-bold text-info">{event.eventNo}</span>
              </div>
            ))}
          </div>
          <button
            onClick={() => navigate('/admin/workorders')}
            className="mt-3 flex items-center gap-1 text-xs text-info hover:underline"
          >
            去处理 <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Row 2: Quick Links */}
      <div className="mb-6">
        <h3 className="mb-3 text-sm font-semibold text-text-primary">快捷入口 + 今日快报</h3>
        <div className="flex gap-3">
          <div className="flex flex-1 gap-3">
            {quickLinks.map((link) => (
              <button
                key={link.path}
                onClick={() => navigate(link.path)}
                className="flex h-[72px] w-[80px] flex-col items-center justify-center gap-1.5 rounded-lg bg-gray-100 text-text-secondary transition-all duration-150 hover:-translate-y-0.5 hover:bg-border-light hover:text-text-primary active:scale-95"
              >
                <link.icon className="h-5 w-5" />
                <span className="text-[11px]">{link.label}</span>
              </button>
            ))}
          </div>
          <div className="w-[280px] rounded-lg bg-gray-100 p-4">
            <div className="mb-2 flex items-center gap-2">
              <Zap className="h-3.5 w-3.5 text-warning" />
              <span className="text-xs font-semibold text-text-primary">今日快报</span>
            </div>
            <div className="space-y-1.5">
              <p className="text-[11px] text-text-secondary">· 今日拦截 <span className="font-bold text-warning">20起</span>，价值 <span className="font-bold text-warning">¥23.6万</span></p>
              <p className="text-[11px] text-text-secondary">· Agent处理建议 <span className="font-bold text-info">47条</span>，采纳率 89.4%</p>
              <p className="text-[11px] text-text-secondary">· 供应商 <span className="font-bold text-danger">江南华盛</span> 连续异常预警</p>
              <p className="text-[11px] text-text-secondary">· Station PKG-01 收货检测正常</p>
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Real-time data */}
      <div className="mb-6 grid grid-cols-3 gap-6">
        {/* Left: Real-time detection feed */}
        <div className="col-span-2 rounded-lg bg-gray-100 p-5">
          <div className="mb-3 flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-success" />
            </span>
            <h3 className="text-sm font-semibold text-text-primary">实时检测动态</h3>
            <span className="ml-auto text-[10px] text-text-muted">Station PKG-01 在线</span>
          </div>
          <div className="space-y-1">
            {[
              { time: '10:32:15', order: 'PKG-2024-0088', status: '通过', station: 'PKG-01' },
              { time: '10:30:42', order: 'PKG-2024-0087', status: '拦截', station: 'PKG-01' },
              { time: '10:28:18', order: 'PKG-2024-0086', status: '警示', station: 'PKG-02' },
              { time: '10:25:55', order: 'PKG-2024-0085', status: '通过', station: 'PKG-01' },
              { time: '10:23:30', order: 'PKG-2024-0084', status: '通过', station: 'PKG-03' },
              { time: '10:21:08', order: 'PKG-2024-0083', status: 'L2', station: 'PKG-01' },
              { time: '10:18:45', order: 'PKG-2024-0082', status: '通过', station: 'PKG-01' },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-3 border-b border-border-light/30 px-3 py-2 transition-colors hover:bg-primary"
              >
                <span className="w-16 text-[10px] text-text-muted font-data">{item.time}</span>
                <span className="w-28 text-xs text-text-primary font-data">{item.order}</span>
                <span className="w-12">
                  {item.status === '通过' && <StatusBadge status="通过" />}
                  {item.status === '拦截' && <StatusBadge status="L1" />}
                  {item.status === '警示' && <StatusBadge status="L2" />}
                  {item.status === 'L2' && <StatusBadge status="L2" />}
                </span>
                <span className="text-[10px] text-text-muted">{item.station}</span>
              </div>
            ))}
          </div>
          <button className="mt-2 text-xs text-info hover:underline">查看全部</button>
        </div>

        {/* Right: Status Distribution Pie */}
        <div className="rounded-lg bg-gray-100 p-5">
          <h3 className="mb-4 text-sm font-semibold text-text-primary">今日状态分布</h3>
          <div className="relative h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  dataKey="value"
                  stroke="none"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-bold text-text-primary font-data">28</span>
              <span className="text-[10px] text-text-muted">总数</span>
            </div>
          </div>
          <div className="mt-3 space-y-1.5">
            {statusData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="flex-1 text-xs text-text-secondary">{item.name}</span>
                <span className="text-xs font-bold text-text-primary font-data">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 4: Recent work orders table */}
      <div className="rounded-lg bg-gray-100 p-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-text-primary">最近工单</h3>
          <button
            onClick={() => navigate('/admin/workorders')}
            className="flex items-center gap-1 text-xs text-info hover:underline"
          >
            查看全部 <ArrowRight className="h-3 w-3" />
          </button>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border-light">
              {['工单号', '类型', '状态', '创建时间', '处理人'].map((h) => (
                <th key={h} className="px-3 py-2 text-left text-xs font-semibold text-text-muted">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {recentWorkOrders.map((wo) => (
              <tr
                key={wo.id}
                className="border-b border-border-light/30 transition-colors hover:bg-primary"
              >
                <td className="px-3 py-2 text-xs font-data text-text-primary">{wo.id}</td>
                <td className="px-3 py-2 text-xs text-text-secondary">{wo.type}</td>
                <td className="px-3 py-2">
                  <StatusBadge status={wo.status as '处理中' | '待处理' | '已完结'} />
                </td>
                <td className="px-3 py-2 text-xs text-text-muted font-data">{wo.time}</td>
                <td className="px-3 py-2 text-xs text-text-secondary">{wo.handler}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminHome;
