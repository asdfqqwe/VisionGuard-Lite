import type { FC } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { problemItems } from '@/data/mockData';
import { cn } from '@/lib/utils';

const receivers = ['质检主管', '收货主管', '安全主管', '巡检员'];
const disposeOptions = [
  { label: '复核通过入库', location: 'A-04-01', tone: 'success' },
  { label: '隔离待整改', location: 'Q-A03', tone: 'warning' },
  { label: '退回供应商', location: 'Q-RETURN', tone: 'danger' },
] as const;

const ProblemHandover: FC = () => {
  const navigate = useNavigate();
  const item = problemItems[0] || {
    problemItemNo: 'IQ-001',
    materialName: '一次性丁腈手套',
    anomalyType: '外箱缺产品标识标签',
    tempLocation: 'TMP-Q01',
    images: ['/images/handover-photo-1.jpg', '/images/handover-photo-2.jpg', '/images/handover-photo-3.jpg'],
  };
  const [receiver, setReceiver] = useState('');
  const [disposeAction, setDisposeAction] = useState<(typeof disposeOptions)[number]['label']>('隔离待整改');
  const [fixed, setFixed] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!receiver) return;
    setSubmitted(true);
    setTimeout(() => navigate('/pda'), 1500);
  };

  if (submitted) {
    return (
      <div className="flex h-full flex-col items-center justify-center bg-primary px-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/20">
          <svg className="h-8 w-8 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="mt-4 text-lg font-semibold text-success">现场处理已登记</p>
        <p className="mt-2 text-sm text-text-muted">{item.problemItemNo} · {disposeAction}</p>
      </div>
    );
  }

  return (
    <div className="h-full bg-primary px-4 pt-3 pb-4">
      {/* Problem Item Info */}
      <div className="rounded-lg bg-white p-3">
        <div className="flex items-center justify-between">
          <span className="font-data text-base font-semibold text-info">{item.problemItemNo}</span>
          <span className="rounded bg-defect-badge px-2 py-0.5 text-[11px] font-bold text-white">
            {item.anomalyType}
          </span>
        </div>
        <div className="mt-2 text-sm text-text-primary">{item.materialName}</div>
        <div className="mt-1 text-xs text-text-muted">
          临时库位：<span className="font-data text-info">{item.tempLocation}</span>
        </div>
      </div>

      {/* 3 Photo Thumbnails */}
      <div className="mt-4">
        <h3 className="mb-2 text-sm font-semibold text-text-primary">现场照片</h3>
        <div className="flex gap-2">
          {item.images.map((src, idx) => (
            <div
              key={idx}
              className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded bg-white border border-border"
            >
              <img src={src} alt={`现场照片-${idx + 1}`} className="h-full w-full object-cover" />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 rounded-lg bg-white p-3">
        <h3 className="mb-2 text-sm font-semibold text-text-primary">整改与去向</h3>
        <label className="flex items-center gap-2 rounded border border-border px-3 py-2">
          <input
            type="checkbox"
            checked={fixed}
            onChange={(e) => setFixed(e.target.checked)}
            className="h-4 w-4 accent-info"
          />
          <span className="text-xs text-text-secondary">问题项已整改，复拍照片已上传</span>
        </label>
        <div className="mt-3 grid grid-cols-1 gap-2">
          {disposeOptions.map((option) => {
            const active = disposeAction === option.label;
            return (
              <button
                key={option.label}
                onClick={() => setDisposeAction(option.label)}
                className={cn(
                  'flex items-center justify-between rounded border px-3 py-2 text-left transition-all',
                  active
                    ? option.tone === 'success'
                      ? 'border-success bg-success/10 text-success'
                      : option.tone === 'danger'
                        ? 'border-danger bg-danger/10 text-danger'
                        : 'border-warning bg-warning/10 text-warning'
                    : 'border-border bg-primary text-text-secondary',
                )}
              >
                <span className="text-xs font-semibold">{option.label}</span>
                <span className="font-data text-[11px]">{option.location}</span>
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-[11px] leading-relaxed text-text-muted">
          复核通过后生成上架任务；仍有问题则留在隔离区，等待退货或供应商整改。
        </p>
      </div>

      {/* Receiver */}
      <div className="mt-4">
        <label className="mb-2 block text-sm text-text-primary">接收人</label>
        <div className="grid grid-cols-2 gap-2">
          {receivers.map((r) => (
            <button
              key={r}
              onClick={() => setReceiver(r)}
              className={cn('rounded py-2.5 text-xs text-text-primary transition-all',
                receiver === r
                  ? 'border border-info bg-info/15 text-info'
                  : 'border border-border bg-white'
              )}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="mt-6">
        <button
          onClick={handleSubmit}
          disabled={!receiver}
          className={cn('h-11 w-full rounded-md text-sm font-semibold text-white',
            receiver ? fixed && disposeAction === '复核通过入库' ? 'bg-success' : 'bg-danger-gradient' : 'bg-danger/40'
          )}
        >
          确认处理并同步后台
        </button>
      </div>
    </div>
  );
};

export default ProblemHandover;
