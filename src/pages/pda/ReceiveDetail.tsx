import type { FC } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, AlertTriangle, XCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { deliveryOrderPO007 } from '@/data/mockData';
import type { DeliveryItem } from '@/data/mockData';
import { cn } from '@/lib/utils';

const ReceiveDetail: FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const orderNo = (location.state as { orderNo?: string } | null)?.orderNo || 'PO-007';
  const [expanded, setExpanded] = useState(false);
  const [fieldReviewed, setFieldReviewed] = useState(false);

  const order = deliveryOrderPO007;
  const anomalousItems = order.items.filter(i => i.status !== '通过');
  const firstAnomaly = anomalousItems[0];

  const getResultCardType = (item?: DeliveryItem) => {
    if (!item) return 'pass' as const;
    if (item.detectLevel === 'L1') return 'danger' as const;
    return 'warning' as const;
  };

  const getBadge = (item?: DeliveryItem) => {
    if (!item) return '通过' as const;
    if (item.detectLevel === 'L1') return 'L1拦截' as const;
    if (item.detectLevel === 'L2') return 'L2警示' as const;
    if (item.status === '标签缺失') return '标签缺失' as const;
    return '不清晰' as const;
  };

  const getIcon = (item?: DeliveryItem) => {
    if (!item) return <CheckCircle className="h-6 w-6 text-success" />;
    if (item.detectLevel === 'L1') return <XCircle className="h-6 w-6 text-danger" />;
    return <AlertTriangle className="h-6 w-6 text-warning" />;
  };

  const getTitle = (item?: DeliveryItem) => {
    if (!item) return '收货通过';
    if (item.detectLevel === 'L1') return '收货拦截';
    return '收货警示';
  };

  const getSuggestion = (item?: DeliveryItem) => {
    if (!item) return '该批次AI检测全部通过，可正常入库。建议按标准流程上架。';
    if (item.detectLevel === 'L1') return '检测到严重外包装破损（3件），已自动通知质检主管。请暂不移交入库。';
    return '发现1件标签轻微磨损，建议人工复核后确认是否接收。';
  };

  const resultCardType = getResultCardType(firstAnomaly);
  const badge = getBadge(firstAnomaly);
  const icon = getIcon(firstAnomaly);
  const title = getTitle(firstAnomaly);
  const suggestion = getSuggestion(firstAnomaly);

  return (
    <div className="h-full bg-primary px-4 pt-3 pb-4">
      {/* Result Card */}
      <div className="rounded-lg border border-border bg-white">
        <div className={cn(
          'h-1 rounded-t-lg',
          resultCardType === 'pass' ? 'bg-success' : resultCardType === 'danger' ? 'bg-danger' : 'bg-warning'
        )} />
        <div className="p-3">
          <div className="flex items-center gap-2">
            {icon}
            <h2 className={cn('text-lg font-bold',
              resultCardType === 'pass' ? 'text-success' : resultCardType === 'danger' ? 'text-danger' : 'text-warning'
            )}>{title}</h2>
            {/* Status badge */}
            <span className={cn('ml-auto inline-flex items-center justify-center rounded px-2 py-0.5 text-xs font-bold text-white',
              badge === '通过' ? 'bg-success' : badge === 'L1拦截' ? 'bg-l1-badge' : badge === 'L2警示' ? 'bg-l2-badge' : badge === '标签缺失' ? 'bg-l1-badge' : 'bg-warning'
            )}>
              {badge === 'L1拦截' ? 'L1' : badge === 'L2警示' ? 'L2' : badge}
            </span>
          </div>
        </div>
      </div>

      {/* Delivery Info */}
      <div className="mt-3">
        <h3 className="mb-2 text-sm font-semibold text-text-primary">运单信息</h3>
        <div className="space-y-1">
          {[
            { label: '运单号', value: orderNo === 'PO-007' ? 'PKG-2024-001247' : `PKG-2024-00${orderNo.replace('PO-', '')}` },
            { label: '来源', value: '收货台 PKG-01' },
            { label: '供应商', value: order.supplier },
            { label: '到货批次', value: firstAnomaly?.batchNo || 'L20260315A' },
            { label: '采购单', value: order.purchaseOrderNo },
            { label: '包装', value: '整托+散装' },
            { label: '检测工位', value: 'Station-03 固定相机' },
            { label: '件数', value: `${order.items.length}/${order.items.length}` },
            { label: '重量', value: '23.5kg' },
            { label: '到库时间', value: '2024-01-15 09:32' },
          ].map((row) => (
            <div key={row.label} className="flex items-center justify-between rounded bg-white px-3 py-2">
              <span className="text-[11px] text-text-muted">{row.label}</span>
              <span className={cn('text-xs text-text-primary', row.label === '运单号' && 'font-data')}>{row.value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 rounded-lg bg-white p-3">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-text-primary">条码与 OCR 抽检</h3>
          <span className="rounded bg-info/10 px-2 py-0.5 text-[10px] text-info">可人工修正</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: '托码', value: 'PLT-20260315-007' },
            { label: '箱码', value: 'CTN-007-001~006' },
            { label: '配件料号', value: 'BPR-FX-2024' },
            { label: '奇瑞料号', value: 'CHERY-BPR-FX' },
            { label: '生产日期', value: '2026-03-15' },
            { label: '有效期', value: '2028-03-15' },
          ].map((row) => (
            <div key={row.label} className="rounded bg-primary px-2 py-1.5">
              <p className="text-[10px] text-text-muted">{row.label}</p>
              <p className="mt-0.5 truncate font-data text-[11px] text-text-primary">{row.value}</p>
            </div>
          ))}
        </div>
        <button
          onClick={() => setFieldReviewed(true)}
          className={cn(
            'mt-3 h-9 w-full rounded text-xs font-semibold',
            fieldReviewed ? 'bg-success/15 text-success' : 'bg-info text-white',
          )}
        >
          {fieldReviewed ? '字段已人工确认' : '人工确认字段'}
        </button>
      </div>

      {/* Item Details - Collapsible */}
      <div className="mt-3">
        <button onClick={() => setExpanded(!expanded)} className="mb-2 flex w-full items-center justify-between">
          <h3 className="text-sm font-semibold text-text-primary">货品明细</h3>
          {expanded ? <ChevronUp className="h-4 w-4 text-text-muted" /> : <ChevronDown className="h-4 w-4 text-text-muted" />}
        </button>
        {(expanded ? order.items : order.items.slice(0, 3)).map((item, idx) => (
          <div key={item.id} className="flex items-center justify-between rounded bg-white px-3 py-2 mb-1">
            <div className="flex items-center gap-2">
              <span className="w-5 text-[11px] text-text-muted">{idx + 1}</span>
              <span className="text-xs text-text-primary">{item.materialName}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-data text-xs text-text-primary">{item.quantity}{item.unit}</span>
              <div className={cn('h-2 w-2 rounded-full',
                item.status === '通过' ? 'bg-success' : item.detectLevel === 'L1' ? 'bg-danger' : 'bg-warning'
              )} />
            </div>
          </div>
        ))}
      </div>

      {/* Agent Suggestion */}
      <div className="mt-3 rounded-md border-l-[3px] border-l-info bg-white p-3">
        <div className="flex items-start gap-2">
          <svg className="mt-0.5 h-4 w-4 shrink-0 text-info" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>
          <div>
            <span className="text-xs font-semibold text-info">Agent建议：</span>
            <p className="mt-0.5 text-xs leading-relaxed text-text-secondary">{suggestion}</p>
          </div>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="mt-6 flex gap-3">
        <button
          onClick={() => navigate(resultCardType === 'pass' ? '/pda/receive/scan' : '/pda/problem/handover')}
          className="flex h-11 flex-1 items-center justify-center rounded border border-border bg-white text-sm text-text-secondary active:bg-primary"
        >
          {resultCardType === 'pass' ? '重新扫描' : '移入复核区'}
        </button>
        <button
          onClick={() => navigate(resultCardType === 'danger' ? '/pda/problem/handover' : '/pda/receive/summary')}
          className={cn('flex h-11 flex-1 items-center justify-center rounded text-sm font-semibold text-white',
            resultCardType === 'pass' ? 'bg-accent-gradient' : resultCardType === 'danger' ? 'bg-danger-gradient' : 'bg-accent-gradient'
          )}
        >
          {resultCardType === 'pass' ? '确认签收' : resultCardType === 'danger' ? '隔离处理' : '整改后入库'}
        </button>
      </div>
    </div>
  );
};

export default ReceiveDetail;
