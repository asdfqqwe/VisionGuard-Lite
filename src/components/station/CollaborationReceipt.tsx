import type { FC } from 'react';
import { FileText, ClipboardList, Package, AlertTriangle, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CollaborationReceiptProps {
  aeNo?: string;
  woNo?: string;
  iqNo?: string;
  clNo?: string;
  reminderStatus?: '待提醒' | '已提醒' | '已确认' | '已驳回';
  backendStatus?: '待接收' | '已接收' | '处理中' | '已完结';
  handler?: string;
  handlerComment?: string;
  timestamp?: string;
  className?: string;
}

export const CollaborationReceipt: FC<CollaborationReceiptProps> = ({
  aeNo,
  woNo,
  iqNo,
  clNo,
  reminderStatus = '待提醒',
  backendStatus = '已接收',
  handler = '王主管',
  handlerComment = '已收到，正在处理中',
  timestamp = '2024-03-15 09:35',
  className,
}) => {
  const reminderIcon = {
    '待提醒': <Clock className="h-3 w-3 text-text-muted" />,
    '已提醒': <CheckCircle2 className="h-3 w-3 text-warning" />,
    '已确认': <CheckCircle2 className="h-3 w-3 text-success" />,
    '已驳回': <XCircle className="h-3 w-3 text-danger" />,
  }[reminderStatus];

  const backendIcon = {
    '待接收': <Clock className="h-3 w-3 text-text-muted" />,
    '已接收': <CheckCircle2 className="h-3 w-3 text-info" />,
    '处理中': <Clock className="h-3 w-3 text-warning" />,
    '已完结': <CheckCircle2 className="h-3 w-3 text-success" />,
  }[backendStatus];

  return (
    <div className={cn('rounded-lg bg-[#F1F5F9] p-3', className)}>
      <h4 className="text-xs font-semibold text-text-primary">协作回执</h4>

      {/* Number IDs grid */}
      <div className="mt-2 grid grid-cols-2 gap-2">
        {aeNo && (
          <div className="flex items-center gap-1.5 rounded bg-primary/50 px-2 py-1.5">
            <FileText className="h-3.5 w-3.5 shrink-0 text-danger" />
            <div>
              <span className="text-[10px] text-text-muted">AE</span>
              <p className="font-mono text-[11px] font-medium text-text-primary">{aeNo}</p>
            </div>
          </div>
        )}
        {woNo && (
          <div className="flex items-center gap-1.5 rounded bg-primary/50 px-2 py-1.5">
            <ClipboardList className="h-3.5 w-3.5 shrink-0 text-info" />
            <div>
              <span className="text-[10px] text-text-muted">WO</span>
              <p className="font-mono text-[11px] font-medium text-text-primary">{woNo}</p>
            </div>
          </div>
        )}
        {iqNo && (
          <div className="flex items-center gap-1.5 rounded bg-primary/50 px-2 py-1.5">
            <Package className="h-3.5 w-3.5 shrink-0 text-warning" />
            <div>
              <span className="text-[10px] text-text-muted">IQ</span>
              <p className="font-mono text-[11px] font-medium text-text-primary">{iqNo}</p>
            </div>
          </div>
        )}
        {clNo && (
          <div className="flex items-center gap-1.5 rounded bg-primary/50 px-2 py-1.5">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-accent" />
            <div>
              <span className="text-[10px] text-text-muted">CL</span>
              <p className="font-mono text-[11px] font-medium text-text-primary">{clNo}</p>
            </div>
          </div>
        )}
      </div>

      {/* Status row */}
      <div className="mt-2 flex gap-3 border-t border-border pt-2">
        <div className="flex items-center gap-1.5">
          {reminderIcon}
          <span className="text-[11px] text-text-secondary">提醒：{reminderStatus}</span>
        </div>
        <div className="flex items-center gap-1.5">
          {backendIcon}
          <span className="text-[11px] text-text-secondary">后台：{backendStatus}</span>
        </div>
      </div>

      {/* Handler info */}
      <div className="mt-2 border-t border-border pt-2">
        <div className="flex justify-between">
          <span className="text-[11px] text-text-muted">处理人</span>
          <span className="text-[11px] text-text-primary">{handler}</span>
        </div>
        <p className="mt-1 text-[11px] text-text-secondary">{handlerComment}</p>
        <p className="mt-1 font-mono text-[10px] text-text-muted">{timestamp}</p>
      </div>
    </div>
  );
};

export default CollaborationReceipt;
