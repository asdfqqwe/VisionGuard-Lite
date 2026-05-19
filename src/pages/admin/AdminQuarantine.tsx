import type { FC } from 'react';
import { useState } from 'react';
import {
  ShieldAlert,
  Clock,
  Zap,
  FileText,
  ArrowRightLeft,
  AlertTriangle,
} from 'lucide-react';
import { PageHeader } from '@/components/admin/PageHeader';
import { StatusBadge } from '@/components/admin/StatusBadge';

interface QuarantineItem {
  id: string;
  orderNo: string;
  type: string;
  enterTime: string;
  hours: number;
  status: string;
  responsible: string;
  location: string;
}

const quarantineItems: QuarantineItem[] = [
  { id: 'IQ-001', orderNo: 'PKG-2024-001', type: '外观缺陷', enterTime: '01-13 09:30', hours: 52, status: '待处理', responsible: '质检员-李', location: 'Q-A01' },
  { id: 'IQ-002', orderNo: 'PKG-2024-003', type: '型号不符', enterTime: '01-14 14:20', hours: 38, status: '处理中', responsible: '收货主管-张', location: 'Q-A02' },
  { id: 'IQ-003', orderNo: 'PKG-2024-007', type: '标签缺失', enterTime: '01-15 08:00', hours: 18, status: '处理中', responsible: '收货主管-张', location: 'Q-A03' },
  { id: 'IQ-004', orderNo: 'PKG-2024-012', type: '数量异常', enterTime: '01-15 16:45', hours: 8, status: '待处理', responsible: '巡检员-王', location: 'Q-B01' },
  { id: 'IQ-005', orderNo: 'PKG-2024-015', type: '多模态异常', enterTime: '01-13 11:20', hours: 54, status: '待处理', responsible: '安全主管-赵', location: 'Q-SAFE' },
];

const getTimeColor = (hours: number) => {
  if (hours < 24) return 'text-success';
  if (hours < 48) return 'text-warning';
  return 'text-danger';
};

const getTimeBg = (hours: number) => {
  if (hours < 24) return 'bg-success/10';
  if (hours < 48) return 'bg-warning/10';
  return 'bg-danger/10';
};

