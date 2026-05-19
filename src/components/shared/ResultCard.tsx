import type { FC, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { StatusBadge } from './StatusBadge';
import { AgentSuggestion } from './AgentSuggestion';
import type { BadgeStatus } from './StatusBadge';

export type ResultCardType = 'pass' | 'warning' | 'danger';

interface ResultCardProps {
  type: ResultCardType;
  title: string;
  badge?: BadgeStatus;
  lines: { label: string; value: string }[];
  agentSuggestion?: string;
  children?: ReactNode;
  className?: string;
}

const cardStyles: Record<ResultCardType, { bg: string; border: string; topBar: string }> = {
  pass: {
    bg: 'bg-success/15',
    border: 'border-success',
    topBar: 'bg-success',
  },
  warning: {
    bg: 'bg-warning/15',
    border: 'border-warning',
    topBar: 'bg-warning',
  },
  danger: {
    bg: 'bg-danger/20',
    border: 'border-danger',
    topBar: 'bg-danger',
  },
};

export const ResultCard: FC<ResultCardProps> = ({
  type,
  title,
  badge,
  lines,
  agentSuggestion,
  children,
  className,
}) => {
  const styles = cardStyles[type];

  return (
    <div
      className={cn(
        'overflow-hidden rounded-lg border',
        styles.bg,
        styles.border,
        className
      )}
    >
      {/* Top accent bar */}
      <div className={cn('h-1', styles.topBar)} />

      <div className="p-3">
        {/* Title row */}
        <div className="flex items-center gap-2">
          {badge && <StatusBadge status={badge} />}
          <h4 className="text-sm font-semibold text-text-primary">{title}</h4>
        </div>

        {/* Info lines */}
        <div className="mt-2 space-y-1">
          {lines.map((line, i) => (
            <div key={i} className="flex justify-between text-xs">
              <span className="text-text-muted">{line.label}</span>
              <span className="font-medium text-text-primary">{line.value}</span>
            </div>
          ))}
        </div>

        {/* Agent suggestion */}
        {agentSuggestion && (
          <div className="mt-3">
            <AgentSuggestion suggestion={agentSuggestion} />
          </div>
        )}

        {children}
      </div>
    </div>
  );
};

export default ResultCard;
