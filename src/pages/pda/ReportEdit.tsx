import type { FC } from 'react';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Camera } from 'lucide-react';
import { cn } from '@/lib/utils';

const anomalyTypes = ['外观缺陷', '标签缺失', '数量不符', '型号不符', '标准号不清晰', '其他'];
const handlers = ['收货主管', '质检员', '巡检员', '安全主管', '收货员'];

const ReportEdit: FC = () => {
  const { draftId } = useParams<{ draftId: string }>();
  const navigate = useNavigate();
  const [anomalyType, setAnomalyType] = useState('');
  const [handler, setHandler] = useState('');
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    setSubmitted(true);
    setTimeout(() => navigate('/pda/exceptions'), 900);
  };

  if (submitted) {
    return (
      <div className="flex h-full flex-col items-center justify-center bg-primary px-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/20">
          <svg className="h-8 w-8 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="mt-4 text-lg font-semibold text-success">上报成功</p>
        <p className="mt-2 text-sm text-text-muted">已生成异常报告 {draftId || 'AR-001'}</p>
      </div>
    );
  }

  return (
    <div className="h-full bg-primary px-4 pt-3 pb-4">
      {/* Header */}
      <div className="mb-3 font-data text-sm text-text-muted">草稿号：{draftId || 'AR-001'}</div>

      {/* Anomaly Type */}
      <div className="mb-3">
        <label className="mb-1 block text-[11px] text-text-muted">异常类型</label>
        <div className="grid grid-cols-3 gap-2">
          {anomalyTypes.map((type) => (
            <button
              key={type}
              onClick={() => setAnomalyType(type)}
              className={cn('rounded py-2 text-xs text-text-primary transition-all',
                anomalyType === type
                  ? 'border border-info bg-info/15 text-info'
                  : 'border border-border bg-white'
              )}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Suggested Handler */}
      <div className="mb-3">
        <label className="mb-1 block text-[11px] text-text-muted">建议处理人</label>
        <div className="grid grid-cols-3 gap-2">
          {handlers.map((h) => (
            <button
              key={h}
              onClick={() => setHandler(h)}
              className={cn('rounded py-2 text-xs text-text-primary transition-all',
                handler === h
                  ? 'border border-info bg-info/15 text-info'
                  : 'border border-border bg-white'
              )}
            >
              {h}
            </button>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div className="mb-3">
        <label className="mb-1 block text-[11px] text-text-muted">备注</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="输入备注信息"
          className={cn('w-full rounded border border-border bg-white px-3 py-2 text-sm text-text-primary outline-none placeholder:text-text-muted', 'h-20 focus:border-info')}
        />
      </div>

      {/* Photos */}
      <div className="mb-3">
        <label className="mb-1 block text-[11px] text-text-muted">照片（最多4张）</label>
        <div className="grid grid-cols-4 gap-2">
          {[0, 1, 2, 3].map((i) => (
            <button key={i} className="flex h-16 items-center justify-center rounded border border-border bg-white active:bg-border">
              <Camera className="h-5 w-5 text-text-muted" />
            </button>
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="mt-6">
        <button
          onClick={handleSubmit}
          disabled={!anomalyType || !handler}
          className={cn('h-11 w-full rounded-md bg-accent-gradient text-sm font-semibold text-white', 'active:scale-[0.98]')}
        >
          提交上报
        </button>
      </div>
    </div>
  );
};

export default ReportEdit;
