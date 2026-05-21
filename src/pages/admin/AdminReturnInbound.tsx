import type { FC } from 'react';
import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardCheck,
  Database,
  FileText,
  MonitorCheck,
  ScanLine,
  Search,
  Tag,
} from 'lucide-react';
import { PageHeader } from '@/components/admin/PageHeader';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { returnInboundOrders } from '@/data/mockData';
import { cn } from '@/lib/utils';

type AuditAction = 'none' | 'approved' | 'rejected';

const auditCards = [
  { key: '单据审核', icon: ClipboardCheck, owner: 'Admin', desc: '核对退料原因、车间、提交人、数量' },
  { key: '条码重绑', icon: ScanLine, owner: 'PDA', desc: '旧码作废，新码重新采集绑定' },
  { key: '标签复检', icon: Tag, owner: 'Station', desc: '识别破损、遮挡、磨损和可读性' },
  { key: '视觉点数', icon: MonitorCheck, owner: 'Station', desc: '实物数量和退料单数量比对' },
  { key: 'OCR 全量复核', icon: FileText, owner: 'Station', desc: '料号、批次、数量、供应商逐项复核' },
  { key: '分类入库', icon: Database, owner: 'PDA', desc: '确认库位，生成上架任务和记录' },
];

const statusTone = (status: string) => {
  if (status.includes('通过') || status.includes('已入库')) return 'text-success';
  if (status.includes('待') || status.includes('复检中')) return 'text-warning';
  return 'text-text-primary';
};

