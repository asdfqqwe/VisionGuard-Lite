import type { FC } from 'react';
import { cn } from '@/lib/utils';

interface DemoStepBadgeProps {
  step: number;
  tone?: 'solid' | 'light';
  className?: string;
}

export const DemoStepBadge: FC<DemoStepBadgeProps> = ({
  step,
  tone = 'solid',
  className,
}) => (
  <span
    className={cn(
      'flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold leading-none',
      tone === 'solid'
        ? 'bg-white/25 text-white ring-1 ring-white/35'
        : 'bg-info text-white ring-2 ring-info/15',
      className,
    )}
  >
    {step}
  </span>
);

export default DemoStepBadge;
