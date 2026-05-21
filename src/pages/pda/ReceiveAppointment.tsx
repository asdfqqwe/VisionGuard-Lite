import type { FC } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { postPurchaseSyncStatus } from '@/api/mockApi';

const suppliers = ['华东物流', '江南华盛', '精工汽配', '环球物流'];
const timeSlots = ['08:00-10:00', '10:00-12:00', '13:00-15:00', '15:00-17:00', '17:00-19:00'];
const stationOptions = ['固定式视觉相机', '移动视觉 PDA'];
const packagingOptions = ['散装', '盒装', '整托', '整托+散装'];

const ReceiveAppointment: FC = () => {
  const navigate = useNavigate();
  const [supplier, setSupplier] = useState('');
  const [deliveryOrder, setDeliveryOrder] = useState('');
  const [date, setDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('');
  const [skuCount, setSkuCount] = useState('');
  const [packagingMethod, setPackagingMethod] = useState('整托+散装');
  const [stationMode, setStationMode] = useState('固定式视觉相机');
  const [skuLines, setSkuLines] = useState('前轮轴承 20件；发动机线束 4件');
  const [carrier, setCarrier] = useState('');
  const [notes, setNotes] = useState('');
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
    navigate('/pda');
  };

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
            placeholder="输入送货单号"
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
            placeholder="输入预计 SKU 数"
            className={cn('h-11 w-full rounded border border-border bg-white px-3 text-sm text-text-primary outline-none placeholder:text-text-muted', 'focus:border-info')}
          />
        </div>

        <div>
          <label className="mb-1 block text-[11px] text-text-muted">SKU 明细</label>
          <textarea
            value={skuLines}
            onChange={(e) => setSkuLines(e.target.value)}
            placeholder="例：前轮轴承 20件；机油 6桶"
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
            placeholder="输入承运商名称"
            className={cn('h-11 w-full rounded border border-border bg-white px-3 text-sm text-text-primary outline-none placeholder:text-text-muted', 'focus:border-info')}
          />
        </div>

        {/* Notes */}
        <div>
          <label className="mb-1 block text-[11px] text-text-muted">备注（可选）</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="输入备注信息"
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
