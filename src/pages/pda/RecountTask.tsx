import type { FC } from 'react';
import { recountTasks } from '@/data/mockData';
import { cn } from '@/lib/utils';

const sourceColor: Record<string, string> = {
  '动碰': 'bg-info/15 text-info',
  '静态': 'bg-warning/15 text-warning',
  '巡检触发': 'bg-danger/15 text-danger',
};

const RecountTask: FC = () => {
  return (
    <div className="h-full bg-primary px-4 pt-3 pb-4">
      {/* Filter tags */}
      <div className="mb-3 flex gap-2 overflow-x-auto">
        {['全部', '动碰', '静态', '巡检触发'].map((f) => (
          <button
            key={f}
            className={cn('shrink-0 rounded-full px-3 py-1.5 text-xs font-medium',
              f === '全部' ? 'bg-info text-white' : 'border border-border text-text-muted'
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Task list */}
      <div className="space-y-2">
        {recountTasks.map((task) => (
          <div key={task.taskNo} className="rounded-lg bg-white p-3">
            <div className="flex items-center justify-between">
              <span className="font-data text-sm font-semibold text-info">{task.taskNo}</span>
              <span className={cn('rounded px-2 py-0.5 text-[11px] font-bold', sourceColor[task.triggerSource] || 'bg-border text-text-muted')}>
                {task.triggerSource}
              </span>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <div>
                <span className="text-[11px] text-text-muted">库位</span>
                <div className="font-data text-xs text-text-primary">{task.location}</div>
              </div>
              <div>
                <span className="text-[11px] text-text-muted">物资</span>
                <div className="text-xs text-text-primary">{task.materialName}</div>
              </div>
              <div>
                <span className="text-[11px] text-text-muted">系统库存</span>
                <div className="font-data text-xs text-text-primary">{task.systemQuantity}{task.unit}</div>
              </div>
              <div>
                <span className="text-[11px] text-text-muted">上次盘点</span>
                <div className="font-data text-xs text-text-primary">{task.lastCountDate}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecountTask;
