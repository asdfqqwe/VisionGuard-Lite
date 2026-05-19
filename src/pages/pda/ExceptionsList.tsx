import type { FC } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { agentEvents } from '@/data/mockData';
import { cn } from '@/lib/utils';

type FilterStatus = '全部' | 'L1拦截' | 'L2警示' | '待确认' | '已处理';
const filters: FilterStatus[] = ['全部', 'L1拦截', 'L2警示', '待确认', '已处理'];

const ExceptionsList: FC = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<FilterStatus>('全部');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = activeFilter === '全部'
    ? agentEvents
    : agentEvents.filter(e => {
        if (activeFilter === 'L1拦截') return e.detectLevel === 'L1';
        if (activeFilter === 'L2警示') return e.detectLevel === 'L2';
        if (activeFilter === '待确认') return e.status === '待人工确认';
        if (activeFilter === '已处理') return e.status === '已处理' || e.status === '处理中';
        return true;
      });

  const totalPending = agentEvents.filter(e => e.detectLevel === 'L1').length;
  const totalProcessed = agentEvents.filter(e => e.status === '已处理' || e.status === '处理中').length;

  return (
    <div className="h-full bg-primary px-4 pt-3 pb-4">
      {/* Stats Card */}
      <div className="rounded-lg bg-white p-3">
        <div className="flex justify-around">
          <div className="text-center">
            <div className="font-data text-base font-bold text-warning">{totalPending}</div>
            <div className="mt-0.5 text-[10px] text-text-muted">待处理</div>
          </div>
          <div className="text-center">
            <div className="font-data text-base font-bold text-success">{totalProcessed}</div>
            <div className="mt-0.5 text-[10px] text-text-muted">已处理</div>
          </div>
          <div className="text-center">
            <div className="font-data text-base font-bold text-danger">{totalPending}</div>
            <div className="mt-0.5 text-[10px] text-text-muted">L1拦截</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mt-3 mb-3 flex gap-2 overflow-x-auto">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={cn('shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-all',
              activeFilter === f ? 'bg-info text-white' : 'border border-border text-text-muted'
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Exception List */}
      <div className="space-y-2">
        {filtered.map((evt) => {
          const isExpanded = expandedId === evt.eventNo;
          return (
            <div
              key={evt.eventNo}
              className="rounded-lg bg-white p-3"
            >
              <button
                onClick={() => setExpandedId(isExpanded ? null : evt.eventNo)}
                className="flex w-full items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <span className="font-data text-sm font-semibold text-info">{evt.eventNo}</span>
                  <span className={cn('rounded px-2 py-0.5 text-[11px] font-bold text-white',
                    evt.detectLevel === 'L1' ? 'bg-l1-badge' : 'bg-l2-badge'
                  )}>
                    {evt.detectLevel}
                  </span>
                </div>
                <span className={cn('text-[11px]', evt.status === '待人工确认' ? 'text-warning' : 'text-success')}>
                  {evt.status}
                </span>
              </button>
              <div className="mt-1 text-xs text-text-primary">{evt.anomalyType} — {evt.materialName}</div>
              <div className="mt-1 text-[11px] text-text-muted">{evt.source}</div>
              {isExpanded && (
                <div className="mt-2 border-t border-border pt-2">
                  <div className="rounded-md border-l-[3px] border-l-info bg-primary p-2">
                    <span className="text-[11px] font-semibold text-info">Agent建议：</span>
                    <p className="mt-0.5 text-xs text-text-secondary">{evt.suggestedActions.join('，')}</p>
                  </div>
                  <div className="mt-2 flex gap-2">
                    <button
                      onClick={() => navigate(`/exceptions/${evt.eventNo}`)}
                      className="flex h-9 flex-1 items-center justify-center rounded bg-info text-xs font-semibold text-white"
                    >
                      查看详情
                    </button>
                    <button
                      onClick={() => navigate(`/exceptions/result/${evt.eventNo}`)}
                      className="flex h-9 flex-1 items-center justify-center rounded bg-warning text-xs font-semibold text-white"
                    >
                      快速上报
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ExceptionsList;
