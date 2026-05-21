import type { FC } from 'react';
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, ScanLine } from 'lucide-react';
import { cn } from '@/lib/utils';
import { purchaseReceiveGuide } from '@/data/purchaseReceiveGuide';

const recentScans = [
  { orderNo: 'PO-006', time: '09:15' },
  { orderNo: 'PO-005', time: '08:42' },
  { orderNo: 'PO-004', time: '08:10' },
];

const ReceiveScan: FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isPurchaseGuide = searchParams.get('scenario') === 'purchase-receive';
  const defaultScannedCode = isPurchaseGuide ? purchaseReceiveGuide.scannedCode : 'PO-007';
  const [input, setInput] = useState(defaultScannedCode);

  const detailPath = isPurchaseGuide ? '/pda/receive/detail?scenario=purchase-receive' : '/pda/receive/detail';

  const handleConfirm = () => {
    navigate(detailPath, { state: { scannedCode: input.trim() || defaultScannedCode } });
  };

  return (
    <div className="flex h-full flex-col bg-primary px-4 py-3">
      {isPurchaseGuide && (
        <div className="rounded-lg border-2 border-info bg-info/10 p-3 shadow-[0_0_0_3px_rgba(59,130,246,0.08)]">
          <div className="inline-flex rounded-full bg-info px-2 py-0.5 text-[10px] font-bold text-white">
            条码枪已就绪
          </div>
          <h2 className="mt-2 text-sm font-semibold text-text-primary">扫描托码和箱码</h2>
          <p className="mt-1 text-[11px] leading-relaxed text-text-secondary">
            当前画面已识别托码、箱码、料号和数量，确认后进入字段核对。
          </p>
        </div>
      )}
      {/* Scan Area */}
      <div className="flex flex-col items-center justify-center" style={{ height: isPurchaseGuide ? '34%' : '55%' }}>
        {/* Scan Frame */}
        <div className="relative flex items-center justify-center overflow-hidden rounded-md bg-slate-900" style={{ width: '280px', height: '200px' }}>
          {isPurchaseGuide && (
            <>
              <img
                src="/images/purchase-receive-scan-label.png"
                alt="箱码标签扫码画面"
                className="absolute inset-0 h-full w-full object-cover"
                style={{ objectPosition: '62% center' }}
              />
              <div className="absolute inset-0 bg-black/10" />
            </>
          )}
          {/* Corner markers */}
          <div className="absolute top-0 left-0 h-6 w-6 border-t-2 border-l-2 border-success" />
          <div className="absolute top-0 right-0 h-6 w-6 border-t-2 border-r-2 border-success" />
          <div className="absolute bottom-0 left-0 h-6 w-6 border-b-2 border-l-2 border-success" />
          <div className="absolute bottom-0 right-0 h-6 w-6 border-b-2 border-r-2 border-success" />
          {/* Animated scan line */}
          <div className="absolute left-4 right-4 h-[1px] bg-success shadow-[0_0_6px_#22C55E]" style={{ animation: 'scanMove 2s ease-in-out infinite' }} />
          {/* Center icon */}
          {!isPurchaseGuide && <ScanLine className="h-12 w-12 text-success/40" />}
        </div>
        <p className="mt-3 text-xs text-text-secondary">将条码/二维码对准框内</p>
      </div>

      {/* Manual Input */}
      <div className="mt-2">
        <div className="mb-2 flex items-center gap-2">
          <div className="h-px flex-1 bg-border" />
          <span className="text-[11px] text-text-muted">扫码结果已识别</span>
          <div className="h-px flex-1 bg-border" />
        </div>
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleConfirm()}
            placeholder="托码或箱码"
            className={cn(
              'h-11 flex-1 rounded border border-border bg-white px-3 text-sm text-text-primary outline-none',
              'placeholder:text-text-muted focus:border-info focus:shadow-[0_0_0_2px_rgba(59,130,246,0.2)]'
            )}
          />
          <button
            onClick={handleConfirm}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded bg-accent text-primary"
          >
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Recent Scans */}
      <div className={cn('mt-4', isPurchaseGuide && 'hidden')}>
        <h3 className="mb-2 text-xs font-medium text-text-muted">最近扫码</h3>
        <div className="space-y-1">
          {recentScans.map((scan) => (
            <button
              key={scan.orderNo}
              onClick={() => navigate(detailPath, { state: { orderNo: scan.orderNo } })}
              className="flex w-full items-center justify-between rounded bg-white px-3 py-2 text-left transition-colors active:bg-info/10"
            >
              <span className="font-data text-sm font-medium text-text-primary">{scan.orderNo}</span>
              <span className="text-[11px] text-text-muted">{scan.time}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="mt-auto pt-3">
        <button
          onClick={handleConfirm}
          className={cn(
            'h-12 w-full rounded-md bg-accent-gradient text-sm font-semibold text-white shadow-[0_0_0_4px_rgba(245,158,11,0.18)]',
            'active:scale-[0.98]',
          )}
        >
          {isPurchaseGuide ? '扫码并核对字段' : '开始扫码'}
        </button>
      </div>

      <style>{`
        @keyframes scanMove {
          0%, 100% { top: 0; }
          50% { top: calc(100% - 16px); }
        }
      `}</style>
    </div>
  );
};

export default ReceiveScan;
