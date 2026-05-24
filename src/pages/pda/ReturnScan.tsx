import type { FC } from 'react';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, ClipboardCheck, MonitorCheck, ScanLine, Smartphone, PlayCircle } from 'lucide-react';
import { DemoStepBadge } from '@/components/shared';
import { returnInboundOrders } from '@/data/mockData';
import { cn } from '@/lib/utils';

const ReturnScan: FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const isProductionReturnGuide = searchParams.get('scenario') === 'production-return';
  const stateReturnNo = (location.state as { returnNo?: string } | null)?.returnNo;
  const defaultReturnNo = isProductionReturnGuide
    ? 'TL2025060300017'
    : stateReturnNo || returnInboundOrders[0]?.returnNo || 'RT-001';
  const [scanStarted, setScanStarted] = useState(!isProductionReturnGuide);
  const [input, setInput] = useState(isProductionReturnGuide ? '' : defaultReturnNo);

  const handleConfirm = () => {
    if (isProductionReturnGuide && !scanStarted) {
      setScanStarted(true);
      return;
    }
    if (isProductionReturnGuide && input.length < defaultReturnNo.length) {
      return;
    }
    const path = isProductionReturnGuide
      ? '/pda/return/detail?scenario=production-return&phase=field'
      : '/pda/return/detail';
    navigate(path, { state: { returnNo: input.trim() || defaultReturnNo } });
  };

  useEffect(() => {
    if (!isProductionReturnGuide || !scanStarted) return undefined;

    let index = 0;
    window.setTimeout(() => setInput(''), 0);
    const timer = window.setInterval(() => {
      index += 1;
      setInput(defaultReturnNo.slice(0, index));
      if (index >= defaultReturnNo.length) {
        window.clearInterval(timer);
      }
    }, 70);

    return () => window.clearInterval(timer);
  }, [defaultReturnNo, isProductionReturnGuide, scanStarted]);

  const scanDone = !isProductionReturnGuide || input.length >= defaultReturnNo.length;

  return (
    <div className="flex h-full flex-col bg-primary px-4 py-3">
      <div className="rounded-lg border-2 border-info bg-info/10 p-3 shadow-[0_0_0_3px_rgba(59,130,246,0.08)]">
        <div className="flex items-center gap-2">
          <PlayCircle className="h-4 w-4 text-info" />
          <span className="text-sm font-semibold text-text-primary">生产退料入库演示</span>
        </div>
        <p className="mt-1 text-[11px] leading-relaxed text-text-secondary">
          现场人员用 PDA 摄像头对准退料单条码。识别单号后进入现场验收，核对数量、原因、供应商和箱内实物。
        </p>
      </div>

      {/* Scan Area */}
      <div className="flex flex-col items-center justify-center" style={{ height: isProductionReturnGuide ? '46%' : '38%' }}>
        <div
          className="relative flex items-center justify-center overflow-hidden rounded-md bg-slate-900"
          style={{ width: isProductionReturnGuide ? '260px' : '280px', height: isProductionReturnGuide ? '332px' : '190px' }}
        >
          {isProductionReturnGuide && (
            <>
              <img
                src="/images/return-pda-scan-first-person.png"
                alt="PDA 摄像头第一视角扫描退料单条码"
                className="absolute inset-0 h-full w-full object-cover"
                style={{ objectPosition: 'center center' }}
              />
              <div className="absolute inset-0 bg-black/10" />
              <div className="absolute left-[22%] top-[40%] h-[33%] w-[56%] rounded border-2 border-success shadow-[0_0_12px_rgba(34,197,94,0.65)]" />
            </>
          )}
          <div className="absolute top-0 left-0 h-6 w-6 border-t-2 border-l-2 border-success" />
          <div className="absolute top-0 right-0 h-6 w-6 border-t-2 border-r-2 border-success" />
          <div className="absolute bottom-0 left-0 h-6 w-6 border-b-2 border-l-2 border-success" />
          <div className="absolute bottom-0 right-0 h-6 w-6 border-b-2 border-r-2 border-success" />
          <div className="absolute left-4 right-4 h-[1px] bg-success shadow-[0_0_6px_#22C55E]" style={{ animation: 'scanMove3 2s ease-in-out infinite' }} />
          {!isProductionReturnGuide && <ScanLine className="h-10 w-10 text-success/40" />}
        </div>
        <p className="mt-3 text-xs text-text-secondary">请将退料单条码放入框内</p>
        <div className="mt-2 flex gap-1.5">
          {[
            { icon: ClipboardCheck, label: 'Admin审核' },
            { icon: Smartphone, label: 'PDA验收' },
            { icon: MonitorCheck, label: 'Station复检' },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <span key={item.label} className="flex items-center gap-1 rounded bg-white px-2 py-1 text-[10px] text-text-muted">
                <Icon className="h-3 w-3 text-info" />
                {item.label}
              </span>
            );
          })}
        </div>
      </div>

      {/* Manual Input */}
      <div>
        <div className="mb-2 flex items-center gap-2">
          <div className="h-px flex-1 bg-border" />
          <span className="text-[11px] text-text-muted">{scanDone ? `识别退料单：${input || defaultReturnNo}` : '等待扫码识别'}</span>
          <div className="h-px flex-1 bg-border" />
        </div>
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleConfirm()}
            placeholder="退料单号"
            className={cn('h-11 flex-1 rounded border border-border bg-white px-3 text-sm text-text-primary outline-none', 'placeholder:text-text-muted focus:border-info')}
          />
          <button
            onClick={handleConfirm}
            className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded text-primary', scanDone ? 'bg-accent' : 'bg-info text-white')}
            aria-label="进入退料详情"
          >
            {scanDone ? <ArrowRight className="h-5 w-5" /> : <PlayCircle className="h-5 w-5" />}
          </button>
        </div>
        {isProductionReturnGuide && scanStarted && !scanDone && (
          <p className="mt-2 text-[11px] text-info">正在读取退料单号…</p>
        )}
        <button
          onClick={handleConfirm}
          className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded bg-info text-sm font-semibold text-white shadow-[0_10px_20px_rgba(59,130,246,0.20)]"
        >
          {isProductionReturnGuide && <DemoStepBadge step={scanDone ? 3 : 2} />}
          {scanDone ? <ArrowRight className="h-4 w-4" /> : <PlayCircle className="h-4 w-4" />}
          {scanDone ? '进入现场验收' : '扫描退料单'}
        </button>
      </div>

      {/* Recent */}
      <div className={cn('mt-4', isProductionReturnGuide && 'hidden')}>
        <h3 className="mb-2 text-xs text-text-muted">最近退料</h3>
        <div className="space-y-2">
          {returnInboundOrders.map((order) => (
            <button
              key={order.returnNo}
              onClick={() => navigate('/pda/return/detail', { state: { returnNo: order.returnNo } })}
              className="w-full rounded bg-white px-3 py-2 text-left"
            >
              <div className="flex items-center justify-between">
                <span className="font-data text-sm text-text-primary">{order.returnNo}</span>
                <span className={cn(
                  'rounded px-2 py-0.5 text-[11px]',
                  order.auditStatus === '已通过' ? 'bg-success/15 text-success' : 'bg-warning/15 text-warning',
                )}>
                  {order.auditStatus}
                </span>
              </div>
              <div className="mt-1 flex items-center justify-between text-[11px] text-text-muted">
                <span>{order.workshop}</span>
                <span>{order.stationStatus}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes scanMove3 {
          0%, 100% { top: 0; }
          50% { top: calc(100% - 16px); }
        }
      `}</style>
    </div>
  );
};

export default ReturnScan;
