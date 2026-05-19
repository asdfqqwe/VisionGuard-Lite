import type { FC } from 'react';
import { deliveryOrderPO007 } from '@/data/mockData';
import { cn } from '@/lib/utils';

const ReceiveSummary: FC = () => {
  const order = deliveryOrderPO007;
  const passedItems = order.items.filter(i => i.status === '通过');
  const anomalyItems = order.items.filter(i => i.status !== '通过');
  const totalItems = order.items.length;

  return (
    <div className="h-full bg-primary px-4 pt-3 pb-4">
      {/* Summary Card */}
      <div className="rounded-lg bg-white p-4">
        <div className="flex justify-around">
          <div className="text-center">
            <div className="font-data text-xl font-bold text-text-primary">{totalItems}</div>
            <div className="mt-0.5 text-[11px] text-text-muted">总件数</div>
          </div>
          <div className="text-center">
            <div className="font-data text-xl font-bold text-success">{passedItems.length}</div>
            <div className="mt-0.5 text-[11px] text-text-muted">通过</div>
          </div>
          <div className="text-center">
            <div className="font-data text-xl font-bold text-danger">{anomalyItems.length}</div>
            <div className="mt-0.5 text-[11px] text-text-muted">拦截</div>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-center gap-2 border-t border-border pt-3">
          <span className="text-sm text-text-muted">拦截价值</span>
          <span className="font-data text-base font-bold text-accent">¥3,200</span>
        </div>
      </div>

      {/* Qualified Items */}
      <div className="mt-4">
        <h3 className="mb-2 text-sm font-semibold text-text-primary">合格项（{passedItems.length}）</h3>
        {passedItems.map((item) => (
          <div key={item.id} className="mb-1 flex items-center justify-between rounded bg-white px-3 py-2.5">
            <div>
              <div className="text-xs text-text-primary">{item.materialName}</div>
              <div className="mt-0.5 font-data text-[11px] text-text-muted">{item.putawayTaskId || '—'}</div>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-data text-xs text-text-primary">{item.quantity}{item.unit}</span>
              <span className="rounded bg-success/15 px-2 py-0.5 text-[11px] font-bold text-success">通过</span>
            </div>
          </div>
        ))}
      </div>

      {/* Anomalous Items */}
      {anomalyItems.length > 0 && (
        <div className="mt-4">
          <h3 className="mb-2 text-sm font-semibold text-text-primary">异常项（{anomalyItems.length}）</h3>
          {anomalyItems.map((item) => (
            <div key={item.id} className="mb-1 flex items-center justify-between rounded border border-danger/30 bg-danger/10 px-3 py-2.5">
              <div>
                <div className="text-xs text-text-primary">{item.materialName}</div>
                <div className="mt-0.5 font-data text-[11px] text-danger">{item.agentEventNo || '—'}</div>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-data text-xs text-text-primary">{item.quantity}{item.unit}</span>
                <span className={cn('rounded px-2 py-0.5 text-[11px] font-bold text-white',
                  item.detectLevel === 'L1' ? 'bg-l1-badge' : 'bg-l2-badge'
                )}>
                  {item.detectLevel || '—'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* WO Numbers */}
      <div className="mt-4 rounded bg-white p-3">
        <span className="text-[11px] text-text-muted">关联工单：</span>
        <div className="mt-1 flex flex-wrap gap-2">
          <span className="font-data rounded bg-info/10 px-2 py-0.5 text-xs text-info">WO-001</span>
          <span className="font-data rounded bg-info/10 px-2 py-0.5 text-xs text-info">WO-004</span>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="mt-6">
        <button className={cn('h-11 w-full rounded-md bg-accent-gradient text-sm font-semibold text-white shadow', 'active:scale-[0.98]')}>
          部分确认签收（合格项）
        </button>
      </div>
    </div>
  );
};

export default ReceiveSummary;
