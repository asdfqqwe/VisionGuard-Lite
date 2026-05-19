import type { FC } from 'react';
import { cn } from '@/lib/utils';

interface L1BadgeProps {
  className?: string;
}

export const L1Badge: FC<L1BadgeProps> = ({ className }) => (
  <span
    className={cn(
      'inline-flex items-center justify-center rounded bg-l1-badge px-2 py-0.5 text-xs font-bold text-white',
      className
    )}
  >
    L1
  </span>
);

export default L1Badge;
