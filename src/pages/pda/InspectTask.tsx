import type { FC } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardCheck, FileSearch, PlayCircle, ScanLine, Shuffle, Tag } from 'lucide-react';
import { DemoStepBadge } from '@/components/shared';
import { cn } from '@/lib/utils';

type FilterStatus = '全部' | '待执行' | '进行中' | '已完成';

const filters: FilterStatus[] = ['全部', '待执行', '进行中', '已完成'];

const qualitySamplingTasks = [
  {
    taskNo: 'QI-20260521-01',
    location: 'A-01 入库暂存区',
    materialName: '前保险杠',
    category: '关键外观件',
    status: '待执行',
    sampleText: '抽 5 / 20 件',
    reason: '日常质量抽检规则',
    samples: '#02、#05、#08、#11、#14',
    checks: ['外观划伤', '标签可读', '数量一致'],
  },
  {
    taskNo: 'QI-20260521-02',
    location: 'A-06-03',
    materialName: '5W-40 机油',
    category: '效期物资',
    status: '已完成',
    sampleText: '抽 2 / 6 桶',
    reason: '效期巡检',
    samples: '#01、#04',
    checks: ['标签清晰', '效期可读', '包装无渗漏'],
  },
  {
    taskNo: 'QI-20260521-03',
    location: 'B-01-02',
    materialName: '前轮轴承',
    category: '关键零部件',
    status: '进行中',
    sampleText: '抽 3 / 20 件',
    reason: '重点物资抽检',
    samples: '#03、#09、#16',
    checks: ['外包装完整', '批次可读', '无锈蚀'],
  },
];

const InspectTaskPage: FC = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<FilterStatus>('全部');
  const filteredTasks =
    activeFilter === '全部'
      ? qualitySamplingTasks
      : qualitySamplingTasks.filter((task) => task.status === activeFilter);

  return (
    <div className="h-full overflow-hidden bg-primary px-4 pt-3 pb-4">
      <div className="rounded-lg bg-white p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ClipboardCheck className="h-4 w-4 text-info" />
            <span className="text-sm font-semibold text-text-primary">仓库日常质量抽检</span>
          </div>
          <span className="rounded bg-info/10 px-2 py-0.5 text-[11px] font-semibold text-info">系统下发</span>
        </div>
        <p className="mt-1 text-[11px] leading-relaxed text-text-secondary">
          按规则抽取样本，现场核查外观、标签、条码和数量，结果回传后台记录。
        </p>
      </div>

      <div className="mt-3 rounded-lg border-2 border-info bg-info/10 p-3">
        <div className="flex items-center gap-2">
          <PlayCircle className="h-4 w-4 text-info" />
          <span className="text-sm font-semibold text-text-primary">推荐演示任务</span>
        </div>
        <p className="mt-1 text-[11px] leading-relaxed text-text-secondary">
          前保险杠为关键外观件，本次抽取 5 件。进入后先拍照识别样本，再人工核对字段。
        </p>
        <div className="mt-2 grid grid-cols-3 gap-2 text-[10px]">
          <span className="rounded bg-white px-2 py-1 text-info">样本 #02/#05/#08/#11/#14</span>
          <span className="rounded bg-white px-2 py-1 text-success">外观 + 标签</span>
          <span className="rounded bg-white px-2 py-1 text-warning">PDA 现场完成</span>
        </div>
        <button
          onClick={() => navigate('/pda/inspect/check', { state: { taskNo: 'QI-20260521-01' } })}
          className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded bg-info text-xs font-semibold text-white"
        >
          <DemoStepBadge step={1} />
          <PlayCircle className="h-4 w-4" />
          开始质量抽检
        </button>
      </div>

      <div className="mt-3 flex gap-2 overflow-x-auto">
        {filters.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={cn(
              'shrink-0 rounded-full px-4 py-1.5 text-xs font-medium transition-all',
              activeFilter === filter ? 'bg-info text-white' : 'border border-border bg-white text-text-muted',
            )}
          >
            {filter}
          </button>
        ))}
      </div>

      <div className="mt-3 space-y-2 overflow-y-auto pb-2" style={{ maxHeight: 345, scrollbarWidth: 'none' }}>
        {filteredTasks.map((task) => (
          <button
            key={task.taskNo}
            onClick={() => navigate('/pda/inspect/check', { state: { taskNo: task.taskNo } })}
            className={cn(
              'w-full rounded-lg border bg-white p-3 text-left transition-all active:scale-[0.98]',
              task.taskNo === 'QI-20260521-01' ? 'border-2 border-info shadow-[0_8px_18px_rgba(59,130,246,0.18)]' : 'border-border',
            )}
          >
            <div className="flex items-center justify-between">
              <span className="font-data text-sm font-semibold text-info">{task.taskNo}</span>
              <span
                className={cn(
                  'rounded px-2 py-0.5 text-[11px] font-bold',
                  task.status === '已完成'
                    ? 'bg-success/10 text-success'
                    : task.status === '进行中'
                      ? 'bg-warning/10 text-warning'
                      : 'bg-info/10 text-info',
                )}
              >
                {task.status}
              </span>
            </div>
            <div className="mt-1 text-sm font-semibold text-text-primary">
              {task.location} - {task.materialName}
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2 text-[11px]">
              <div className="rounded bg-info/10 px-2 py-1 text-info">
                <Shuffle className="mr-1 inline h-3 w-3" />
                {task.sampleText}
              </div>
              <div className="rounded bg-success/10 px-2 py-1 text-success">
                <ScanLine className="mr-1 inline h-3 w-3" />
                {task.reason}
              </div>
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              {task.checks.map((check) => (
                <span key={check} className="rounded bg-primary px-2 py-0.5 text-[10px] text-text-secondary">
                  {check}
                </span>
              ))}
            </div>
            <div className="mt-2 flex items-center gap-2 text-[11px] text-text-muted">
              <Tag className="h-3.5 w-3.5" />
              <span>样本：{task.samples}</span>
              <FileSearch className="ml-auto h-3.5 w-3.5 text-info" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default InspectTaskPage;
