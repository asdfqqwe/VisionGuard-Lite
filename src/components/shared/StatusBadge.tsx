import type { FC } from 'react';
import { cn } from '@/lib/utils';

export type BadgeStatus = '通过' | 'L1拦截' | 'L2警示' | 'NG外观' | '不清晰' | '标签缺失';

interface StatusBadgeProps {
  status: BadgeStatus;
  className?: string;
  size?: 'sm' | 'md';
}

const badgeConfig: Record<BadgeStatus, { bg: string; text: string }> = {
  '通过': { bg: 'bg-success', text: '通过' },
  'L1拦截': { bg: 'bg-l1-badge', text: 'L1' },
  'L2警示': { bg: 'bg-l2-badge', text: 'L2' },
  'NG外观': { bg: 'bg-defect-badge', text: 'NG' },
  '不清晰': { bg: 'bg-warning', text: '不清晰' },
  '标签缺失': { bg: 'bg-l1-badge', text: '标签缺失' },
};

export const StatusBadge: FC<StatusBadgeProps> = ({ status, className, size = 'md' }) => {
  const config = badgeConfig[status];
  if (!config) return null;

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded font-bold text-white',
        config.bg,
        size === 'sm' ? 'px-1.5 py-0.5 text-[11px]' : 'px-2 py-0.5 text-xs',
        className
      )}
    >
      {config.text}
    </span>
  );
};

export default StatusBadge;
