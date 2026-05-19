import type { FC, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

type Tone = 'success' | 'info' | 'warning' | 'accent';

const toneClassMap: Record<Tone, { iconBg: string; iconText: string; valueColor: string }> = {
  success: { iconBg: 'bg-success/10', iconText: 'text-success', valueColor: 'text-success' },
  info: { iconBg: 'bg-info/10', iconText: 'text-info', valueColor: 'text-info' },
  warning: { iconBg: 'bg-accent/10', iconText: 'text-accent', valueColor: 'text-accent' },
  accent: { iconBg: 'bg-accent/10', iconText: 'text-accent', valueColor: 'text-accent' },
};

interface ValueCardProps {
  icon: ReactNode;
  label: string;
  value: string;
  caption: string;
  tone: Tone;
  delay?: number;
}

export const ValueCard: FC<ValueCardProps> = ({ icon, label, value, caption, tone, delay = 0 }) => {
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
      <div className={cn('mt-2 font-data text-[26px] font-bold leading-none', t.valueColor)}>
        {value}
      </div>
      <div className="mt-1.5 text-[11px] leading-relaxed text-text-muted">{caption}</div>
    </motion.div>
  );
};

export default ValueCard;
