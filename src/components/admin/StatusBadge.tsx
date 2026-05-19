import type { FC } from 'react';
import { cn } from '@/lib/utils';

export type AdminBadgeStatus =
  | '通过'
  | 'L1'
  | 'L2'
  | 'NG'
  | '不清晰'
  | '标签缺失'
  | '待处理'
  | '处理中'
  | '已完结'
  | '已结案'
  | '待人工确认'
  | '已提醒'
  | '已处理'
  | '低风险'
  | '中风险'
  | '高风险'
  | '成功'
  | '失败'
  | '在线'
  | '离线'
  | '违规';

interface StatusBadgeProps {
  status: AdminBadgeStatus | string;
  className?: string;
}

const statusStyles: Record<string, { bg: string; text: string }> = {
  '通过': { bg: 'bg-success/20', text: 'text-success' },
  'L1': { bg: 'bg-l1-badge', text: 'text-white' },
  'L2': { bg: 'bg-l2-badge', text: 'text-white' },
  'NG': { bg: 'bg-defect-badge', text: 'text-white' },
  '不清晰': { bg: 'bg-warning/20', text: 'text-warning' },
  '标签缺失': { bg: 'bg-l1-badge/90', text: 'text-white' },
  '待处理': { bg: 'bg-warning/20', text: 'text-warning' },
  '处理中': { bg: 'bg-info/20', text: 'text-info' },
  '已完结': { bg: 'bg-success/20', text: 'text-success' },
  '已结案': { bg: 'bg-success/20', text: 'text-success' },
  '待人工确认': { bg: 'bg-warning/20', text: 'text-warning' },
  '已提醒': { bg: 'bg-info/20', text: 'text-info' },
  '已处理': { bg: 'bg-success/20', text: 'text-success' },
  '低风险': { bg: 'bg-success/20', text: 'text-success' },
  '中风险': { bg: 'bg-l2-badge/20', text: 'text-warning' },
  '高风险': { bg: 'bg-l1-badge/20', text: 'text-danger' },
  '成功': { bg: 'bg-success/20', text: 'text-success' },
  '失败': { bg: 'bg-danger/20', text: 'text-danger' },
  '在线': { bg: 'bg-success/20', text: 'text-success' },
  '离线': { bg: 'bg-text-muted/20', text: 'text-text-muted' },
  '违规': { bg: 'bg-video-alert/20', text: 'text-video-alert' },
};

export const StatusBadge: FC<StatusBadgeProps> = ({ status, className }) => {
  const styles = statusStyles[status] || { bg: 'bg-[#F1F5F9]', text: 'text-text-secondary' };
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded px-2 py-0.5 text-xs font-bold',
        styles.bg,
        styles.text,
        className
      )}
    >
      {status}
    </span>
  );
};

export default StatusBadge;
