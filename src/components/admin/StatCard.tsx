import type { FC, ReactNode } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export type TrendDirection = 'up' | 'down' | 'neutral';

interface StatCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  trend?: TrendDirection;
  trendValue?: string;
  icon?: ReactNode;
  color?: 'default' | 'accent' | 'success' | 'warning' | 'danger' | 'info';
  className?: string;
  onClick?: () => void;
}

const colorStyles: Record<string, { bg: string; text: string; iconBg: string }> = {
  default: { bg: 'bg-gray-100', text: 'text-text-primary', iconBg: 'bg-[#F1F5F9]' },
  accent: { bg: 'bg-accent-gradient', text: 'text-white', iconBg: 'bg-white/20' },
  success: { bg: 'bg-gray-100', text: 'text-success', iconBg: 'bg-success/20' },
  warning: { bg: 'bg-gray-100', text: 'text-warning', iconBg: 'bg-warning/20' },
  danger: { bg: 'bg-gray-100', text: 'text-danger', iconBg: 'bg-danger/20' },
  info: { bg: 'bg-gray-100', text: 'text-info', iconBg: 'bg-info/20' },
};

export const StatCard: FC<StatCardProps> = ({
  label,
  value,
  subtitle,
  trend,
  trendValue,
  icon,
  color = 'default',
  className,
  onClick,
}) => {
  const styles = colorStyles[color];
  const isAccent = color === 'accent';

  return (
    <div
      className={cn(
        'rounded-lg p-5 transition-all duration-200',
        styles.bg,
        onClick && 'cursor-pointer hover:opacity-90 active:scale-[0.98]',
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className={cn('text-sm font-medium', isAccent ? 'text-white/90' : 'text-text-muted')}>
            {label}
          </p>
          <p className={cn('mt-1 text-2xl font-bold font-data', styles.text)}>{value}</p>
          {subtitle && (
            <p className={cn('mt-0.5 text-xs', isAccent ? 'text-white/70' : 'text-text-muted')}>
              {subtitle}
            </p>
          )}
          {trend && trendValue && (
            <div className="mt-1.5 flex items-center gap-1">
              {trend === 'up' && (
                <TrendingUp className={cn('h-3.5 w-3.5', isAccent ? 'text-white/80' : 'text-success')} />
              )}
              {trend === 'down' && (
                <TrendingDown className={cn('h-3.5 w-3.5', isAccent ? 'text-white/80' : 'text-danger')} />
              )}
              <span className={cn('text-xs font-medium', isAccent ? 'text-white/80' : trend === 'up' ? 'text-success' : 'text-danger')}>
                {trendValue}
              </span>
            </div>
          )}
        </div>
        {icon && (
          <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', styles.iconBg)}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
