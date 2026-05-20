import type { FC } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { inspectionTasks } from '@/data/mockData';
import { cn } from '@/lib/utils';

type FilterStatus = '全部' | '待巡检' | '巡检中' | '已完成';
const filters: FilterStatus[] = ['全部', '待巡检', '巡检中', '已完成'];

const InspectTaskPage: FC = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<FilterStatus>('全部');

  const filtered = activeFilter === '全部'
    ? inspectionTasks
    : inspectionTasks.filter(t => {
        if (activeFilter === '待巡检') return t.status === '待执行';
        if (activeFilter === '巡检中') return t.status === '异常';
        return t.status === '已完成';
      });

  const statusBadge = (task: typeof inspectionTasks[0]) => {
    if (task.status === '异常') return 'bg-warning/15 text-warning';
    if (task.status === '已完成') return 'bg-success/15 text-success';
    return 'bg-info/15 text-info';
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
              activeFilter === f ? 'bg-info text-white' : 'border border-border text-text-muted'
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
            onClick={() => navigate('/pda/inspect/check', { state: { taskNo: task.taskNo } })}
            className="w-full rounded-lg bg-white p-3 text-left transition-all active:scale-[0.98] active:bg-info/10"
          >
            <div className="flex items-center justify-between">
              <span className="font-data text-sm font-semibold text-info">{task.taskNo}</span>
              <span className={cn('rounded px-2 py-0.5 text-[11px] font-bold', statusBadge(task))}>
                {task.status}
              </span>
            </div>
            <div className="mt-1 text-sm font-semibold text-text-primary">
              {task.location} — {task.materialName}
            </div>
            <div className="mt-1 text-[11px] text-text-muted">{task.category}</div>
            {task.riskAttr !== '常规' && (
              <div className="mt-1">
                <span className="rounded bg-warning/15 px-2 py-0.5 text-[11px] text-warning">{task.riskAttr}</span>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default InspectTaskPage;