export const AdminQuarantine: FC = () => {
  const [, setSelectedItem] = useState<QuarantineItem | null>(null);

  const totalCount = quarantineItems.length;
  const pendingCount = quarantineItems.filter((i) => i.status === '待处理').length;
  const overdueCount = quarantineItems.filter((i) => i.hours > 48).length;

  // Zone positions (simulated)
  const zones = [
    { id: 'Q-A01', x: 20, y: 20, item: quarantineItems[0] },
    { id: 'Q-A02', x: 55, y: 20, item: quarantineItems[1] },
    { id: 'Q-A03', x: 80, y: 45, item: quarantineItems[2] },
    { id: 'Q-B01', x: 30, y: 65, item: quarantineItems[3] },
    { id: 'Q-SAFE', x: 65, y: 70, item: quarantineItems[4] },
  ];

  return (
    <div className="p-6">
      <PageHeader title="问题件/隔离区" breadcrumbs={[{ label: '运营' }, { label: '问题件/隔离区' }]} />

      {/* Stats */}
      <div className="mb-6 grid grid-cols-3 gap-4">
        <div className="rounded-lg bg-gray-100 p-5">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-danger" />
            <span className="text-2xl font-bold text-danger font-data">{totalCount}</span>
          </div>
          <p className="mt-1 text-xs text-text-muted">隔离区件数</p>
        </div>
        <div className="rounded-lg bg-gray-100 p-5">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-warning" />
            <span className="text-2xl font-bold text-warning font-data">{pendingCount}</span>
          </div>
          <p className="mt-1 text-xs text-text-muted">待处理</p>
        </div>
        <div className="rounded-lg bg-gray-100 p-5">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-danger" />
            <span className="text-2xl font-bold text-danger font-data">{overdueCount}</span>
          </div>
          <p className="mt-1 text-xs text-text-muted">超48小时</p>
        </div>
      </div>

      {/* Zone Map */}
      <div className="mb-6 rounded-lg bg-gray-100 p-5">
        <h3 className="mb-4 text-sm font-semibold text-text-primary">隔离区分布图</h3>
        <div className="relative h-64 rounded-md bg-[#F1F5F9]">
          {/* Grid lines */}
          <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(#334155 1px, transparent 1px), linear-gradient(90deg, #334155 1px, transparent 1px)', backgroundSize: '40px 40px', opacity: 0.3 }} />
          {/* Zone markers */}
          {zones.map((zone) => {
            const timeColor = getTimeColor(zone.item.hours);
            const isOverdue = zone.item.hours > 48;
            return (
              <button
                key={zone.id}
                onClick={() => setSelectedItem(zone.item)}
                className={`absolute flex h-12 w-14 flex-col items-center justify-center rounded-md border transition-all hover:scale-110 ${
                  isOverdue ? 'border-danger bg-danger/20 animate-pulse' : 'border-border-light bg-gray-100'
                }`}
                style={{ left: `${zone.x}%`, top: `${zone.y}%`, transform: 'translate(-50%, -50%)' }}
              >
                <span className={`text-[10px] font-bold font-data ${timeColor}`}>{zone.id}</span>
                <span className="text-[9px] text-text-muted">{zone.item.hours}h</span>
              </button>
            );
          })}
          {/* Legend */}
          <div className="absolute bottom-2 right-2 rounded-md bg-gray-100/90 p-2 text-[10px]">
            <div className="flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-success" /> &lt;24h
              <span className="inline-block h-2 w-2 rounded-full bg-warning" /> 24-48h
              <span className="inline-block h-2 w-2 rounded-full bg-danger" /> &gt;48h
            </div>
          </div>
        </div>
      </div>

      {/* Problem Items Table */}
      <div className="rounded-lg bg-gray-100 p-5">
        <h3 className="mb-4 text-sm font-semibold text-text-primary">问题件列表</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border-light">
              <th className="px-3 py-2 text-left text-xs font-semibold text-text-muted">IQ编号</th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-text-muted">运单号</th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-text-muted">问题类型</th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-text-muted">入区时间</th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-text-muted">滞留时长</th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-text-muted">当前责任方</th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-text-muted">状态</th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-text-muted">操作</th>
            </tr>
          </thead>
          <tbody>
            {quarantineItems.map((item) => {
              const timeColor = getTimeColor(item.hours);
              return (
                <tr
                  key={item.id}
                  className={`border-b border-border-light/30 transition-colors hover:bg-primary ${
                    item.hours > 48 ? 'bg-danger/5' : ''
                  }`}
                >
                  <td className="px-3 py-3 font-data text-xs text-info">{item.id}</td>
                  <td className="px-3 py-3 font-data text-xs text-text-secondary">{item.orderNo}</td>
                  <td className="px-3 py-3 text-xs text-text-primary">{item.type}</td>
                  <td className="px-3 py-3 text-xs text-text-muted">{item.enterTime}</td>
                  <td className="px-3 py-3">
                    <span className={`rounded px-2 py-0.5 text-xs font-bold font-data ${getTimeBg(item.hours)} ${timeColor}`}>
                      {item.hours}h
                    </span>
                  </td>
                  <td className="px-3 py-3 text-xs text-text-secondary">{item.responsible}</td>
                  <td className="px-3 py-3">
                    <StatusBadge status={item.status as '处理中' | '待处理'} />
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-1.5">
                      <button className="rounded bg-warning/10 px-2 py-1 text-[10px] text-warning transition-colors hover:bg-warning/20">
                        <Zap className="mr-1 inline h-3 w-3" />
                        催办
                      </button>
                      <button className="rounded bg-danger/10 px-2 py-1 text-[10px] text-danger transition-colors hover:bg-danger/20">
                        <FileText className="mr-1 inline h-3 w-3" />
                        转索赔
                      </button>
                      <button className="rounded bg-info/10 px-2 py-1 text-[10px] text-info transition-colors hover:bg-info/20">
                        <ArrowRightLeft className="mr-1 inline h-3 w-3" />
                        调拨
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminQuarantine;
