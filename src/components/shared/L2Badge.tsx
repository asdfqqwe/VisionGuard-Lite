import type { FC } from 'react';
import { cn } from '@/lib/utils';

interface L2BadgeProps {
  className?: string;
}

export const L2Badge: FC<L2BadgeProps> = ({ className }) => (
  <span
    className={cn(
      'inline-flex items-center justify-center rounded bg-l2-badge px-2 py-0.5 text-xs font-bold text-white',
      className
    )}
  >
    L2
  </span>
);

export default L2Badge;
