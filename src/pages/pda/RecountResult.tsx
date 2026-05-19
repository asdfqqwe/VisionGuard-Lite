import type { FC } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

const recountData = [
  { materialName: '矿泉水', systemQty: 12, actualQty: 10, unit: '箱' },
  { materialName: '丁腈手套', systemQty: 40, actualQty: 40, unit: '盒' },
];

const RecountResult: FC = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'consistent' | 'diff' | null>(null);

  return (
    <div className="h-full bg-primary px-4 pt-3 pb-4">
      {/* Summary Card */}
      <div className="rounded-lg bg-white p-3">
        <div className="font-data text-sm font-semibold text-info">RC-001 盘点结果</div>
        <div className="mt-2 flex justify-around">
          <div className="text-center">
            <div className="font-data text-lg font-bold text-text-primary">2</div>
            <div className="text-[10px] text-text-muted">盘点项</div>
          </div>
          <div className="text-center">
            <div className="font-data text-lg font-bold text-success">1</div>
            <div className="text-[10px] text-text-muted">一致</div>
          </div>
          <div className="text-center">
            <div className="font-data text-lg font-bold text-danger">1</div>
            <div className="text-[10px] text-text-muted">差异</div>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="mt-4 space-y-2">
        {recountData.map((item, idx) => {
          const diff = item.actualQty - item.systemQty;
          return (
            <div key={idx} className={cn('rounded-lg border p-3',
              diff === 0 ? 'border-success/30 bg-success/10' : 'border-danger/30 bg-danger/10'
            )}>
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-primary">{item.materialName}</span>
                <span className={cn('rounded px-2 py-0.5 text-[11px] font-bold',
                  diff === 0 ? 'bg-success text-white' : 'bg-danger text-white'
                )}>
                  {diff === 0 ? '一致' : '差异'}
                </span>
              </div>
              <div className="mt-1 grid grid-cols-3 gap-2">
                <div className="text-center">
                  <div className="text-[11px] text-text-muted">系统</div>
                  <div className="font-data text-sm">{item.systemQty}</div>
                </div>
                <div className="text-center">
                  <div className="text-[11px] text-text-muted">现场</div>
                  <div className="font-data text-sm">{item.actualQty}</div>
                </div>
                <div className="text-center">
                  <div className="text-[11px] text-text-muted">差异</div>
                  <div className={cn('font-data text-sm font-semibold', diff === 0 ? 'text-success' : 'text-danger')}>
                    {diff > 0 ? '+' : ''}{diff}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Agent Suggestion */}
      <div className="mt-4 rounded-md border-l-[3px] border-l-info bg-white p-3">
        <span className="text-xs font-semibold text-info">Agent建议：</span>
        <p className="mt-1 text-xs text-text-secondary">
          一致项生成盘点报告写库，差异项转问题件处理
        </p>
      </div>

      {/* Action buttons */}
      <div className="mt-6 space-y-2">
        <button
          onClick={() => setMode('consistent')}
          className={cn('h-11 w-full rounded-md text-sm font-semibold text-white',
            mode === 'consistent' ? 'bg-success' : 'bg-success/70'
          )}
        >
          一致 — 生成报告写库
        </button>
        <button
          onClick={() => navigate('/pda/problem/handover')}
          className={cn('h-11 w-full rounded-md text-sm font-semibold text-white',
            mode === 'diff' ? 'bg-danger' : 'bg-danger/70'
          )}
        >
          差异 — 转问题件
        </button>
        <button
          onClick={() => navigate('/pda/recount/reprint')}
          className="h-11 w-full rounded-md border border-border bg-white text-sm text-text-secondary"
        >
          补打标签
        </button>
      </div>
    </div>
  );
};

export default RecountResult;
