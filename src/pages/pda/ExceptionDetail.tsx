import type { FC } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { agentEvents, workOrders } from '@/data/mockData';
import { cn } from '@/lib/utils';

const ExceptionDetail: FC = () => {
  const { reportId } = useParams<{ reportId: string }>();
  const navigate = useNavigate();

  const evt = agentEvents.find(e => e.eventNo === reportId) || agentEvents[0];
  const wo = workOrders.find(w => w.eventNo === reportId);

  const statusSteps = [
    { label: '异常检测', time: '2024-01-15 09:35', done: true },
    { label: 'Agent分析', time: '2024-01-15 09:36', done: true },
    { label: '工单创建', time: wo ? wo.createdAt : '—', done: !!wo },
    { label: '人工确认', time: evt.status === '已处理' ? '2024-01-15 10:20' : '—', done: evt.status === '已处理' },
  ];

  return (
    <div className="h-full bg-primary px-4 pt-3 pb-4">
      {/* Status Header */}
      <div className="rounded-lg bg-white p-3">
        <div className="flex items-center justify-between">
          <span className="font-data text-sm font-semibold text-info">{evt.eventNo}</span>
          <span className={cn('rounded px-2 py-0.5 text-[11px] font-bold text-white',
            evt.detectLevel === 'L1' ? 'bg-l1-badge' : 'bg-l2-badge'
          )}>
            {evt.detectLevel}
          </span>
        </div>
        <div className="mt-2 text-sm text-text-primary">{evt.anomalyType}</div>
        <div className="mt-1 text-xs text-text-muted">{evt.materialName}</div>
        <div className="mt-2">
          <span className={cn('text-xs',
            evt.status === '已处理' ? 'text-success' : 'text-warning'
          )}>
            {evt.status}
          </span>
        </div>
      </div>

      {/* Linked WO */}
      {wo && (
        <div className="mt-4 rounded-lg bg-white p-3">
          <span className="text-xs text-text-muted">关联工单</span>
          <div className="mt-2 flex items-center justify-between">
            <span className="font-data text-sm text-info">{wo.workOrderId}</span>
            <span className={cn('rounded px-2 py-0.5 text-[11px]',
              wo.status === '待处理' ? 'bg-warning/15 text-warning' : 'bg-success/15 text-success'
            )}>
              {wo.status}
            </span>
          </div>
          <div className="mt-1 text-xs text-text-secondary">{wo.title}</div>
        </div>
      )}

      {/* Progress Timeline */}
      <div className="mt-4">
        <h3 className="mb-2 text-sm font-semibold text-text-primary">处理进度</h3>
        <div className="space-y-0">
          {statusSteps.map((step, idx) => (
            <div key={idx} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className={cn('h-3 w-3 rounded-full',
                  step.done ? 'bg-success' : 'bg-border'
                )} />
                {idx < statusSteps.length - 1 && (
                  <div className={cn('w-px flex-1 min-h-[20px]',
                    step.done ? 'bg-success/50' : 'bg-border'
                  )} />
                )}
              </div>
              <div className="pb-3">
                <div className={cn('text-xs', step.done ? 'text-text-primary' : 'text-text-muted')}>
                  {step.label}
                </div>
                <div className="text-[11px] text-text-muted">{step.time}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="mt-4">
        <button
          onClick={() => navigate('/exceptions')}
          className="h-11 w-full rounded-md border border-border bg-white text-sm text-text-secondary"
        >
          返回异常列表
        </button>
      </div>
    </div>
  );
};

export default ExceptionDetail;
