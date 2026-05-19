import type { FC } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ScanLine } from 'lucide-react';
import { cn } from '@/lib/utils';

const ReturnScan: FC = () => {
  const navigate = useNavigate();
  const [input, setInput] = useState('');

  const handleConfirm = () => {
    if (input.trim()) {
      navigate('/pda/return/detail', { state: { returnNo: input.trim() } });
    }
  };

  return (
    <div className="h-full bg-primary px-4 pt-3">
      {/* Scan Area */}
      <div className="flex flex-col items-center justify-center" style={{ height: '45%' }}>
        <div className="relative flex items-center justify-center" style={{ width: '240px', height: '180px' }}>
          <div className="absolute top-0 left-0 h-6 w-6 border-t-2 border-l-2 border-success" />
          <div className="absolute top-0 right-0 h-6 w-6 border-t-2 border-r-2 border-success" />
          <div className="absolute bottom-0 left-0 h-6 w-6 border-b-2 border-l-2 border-success" />
          <div className="absolute bottom-0 right-0 h-6 w-6 border-b-2 border-r-2 border-success" />
          <div className="absolute left-4 right-4 h-[1px] bg-success shadow-[0_0_6px_#22C55E]" style={{ animation: 'scanMove3 2s ease-in-out infinite' }} />
          <ScanLine className="h-10 w-10 text-success/40" />
        </div>
        <p className="mt-3 text-xs text-text-secondary">扫描退料单条码</p>
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
            placeholder="输入退料单号（如 RT-001）"
            className={cn('h-11 flex-1 rounded border border-border bg-white px-3 text-sm text-text-primary outline-none', 'placeholder:text-text-muted focus:border-info')}
          />
          <button
            onClick={handleConfirm}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded bg-accent text-primary"
          >
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Recent */}
      <div className="mt-4">
        <h3 className="mb-2 text-xs text-text-muted">最近退料</h3>
        <button
          onClick={() => navigate('/pda/return/detail', { state: { returnNo: 'RT-001' } })}
          className="flex w-full items-center justify-between rounded bg-white px-3 py-2 text-left"
        >
          <span className="font-data text-sm text-text-primary">RT-001</span>
          <span className="text-[11px] text-text-muted">冲压车间</span>
        </button>
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
