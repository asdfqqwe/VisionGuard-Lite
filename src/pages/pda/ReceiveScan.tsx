import type { FC } from 'react';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, ScanLine, PlayCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DemoStepBadge } from '@/components/shared';
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
  const [scanStarted, setScanStarted] = useState(!isPurchaseGuide);
  const [typedText, setTypedText] = useState(isPurchaseGuide ? '' : defaultScannedCode);
  const input = typedText;

  const detailPath = isPurchaseGuide ? '/pda/receive/detail?scenario=purchase-receive' : '/pda/receive/detail';

  const handleConfirm = () => {
    if (isPurchaseGuide && !scanStarted) {
      setScanStarted(true);
      return;
    }
    if (isPurchaseGuide && typedText.length < defaultScannedCode.length) {
      return;
    }
    navigate(detailPath, { state: { scannedCode: input.trim() || defaultScannedCode } });
  };

  useEffect(() => {
    if (!isPurchaseGuide || !scanStarted) return undefined;

    setTypedText('');
    let index = 0;
    const timer = window.setInterval(() => {
      index += 1;
      setTypedText(defaultScannedCode.slice(0, index));
      if (index >= defaultScannedCode.length) {
        window.clearInterval(timer);
      }
    }, 55);

    return () => window.clearInterval(timer);
  }, [defaultScannedCode, isPurchaseGuide, scanStarted]);

  const scanDone = !isPurchaseGuide || typedText.length >= defaultScannedCode.length;

  return (
    <div className="flex h-full flex-col bg-primary px-4 py-3">
      {isPurchaseGuide && (
        <div className="rounded-lg border-2 border-info bg-info/10 p-3 shadow-[0_0_0_3px_rgba(59,130,246,0.08)]">
          <div className="inline-flex rounded-full bg-info px-2 py-0.5 text-[10px] font-bold text-white">
            条码枪已就绪
          </div>
          <h2 className="mt-2 text-sm font-semibold text-text-primary">扫描托码和箱码</h2>
          <p className="mt-1 text-[11px] leading-relaxed text-text-secondary">
            先采集托码、箱码和现场照片。PDA 做预读，是否需要 Station 由 Agent 判断。
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
          <span className="text-[11px] text-text-muted">{scanDone ? '扫码结果已识别' : '等待扫码识别'}</span>
          <div className="h-px flex-1 bg-border" />
        </div>
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setTypedText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleConfirm()}
            placeholder="托码或箱码"
            className={cn(
              'h-11 flex-1 rounded border border-border bg-white px-3 text-sm text-text-primary outline-none',
              'placeholder:text-text-muted focus:border-info focus:shadow-[0_0_0_2px_rgba(59,130,246,0.2)]'
            )}
          />
          <button
            onClick={handleConfirm}
            className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded text-primary', scanDone ? 'bg-accent' : 'bg-info text-white')}
          >
            {scanDone ? <ArrowRight className="h-5 w-5" /> : <PlayCircle className="h-5 w-5" />}
          </button>
        </div>
        {isPurchaseGuide && scanStarted && !scanDone && (
          <p className="mt-2 text-[11px] text-info">正在读取托码…</p>
        )}
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
            'flex h-12 w-full items-center justify-center gap-2 rounded-md bg-accent-gradient text-sm font-semibold text-white shadow-[0_0_0_4px_rgba(245,158,11,0.18)]',
            'active:scale-[0.98]',
          )}
        >
          {isPurchaseGuide && <DemoStepBadge step={scanDone ? 4 : 3} />}
          {isPurchaseGuide ? (scanDone ? <ArrowRight className="h-4 w-4" /> : <PlayCircle className="h-4 w-4" />) : <ScanLine className="h-4 w-4" />}
          {isPurchaseGuide ? (scanDone ? '进入采集预读' : '开始现场采集') : '开始扫码'}
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
