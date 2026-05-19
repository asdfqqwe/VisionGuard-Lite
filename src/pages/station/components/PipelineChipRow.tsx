/**
 * 底部 AI 检测流水线 7 chip 横排组件。
 * 把原 StationIdle 内嵌的 AICapability 抽到这里，并扩展为 4 态：
 * idle / loading / ready / danger
 */

import type { FC, ReactNode } from 'react';
import { Loader2, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PipelineState } from '../useDetectionPlayer';

export interface PipelineChipDef {
  key: string;
  name: string;
  icon: ReactNode;
}

interface PipelineChipProps extends PipelineChipDef {
  state: PipelineState;
}

const STATE_CLASSES: Record<PipelineState, { wrapper: string; icon: string; text: string }> = {
  idle: {
    wrapper: 'border-text-muted/20 bg-[#F1F5F9]',
    icon: 'text-text-muted',
    text: 'text-text-muted',
  },
  loading: {
    wrapper: 'border-info/40 bg-info/10',
    icon: 'text-info',
    text: 'text-text-primary',
  },
  ready: {
    wrapper: 'border-success/40 bg-success/10',
    icon: 'text-success',
    text: 'text-text-primary',
  },
  danger: {
    wrapper: 'border-danger/50 bg-danger/15',
    icon: 'text-danger',
    text: 'text-danger',
  },
};

const PipelineChip: FC<PipelineChipProps> = ({ name, icon, state }) => {
  const cls = STATE_CLASSES[state];

  return (
    <div
      className={cn(
        'flex flex-1 items-center gap-1.5 rounded border px-2 py-1.5 transition-colors duration-200',
        cls.wrapper,
      )}
    >
      <span className={cn('shrink-0', cls.icon)}>{icon}</span>
      <span className={cn('truncate text-[10px] font-medium', cls.text)}>{name}</span>
      <span className="ml-auto inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center">
        {state === 'idle' && <span className="h-1.5 w-1.5 rounded-full bg-text-muted/60" />}
        {state === 'loading' && <Loader2 className="h-3 w-3 animate-spin text-info" />}
        {state === 'ready' && <Check className="h-3 w-3 text-success" />}
        {state === 'danger' && <X className="h-3 w-3 text-danger" />}
      </span>
    </div>
  );
};

interface PipelineChipRowProps {
  chips: PipelineChipDef[];
  states: PipelineState[];
}

export const PipelineChipRow: FC<PipelineChipRowProps> = ({ chips, states }) => (
  <div className="grid grid-cols-7 gap-1.5">
    {chips.map((c, i) => {
      const { key, ...rest } = c;
      return <PipelineChip key={key} {...rest} state={states[i] ?? 'idle'} />;
    })}
  </div>
);

export default PipelineChipRow;
