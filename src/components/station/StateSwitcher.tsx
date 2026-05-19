import type { FC } from 'react';
import { cn } from '@/lib/utils';

export type DetectionState =
  | 'pass'
  | 'warning'
  | 'blur'
  | 'tagMissing'
  | 'defect'
  | 'intercept'
  | 'multiModal';

interface StateSwitcherProps {
  currentState: DetectionState;
  onStateChange: (state: DetectionState) => void;
  className?: string;
}

interface StateOption {
  key: DetectionState;
  label: string;
  color: string;
  bgActive: string;
}

const states: StateOption[] = [
  { key: 'pass', label: '通过', color: 'text-success', bgActive: 'bg-success text-white' },
  { key: 'warning', label: '警示', color: 'text-warning', bgActive: 'bg-warning text-primary-dark' },
  { key: 'blur', label: '不清晰', color: 'text-warning', bgActive: 'bg-warning text-primary-dark' },
  { key: 'tagMissing', label: '标签缺失', color: 'text-danger', bgActive: 'bg-danger text-white' },
  { key: 'defect', label: '外观缺陷', color: 'text-defect-badge', bgActive: 'bg-defect-badge text-white' },
  { key: 'intercept', label: '拦截', color: 'text-danger', bgActive: 'bg-danger text-white' },
  { key: 'multiModal', label: '多模态异常', color: 'text-danger', bgActive: 'bg-multi-modal-alert text-white' },
];

export const StateSwitcher: FC<StateSwitcherProps> = ({
  currentState,
  onStateChange,
  className,
}) => {
  return (
    <div className={cn('flex flex-wrap gap-1', className)}>
      {states.map((s) => {
        const isActive = currentState === s.key;
        return (
          <button
            key={s.key}
            onClick={() => onStateChange(s.key)}
            className={cn(
              'rounded px-2 py-1 text-[11px] font-medium transition-all',
              isActive
                ? s.bgActive
                : cn('bg-[#F1F5F9] text-text-muted hover:bg-primary', s.color)
            )}
          >
            {s.label}
          </button>
        );
      })}
    </div>
  );
};

export default StateSwitcher;
