import type { FC } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

const ReturnDetail: FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const returnNo = (location.state as { returnNo?: string } | null)?.returnNo || 'RT-001';

  return (
    <div className="h-full bg-primary px-4 pt-3 pb-4">
      {/* Header */}
      <div className="rounded-lg bg-white p-3">
        <div className="font-data text-sm font-semibold text-info">{returnNo}</div>
        <div className="mt-1 text-sm text-text-primary">冲压车间退料</div>
        <div className="mt-1 text-xs text-text-muted">退料原因：生产结余</div>
      </div>

      {/* Barcode rebind status */}
      <div className="mt-4">
        <h3 className="mb-2 text-sm font-semibold text-text-primary">条码重绑状态</h3>
        <div className="space-y-2">
          {[
            { name: '前轮轴承', oldCode: 'BC-OLD-001', newCode: 'BC-NEW-001', status: '已重绑' },
            { name: '发动机线束', oldCode: 'BC-OLD-002', newCode: 'BC-NEW-002', status: '已重绑' },
            { name: '雨刮电机', oldCode: 'BC-OLD-003', newCode: '—', status: '待处理' },
          ].map((item, idx) => (
            <div key={idx} className="rounded bg-white px-3 py-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-primary">{item.name}</span>
                <span className={cn('rounded px-2 py-0.5 text-[11px]',
                  item.status === '已重绑' ? 'bg-success/15 text-success' : 'bg-warning/15 text-warning'
                )}>{item.status}</span>
              </div>
              <div className="mt-1 flex items-center gap-2 text-[11px] text-text-muted">
                <span className="font-data line-through">{item.oldCode}</span>
                <span>→</span>
                <span className={cn('font-data', item.newCode === '—' ? 'text-warning' : 'text-info')}>{item.newCode}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Label reinspection */}
      <div className="mt-4">
        <h3 className="mb-2 text-sm font-semibold text-text-primary">标签复检</h3>
        <div className="rounded-lg border border-success/30 bg-success/10 p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-success">标签完整性</span>
            <span className="rounded bg-success px-2 py-0.5 text-[11px] font-bold text-white">通过</span>
          </div>
          <div className="mt-1 text-[11px] text-text-secondary">3/3件标签完好，条码可识别</div>
        </div>
      </div>

      {/* OCR summary */}
      <div className="mt-4">
        <h3 className="mb-2 text-sm font-semibold text-text-primary">OCR全量字段核验</h3>
        <div className="space-y-1">
          {[
            { field: '料号', result: '匹配', status: 'pass' },
            { field: '批次', result: '匹配', status: 'pass' },
            { field: '数量', result: '匹配', status: 'pass' },
            { field: '供应商', result: '匹配', status: 'pass' },
          ].map((row, idx) => (
            <div key={idx} className="flex items-center justify-between rounded bg-white px-3 py-2">
              <span className="text-xs text-text-primary">{row.field}</span>
              <span className={cn('text-xs font-semibold', row.status === 'pass' ? 'text-success' : 'text-danger')}>
                {row.result}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Agent suggestion */}
      <div className="mt-4 rounded-md border-l-[3px] border-l-info bg-white p-3">
        <span className="text-xs font-semibold text-info">Agent建议：</span>
        <p className="mt-1 text-xs text-text-secondary">退料检测全部通过，建议入库并生成分类上架任务</p>
      </div>

      {/* Bottom Actions */}
      <div className="mt-6 flex gap-3">
        <button
          onClick={() => navigate('/pda/return/scan')}
          className="flex h-11 flex-1 items-center justify-center rounded border border-border bg-white text-sm text-text-secondary"
        >
          返回
        </button>
        <button
          onClick={() => navigate('/pda/putaway/task')}
          className="flex h-11 flex-1 items-center justify-center rounded bg-accent-gradient text-sm font-semibold text-white"
        >
          确认入库
        </button>
      </div>
    </div>
  );
};

export default ReturnDetail;
