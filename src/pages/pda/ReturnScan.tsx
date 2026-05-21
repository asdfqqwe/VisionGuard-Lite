import type { FC } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ClipboardCheck, MonitorCheck, ScanLine, Smartphone, PlayCircle } from 'lucide-react';
import { returnInboundOrders } from '@/data/mockData';
import { cn } from '@/lib/utils';

const ReturnScan: FC = () => {
  const navigate = useNavigate();
  const defaultReturnNo = returnInboundOrders[0]?.returnNo ?? 'RT-001';
  const [input, setInput] = useState(defaultReturnNo);

  const handleConfirm = () => {
    navigate('/pda/return/detail', { state: { returnNo: input.trim() || defaultReturnNo } });
  };

  return (
    <div className="h-full bg-primary px-4 pt-3">
      <div className="mb-3 rounded-lg border-2 border-info bg-info/10 p-3">
        <div className="flex items-center gap-2">
          <PlayCircle className="h-4 w-4 text-info" />
          <span className="text-sm font-semibold text-text-primary">生产退料入库演示</span>
        </div>
        <p className="mt-1 text-[11px] leading-relaxed text-text-secondary">
          退料单已预填，点击下方高亮按钮进入条码重绑、标签复检和分类入库。
        </p>
      </div>

      {/* Scan Area */}
      <div className="flex flex-col items-center justify-center" style={{ height: '34%' }}>
        <div className="relative flex items-center justify-center" style={{ width: '240px', height: '180px' }}>
          <div className="absolute top-0 left-0 h-6 w-6 border-t-2 border-l-2 border-success" />
          <div className="absolute top-0 right-0 h-6 w-6 border-t-2 border-r-2 border-success" />
          <div className="absolute bottom-0 left-0 h-6 w-6 border-b-2 border-l-2 border-success" />
          <div className="absolute bottom-0 right-0 h-6 w-6 border-b-2 border-r-2 border-success" />
          <div className="absolute left-4 right-4 h-[1px] bg-success shadow-[0_0_6px_#22C55E]" style={{ animation: 'scanMove3 2s ease-in-out infinite' }} />
          <ScanLine className="h-10 w-10 text-success/40" />
        </div>
        <p className="mt-3 text-xs text-text-secondary">扫描退料单条码</p>
        <div className="mt-2 flex gap-1.5">
          {[
            { icon: ClipboardCheck, label: 'Admin审核' },
            { icon: MonitorCheck, label: 'Station复检' },
            { icon: Smartphone, label: 'PDA入库' },
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
      <div className="mt-2">
        <div className="mb-2 flex items-center gap-2">
          <div className="h-px flex-1 bg-border" />
          <span className="text-[11px] text-text-muted">退料单已识别</span>
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
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded bg-accent text-primary"
            aria-label="进入退料详情"
          >
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
        <button
          onClick={handleConfirm}
          className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded bg-info text-sm font-semibold text-white shadow-[0_10px_20px_rgba(59,130,246,0.20)]"
        >
          <PlayCircle className="h-4 w-4" />
          开始处理退料入库
        </button>
      </div>

      {/* Recent */}
      <div className="mt-4">
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
