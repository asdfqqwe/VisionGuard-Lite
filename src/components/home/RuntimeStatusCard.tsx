import type { FC, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useCountUp } from '@/hooks/use-count-up';
import { cn } from '@/lib/utils';
import { Sparkline } from './Sparkline';

type Tone = 'success' | 'info' | 'warning' | 'danger' | 'muted';

const toneClassMap: Record<Tone, { text: string; iconBg: string; iconText: string; spark: string }> = {
  success: {
    text: 'text-success',
    iconBg: 'bg-success/10',
    iconText: 'text-success',
    spark: '#22C55E',
  },
  info: {
    text: 'text-info',
    iconBg: 'bg-info/10',
    iconText: 'text-info',
    spark: '#3B82F6',
  },
  warning: {
    text: 'text-accent',
    iconBg: 'bg-accent/10',
    iconText: 'text-accent',
    spark: '#EAB308',
  },
  danger: {
    text: 'text-danger',
    iconBg: 'bg-danger/10',
    iconText: 'text-danger',
    spark: '#DC2626',
  },
  muted: {
    text: 'text-text-muted',
    iconBg: 'bg-text-muted/10',
    iconText: 'text-text-muted',
    spark: '#94A3B8',
  },
};

interface RuntimeStatusCardProps {
  icon: ReactNode;
  label: string;
  value: number;
  /** 总数(分母),如"在线 4 / 6" 中的 6 */
  total?: number;
  /** 数字单位,如"件" */
  unit?: string;
  tone: Tone;
  sparkData: number[];
  delay?: number;
}

export const RuntimeStatusCard: FC<RuntimeStatusCardProps> = ({
  icon,
  label,
  value,
  total,
  unit,
  tone,
  sparkData,
  delay = 0,
}) => {
  const count = useCountUp(value, 700, delay);
  const t = toneClassMap[tone];
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: delay / 1000 }}
      className="rounded-xl border border-border-light/60 bg-white px-5 py-4 shadow-[0_2px_12px_rgba(15,23,42,0.04)]"
    >
      <div className="flex items-center gap-2">
        <div
          className={cn(
            'flex h-7 w-7 shrink-0 items-center justify-center rounded-md',
            t.iconBg,
            t.iconText
          )}
        >
          {icon}
        </div>
        <span className="text-xs text-text-muted">{label}</span>
      </div>

      <div className="mt-2 flex items-baseline gap-1.5">
        <span className={cn('font-data text-[28px] font-bold leading-none', t.text)}>
          {count}
        </span>
        {total !== undefined ? (
          <span className="text-xs text-text-muted">/ {total}</span>
        ) : null}
        {unit ? <span className="text-xs text-text-muted">{unit}</span> : null}
      </div>

      <div className="mt-1">
        <Sparkline data={sparkData} color={t.spark} width={240} height={32} />
      </div>
    </motion.div>
  );
};

export default RuntimeStatusCard;
