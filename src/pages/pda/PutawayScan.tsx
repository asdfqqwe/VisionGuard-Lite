import type { FC } from 'react';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, ScanLine } from 'lucide-react';
import { putawayTasks } from '@/data/mockData';
import { cn } from '@/lib/utils';

const PutawayScan: FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const taskNo = (location.state as { taskNo?: string } | null)?.taskNo || 'PUT-001';
  const task = putawayTasks.find((item) => item.taskNo === taskNo) || putawayTasks[0];
  const totalCount = task.materialName.includes('动力电池') ? 2 : task.materialName.includes('矿泉水') ? 12 : 6;
  const [scannedCount, setScannedCount] = useState(Math.min(3, totalCount - 1));
  const done = scannedCount >= totalCount;

  const handleConfirm = () => {
    if (done) {
      navigate('/pda/putaway/task');
      return;
    }
    setScannedCount(c => Math.min(totalCount, c + 1));
  };

  return (
    <div className="h-full bg-primary px-4 pt-3 pb-4">
      {/* Task Card */}
      <div className="rounded-lg bg-white p-3">
        <div className="font-data text-sm font-semibold text-info">{task.taskNo}</div>
        <div className="mt-1 text-base font-semibold text-text-primary">{task.source} → {task.targetLocation}</div>
        <div className="mt-1 text-xs text-text-primary">{task.materialName}</div>
        <div className="mt-1 text-xs text-text-primary">共 {totalCount} 件</div>
        <div className="mt-2 flex items-center gap-2">
          <span className="text-[11px] text-text-muted">已扫 {scannedCount}/{totalCount}</span>
          <div className="h-2 flex-1 rounded-full bg-primary">
            <div className="h-full rounded-full bg-success transition-all" style={{ width: `${(scannedCount / totalCount) * 100}%` }} />
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
          <div className="absolute left-4 right-4 h-[1px] bg-success shadow-[0_0_6px_#22C55E]" style={{ animation: 'scanMove2 2s ease-in-out infinite' }} />
          <ScanLine className="h-10 w-10 text-success/40" />
        </div>
        <p className="mt-3 text-xs text-text-secondary">扫描货位条码</p>
      </div>

      {done && (
        <div className="mt-4 flex items-center gap-2 rounded-lg border border-success/30 bg-success/10 p-3">
          <CheckCircle className="h-5 w-5 text-success" />
          <div>
            <div className="text-xs font-semibold text-success">上架完成</div>
            <div className="mt-0.5 text-[11px] text-text-secondary">库存已写入 {task.targetLocation}</div>
          </div>
        </div>
      )}

      {/* Current Location */}
      <div className="mt-6 text-center">
        <span className="text-[11px] text-text-muted">当前货位</span>
        <div className="mt-1 font-data text-xl font-bold text-text-primary">{task.targetLocation}</div>
      </div>

      {/* Scanned items */}
      <div className="mt-4 space-y-1">
        <div className="rounded bg-white px-3 py-2 text-xs text-text-primary">
          PKG-2024-001247 — {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="mt-6 flex gap-3">
        <button
          onClick={() => navigate('/pda/putaway/task')}
          className="flex h-11 flex-1 items-center justify-center rounded border border-border bg-white text-sm text-text-secondary"
        >
          跳过
        </button>
        <button
          onClick={handleConfirm}
          className={cn('flex h-11 flex-1 items-center justify-center rounded text-sm font-semibold text-white',
            done ? 'bg-success' : 'bg-accent-gradient'
          )}
        >
          {done ? '返回任务列表' : '确认上架'}
        </button>
      </div>

      <style>{`
        @keyframes scanMove2 {
          0%, 100% { top: 0; }
          50% { top: calc(100% - 20px); }
        }
      `}</style>
    </div>
  );
};

export default PutawayScan;
