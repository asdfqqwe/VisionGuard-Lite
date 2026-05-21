import type { FC } from 'react';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AlertTriangle, CheckCircle, ClipboardCheck, MapPin, RotateCcw, ScanLine } from 'lucide-react';
import { pickTasks } from '@/data/mockData';
import { cn } from '@/lib/utils';

const scanMeta: Record<string, { orderNo: string; barcode: string; station: string; returned?: boolean; check: string }> = {
  'PK-001': {
    orderNo: 'SO-031',
    barcode: 'BRG-B20260310A-010',
    station: 'Station-03 出库复核',
    check: '条码、库位、数量一致',
  },
  'PK-002': {
    orderNo: 'SO-031',
    barcode: 'GLOVE-L-202603-020',
    station: '打包区扫码确认',
    check: '低风险物资，扫码后可送打包',
  },
  'PK-003': {
    orderNo: 'SO-031',
    barcode: 'WPM-B03-02-005',
    station: 'Station-03 出库复核',
    returned: true,
    check: 'Station 提示型号不符，重新扫描后送复核台',
  },
};

const PickScan: FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const taskNo = (location.state as { taskNo?: string } | null)?.taskNo || 'PK-001';
  const task = pickTasks.find((item) => item.taskNo === taskNo) || pickTasks[0];
  const meta = scanMeta[task.taskNo] || scanMeta['PK-001'];
  const [pickedCount, setPickedCount] = useState(Math.max(0, task.quantity - 1));
  const done = pickedCount >= task.quantity;

  const handleConfirm = () => {
    if (done) {
      navigate('/pda/pick/task');
      return;
    }
    setPickedCount((count) => Math.min(task.quantity, count + 1));
  };

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
          <span className="text-[10px] text-text-primary">当前：{task.sourceLocation}</span>
        </div>
      </div>

      {/* Current Item Card */}
      <div className={cn('mt-4 rounded-lg bg-white p-3', meta.returned && 'border border-warning/40 bg-warning/5')}>
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="font-data text-[11px] font-semibold text-info">{meta.orderNo}</div>
            <h3 className="mt-0.5 text-base font-semibold text-text-primary">{task.materialName}</h3>
          </div>
          {meta.returned && (
            <span className="flex items-center gap-1 rounded bg-warning/15 px-2 py-1 text-[10px] font-semibold text-warning">
              <RotateCcw className="h-3 w-3" />
              重拣
            </span>
          )}
        </div>
        <div className="mt-2 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-text-muted">来源货位</span>
            <div className="font-data text-base font-semibold text-info">{task.sourceLocation}</div>
          </div>
          <div className="text-right">
            <span className="text-[11px] text-text-muted">数量</span>
            <div className="font-data text-base font-semibold text-text-primary">×{task.quantity}{task.unit}</div>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="rounded bg-primary px-2 py-1.5">
            <span className="text-[10px] text-text-muted">目标去向</span>
            <p className="mt-0.5 text-[11px] font-medium text-text-primary">{meta.station}</p>
          </div>
          <div className="rounded bg-primary px-2 py-1.5">
            <span className="text-[10px] text-text-muted">扫码校验</span>
            <p className="mt-0.5 text-[11px] font-medium text-success">待确认</p>
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
        <div className="mt-2 rounded bg-white px-3 py-2 text-center">
          <p className="font-data text-[11px] text-text-primary">{meta.barcode}</p>
          <p className="mt-0.5 text-[10px] text-text-muted">{meta.check}</p>
        </div>
      </div>

      {/* Progress */}
      <div className="mt-4 flex items-center gap-2">
        <span className="text-[11px] text-text-muted">进度 {pickedCount}/{task.quantity}</span>
        <div className="h-2 flex-1 rounded-full bg-primary">
          <div className="h-full rounded-full bg-success" style={{ width: `${(pickedCount / task.quantity) * 100}%` }} />
        </div>
      </div>

      {done && (
        <div className="mt-4 flex items-center gap-2 rounded-lg border border-success/30 bg-success/10 p-3">
          <CheckCircle className="h-5 w-5 text-success" />
          <div>
            <div className="text-xs font-semibold text-success">拣货完成</div>
            <div className="mt-0.5 text-[11px] text-text-secondary">已送往 Station 出库复核</div>
          </div>
        </div>
      )}

      {meta.returned && !done && (
        <div className="mt-4 rounded-lg border border-warning/30 bg-warning/10 p-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-warning" />
            <span className="text-xs font-semibold text-warning">退回重拣任务</span>
          </div>
          <p className="mt-1 text-[11px] text-text-secondary">
            上次复核发现型号不符，请核对实物铭牌、货位和出库单后再提交。
          </p>
        </div>
      )}

      {/* Bottom Actions */}
      <div className="mt-6">
        <button
          onClick={handleConfirm}
          className={cn('h-11 w-full rounded-md text-sm font-semibold text-white',
            done ? 'bg-success' : 'bg-accent-gradient'
          )}
        >
          <span className="inline-flex items-center gap-1.5">
            {done ? <ClipboardCheck className="h-4 w-4" /> : <ScanLine className="h-4 w-4" />}
            {done ? '返回任务列表' : '确认拣货'}
          </span>
        </button>
      </div>
    </div>
  );
};

export default PickScan;
