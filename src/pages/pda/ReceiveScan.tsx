import type { FC } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ScanLine } from 'lucide-react';
import { cn } from '@/lib/utils';

const recentScans = [
  { orderNo: 'PO-006', time: '09:15' },
  { orderNo: 'PO-005', time: '08:42' },
  { orderNo: 'PO-004', time: '08:10' },
];

const ReceiveScan: FC = () => {
  const navigate = useNavigate();
  const [input, setInput] = useState('');

  const handleConfirm = () => {
    const val = input.trim();
    if (val) {
      navigate('/pda/receive/detail', { state: { orderNo: val } });
    }
  };

  return (
    <div className="h-full bg-primary px-4 pt-3">
      {/* Scan Area */}
      <div className="flex flex-col items-center justify-center" style={{ height: '55%' }}>
        {/* Scan Frame */}
        <div className="relative flex items-center justify-center" style={{ width: '280px', height: '200px' }}>
          {/* Corner markers */}
          <div className="absolute top-0 left-0 h-6 w-6 border-t-2 border-l-2 border-success" />
          <div className="absolute top-0 right-0 h-6 w-6 border-t-2 border-r-2 border-success" />
          <div className="absolute bottom-0 left-0 h-6 w-6 border-b-2 border-l-2 border-success" />
          <div className="absolute bottom-0 right-0 h-6 w-6 border-b-2 border-r-2 border-success" />
          {/* Animated scan line */}
          <div className="absolute left-4 right-4 h-[1px] bg-success shadow-[0_0_6px_#22C55E]" style={{ animation: 'scanMove 2s ease-in-out infinite' }} />
          {/* Center icon */}
          <ScanLine className="h-12 w-12 text-success/40" />
        </div>
        <p className="mt-3 text-xs text-text-secondary">将条码/二维码对准框内</p>
      </div>

      {/* Manual Input */}
      <div className="mt-2">
        <div className="mb-2 flex items-center gap-2">
          <div className="h-px flex-1 bg-border" />
          <span className="text-[11px] text-text-muted">或手动输入</span>
          <div className="h-px flex-1 bg-border" />
        </div>
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleConfirm()}
            placeholder="请输入运单号"
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
      <div className="mt-4">
        <h3 className="mb-2 text-xs font-medium text-text-muted">最近扫码</h3>
        <div className="space-y-1">
          {recentScans.map((scan) => (
            <button
              key={scan.orderNo}
              onClick={() => navigate('/pda/receive/detail', { state: { orderNo: scan.orderNo } })}
              className="flex w-full items-center justify-between rounded bg-white px-3 py-2 text-left transition-colors active:bg-info/10"
            >
              <span className="font-data text-sm font-medium text-text-primary">{scan.orderNo}</span>
              <span className="text-[11px] text-text-muted">{scan.time}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="mt-6">
        <button className={cn('h-11 w-full rounded-md bg-accent-gradient text-sm font-semibold text-white shadow', 'active:scale-[0.98]')}
        >
          开始扫码
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
