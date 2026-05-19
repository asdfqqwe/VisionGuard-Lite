import type { FC } from 'react';
import { useState } from 'react';
import { ScanLine, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

const PickScan: FC = () => {
  const [scanned, setScanned] = useState(false);

  return (
    <div className="h-full bg-primary px-4 pt-3 pb-4">
      {/* Mini Route Map */}
      <div className="relative h-[120px] overflow-hidden rounded-lg bg-white">
        <svg viewBox="0 0 343 120" className="h-full w-full">
          {/* Warehouse layout simplified */}
          <rect x="20" y="10" width="60" height="40" rx="4" fill="#334155" stroke="#475569" strokeWidth="1" />
          <rect x="100" y="10" width="60" height="40" rx="4" fill="#334155" stroke="#475569" strokeWidth="1" />
          <rect x="180" y="10" width="60" height="40" rx="4" fill="#334155" stroke="#475569" strokeWidth="1" />
          <rect x="260" y="10" width="60" height="40" rx="4" fill="#334155" stroke="#475569" strokeWidth="1" />
          <rect x="20" y="65" width="60" height="40" rx="4" fill="#334155" stroke="#475569" strokeWidth="1" />
          <rect x="100" y="65" width="60" height="40" rx="4" fill="#334155" stroke="#475569" strokeWidth="1" />
          <rect x="180" y="65" width="60" height="40" rx="4" fill="#334155" stroke="#475569" strokeWidth="1" />
          <rect x="260" y="65" width="60" height="40" rx="4" fill="#334155" stroke="#475569" strokeWidth="1" />
          {/* Path line */}
          <line x1="50" y1="85" x2="130" y2="30" stroke="#3B82F6" strokeWidth="2" strokeDasharray="4 2" />
          {/* Current position */}
          <circle cx="50" cy="85" r="6" fill="#3B82F6">
            <animate attributeName="r" values="6;8;6" dur="2s" repeatCount="indefinite" />
          </circle>
          {/* Target */}
          <circle cx="130" cy="30" r="5" fill="#DC2626" />
        </svg>
        <div className="absolute top-1.5 right-2 flex items-center gap-1 rounded bg-primary/80 px-2 py-0.5">
          <MapPin className="h-3 w-3 text-info" />
          <span className="text-[10px] text-text-primary">当前：A-01-03</span>
        </div>
      </div>

      {/* Current Item Card */}
      <div className="mt-4 rounded-lg bg-white p-3">
        <h3 className="text-base font-semibold text-text-primary">前轮轴承</h3>
        <div className="mt-2 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-text-muted">目标货位</span>
            <div className="font-data text-base font-semibold text-info">B-07-03</div>
          </div>
          <div className="text-right">
            <span className="text-[11px] text-text-muted">数量</span>
            <div className="font-data text-base font-semibold text-text-primary">×3</div>
          </div>
        </div>
      </div>

      {/* Scan Area */}
      <div className="mt-6 flex flex-col items-center">
        <div className="relative flex items-center justify-center" style={{ width: '200px', height: '200px' }}>
          <div className="absolute top-0 left-0 h-5 w-5 border-t-2 border-l-2 border-success" />
          <div className="absolute top-0 right-0 h-5 w-5 border-t-2 border-r-2 border-success" />
          <div className="absolute bottom-0 left-0 h-5 w-5 border-b-2 border-l-2 border-success" />
          <div className="absolute bottom-0 right-0 h-5 w-5 border-b-2 border-r-2 border-success" />
          <ScanLine className="h-10 w-10 text-success/40" />
        </div>
        <p className="mt-3 text-xs text-text-secondary">扫描货品条码确认</p>
      </div>

      {/* Progress */}
      <div className="mt-4 flex items-center gap-2">
        <span className="text-[11px] text-text-muted">进度 2/5</span>
        <div className="h-2 flex-1 rounded-full bg-primary">
          <div className="h-full rounded-full bg-success" style={{ width: '40%' }} />
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="mt-6">
        <button
          onClick={() => setScanned(!scanned)}
          className={cn('h-11 w-full rounded-md text-sm font-semibold text-white',
            scanned ? 'bg-success' : 'bg-accent-gradient'
          )}
        >
          {scanned ? '已确认' : '确认拣货'}
        </button>
      </div>
    </div>
  );
};

export default PickScan;
