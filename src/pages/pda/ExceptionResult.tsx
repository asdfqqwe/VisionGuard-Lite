import type { FC } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { agentEvents } from '@/data/mockData';
import { cn } from '@/lib/utils';

const ExceptionResult: FC = () => {
  const { draftId } = useParams<{ draftId: string }>();
  const navigate = useNavigate();

  const evt = agentEvents.find(e => e.eventNo === draftId) || agentEvents[0];

  const detectLevelColor = evt.detectLevel === 'L1' ? 'text-danger' : 'text-warning';
  const detectLevelBg = evt.detectLevel === 'L1' ? 'bg-l1-badge' : 'bg-l2-badge';

  return (
    <div className="h-full bg-primary px-4 pt-3 pb-4">
      {/* Detect Result Card */}
      <div className={cn('rounded-lg border p-3',
        evt.detectLevel === 'L1' ? 'border-danger/30 bg-danger/10' : 'border-warning/30 bg-warning/10'
      )}>
        <div className="flex items-center justify-between">
          <h3 className={cn('text-base font-bold', detectLevelColor)}>检测结果</h3>
          <span className={cn('rounded px-2 py-0.5 text-xs font-bold text-white', detectLevelBg)}>
            {evt.detectLevel}
          </span>
        </div>
        <div className="mt-2 text-sm text-text-primary">{evt.anomalyType}</div>
        <div className="mt-1 text-xs text-text-muted">物资：{evt.materialName}</div>
        <div className="mt-1 text-xs text-text-muted">来源：{evt.source}</div>
      </div>

      {/* Agent Suggestion */}
      <div className="mt-4 rounded-md border-l-[3px] border-l-info bg-white p-3">
        <span className="text-xs font-semibold text-info">Agent建议：</span>
        <p className="mt-1 text-xs leading-relaxed text-text-secondary">
          {evt.suggestedActions.join('，')}
        </p>
      </div>

      {/* Linked IDs */}
      <div className="mt-4 rounded-lg bg-white p-3">
        <span className="text-xs text-text-muted">关联编号</span>
        <div className="mt-2 flex flex-wrap gap-2">
          {evt.linkedIds.workOrderId && (
            <span className="rounded bg-info/10 px-2 py-0.5 font-data text-xs text-info">{evt.linkedIds.workOrderId}</span>
          )}
          {evt.linkedIds.problemItemNo && (
            <span className="rounded bg-danger/10 px-2 py-0.5 font-data text-xs text-danger">{evt.linkedIds.problemItemNo}</span>
          )}
          {evt.linkedIds.claimNo && (
            <span className="rounded bg-warning/10 px-2 py-0.5 font-data text-xs text-warning">{evt.linkedIds.claimNo}</span>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 space-y-2">
        <button
          onClick={() => navigate(`/report/edit/${evt.eventNo}`)}
          className="h-11 w-full rounded-md bg-accent-gradient text-sm font-semibold text-white"
        >
          编辑上报
        </button>
        <button
          onClick={() => navigate('/pda/problem/handover')}
          className="h-11 w-full rounded-md bg-danger-gradient text-sm font-semibold text-white"
        >
          移交问题件
        </button>
      </div>
    </div>
  );
};

export default ExceptionResult;
