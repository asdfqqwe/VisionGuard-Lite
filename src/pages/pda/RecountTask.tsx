import type { FC } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarClock, MonitorCheck, PlayCircle, Send, Smartphone } from 'lucide-react';
import { DemoStepBadge } from '@/components/shared';
import { recountTasks } from '@/data/mockData';
import { cn } from '@/lib/utils';

type SourceFilter = '全部' | '动碰' | '静态' | '巡检触发';
const filters: SourceFilter[] = ['全部', '动碰', '静态', '巡检触发'];

const sourceColor: Record<string, string> = {
  '动碰': 'bg-info/15 text-info',
  '静态': 'bg-warning/15 text-warning',
  '巡检触发': 'bg-danger/15 text-danger',
};

const taskPlans: Record<string, {
  frequency: string;
  deadline: string;
  method: 'Station' | 'PDA';
  dispatchStatus: string;
}> = {
  'RC-001': {
    frequency: '重点库位 · 周度',
    deadline: '今日 16:00',
    method: 'PDA',
    dispatchStatus: '已下发',
  },
  'RC-002': {
    frequency: '动碰 · 实时',
    deadline: '今日 14:30',
    method: 'PDA',
    dispatchStatus: '已接收',
  },
};

const RecountTask: FC = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<SourceFilter>('全部');
  const filteredTasks = activeFilter === '全部'
    ? recountTasks
    : recountTasks.filter((task) => task.triggerSource === activeFilter);

  return (
    <div className="h-full bg-primary px-4 pt-3 pb-4">
      <div className="mb-3 rounded-lg border-2 border-warning bg-warning/10 p-3">
        <div className="flex items-center gap-2">
          <PlayCircle className="h-4 w-4 text-warning" />
          <span className="text-sm font-semibold text-text-primary">在库循环盘点演示</span>
        </div>
        <p className="mt-1 text-[11px] leading-relaxed text-text-secondary">
          Admin 已按动碰记录和上次盘点日期生成 RC-001。现场人员使用 PDA 接收任务后，先核对库位与货物。
        </p>
        <button
          onClick={() => navigate('/pda/recount', { state: { taskNo: 'RC-001' } })}
          className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded bg-warning text-xs font-semibold text-white"
        >
          <DemoStepBadge step={1} />
          <PlayCircle className="h-4 w-4" />
          开始库位盘点
        </button>
      </div>

      {/* Filter tags */}
      <div className="mb-3 flex gap-2 overflow-x-auto">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={cn('shrink-0 rounded-full px-3 py-1.5 text-xs font-medium',
              activeFilter === f ? 'bg-info text-white' : 'border border-border text-text-muted'
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Task list */}
      <div className="space-y-2">
        {filteredTasks.map((task) => {
          const plan = taskPlans[task.taskNo] ?? {
            frequency: `${task.triggerSource}盘点`,
            deadline: '今日内',
            method: 'PDA' as const,
            dispatchStatus: '已下发',
          };
          const MethodIcon = plan.method === 'Station' ? MonitorCheck : Smartphone;

          return (
              <button
              key={task.taskNo}
              onClick={() => navigate('/pda/recount', { state: { taskNo: task.taskNo } })}
              className={cn(
                'w-full rounded-lg bg-white p-3 text-left transition-all active:scale-[0.98] active:bg-info/10',
                task.taskNo === 'RC-001' && 'border-2 border-warning shadow-[0_8px_18px_rgba(245,158,11,0.18)]',
              )}
            >
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
              <div className="mt-3 grid grid-cols-3 gap-1.5">
                <div className="rounded bg-primary px-2 py-1.5">
                  <div className="flex items-center gap-1 text-[10px] text-text-muted">
                    <CalendarClock className="h-3 w-3" />
                    频次
                  </div>
                  <div className="mt-0.5 truncate text-[11px] text-text-primary">{plan.frequency}</div>
                </div>
                <div className="rounded bg-primary px-2 py-1.5">
                  <div className="flex items-center gap-1 text-[10px] text-text-muted">
                    <MethodIcon className="h-3 w-3" />
                    方式
                  </div>
                  <div className="mt-0.5 text-[11px] text-text-primary">{plan.method}</div>
                </div>
                <div className="rounded bg-primary px-2 py-1.5">
                  <div className="flex items-center gap-1 text-[10px] text-text-muted">
                    <Send className="h-3 w-3" />
                    状态
                  </div>
                  <div className="mt-0.5 text-[11px] text-success">{plan.dispatchStatus}</div>
                </div>
              </div>
              <div className="mt-2 text-[11px] text-text-muted">截止：{plan.deadline}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default RecountTask;
