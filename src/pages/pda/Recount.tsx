import type { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

const recountData = [
  { materialName: '矿泉水', systemQty: 12, actualQty: 10, unit: '箱' },
  { materialName: '丁腈手套', systemQty: 40, actualQty: 40, unit: '盒' },
  { materialName: '前轮轴承', systemQty: 20, actualQty: 20, unit: '件' },
  { materialName: '5W-40机油', systemQty: 6, actualQty: 6, unit: '桶' },
];

const Recount: FC = () => {
  const navigate = useNavigate();

  const hasDiff = recountData.some(r => r.systemQty !== r.actualQty);

  return (
    <div className="h-full bg-primary px-4 pt-3 pb-4">
      {/* Info Card */}
      <div className="rounded-lg bg-white p-3">
        <div className="font-data text-sm font-semibold text-info">RC-001</div>
        <div className="mt-1 text-sm text-text-primary">A-03-05 区域盘点</div>
        <div className="mt-1 text-xs text-text-muted">触发原因：PDA巡检差异（INS-002）</div>
        <div className="mt-2">
          <span className="rounded bg-warning/15 px-2 py-0.5 text-[11px] text-warning">进行中</span>
        </div>
      </div>

      {/* 3-Column Comparison Table */}
      <div className="mt-4">
        <h3 className="mb-2 text-sm font-semibold text-text-primary">数量对比</h3>
        <div className="overflow-hidden rounded-lg border border-border">
          {/* Header */}
          <div className="grid grid-cols-3 bg-primary">
            <div className="px-2 py-2 text-center text-[11px] text-text-muted">系统数量</div>
            <div className="px-2 py-2 text-center text-[11px] text-text-muted">现场数量</div>
            <div className="px-2 py-2 text-center text-[11px] text-text-muted">差异值</div>
          </div>
          {/* Rows */}
          {recountData.map((row, idx) => {
            const diff = row.actualQty - row.systemQty;
            return (
              <div key={idx} className={cn('grid grid-cols-3 border-t border-border',
                idx % 2 === 0 ? 'bg-white' : 'bg-transparent'
              )}>
                <div className="px-2 py-2.5 text-center font-data text-sm text-text-primary">{row.systemQty}</div>
                <div className="px-2 py-2.5 text-center font-data text-sm text-text-primary">{row.actualQty}</div>
                <div className={cn('px-2 py-2.5 text-center font-data text-sm font-semibold',
                  diff > 0 ? 'text-warning' : diff < 0 ? 'text-danger' : 'text-success'
                )}>
                  {diff > 0 ? '+' : ''}{diff}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Diff Warning */}
      {hasDiff && (
        <div className="mt-4 rounded-lg border border-warning/30 bg-warning/10 p-3">
          <div className="text-xs font-semibold text-warning">差异警告</div>
          <div className="mt-1 text-xs text-text-secondary">发现数量差异，建议转问题件并查监控</div>
        </div>
      )}

      {/* Agent Suggestion */}
      <div className="mt-4 rounded-md border-l-[3px] border-l-info bg-white p-3">
        <span className="text-xs font-semibold text-info">Agent建议：</span>
        <p className="mt-1 text-xs leading-relaxed text-text-secondary">
          动碰盘点策略 — 本库位近7日有3次出入库，差异可能性高，建议转问题件并查监控
        </p>
      </div>

      {/* Bottom Actions */}
      <div className="mt-6 flex gap-3">
        <button
          onClick={() => navigate('/pda/problem/handover')}
          className="flex h-11 flex-1 items-center justify-center rounded bg-warning text-sm font-semibold text-white"
        >
          调整数量
        </button>
        <button
          onClick={() => navigate('/pda')}
          className="flex h-11 flex-1 items-center justify-center rounded bg-success text-sm font-semibold text-white"
        >
          确认无误
        </button>
      </div>
    </div>
  );
};

export default Recount;
