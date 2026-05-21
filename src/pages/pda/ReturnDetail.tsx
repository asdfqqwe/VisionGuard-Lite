import type { FC } from 'react';
import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  CheckCircle,
  ClipboardCheck,
  Database,
  FileText,
  PackageCheck,
  ScanLine,
  Tag,
} from 'lucide-react';
import { returnInboundOrders } from '@/data/mockData';
import { cn } from '@/lib/utils';

const ReturnDetail: FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const returnNo = (location.state as { returnNo?: string } | null)?.returnNo || 'RT-001';
  const order = useMemo(
    () => returnInboundOrders.find((item) => item.returnNo === returnNo) ?? returnInboundOrders[0],
    [returnNo],
  );
  const [activeStep, setActiveStep] = useState('条码绑定');
  const [confirmed, setConfirmed] = useState(false);

  const steps = [
    {
      key: '单据审核',
      icon: ClipboardCheck,
      status: order.auditStatus,
      tone: order.auditStatus === '已通过' ? 'success' : 'warning',
      desc: `${order.workshop} · ${order.reason}`,
    },
    {
      key: '条码绑定',
      icon: ScanLine,
      status: order.checks.barcode,
      tone: order.items.every((item) => item.bindStatus === '已重绑') ? 'success' : 'warning',
      desc: '旧码作废，新码绑定物料',
    },
    {
      key: '标签复检',
      icon: Tag,
      status: order.checks.label,
      tone: order.items.some((item) => item.labelStatus !== '完整') ? 'warning' : 'success',
      desc: '完整性、遮挡、磨损',
    },
    {
      key: 'OCR复核',
      icon: FileText,
      status: order.checks.ocr,
      tone: order.items.some((item) => item.ocrStatus === '待复核') ? 'warning' : 'success',
      desc: '料号、批次、数量、供应商',
    },
    {
      key: '分类入库',
      icon: Database,
      status: order.checks.storage,
      tone: 'success',
      desc: '生成上架任务和目标库位',
    },
  ];

  const active = steps.find((step) => step.key === activeStep) ?? steps[1];

  const renderStepDetail = () => {
    if (active.key === '单据审核') {
      return (
        <div className="space-y-2">
          {order.auditTimeline.map((item) => (
            <div key={`${item.role}-${item.time}`} className="flex items-center gap-2 rounded bg-white px-3 py-2">
              <span className="font-data text-[11px] text-text-muted">{item.time}</span>
              <span className="w-12 text-[11px] text-info">{item.role}</span>
              <span className="flex-1 text-xs text-text-primary">{item.action}</span>
            </div>
          ))}
        </div>
      );
    }

    if (active.key === '条码绑定') {
      return (
        <div className="space-y-2">
          {order.items.map((item) => (
            <div key={item.id} className="rounded bg-white px-3 py-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-primary">{item.materialName}</span>
                <span
                  className={cn(
                    'rounded px-2 py-0.5 text-[11px]',
                    item.bindStatus === '已重绑' ? 'bg-success/15 text-success' : 'bg-warning/15 text-warning',
                  )}
                >
                  {item.bindStatus}
                </span>
              </div>
              <div className="mt-1 flex items-center gap-2 text-[11px] text-text-muted">
                <span className="font-data line-through">{item.oldBarcode}</span>
                <span>→</span>
                <span className="font-data text-info">{item.newBarcode}</span>
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (active.key === '标签复检') {
      return (
        <div className="space-y-2">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between rounded bg-white px-3 py-2">
              <span className="text-xs text-text-primary">{item.materialName}</span>
              <span
                className={cn(
                  'rounded px-2 py-0.5 text-[11px]',
                  item.labelStatus === '完整' ? 'bg-success/15 text-success' : 'bg-warning/15 text-warning',
                )}
              >
                {item.labelStatus}
              </span>
            </div>
          ))}
        </div>
      );
    }

    if (active.key === 'OCR复核') {
      const fields = ['料号', '批次', '数量', '供应商', '退料原因', '车间', '旧码', '新码'];
      return (
        <div className="grid grid-cols-2 gap-2">
          {fields.map((field, index) => {
            const warn = field === '批次' && order.items.some((item) => item.ocrStatus === '待复核');
            return (
              <div key={field} className="flex items-center justify-between rounded bg-white px-3 py-2">
                <span className="text-xs text-text-primary">{field}</span>
                <span className={cn('text-xs font-semibold', warn ? 'text-warning' : 'text-success')}>
                  {warn ? '待确认' : index < 6 ? '匹配' : '已读'}
                </span>
              </div>
            );
          })}
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {order.items.map((item) => (
          <div key={item.id} className="rounded bg-white px-3 py-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-text-primary">{item.materialName}</span>
              <span className="font-data text-[11px] text-info">{item.targetLocation}</span>
            </div>
            <div className="mt-1 flex items-center justify-between text-[11px] text-text-muted">
              <span>{item.category}</span>
              <span>
                {item.actualQty}/{item.expectedQty} {item.unit}
              </span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="h-full bg-primary px-4 pt-3 pb-4">
      {/* Header */}
      <div className="rounded-lg bg-white p-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="font-data text-sm font-semibold text-info">{order.returnNo}</div>
            <div className="mt-1 text-sm text-text-primary">{order.workshop}退料</div>
            <div className="mt-1 text-xs text-text-muted">退料原因：{order.reason}</div>
          </div>
          <span className="rounded bg-warning/15 px-2 py-1 text-[11px] font-semibold text-warning">
            {order.auditStatus}
          </span>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          <div className="rounded bg-[#F1F5F9] px-2 py-1.5">
            <p className="text-[10px] text-text-muted">复检</p>
            <p className="mt-0.5 text-[11px] font-semibold text-info">{order.stationStatus}</p>
          </div>
          <div className="rounded bg-[#F1F5F9] px-2 py-1.5">
            <p className="text-[10px] text-text-muted">数量</p>
            <p className="mt-0.5 font-data text-[11px] text-text-primary">{order.checks.visualCount}</p>
          </div>
          <div className="rounded bg-[#F1F5F9] px-2 py-1.5">
            <p className="text-[10px] text-text-muted">入库</p>
            <p className="mt-0.5 text-[11px] font-semibold text-success">
              {confirmed ? '已确认' : order.inboundStatus}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <button
          onClick={() => navigate('/station/return-inbound?scenario=production-return')}
          className="flex h-10 items-center justify-center gap-1.5 rounded bg-info text-xs font-semibold text-white"
        >
          <ScanLine className="h-4 w-4" />
          送 Station 复检
        </button>
        <button
          onClick={() => setConfirmed(true)}
          className="flex h-10 items-center justify-center gap-1.5 rounded bg-success text-xs font-semibold text-white"
        >
          <PackageCheck className="h-4 w-4" />
          {confirmed ? '已确认入库' : '确认入库'}
        </button>
      </div>

      <div className="mt-3 rounded-lg border border-info/25 bg-info/10 p-3">
        <p className="text-xs font-semibold text-text-primary">下一步操作</p>
        <p className="mt-1 text-[11px] leading-relaxed text-text-secondary">
          当前退料单已完成主要信息核对。若要展示视觉复检，请点击“送 Station 复检”；若作为 PDA 端演示，可直接点击“确认入库”。
        </p>
      </div>

      <div className="mt-4">
        <h3 className="mb-2 text-sm font-semibold text-text-primary">退料入库处理</h3>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {steps.map((step) => {
            const Icon = step.icon;
            const selected = activeStep === step.key;
            return (
              <button
                key={step.key}
                onClick={() => setActiveStep(step.key)}
                className={cn(
                  'flex h-[62px] w-[92px] shrink-0 flex-col items-center justify-center rounded-lg border text-center transition-all',
                  selected
                    ? 'border-info bg-info/10 text-info'
                    : 'border-border bg-white text-text-muted',
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="mt-1 text-[10px] font-medium">{step.key}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-3 rounded-lg bg-[#F1F5F9] p-3">
        <div className="mb-2 flex items-start justify-between gap-2">
          <div>
            <h3 className="text-sm font-semibold text-text-primary">{active.key}</h3>
            <p className="mt-0.5 text-[11px] text-text-muted">{active.desc}</p>
          </div>
          <span
            className={cn(
              'rounded px-2 py-0.5 text-[11px] font-semibold',
              active.tone === 'success' ? 'bg-success/15 text-success' : 'bg-warning/15 text-warning',
            )}
          >
            {active.status}
          </span>
        </div>
        {renderStepDetail()}
      </div>

      <div className="mt-3 rounded-lg border border-info/20 bg-info/10 p-3">
        <div className="flex items-center gap-2">
          <PackageCheck className="h-4 w-4 text-info" />
          <h3 className="text-sm font-semibold text-text-primary">三端记录</h3>
        </div>
        <div className="mt-2 space-y-1 text-[11px] text-text-secondary">
          <div className="flex justify-between">
            <span>Admin</span>
            <span className="text-warning">退料单待审核</span>
          </div>
          <div className="flex justify-between">
            <span>Station</span>
            <span className="text-info">{order.station} 复检中</span>
          </div>
          <div className="flex justify-between">
            <span>PDA</span>
            <span className="text-success">可执行扫码绑定与入库</span>
          </div>
        </div>
      </div>

      {/* Agent suggestion */}
      <div className="mt-3 rounded-md border-l-[3px] border-l-info bg-white p-3">
        <div className="flex items-start gap-2">
          {order.items.some((item) => item.ocrStatus === '待复核' || item.bindStatus === '待重绑') ? (
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
          ) : (
            <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-success" />
          )}
          <div>
            <span className="text-xs font-semibold text-info">Agent建议：</span>
            <p className="mt-1 text-xs text-text-secondary">
              退料件数一致，建议先完成雨刮电机新码采集，再把发动机线束放入临时位等待批次人工确认，其余物料可分类入库。
            </p>
          </div>
        </div>
      </div>

      {confirmed && (
        <div className="mt-3 rounded-lg bg-success/15 p-3 text-xs text-success">
          已生成上架任务 PUT-RT-001，并把退料入库记录同步给 Admin。
        </div>
      )}

      <div className="mt-3 rounded-lg bg-white p-3">
        <button
          onClick={() => navigate('/pda/putaway/task', { state: { fromReturn: true, returnNo: order.returnNo } })}
          className="flex w-full items-center justify-between text-left"
        >
          <div>
            <p className="text-sm font-semibold text-text-primary">查看分类上架任务</p>
            <p className="mt-0.5 text-[11px] text-text-muted">PUT-RT-001 · 退料复检通过后生成</p>
          </div>
          <Database className="h-5 w-5 text-info" />
        </button>
      </div>

      {/* Bottom Actions */}
      <div className="mt-4 flex gap-3">
        <button
          onClick={() => navigate('/pda/return/scan')}
          className="flex h-11 flex-1 items-center justify-center rounded border border-border bg-white text-sm text-text-secondary"
        >
          返回
        </button>
        <button
          onClick={() => setConfirmed(true)}
          className="flex h-11 flex-1 items-center justify-center rounded bg-accent-gradient text-sm font-semibold text-white"
        >
          {confirmed ? '已确认' : '确认入库'}
        </button>
      </div>
    </div>
  );
};

export default ReturnDetail;
