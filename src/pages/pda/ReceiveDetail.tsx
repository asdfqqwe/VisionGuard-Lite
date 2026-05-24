import type { FC } from 'react';
import { useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSearchParams } from 'react-router-dom';
import { CheckCircle, AlertTriangle, XCircle, ChevronDown, ChevronUp, Loader2, MonitorCheck, PencilLine } from 'lucide-react';
import { useState } from 'react';
import { deliveryOrderPO007 } from '@/data/mockData';
import type { DeliveryItem } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { DemoStepBadge } from '@/components/shared';
import { purchaseReceiveGuide } from '@/data/purchaseReceiveGuide';

const ReceiveDetail: FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isPurchaseGuide = searchParams.get('scenario') === 'purchase-receive';
  const navState = location.state as { orderNo?: string; scannedCode?: string } | null;
  const scannedCode = navState?.scannedCode || purchaseReceiveGuide.scannedCode;
  const orderNo = navState?.orderNo || purchaseReceiveGuide.purchaseOrderNo;
  const [expanded, setExpanded] = useState(false);
  const [fieldReviewed, setFieldReviewed] = useState(!isPurchaseGuide);
  const [typedFieldChars, setTypedFieldChars] = useState(isPurchaseGuide ? 0 : Number.MAX_SAFE_INTEGER);

  const order = deliveryOrderPO007;
  const anomalousItems = order.items.filter(i => i.status !== '通过');
  const firstAnomaly = anomalousItems[0];
  const purchaseGuideItems = [
    {
      id: 'guide-scan',
      materialName: purchaseReceiveGuide.scanMaterialName,
      quantity: '50',
      unit: 'EA',
      status: '已读取',
    },
    {
      id: 'guide-ocr',
      materialName: purchaseReceiveGuide.ocrMaterialName,
      quantity: purchaseReceiveGuide.quantity,
      unit: '件',
      status: '已读取',
    },
    {
      id: 'guide-station',
      materialName: 'Station 固定相机检测',
      quantity: '待执行',
      unit: '',
      status: '待检测',
    },
  ];
  const displayItems = isPurchaseGuide ? purchaseGuideItems : order.items;

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

  const ocrRows = useMemo(() => [
    { label: '托码', value: purchaseReceiveGuide.palletCode, source: '扫码照片' },
    { label: '箱码', value: purchaseReceiveGuide.cartonCode, source: '扫码照片' },
    { label: '扫码料号', value: purchaseReceiveGuide.scanPartNo, source: '扫码照片' },
    { label: '扫码数量', value: purchaseReceiveGuide.scanQty, source: '扫码照片' },
    { label: '供应商编码', value: purchaseReceiveGuide.supplierCode, source: 'PDA 预读' },
    { label: '配件料号', value: purchaseReceiveGuide.ocrPartNo, source: 'PDA 预读' },
    { label: '批次号', value: purchaseReceiveGuide.batchNo, source: 'PDA 预读' },
    { label: '有效期', value: purchaseReceiveGuide.expirationDate, source: 'PDA 预读' },
  ], []);
  const fieldOffsets = useMemo(() => {
    let cursor = 0;
    return ocrRows.map((row) => {
      const start = cursor;
      cursor += row.value.length + 1;
      return { start, end: start + row.value.length };
    });
  }, [ocrRows]);
  const fieldCharTotal = useMemo(
    () => ocrRows.reduce((total, row) => total + row.value.length + 1, 0),
    [ocrRows],
  );
  const completedFieldCount = fieldOffsets.filter((offset) => typedFieldChars >= offset.end).length;
  const fieldsDone = !isPurchaseGuide || typedFieldChars >= fieldCharTotal;
  const resultCardType = isPurchaseGuide ? (fieldReviewed ? 'pass' : 'warning') : getResultCardType(firstAnomaly);
  const badge = isPurchaseGuide ? (fieldReviewed ? '已采集' : fieldsDone ? '待确认' : '预读中') : getBadge(firstAnomaly);
  const icon = isPurchaseGuide
    ? fieldReviewed
      ? <CheckCircle className="h-6 w-6 text-success" />
      : <Loader2 className="h-6 w-6 animate-spin text-info" />
    : getIcon(firstAnomaly);
  const title = isPurchaseGuide ? (fieldReviewed ? '采集已确认' : fieldsDone ? '采集待确认' : '字段预读中') : getTitle(firstAnomaly);
  const suggestion = isPurchaseGuide
    ? fieldReviewed
      ? 'PDA 已完成现场采集。当前批次包含整托、散件和标签风险，Agent 建议送 Station 做正式检测。'
      : fieldsDone
        ? 'PDA 预读已完成。这里只确认现场采集结果，当前批次仍按 Agent 建议送 Station 正式检测。'
        : 'PDA 正在预读托码、箱码和标签字段。这里只做采集确认，不代替 Station 正式检测。'
    : getSuggestion(firstAnomaly);

  useEffect(() => {
    if (!isPurchaseGuide) return undefined;

    setTypedFieldChars(0);
    const timer = window.setInterval(() => {
      setTypedFieldChars((count) => {
        const next = Math.min(fieldCharTotal, count + 1);
        if (next >= fieldCharTotal) {
          window.clearInterval(timer);
        }
        return next;
      });
    }, 28);

    return () => window.clearInterval(timer);
  }, [fieldCharTotal, isPurchaseGuide]);

  return (
    <div className="flex h-full flex-col bg-primary px-4 py-3">
      {isPurchaseGuide && (
        <div className="mb-3 rounded-lg border-2 border-info bg-info/10 p-3 shadow-[0_0_0_3px_rgba(59,130,246,0.08)]">
          <div className="inline-flex rounded-full bg-info px-2 py-0.5 text-[10px] font-bold text-white">
            {fieldsDone ? 'PDA 采集已完成' : 'PDA 字段预读中'}
          </div>
          <h2 className="mt-2 text-sm font-semibold text-text-primary">现场采集和预读信息</h2>
          <p className="mt-1 text-[11px] leading-relaxed text-text-secondary">
            PDA 负责现场扫码、拍照和字段预读。低风险任务可在 PDA 完成，当前批次按 Agent 建议送 Station。
          </p>
        </div>
      )}
      <div className="min-h-0 flex-1 overflow-y-auto pb-3" style={{ scrollbarWidth: 'none' }}>
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

        {isPurchaseGuide && (
          <div className="mt-3 rounded-lg bg-white p-3">
            <h3 className="text-sm font-semibold text-text-primary">现场采集照片</h3>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <div className="h-24 overflow-hidden rounded-md border border-border bg-slate-100">
                <img
                  src="/images/purchase-receive-scan-label.png"
                  alt="托码箱码扫码照片"
                  className="h-full w-full object-cover"
                  style={{ objectPosition: '62% center' }}
                />
              </div>
              <div className="h-24 overflow-hidden rounded-md border border-border bg-slate-100">
                <img
                  src="/images/purchase-receive-ocr-label.png"
                  alt="OCR 标签抽检照片"
                  className="h-full w-full object-cover"
                  style={{ objectPosition: 'center' }}
                />
              </div>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2 text-[10px]">
              <span className="truncate rounded bg-primary px-2 py-1 text-text-secondary">托码 {completedFieldCount >= 1 ? purchaseReceiveGuide.palletCode : '读取中'}</span>
              <span className="truncate rounded bg-primary px-2 py-1 text-text-secondary">箱码 {completedFieldCount >= 2 ? purchaseReceiveGuide.cartonCode : '读取中'}</span>
              <span className="truncate rounded bg-primary px-2 py-1 text-text-secondary">料号 {completedFieldCount >= 6 ? purchaseReceiveGuide.ocrPartNo : '读取中'}</span>
              <span className="truncate rounded bg-primary px-2 py-1 text-text-secondary">批次 {completedFieldCount >= 7 ? purchaseReceiveGuide.batchNo : '读取中'}</span>
            </div>
          </div>
        )}

        {/* Delivery Info */}
        <div className="mt-3">
          <h3 className="mb-2 text-sm font-semibold text-text-primary">到货信息</h3>
          <div className="space-y-1">
            {[
              { label: '扫码结果', value: isPurchaseGuide ? scannedCode : orderNo },
              { label: '采集类型', value: isPurchaseGuide ? purchaseReceiveGuide.scannedCodeLabel : '运单号' },
              { label: '供应商', value: isPurchaseGuide ? purchaseReceiveGuide.supplier : order.supplier },
              { label: '到货批次', value: isPurchaseGuide ? (completedFieldCount >= 7 ? purchaseReceiveGuide.batchNo : '待读取') : firstAnomaly?.batchNo || 'L20260315A' },
              { label: '采购单', value: isPurchaseGuide ? purchaseReceiveGuide.purchaseOrderNo : order.purchaseOrderNo },
              { label: '箱码', value: isPurchaseGuide ? (completedFieldCount >= 2 ? purchaseReceiveGuide.cartonCode : '待读取') : 'CTN-007-001~006' },
              { label: 'Agent 建议', value: fieldsDone ? `送 ${purchaseReceiveGuide.stationCode} 正式检测` : '待读取' },
              { label: '包装', value: fieldsDone ? purchaseReceiveGuide.packagingMethod : '待读取' },
              { label: '扫码照片物料', value: completedFieldCount >= 3 ? purchaseReceiveGuide.scanMaterialName : '待读取' },
              { label: '扫码照片数量', value: completedFieldCount >= 4 ? purchaseReceiveGuide.scanQty : '待读取' },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between rounded bg-white px-3 py-2">
                <span className="text-[11px] text-text-muted">{row.label}</span>
                <span className={cn('text-xs text-text-primary', ['扫码结果', '运单号', '采购单', '箱码'].includes(row.label) && 'font-data')}>{row.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-3 rounded-lg bg-white p-3">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-text-primary">条码与字段预读</h3>
            <span className="rounded bg-info/10 px-2 py-0.5 text-[10px] text-info">采集确认</span>
          </div>
          {isPurchaseGuide && (
            <div className="mb-3 overflow-hidden rounded-md border border-border bg-slate-100">
              <div className="grid grid-cols-2 gap-1 p-1">
                <div className="h-28 overflow-hidden rounded bg-white">
                  <img
                    src="/images/purchase-receive-scan-label.png"
                    alt="托码箱码扫码照片"
                    className="h-full w-full object-cover"
                    style={{ objectPosition: '62% center' }}
                  />
                </div>
                <div className="h-28 overflow-hidden rounded bg-white">
                  <img
                    src="/images/purchase-receive-ocr-label.png"
                    alt="OCR 标签抽检照片"
                    className="h-full w-full object-cover"
                    style={{ objectPosition: 'center' }}
                  />
                </div>
              </div>
            </div>
          )}
          <div className="grid grid-cols-2 gap-2">
            {ocrRows.map((row, index) => {
              const offset = fieldOffsets[index];
              const chars = isPurchaseGuide
                ? Math.max(0, Math.min(row.value.length, typedFieldChars - offset.start))
                : row.value.length;
              const visible = chars > 0;
              const done = chars >= row.value.length;
              return (
              <div key={row.label} className={cn('rounded px-2 py-1.5', visible ? 'bg-primary' : 'bg-slate-100')}>
                <p className="flex items-center justify-between gap-1 text-[10px] text-text-muted">
                  <span>{row.label}</span>
                  <span className={cn('text-[9px]', visible ? 'text-info' : 'text-text-muted')}>{row.source}</span>
                </p>
                <p className={cn('mt-0.5 truncate font-data text-[11px]', visible ? 'text-text-primary' : 'text-text-muted')}>
                  {visible ? row.value.slice(0, chars) : '识别中…'}
                  {isPurchaseGuide && visible && !done && (
                    <span className="ml-0.5 inline-block animate-pulse text-info">▍</span>
                  )}
                </p>
              </div>
            );
            })}
          </div>
          {!fieldsDone && (
            <div className="mt-3 flex items-center gap-2 rounded bg-info/10 px-3 py-2 text-[11px] text-info">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              正在预读标签字段
            </div>
          )}
          <button
            onClick={() => fieldsDone && setFieldReviewed(true)}
            disabled={!fieldsDone}
            className={cn(
              'mt-3 flex h-9 w-full items-center justify-center gap-1.5 rounded text-xs font-semibold',
              !fieldsDone ? 'cursor-not-allowed bg-text-muted/20 text-text-muted' : fieldReviewed ? 'bg-success/15 text-success' : 'bg-info text-white',
            )}
          >
            {fieldReviewed ? <CheckCircle className="h-3.5 w-3.5" /> : <PencilLine className="h-3.5 w-3.5" />}
            {fieldReviewed ? '采集结果已确认' : '确认采集结果'}
          </button>
        </div>

        {/* Item Details - Collapsible */}
        <div className="mt-3">
          <button onClick={() => setExpanded(!expanded)} className="mb-2 flex w-full items-center justify-between">
            <h3 className="text-sm font-semibold text-text-primary">货品明细</h3>
            {expanded ? <ChevronUp className="h-4 w-4 text-text-muted" /> : <ChevronDown className="h-4 w-4 text-text-muted" />}
          </button>
          {(expanded ? displayItems : displayItems.slice(0, 3)).map((item, idx) => (
            <div key={item.id} className="flex items-center justify-between rounded bg-white px-3 py-2 mb-1">
              <div className="flex items-center gap-2">
                <span className="w-5 text-[11px] text-text-muted">{idx + 1}</span>
                <span className="text-xs text-text-primary">{item.materialName}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-data text-xs text-text-primary">{item.quantity}{item.unit}</span>
                {isPurchaseGuide ? (
                  <div className={cn('h-2 w-2 rounded-full', item.status === '待检测' ? 'bg-warning' : 'bg-success')} />
                ) : (
                  <div className={cn('h-2 w-2 rounded-full', item.status === '通过' ? 'bg-success' : 'detectLevel' in item && item.detectLevel === 'L1' ? 'bg-danger' : 'bg-warning')} />
                )}
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
      </div>

      {/* Bottom Actions */}
      <div className="shrink-0 border-t border-border-light bg-primary pt-3">
        <div className={cn('flex gap-3', isPurchaseGuide && 'block')}>
          {!isPurchaseGuide && (
            <button
              onClick={() => navigate(resultCardType === 'pass' ? '/pda/receive/scan' : '/pda/problem/handover')}
              className="flex h-11 flex-1 items-center justify-center rounded border border-border bg-white text-sm text-text-secondary active:bg-primary"
            >
              {resultCardType === 'pass' ? '重新扫描' : '移入复核区'}
            </button>
          )}
          <button
            disabled={isPurchaseGuide && !fieldsDone && !fieldReviewed}
            onClick={() => {
              if (isPurchaseGuide && !fieldReviewed) {
                if (fieldsDone) setFieldReviewed(true);
                return;
              }
              navigate(isPurchaseGuide ? '/station?scenario=purchase-receive' : resultCardType === 'danger' ? '/pda/problem/handover' : '/pda/receive/summary');
            }}
            className={cn('flex h-11 flex-1 items-center justify-center gap-2 rounded text-sm font-semibold text-white',
              isPurchaseGuide && 'w-full',
              isPurchaseGuide && !fieldsDone && !fieldReviewed
                ? 'cursor-not-allowed bg-text-muted/40'
                : resultCardType === 'pass'
                  ? 'bg-accent-gradient'
                  : resultCardType === 'danger'
                    ? 'bg-danger-gradient'
                    : 'bg-accent-gradient'
            )}
          >
            {isPurchaseGuide
              ? fieldReviewed
                ? (
                    <>
                      <DemoStepBadge step={6} />
                      <MonitorCheck className="h-4 w-4" />
                    </>
                  )
                : fieldsDone
                  ? (
                      <>
                        <DemoStepBadge step={5} />
                        <PencilLine className="h-4 w-4" />
                      </>
                    )
                  : <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              : null}
            {isPurchaseGuide ? (fieldReviewed ? '按建议送 Station' : fieldsDone ? '确认采集结果' : '正在预读字段') : resultCardType === 'pass' ? '确认签收' : resultCardType === 'danger' ? '隔离处理' : '整改后入库'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReceiveDetail;
