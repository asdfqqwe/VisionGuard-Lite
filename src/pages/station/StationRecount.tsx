import type { FC } from 'react';
import { useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Boxes,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  PackageSearch,
  Scale,
  ScanLine,
  Truck,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const queue = [
  {
    id: 'RC-001',
    material: '矿泉水',
    location: 'A-03-05',
    qty: '系统 12 箱',
    mode: '整箱视觉计数',
    status: '已到检测区',
  },
  {
    id: 'RC-003',
    material: '5W-40 机油',
    location: 'B-02-04',
    qty: '系统 6 桶',
    mode: '散装重量复核',
    status: '待搬运',
  },
  {
    id: 'RC-004',
    material: '前保险杠',
    location: 'B-01-03',
    qty: '系统 8 件',
    mode: '大件视觉计数',
    status: '待检测',
  },
];

const ocrRows = [
  { label: '标签批次', value: 'B20260310A', state: '匹配' },
  { label: '数量字段', value: '12 箱 / 144 瓶', state: '差异' },
  { label: '奇瑞料号', value: 'CHERY-WATER-550', state: '匹配' },
  { label: '货物条码', value: '12 / 12 已采集', state: '匹配' },
];

const issueRows = [
  { label: '混批', value: '0', tone: 'success' },
  { label: '错放', value: '0', tone: 'success' },
  { label: '漏盘', value: '2 箱', tone: 'danger' },
  { label: '多盘', value: '0', tone: 'success' },
];

export const StationRecount: FC = () => {
  const [selectedTask, setSelectedTask] = useState(queue[0]);
  const [moved, setMoved] = useState(true);
  const [fullOcr, setFullOcr] = useState(true);
  const [reviewed, setReviewed] = useState(false);

  return (
    <div className="grid h-full grid-cols-[300px_1fr_320px] gap-3 bg-primary p-3">
      <aside className="flex min-h-0 flex-col rounded-lg border border-border bg-white p-3">
        <div className="mb-3 flex items-center gap-2">
          <ClipboardCheck className="h-4 w-4 text-info" />
          <h2 className="text-sm font-semibold text-text-primary">盘点视觉复核</h2>
        </div>
        <div className="space-y-2">
          {queue.map((item) => {
            const active = selectedTask.id === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setSelectedTask(item);
                  setMoved(item.status !== '待搬运');
                  setFullOcr(true);
                  setReviewed(false);
                }}
                className={cn(
                  'w-full rounded-lg border p-3 text-left transition-all',
                  active ? 'border-info bg-info/10' : 'border-border bg-primary hover:bg-info/5',
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="font-data text-xs font-semibold text-info">{item.id}</span>
                  <span className={cn(
                    'rounded px-2 py-0.5 text-[10px]',
                    item.status === '待搬运' ? 'bg-warning/15 text-warning' : 'bg-success/15 text-success',
                  )}>
                    {item.status}
                  </span>
                </div>
                <div className="mt-2 text-sm font-semibold text-text-primary">{item.material}</div>
                <div className="mt-1 grid grid-cols-2 gap-1.5 text-[11px] text-text-muted">
                  <span>{item.location}</span>
                  <span>{item.qty}</span>
                </div>
                <div className="mt-2 text-[11px] text-text-secondary">{item.mode}</div>
              </button>
            );
          })}
        </div>

        <div className="mt-auto rounded-lg bg-primary p-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-text-primary">
            <Truck className="h-4 w-4 text-warning" />
            现场流转
          </div>
          <div className="mt-2 space-y-2 text-[11px] text-text-secondary">
            <div className="flex items-center justify-between">
              <span>PDA 发起复核</span>
              <CheckCircle2 className="h-3.5 w-3.5 text-success" />
            </div>
            <div className="flex items-center justify-between">
              <span>货物到检测区</span>
              {moved ? <CheckCircle2 className="h-3.5 w-3.5 text-success" /> : <AlertTriangle className="h-3.5 w-3.5 text-warning" />}
            </div>
            <div className="flex items-center justify-between">
              <span>结果回传 PDA</span>
              <span className="text-text-muted">待确认</span>
            </div>
          </div>
          {!moved && (
            <button
              onClick={() => setMoved(true)}
              className="mt-3 h-8 w-full rounded bg-warning text-xs font-semibold text-white"
            >
              确认已移至检测区
            </button>
          )}
        </div>
      </aside>

      <main className="flex min-h-0 flex-col gap-3">
        <section className="relative min-h-0 flex-1 overflow-hidden rounded-lg border border-border bg-[#0F172A]">
          <img
            src="/images/station-cam/cam-01-shelf-overview.jpg"
            alt="盘点视觉复核"
            className="h-full w-full object-contain opacity-90"
          />
          <div className="absolute left-[36%] top-[20%] h-[17%] w-[31%] rounded border-2 border-success shadow-[0_0_0_2px_rgba(34,197,94,0.2)]">
            <span className="absolute -top-6 left-0 rounded bg-success px-2 py-1 text-[11px] font-semibold text-white">
              整箱 6 / 6
            </span>
          </div>
          <div className="absolute left-[44%] top-[28%] h-[6%] w-[7%] rounded border-2 border-info">
            <span className="absolute left-full top-0 ml-1 rounded bg-info px-2 py-1 text-[10px] text-white">
              托码已读
            </span>
          </div>
          <div className="absolute left-[44%] top-[45%] h-[6%] w-[7%] rounded border-2 border-warning">
            <span className="absolute left-full top-0 ml-1 rounded bg-warning px-2 py-1 text-[10px] text-white">
              数量字段待核
            </span>
          </div>
          <div className="absolute bottom-3 left-3 rounded bg-black/60 px-3 py-2 text-xs text-white backdrop-blur">
            主相机 · 盘点复核 · {selectedTask.material}
          </div>
        </section>

        <section className="grid grid-cols-4 gap-3">
          {[
            { icon: Boxes, label: '视觉计数', value: selectedTask.id === 'RC-001' ? '10 / 12 箱' : '6 / 6', tone: 'text-warning' },
            { icon: ScanLine, label: '条码采集', value: '12 / 12', tone: 'text-success' },
            { icon: FileText, label: 'OCR 字段', value: fullOcr ? '全量完成' : '待全量', tone: fullOcr ? 'text-success' : 'text-warning' },
            { icon: Scale, label: '散装复核', value: selectedTask.id === 'RC-003' ? '6 桶' : '不适用', tone: 'text-info' },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="rounded-lg bg-white p-3">
                <div className="flex items-center gap-2">
                  <Icon className={cn('h-4 w-4', item.tone)} />
                  <span className="text-[11px] text-text-muted">{item.label}</span>
                </div>
                <div className={cn('mt-2 font-data text-lg font-bold', item.tone)}>{item.value}</div>
              </div>
            );
          })}
        </section>
      </main>

      <aside className="flex min-h-0 flex-col rounded-lg border border-border bg-white p-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-text-primary">OCR 全量识别</h3>
          <button
            onClick={() => setFullOcr(true)}
            className={cn(
              'rounded px-2 py-1 text-[11px] font-semibold',
              fullOcr ? 'bg-success/15 text-success' : 'bg-info text-white',
            )}
          >
            {fullOcr ? '已完成' : '开始识别'}
          </button>
        </div>
        <div className="mt-3 space-y-2">
          {ocrRows.map((row) => (
            <div key={row.label} className="rounded bg-primary px-3 py-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-text-muted">{row.label}</span>
                <span className={cn('text-[11px]', row.state === '差异' ? 'text-warning' : 'text-success')}>
                  {fullOcr ? row.state : '待识别'}
                </span>
              </div>
              <div className="mt-1 truncate font-data text-xs text-text-primary">
                {fullOcr ? row.value : '--'}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4">
          <h3 className="mb-2 text-sm font-semibold text-text-primary">问题排查</h3>
          <div className="grid grid-cols-2 gap-2">
            {issueRows.map((issue) => (
              <div key={issue.label} className="rounded bg-primary p-3">
                <div className="text-[11px] text-text-muted">{issue.label}</div>
                <div className={cn('mt-1 font-data text-lg font-bold', issue.tone === 'danger' ? 'text-danger' : 'text-success')}>
                  {fullOcr ? issue.value : '--'}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 rounded-lg border border-warning/30 bg-warning/10 p-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-warning">
            <PackageSearch className="h-4 w-4" />
            复核结论
          </div>
          <p className="mt-2 text-xs leading-relaxed text-text-secondary">
            当前任务现场少 2 箱，条码齐全但视觉实点不一致。建议退回 PDA 人工复核，并在 Admin 生成差异处理记录。
          </p>
        </div>

        <div className="mt-auto space-y-2">
          <button
            onClick={() => setReviewed(true)}
            className={cn(
              'flex h-10 w-full items-center justify-center gap-2 rounded text-xs font-semibold text-white',
              'bg-warning',
            )}
          >
            提交账实差异
            <ArrowRight className="h-4 w-4" />
          </button>
          <button
            onClick={() => setReviewed(true)}
            className="h-10 w-full rounded border border-border bg-primary text-xs font-semibold text-text-secondary"
          >
            盘点一致，回写报告
          </button>
          {reviewed && (
            <div className="rounded bg-success/10 p-2 text-center text-[11px] font-semibold text-success">
              结果已回传 PDA 和 Admin
            </div>
          )}
        </div>
      </aside>
    </div>
  );
};

export default StationRecount;
