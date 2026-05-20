import type { FC } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { pickTasks } from '@/data/mockData';
import { cn } from '@/lib/utils';

type FilterStatus = '全部' | '待拣货' | '拣货中' | '已完成';
const filters: FilterStatus[] = ['全部', '待拣货', '拣货中', '已完成'];

const PickTaskPage: FC = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<FilterStatus>('全部');

  const filtered = activeFilter === '全部'
    ? pickTasks
    : pickTasks.filter(t => {
        if (activeFilter === '待拣货') return t.status === '待执行';
        if (activeFilter === '拣货中') return t.status === '已拣货';
        return t.status === '已拣货';
      });

  return (
    <div className="h-full bg-primary px-4 pt-3 pb-4">
      {/* Filters */}
      <div className="mb-3 flex gap-2 overflow-x-auto">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={cn('shrink-0 rounded-full px-4 py-1.5 text-xs font-medium transition-all',
              activeFilter === f ? 'bg-info text-white' : 'border border-border text-text-muted'
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Summary */}
      <div className="mb-3 flex items-center justify-between rounded bg-white px-3 py-2">
        <span className="text-xs text-text-muted">剩余库位</span>
        <span className="font-data text-sm font-semibold text-warning">{filtered.length} 个</span>
      </div>

      {/* Task List */}
      <div className="space-y-2">
        {filtered.map((task) => (
          <button
            key={task.taskNo}
            onClick={() => navigate('/pda/pick/scan', { state: { taskNo: task.taskNo } })}
            className="w-full rounded-lg bg-white p-3 text-left transition-all active:scale-[0.98] active:bg-info/10"
          >
            <div className="flex items-center justify-between">
              <span className="font-data text-sm font-semibold text-info">{task.taskNo}</span>
              <span className={cn('rounded px-2 py-0.5 text-[11px] font-bold',
                task.status === '待执行' ? 'bg-info/15 text-info' : 'bg-success/15 text-success'
              )}>
                {task.status === '待执行' ? '待拣货' : '已完成'}
              </span>
            </div>
            <div className="mt-1.5 text-xs text-text-primary">{task.materialName}</div>
            <div className="mt-1 flex items-center justify-between">
              <span className="font-data text-xs text-info">{task.sourceLocation}</span>
              <span className="font-data text-xs text-text-primary">×{task.quantity}{task.unit}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default PickTaskPage;
