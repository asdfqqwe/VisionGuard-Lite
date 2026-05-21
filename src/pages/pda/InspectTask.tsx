import type { FC } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardCheck, PlayCircle, ScanLine, Shuffle } from 'lucide-react';
import { inspectionTasks } from '@/data/mockData';
import { cn } from '@/lib/utils';

type FilterStatus = '全部' | '待巡检' | '巡检中' | '已完成';
const filters: FilterStatus[] = ['全部', '待巡检', '巡检中', '已完成'];

const qualitySamplingTasks = [
  {
    taskNo: 'QI-20260521-01',
    location: 'A-01 入库区',
    materialName: '前保险杠',
    category: '关键零部件',
    status: '待执行',
    sampleText: '抽 5 / 20 件',
    source: '系统抽检规则',
    samples: '#02、#05、#08、#11、#14',
  },
  {
    taskNo: 'QI-20260521-03',
    location: 'A-04-01',
    materialName: '丁腈手套',
    category: '标准包装物资',
    status: '异常',
    sampleText: '整批 40 / 40 盒',
    source: '标签缺失后排查',
    samples: '全部箱标与条码',
  },
];

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
      <div className="mb-3 rounded-lg bg-white p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ClipboardCheck className="h-4 w-4 text-info" />
            <span className="text-sm font-semibold text-text-primary">质量抽检</span>
          </div>
          <span className="rounded bg-info/10 px-2 py-0.5 text-[11px] font-semibold text-info">系统下发</span>
        </div>
        <p className="mt-1 text-[11px] text-text-secondary">按后台规则锁定样本，现场逐件扫码、拍照并回传结果。</p>
      </div>

      <div className="mb-3 rounded-lg border-2 border-info bg-info/10 p-3">
        <div className="flex items-center gap-2">
          <PlayCircle className="h-4 w-4 text-info" />
          <span className="text-sm font-semibold text-text-primary">仓库日常质量抽检演示</span>
        </div>
        <p className="mt-1 text-[11px] leading-relaxed text-text-secondary">
          推荐执行前保险杠抽检任务。样本、条码和 OCR 字段已预置，点击下方按钮进入拍照确认。
        </p>
        <button
          onClick={() => navigate('/pda/inspect/check', { state: { taskNo: 'QI-20260521-01' } })}
          className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded bg-info text-xs font-semibold text-white"
        >
          <PlayCircle className="h-4 w-4" />
          开始质量抽检
        </button>
      </div>

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
        {qualitySamplingTasks.map((task) => (
          <button
            key={task.taskNo}
            onClick={() => navigate('/pda/inspect/check', { state: { taskNo: task.taskNo } })}
            className={cn(
              'w-full rounded-lg border bg-white p-3 text-left transition-all active:scale-[0.98] active:bg-info/10',
              task.taskNo === 'QI-20260521-01'
                ? 'border-2 border-info shadow-[0_8px_18px_rgba(59,130,246,0.18)]'
                : 'border-info/30',
            )}
          >
            <div className="flex items-center justify-between">
              <span className="font-data text-sm font-semibold text-info">{task.taskNo}</span>
              <span className={cn('rounded px-2 py-0.5 text-[11px] font-bold', task.status === '异常' ? 'bg-warning/15 text-warning' : 'bg-info/15 text-info')}>
                {task.status}
              </span>
            </div>
            <div className="mt-1 text-sm font-semibold text-text-primary">
              {task.location} — {task.materialName}
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2 text-[11px]">
              <div className="rounded bg-info/10 px-2 py-1 text-info">
                <Shuffle className="mr-1 inline h-3 w-3" />
                {task.sampleText}
              </div>
              <div className="rounded bg-success/10 px-2 py-1 text-success">
                <ScanLine className="mr-1 inline h-3 w-3" />
                {task.source}
              </div>
            </div>
            <div className="mt-2 text-[11px] text-text-muted">样本：{task.samples}</div>
          </button>
        ))}

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
