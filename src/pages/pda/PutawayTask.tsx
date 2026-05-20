import type { FC } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { putawayTasks } from '@/data/mockData';
import { cn } from '@/lib/utils';

type FilterStatus = '全部' | '待上架' | '上架中' | '已完成';

const filters: FilterStatus[] = ['全部', '待上架', '上架中', '已完成'];

const PutawayTask: FC = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<FilterStatus>('全部');

  const filtered = activeFilter === '全部'
    ? putawayTasks
    : putawayTasks.filter(t => {
        if (activeFilter === '待上架') return t.status === '待执行';
        if (activeFilter === '已完成') return t.status === '已完成';
        return false;
      });

  const statusColor = (status: string) => {
    if (status === '待执行') return 'bg-info/15 text-info';
    return 'bg-success/15 text-success';
  };

  return (
    <div className="h-full bg-primary px-4 pt-3 pb-4">
      {/* Filters */}
      <div className="mb-3 flex gap-2 overflow-x-auto">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={cn('shrink-0 rounded-full px-4 py-1.5 text-xs font-medium transition-all',
              activeFilter === f
                ? 'bg-info text-white'
                : 'border border-border text-text-muted'
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Task List */}
      <div className="space-y-2">
        {filtered.map((task) => (
          <button
            key={task.taskNo}
            onClick={() => navigate('/pda/putaway/scan', { state: { taskNo: task.taskNo } })}
            className="w-full rounded-lg bg-white p-3 text-left transition-all active:scale-[0.98] active:bg-info/10"
          >
            <div className="flex items-center justify-between">
              <span className="font-data text-sm font-semibold text-info">{task.taskNo}</span>
              <span className={cn('rounded px-2 py-0.5 text-[11px] font-bold', statusColor(task.status))}>
                {task.status === '待执行' ? '待上架' : task.status}
              </span>
            </div>
            <div className="mt-1.5 text-xs text-text-primary">{task.materialName}</div>
            <div className="mt-1 flex items-center gap-1">
              <span className="text-[11px] text-text-muted">目标库位：</span>
              <span className="font-data text-xs font-semibold text-text-primary">{task.targetLocation}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default PutawayTask;
