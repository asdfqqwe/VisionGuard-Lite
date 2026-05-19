import type { FC } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

const InspectCheck: FC = () => {
  const navigate = useNavigate();
  const [count, setCount] = useState(0);
  const [anomaly, setAnomaly] = useState(false);
  const [anomalyType, setAnomalyType] = useState('');

  const systemQty = 12;
  const diff = count - systemQty;

  const handleSubmit = () => {
    if (diff !== 0) {
      navigate('/pda/recount');
    } else {
      navigate('/pda');
    }
  };

  return (
    <div className="h-full bg-primary px-4 pt-3 pb-4">
      {/* Inspect Info Card */}
      <div className="rounded-lg bg-white p-3">
        <div className="text-sm font-semibold text-text-primary">巡检区域：A-03-05</div>
        <div className="mt-1 text-xs text-text-primary">物资：矿泉水</div>
        <div className="mt-1 text-xs text-text-muted">检查货品摆放是否整齐，标签是否完好</div>
      </div>

      {/* Photo Area */}
      <div className="mt-4">
        <h3 className="mb-2 text-sm font-semibold text-text-primary">拍照记录</h3>
        <div className="grid grid-cols-2 gap-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex h-20 items-center justify-center rounded bg-white">
              <Camera className="h-6 w-6 text-text-muted" />
            </div>
          ))}
        </div>
      </div>

      {/* AI Appearance Result */}
      <div className="mt-4 rounded-lg border border-success/30 bg-success/10 p-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-success">AI外观检测</span>
          <span className="rounded bg-success px-2 py-0.5 text-[11px] font-bold text-white">正常</span>
        </div>
        <div className="mt-1 text-xs text-text-secondary">包装完整，标签清晰，无外观缺陷</div>
      </div>

      {/* Manual Count */}
      <div className="mt-4">
        <h3 className="mb-2 text-sm font-semibold text-text-primary">人工计数</h3>
        <div className="flex items-center justify-center gap-6">
          <button
            onClick={() => setCount(Math.max(0, count - 1))}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-text-primary active:bg-border"
          >
            <Minus className="h-5 w-5" />
          </button>
          <span className="font-data text-2xl font-bold text-text-primary">{count}</span>
          <button
            onClick={() => setCount(count + 1)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-text-primary active:bg-border"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-2 text-center">
          <span className="text-xs text-text-muted">系统数量：{systemQty}</span>
          {count > 0 && (
            <span className={cn('ml-3 text-xs font-semibold', diff === 0 ? 'text-success' : 'text-warning')}>
              差异：{diff > 0 ? '+' : ''}{diff}
            </span>
          )}
        </div>
      </div>

      {/* Anomaly Toggle */}
      <div className="mt-4 flex items-center gap-3">
        <span className="text-sm text-text-primary">发现异常</span>
        <button
          onClick={() => setAnomaly(!anomaly)}
          className={cn('h-6 w-11 rounded-full transition-colors', anomaly ? 'bg-info' : 'bg-border')}
        >
          <div className={cn('h-5 w-5 rounded-full bg-white shadow transition-transform', anomaly ? 'translate-x-6' : 'translate-x-0.5')} />
        </button>
      </div>

      {anomaly && (
        <div className="mt-3 space-y-2">
          {['标签缺失', '外观破损', '数量不符', '其他'].map((type) => (
            <button
              key={type}
              onClick={() => setAnomalyType(type)}
              className={cn('w-full rounded bg-white px-3 py-2 text-left text-xs text-text-primary transition-all',
                anomalyType === type && 'border border-info'
              )}
            >
              {type}
            </button>
          ))}
        </div>
      )}

      {/* Bottom CTA */}
      <div className="mt-6">
        <button
          onClick={handleSubmit}
          className={cn('h-11 w-full rounded-md text-sm font-semibold text-white',
            diff !== 0 ? 'bg-warning' : 'bg-accent-gradient'
          )}
        >
          {diff !== 0 ? '差异确认 → 盘点复点' : '提交巡检结果'}
        </button>
      </div>
    </div>
  );
};

export default InspectCheck;
