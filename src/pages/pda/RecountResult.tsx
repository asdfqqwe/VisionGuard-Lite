import type { FC } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Camera, FileText, ScanLine, ScanText, Tag } from 'lucide-react';
import { DemoStepBadge } from '@/components/shared';
import { cn } from '@/lib/utils';

const ocrFields = [
  { label: '批次', value: 'B20260310A', status: '匹配' },
  { label: '料号', value: 'WATER-550ML', status: '匹配' },
  { label: '数量', value: '10 / 12 箱', status: '差异' },
  { label: '标签', value: '10 张已读', status: '匹配' },
];

const issueTypes = ['混批', '错放', '漏盘', '多盘'];
const evidencePhotos = [
  { label: '库位码', value: 'A-03-05', image: '/images/recount-pda-location-scan.png', icon: ScanLine },
  { label: '货物码', value: 'WATER-550ML', image: '/images/recount-pda-item-scan.png', icon: ScanLine },
  { label: '标签状态', value: '完整', image: '/images/recount-pda-label-check.png', icon: Tag },
  { label: '现场点数', value: '10 箱', image: '/images/recount-pda-count-entry.png', icon: Camera },
];

const RecountResult: FC = () => {
  const navigate = useNavigate();
  const [selectedIssue, setSelectedIssue] = useState('漏盘');

  return (
    <div className="h-full bg-primary px-4 pt-3 pb-4">
      <div className="rounded-lg bg-white p-3">
        <div className="font-data text-sm font-semibold text-info">RC-001 盘点结果</div>
        <div className="mt-2 flex justify-around">
          <div className="text-center">
            <div className="font-data text-lg font-bold text-text-primary">12</div>
            <div className="text-[10px] text-text-muted">系统箱数</div>
          </div>
          <div className="text-center">
            <div className="font-data text-lg font-bold text-warning">10</div>
            <div className="text-[10px] text-text-muted">现场箱数</div>
          </div>
          <div className="text-center">
            <div className="font-data text-lg font-bold text-danger">-2</div>
            <div className="text-[10px] text-text-muted">差异</div>
          </div>
        </div>
      </div>

      <div className="mt-3 rounded-lg border-2 border-danger/30 bg-danger/10 p-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-danger">
          <AlertTriangle className="h-4 w-4" />
          PDA 现场盘点少 2 箱
        </div>
        <p className="mt-1 text-[11px] leading-relaxed text-text-secondary">
          系统库存 12 箱，现场点数 10 箱。已预选问题分类为漏盘，可直接提交。
        </p>
        <button
          onClick={() => navigate('/pda/problem/handover?scenario=recount')}
          className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded bg-danger text-xs font-semibold text-white"
        >
          <DemoStepBadge step={3} />
          提交差异处理
        </button>
      </div>

      <div className="mt-3 rounded-lg border border-danger/30 bg-danger/10 p-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-text-primary">矿泉水</span>
          <span className="rounded bg-danger px-2 py-0.5 text-[11px] font-bold text-white">漏盘</span>
        </div>
        <div className="mt-2 grid grid-cols-3 gap-2">
          <div className="text-center">
            <div className="text-[11px] text-text-muted">系统</div>
            <div className="font-data text-sm">12 箱</div>
          </div>
          <div className="text-center">
            <div className="text-[11px] text-text-muted">现场</div>
            <div className="font-data text-sm">10 箱</div>
          </div>
          <div className="text-center">
            <div className="text-[11px] text-text-muted">差异</div>
            <div className="font-data text-sm font-semibold text-danger">-2</div>
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-lg bg-white p-3">
        <div className="mb-2 flex items-center gap-2">
          <ScanText className="h-4 w-4 text-info" />
          <h3 className="text-sm font-semibold text-text-primary">PDA 采集字段</h3>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {ocrFields.map((field) => (
            <div key={field.label} className="rounded bg-primary px-2 py-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-text-muted">{field.label}</span>
                <span className={cn('text-[10px]', field.status === '待整改' ? 'text-warning' : 'text-success')}>
                  {field.status}
                </span>
              </div>
              <div className="mt-0.5 truncate font-data text-[11px] text-text-primary">{field.value}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 rounded-lg bg-white p-3">
        <div className="mb-2 text-sm font-semibold text-text-primary">问题分类</div>
        <div className="grid grid-cols-4 gap-1.5">
          {issueTypes.map((issue) => (
            <button
              key={issue}
              onClick={() => setSelectedIssue(issue)}
              className={cn(
                'rounded border px-2 py-1.5 text-[11px] font-semibold',
                selectedIssue === issue
                  ? 'border-danger bg-danger/10 text-danger'
                  : 'border-border bg-primary text-text-secondary',
              )}
            >
              {issue}
            </button>
          ))}
        </div>
        <p className="mt-2 text-[11px] text-text-muted">当前选择：{selectedIssue}。提交后进入后台差异处理列表。</p>
      </div>

      <div className="mt-4 rounded-lg bg-white p-3">
        <div className="mb-2 flex items-center gap-2">
          <FileText className="h-4 w-4 text-info" />
          <h3 className="text-sm font-semibold text-text-primary">现场证据</h3>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {evidencePhotos.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="overflow-hidden rounded bg-primary">
                <div className="relative h-16 bg-[#0F172A]">
                  <img src={item.image} alt={item.label} className="h-full w-full object-cover" />
                  <div className="absolute left-1.5 top-1.5 rounded bg-success px-1.5 py-0.5 text-[9px] font-semibold text-white">
                    已采集
                  </div>
                </div>
                <div className="px-2 py-1.5">
                  <div className="flex items-center gap-1">
                    <Icon className="h-3.5 w-3.5 text-success" />
                    <p className="text-[10px] text-text-muted">{item.label}</p>
                  </div>
                  <p className="mt-0.5 truncate text-[11px] font-semibold text-text-primary">{item.value}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Agent Suggestion */}
      <div className="mt-4 rounded-md border-l-[3px] border-l-info bg-white p-3">
        <span className="text-xs font-semibold text-info">Agent建议：</span>
        <p className="mt-1 text-xs text-text-secondary">
          RC-001 现场盘点少 2 箱。建议现场人员在 PDA 提交差异，后台保留照片、库位码、货物码和标签记录。
        </p>
      </div>

      {/* Action buttons */}
      <div className="mt-6 space-y-2">
        <button
          onClick={() => navigate('/pda/problem/handover?scenario=recount')}
          className="h-11 w-full rounded-md bg-danger text-sm font-semibold text-white"
        >
          <span className="inline-flex items-center justify-center gap-2">
            <DemoStepBadge step={3} />
            提交差异处理
          </span>
        </button>
      </div>
    </div>
  );
};

export default RecountResult;
