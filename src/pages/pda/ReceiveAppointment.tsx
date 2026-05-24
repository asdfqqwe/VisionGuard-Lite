import type { FC } from 'react';
import { useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { ClipboardCheck, ScanLine } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DemoStepBadge } from '@/components/shared';
import { postPurchaseSyncStatus } from '@/api/mockApi';
import { purchaseReceiveGuide } from '@/data/purchaseReceiveGuide';

const suppliers = ['ABC Manufacturing Inc.', '华东物流', '江南华盛', '精工汽配', '环球物流'];
const timeSlots = ['08:00-10:00', '10:00-12:00', '13:00-15:00', '15:00-17:00', '17:00-19:00'];
const stationOptions = ['固定式视觉相机', '移动视觉 PDA'];
const packagingOptions = ['散装', '盒装', '整托', '整托+散装'];

const ReceiveAppointment: FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const isPurchaseGuide = searchParams.get('scenario') === 'purchase-receive';
  const navState = location.state as {
    appointment?: {
      po: string;
      supplier: string;
      eta?: string;
      sku: string;
      qty: string;
      pack: string;
      station: string;
      batch: string;
    };
  } | null;
  const appointment = navState?.appointment;
  const [supplier, setSupplier] = useState<string>(appointment?.supplier ?? purchaseReceiveGuide.supplier);
  const [deliveryOrder, setDeliveryOrder] = useState<string>(appointment?.po ?? purchaseReceiveGuide.purchaseOrderNo);
  const [date, setDate] = useState<string>(purchaseReceiveGuide.date);
  const [timeSlot, setTimeSlot] = useState<string>(appointment?.eta ?? purchaseReceiveGuide.timeSlot);
  const [skuCount, setSkuCount] = useState<string>(appointment?.sku ?? purchaseReceiveGuide.skuCount);
  const [packagingMethod, setPackagingMethod] = useState<string>(appointment?.pack ?? purchaseReceiveGuide.packagingMethod);
  const [stationMode, setStationMode] = useState<string>(appointment?.station ?? purchaseReceiveGuide.stationMode);
  const [skuLines, setSkuLines] = useState<string>(purchaseReceiveGuide.skuLines);
  const [carrier, setCarrier] = useState<string>(purchaseReceiveGuide.carrier);
  const [notes, setNotes] = useState(`预约车辆已到厂门，按 ${purchaseReceiveGuide.purchaseOrderNo} 批次收货。`);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!supplier || !deliveryOrder || !date || !timeSlot) return;
    setSubmitting(true);
    await postPurchaseSyncStatus({
      deliveryOrderNo: deliveryOrder,
      syncPhase: 'appointment',
      syncData: { supplier, date, timeSlot, skuCount, packagingMethod, stationMode, skuLines, carrier },
    });
    setSubmitting(false);
    navigate(isPurchaseGuide ? '/pda/receive/scan?scenario=purchase-receive' : '/pda/receive/scan');
  };

  if (isPurchaseGuide) {
    const summaryRows = [
      { label: '供应商', value: supplier },
      { label: '采购单', value: deliveryOrder },
      { label: '预约时间', value: `${date} ${timeSlot}` },
      { label: '预计 SKU', value: `${skuCount} 个` },
      { label: '包装方式', value: packagingMethod },
      { label: '执行安排', value: 'PDA 采集，Agent 判断是否送检' },
      { label: '承运商', value: carrier },
      { label: '批次说明', value: skuLines },
    ];

    return (
      <div className="flex h-full flex-col bg-primary px-4 py-3">
        <div className="rounded-lg border-2 border-info bg-info/10 p-3 shadow-[0_0_0_3px_rgba(59,130,246,0.08)]">
          <div className="inline-flex rounded-full bg-info px-2 py-0.5 text-[10px] font-bold text-white">
            收货任务已带入
          </div>
          <h2 className="mt-2 text-sm font-semibold text-text-primary">收货员确认到货登记</h2>
          <p className="mt-1 text-[11px] leading-relaxed text-text-secondary">
            Agent 已安排收货任务。PDA 负责现场采集；低风险任务可直接完成，当前批次建议送 Station 正式检测。
          </p>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          {summaryRows.slice(0, 6).map((row) => (
            <div key={row.label} className="rounded-md bg-white px-3 py-2">
              <p className="text-[10px] text-text-muted">{row.label}</p>
              <p className="mt-1 truncate text-xs font-semibold text-text-primary">{row.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-3 rounded-md bg-white p-3">
          <div className="grid grid-cols-2 gap-2">
            {summaryRows.slice(6).map((row) => (
              <div key={row.label}>
                <p className="text-[10px] text-text-muted">{row.label}</p>
                <p className="mt-1 text-xs font-semibold leading-relaxed text-text-primary">{row.value}</p>
              </div>
            ))}
          </div>
          <p className="mt-2 rounded bg-success/10 px-2 py-1.5 text-[11px] text-success">
            当前 PDA 登录人为收货员，可直接进入扫码收货。
          </p>
        </div>

        <div className="mt-auto pt-3">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className={cn(
              'flex h-12 w-full items-center justify-center gap-2 rounded-md bg-accent-gradient text-sm font-semibold text-white shadow-[0_0_0_4px_rgba(245,158,11,0.18)]',
              'active:scale-[0.98] disabled:opacity-50',
            )}
          >
            <DemoStepBadge step={2} />
            {submitting ? <ClipboardCheck className="h-4 w-4 animate-pulse" /> : <ScanLine className="h-4 w-4" />}
            {submitting ? '正在确认...' : '确认到货信息'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-primary px-4 pt-3 pb-4">
      <div className="space-y-3">
        {/* Supplier */}
        <div>
          <label className="mb-1 block text-[11px] text-text-muted">供应商</label>
          <select
            value={supplier}
            onChange={(e) => setSupplier(e.target.value)}
            className={cn('h-11 w-full rounded border border-border bg-white px-3 text-sm text-text-primary outline-none', 'focus:border-info')}
          >
            <option value="">请选择供应商</option>
            {suppliers.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {/* Delivery Order No */}
        <div>
          <label className="mb-1 block text-[11px] text-text-muted">送货单号</label>
          <input
            value={deliveryOrder}
            onChange={(e) => setDeliveryOrder(e.target.value)}
            placeholder="送货单号"
            className={cn('h-11 w-full rounded border border-border bg-white px-3 text-sm text-text-primary outline-none placeholder:text-text-muted', 'focus:border-info')}
          />
        </div>

        {/* Date + Time Slot */}
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="mb-1 block text-[11px] text-text-muted">预约日期</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={cn('h-11 w-full rounded border border-border bg-white px-3 text-sm text-text-primary outline-none', 'focus:border-info')}
            />
          </div>
          <div className="flex-1">
            <label className="mb-1 block text-[11px] text-text-muted">预约时段</label>
            <select
              value={timeSlot}
              onChange={(e) => setTimeSlot(e.target.value)}
              className={cn('h-11 w-full rounded border border-border bg-white px-3 text-sm text-text-primary outline-none', 'focus:border-info')}
            >
              <option value="">请选择时段</option>
              {timeSlots.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {/* SKU Count */}
        <div>
          <label className="mb-1 block text-[11px] text-text-muted">预计 SKU / 件数</label>
          <input
            type="number"
            value={skuCount}
            onChange={(e) => setSkuCount(e.target.value)}
            placeholder="预计 SKU 数"
            className={cn('h-11 w-full rounded border border-border bg-white px-3 text-sm text-text-primary outline-none placeholder:text-text-muted', 'focus:border-info')}
          />
        </div>

        <div>
          <label className="mb-1 block text-[11px] text-text-muted">SKU 明细</label>
          <textarea
            value={skuLines}
            onChange={(e) => setSkuLines(e.target.value)}
            placeholder="SKU 明细"
            className={cn('h-16 w-full rounded border border-border bg-white px-3 py-2 text-sm text-text-primary outline-none placeholder:text-text-muted', 'focus:border-info')}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-[11px] text-text-muted">包装方式</label>
            <select
              value={packagingMethod}
              onChange={(e) => setPackagingMethod(e.target.value)}
              className={cn('h-11 w-full rounded border border-border bg-white px-3 text-sm text-text-primary outline-none', 'focus:border-info')}
            >
              {packagingOptions.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-[11px] text-text-muted">检测工位</label>
            <select
              value={stationMode}
              onChange={(e) => setStationMode(e.target.value)}
              className={cn('h-11 w-full rounded border border-border bg-white px-3 text-sm text-text-primary outline-none', 'focus:border-info')}
            >
              {stationOptions.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {/* Carrier */}
        <div>
          <label className="mb-1 block text-[11px] text-text-muted">承运商</label>
          <input
            value={carrier}
            onChange={(e) => setCarrier(e.target.value)}
            placeholder="承运商名称"
            className={cn('h-11 w-full rounded border border-border bg-white px-3 text-sm text-text-primary outline-none placeholder:text-text-muted', 'focus:border-info')}
          />
        </div>

        {/* Notes */}
        <div>
          <label className="mb-1 block text-[11px] text-text-muted">备注（可选）</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="备注信息"
            className={cn('w-full rounded border border-border bg-white px-3 py-2 text-sm text-text-primary outline-none placeholder:text-text-muted', 'h-20 focus:border-info')}
          />
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="mt-6">
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className={cn('h-11 w-full rounded-md bg-accent-gradient text-sm font-semibold text-white shadow', 'active:scale-[0.98] disabled:opacity-50')}
        >
          {submitting ? '提交中...' : '提交预约'}
        </button>
      </div>
    </div>
  );
};

export default ReceiveAppointment;