export const AdminReturnInbound: FC = () => {
  const [selectedNo, setSelectedNo] = useState(returnInboundOrders[0]?.returnNo ?? '');
  const [auditAction, setAuditAction] = useState<AuditAction>('none');
  const [searchText, setSearchText] = useState('');

  const filteredOrders = useMemo(
    () =>
      returnInboundOrders.filter((order) => {
        if (!searchText) return true;
        return (
          order.returnNo.includes(searchText) ||
          order.workshop.includes(searchText) ||
          order.reason.includes(searchText)
        );
      }),
    [searchText],
  );

  const selectedOrder =
    returnInboundOrders.find((order) => order.returnNo === selectedNo) ?? returnInboundOrders[0];

  const displayedAuditStatus =
    auditAction === 'approved'
      ? '已通过'
      : auditAction === 'rejected'
        ? '驳回'
        : selectedOrder.auditStatus;

  const totalItems = selectedOrder.items.reduce((sum, item) => sum + item.actualQty, 0);
  const pendingBarcode = selectedOrder.items.filter((item) => item.bindStatus === '待重绑').length;
  const pendingOcr = selectedOrder.items.filter((item) => item.ocrStatus === '待复核').length;

  const checkRows = [
    { label: '条码重新采集绑定', owner: 'PDA', value: selectedOrder.checks.barcode, warn: pendingBarcode > 0 },
    { label: '标签完整性复检', owner: 'Station', value: selectedOrder.checks.label, warn: selectedOrder.items.some((item) => item.labelStatus !== '完整') },
    { label: '视觉点数校对', owner: 'Station', value: selectedOrder.checks.visualCount, warn: false },
    { label: 'OCR 全量复核', owner: 'Station', value: selectedOrder.checks.ocr, warn: pendingOcr > 0 },
    { label: '分类入库存储', owner: 'PDA', value: selectedOrder.checks.storage, warn: false },
  ];

  return (
    <div className="p-6">
      <PageHeader
        title="生产退料入库"
        breadcrumbs={[{ label: '作业' }, { label: '生产退料入库' }]}
        actions={
          <button className="flex items-center gap-1.5 rounded-md bg-info px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-info/80">
            <ClipboardCheck className="h-3.5 w-3.5" />
            导出审核记录
          </button>
        }
      />

      <div className="mb-6 grid grid-cols-4 gap-4">
        {[
          { label: '待审核退料单', value: '1 单', tone: 'text-warning' },
          { label: 'Station 复检中', value: '1 单', tone: 'text-info' },
          { label: '待重绑条码', value: `${pendingBarcode} 件`, tone: pendingBarcode > 0 ? 'text-warning' : 'text-success' },
          { label: '今日退料入库', value: '41 件', tone: 'text-success' },
        ].map((item) => (
          <div key={item.label} className="rounded-lg bg-gray-100 p-4">
            <p className="text-xs text-text-muted">{item.label}</p>
            <p className={`mt-2 font-data text-2xl font-bold ${item.tone}`}>{item.value}</p>
          </div>
        ))}
      </div>

      <div className="mb-6 grid grid-cols-6 gap-3">
        {auditCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.key} className="rounded-lg bg-gray-100 p-3">
              <div className="flex items-center justify-between">
                <Icon className="h-4 w-4 text-info" />
                <span className="rounded bg-white px-2 py-0.5 text-[10px] text-text-muted">{card.owner}</span>
              </div>
              <p className="mt-2 text-xs font-semibold text-text-primary">{card.key}</p>
              <p className="mt-1 min-h-[32px] text-[11px] leading-relaxed text-text-muted">{card.desc}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-12 gap-6">
        <section className="col-span-4 rounded-lg bg-gray-100 p-4">
          <div className="mb-3 flex items-center gap-2 rounded-md bg-white px-3 py-2">
            <Search className="h-3.5 w-3.5 text-text-muted" />
            <input
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder="搜索退料单、车间、原因"
              className="flex-1 bg-transparent text-xs text-text-primary outline-none placeholder:text-text-muted"
            />
          </div>

          <div className="space-y-2">
            {filteredOrders.map((order) => {
              const selected = order.returnNo === selectedOrder.returnNo;
              return (
                <button
                  key={order.returnNo}
                  onClick={() => {
                    setSelectedNo(order.returnNo);
                    setAuditAction('none');
                  }}
                  className={cn(
                    'w-full rounded-md border-l-2 p-3 text-left transition-colors',
                    selected ? 'border-info bg-info/10' : 'border-transparent bg-white hover:bg-primary',
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-data text-xs font-bold text-info">{order.returnNo}</span>
                    <StatusBadge status={order.auditStatus} />
                  </div>
                  <p className="mt-1 text-xs text-text-primary">{order.workshop} · {order.reason}</p>
                  <div className="mt-1 flex items-center justify-between text-[10px] text-text-muted">
                    <span>{order.createdAt}</span>
                    <span>{order.station}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        <section className="col-span-8 space-y-4">
          <div className="rounded-lg bg-gray-100 p-5">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-data text-sm font-bold text-info">{selectedOrder.returnNo}</span>
                  <StatusBadge status={displayedAuditStatus} />
                  <StatusBadge status={selectedOrder.stationStatus} />
                </div>
                <h3 className="mt-2 text-lg font-semibold text-text-primary">
                  {selectedOrder.workshop}退料 · {selectedOrder.reason}
                </h3>
                <p className="mt-1 text-xs text-text-muted">
                  提交人 {selectedOrder.submitter}，{selectedOrder.createdAt} 提交，复检工位 {selectedOrder.station}
                </p>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded bg-white px-3 py-2">
                  <p className="text-[10px] text-text-muted">退料数量</p>
                  <p className="mt-1 font-data text-sm font-bold text-text-primary">{totalItems} 件</p>
                </div>
                <div className="rounded bg-white px-3 py-2">
                  <p className="text-[10px] text-text-muted">风险</p>
                  <p className="mt-1 text-sm font-bold text-warning">{selectedOrder.riskLevel}</p>
                </div>
                <div className="rounded bg-white px-3 py-2">
                  <p className="text-[10px] text-text-muted">入库</p>
                  <p className={`mt-1 text-sm font-bold ${statusTone(selectedOrder.inboundStatus)}`}>
                    {selectedOrder.inboundStatus}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-5 gap-2">
              {checkRows.map((row) => (
                <div
                  key={row.label}
                  className={cn(
                    'rounded-md border p-3',
                    row.warn ? 'border-warning/30 bg-warning/10' : 'border-success/20 bg-success/10',
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-semibold text-text-primary">{row.label}</span>
                    {row.warn ? (
                      <AlertTriangle className="h-3.5 w-3.5 text-warning" />
                    ) : (
                      <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                    )}
                  </div>
                  <p className="mt-1 text-[10px] text-text-muted">{row.owner}</p>
                  <p className="mt-2 text-[11px] leading-relaxed text-text-secondary">{row.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg bg-gray-100 p-4">
              <h3 className="mb-3 text-sm font-semibold text-text-primary">退料明细</h3>
              <div className="space-y-2">
                {selectedOrder.items.map((item) => (
                  <div key={item.id} className="rounded bg-white p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-text-primary">{item.materialName}</span>
                      <span className="font-data text-[11px] text-info">{item.actualQty}/{item.expectedQty} {item.unit}</span>
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-2 text-[11px] text-text-muted">
                      <span>新码：<span className="font-data text-text-primary">{item.newBarcode}</span></span>
                      <span>库位：<span className="font-data text-text-primary">{item.targetLocation}</span></span>
                      <span>标签：<span className={item.labelStatus === '完整' ? 'text-success' : 'text-warning'}>{item.labelStatus}</span></span>
                      <span>OCR：<span className={item.ocrStatus === '通过' ? 'text-success' : 'text-warning'}>{item.ocrStatus}</span></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg bg-gray-100 p-4">
              <h3 className="mb-3 text-sm font-semibold text-text-primary">审核记录</h3>
              <div className="space-y-2">
                {selectedOrder.auditTimeline.map((item) => (
                  <div key={`${item.role}-${item.time}`} className="flex items-center gap-3 rounded bg-white px-3 py-2">
                    <span className="font-data text-[11px] text-text-muted">{item.time}</span>
                    <span className="w-16 text-[11px] text-info">{item.role}</span>
                    <span className="flex-1 text-xs text-text-secondary">{item.action}</span>
                  </div>
                ))}
                {auditAction !== 'none' && (
                  <div className="flex items-center gap-3 rounded bg-info/10 px-3 py-2">
                    <span className="font-data text-[11px] text-text-muted">现在</span>
                    <span className="w-16 text-[11px] text-info">Admin</span>
                    <span className="flex-1 text-xs text-text-primary">
                      {auditAction === 'approved' ? '审核通过，允许 PDA 确认入库' : '审核驳回，要求车间补充说明'}
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-4 rounded-md border-l-[3px] border-l-info bg-white p-3">
                <p className="text-xs font-semibold text-info">审核建议</p>
                <p className="mt-1 text-xs leading-relaxed text-text-secondary">
                  数量一致，标签轻微磨损和 OCR 批次待确认项需要留痕。建议通过审核，但把发动机线束先入临时位，待批次确认后再转正式库位。
                </p>
              </div>

              <div className="mt-4 flex gap-3">
                <button
                  onClick={() => setAuditAction('approved')}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-md bg-success px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-success/90"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  审核通过
                </button>
                <button
                  onClick={() => setAuditAction('rejected')}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-md bg-warning px-3 py-2 text-xs font-medium text-primary-dark transition-colors hover:bg-warning/90"
                >
                  <AlertTriangle className="h-3.5 w-3.5" />
                  退回补充
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminReturnInbound;
