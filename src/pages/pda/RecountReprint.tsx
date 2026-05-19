import type { FC } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

const RecountReprint: FC = () => {
  const navigate = useNavigate();
  const [printed, setPrinted] = useState(false);

  const labelData = {
    skuName: '一次性丁腈手套 L',
    skuCode: 'SKU-2024-0041',
    batchNo: 'B20260310A',
    location: 'A-04-01',
    supplier: '精工汽配',
    date: '2024-03-15',
  };

  return (
    <div className="h-full bg-primary px-4 pt-3 pb-4">
      {/* Label Preview */}
      <div className="mb-3 text-sm font-semibold text-text-primary">标签预览</div>
      <div className="rounded-lg border border-dashed border-border bg-white p-4">
        <div className="text-center">
          {/* Barcode simulation */}
          <div className="flex items-end justify-center gap-[2px] h-10 mb-2">
            {Array.from({ length: 30 }).map((_, i) => (
              <div key={i} className="bg-text-primary" style={{ width: '2px', height: `${Math.random() * 60 + 40}%` }} />
            ))}
          </div>
          <div className="font-data text-[11px] text-text-muted">{labelData.skuCode}</div>
        </div>
        <div className="mt-3 space-y-1 text-xs text-text-primary">
          <div className="flex justify-between"><span className="text-text-muted">品名</span><span>{labelData.skuName}</span></div>
          <div className="flex justify-between font-data"><span className="text-text-muted">批次</span><span>{labelData.batchNo}</span></div>
          <div className="flex justify-between font-data"><span className="text-text-muted">库位</span><span className="text-info">{labelData.location}</span></div>
          <div className="flex justify-between"><span className="text-text-muted">供应商</span><span>{labelData.supplier}</span></div>
          <div className="flex justify-between font-data"><span className="text-text-muted">日期</span><span>{labelData.date}</span></div>
        </div>
      </div>

      {/* Print Actions */}
      <div className="mt-6 space-y-2">
        <button
          onClick={() => setPrinted(true)}
          className={cn('h-11 w-full rounded-md text-sm font-semibold text-white',
            printed ? 'bg-success' : 'bg-accent-gradient'
          )}
        >
          {printed ? '打印完成' : '打印标签'}
        </button>
        {printed && (
          <button
            onClick={() => navigate('/pda')}
            className="h-11 w-full rounded-md bg-success text-sm font-semibold text-white"
          >
            确认已重新贴标
          </button>
        )}
      </div>
    </div>
  );
};

export default RecountReprint;
