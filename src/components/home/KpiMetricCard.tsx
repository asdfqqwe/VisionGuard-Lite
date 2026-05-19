import type { FC, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useCountUp } from '@/hooks/use-count-up';
import { cn } from '@/lib/utils';

interface KpiMetricCardProps {
  icon: ReactNode;
  value: number;
  /** 默认按千分位格式化,可自定义如 (n) => `¥${n}万` */
  formatter?: (n: number) => string;
  label: string;
  /** Tailwind 文本色类,默认价值金 */
  valueColor?: string;
  delay?: number;
}

export const KpiMetricCard: FC<KpiMetricCardProps> = ({
  icon,
  value,
  formatter = (n) => n.toLocaleString(),
  label,
  valueColor = 'text-accent',
  delay = 0,
}) => {
  const count = useCountUp(value, 900, delay);
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: delay / 1000, ease: 'easeOut' }}
      className="group relative overflow-hidden rounded-xl border border-white/70 bg-white/65 px-5 py-4 shadow-[0_4px_20px_rgba(15,23,42,0.06)] backdrop-blur-md transition-shadow duration-300 hover:shadow-[0_6px_28px_rgba(59,130,246,0.12)]"
    >
      {/* 底部扫描光（极轻微，仅 hover 触发） */}
      <span
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-info/40 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        aria-hidden
      />

      <div className="relative flex items-center gap-4">
        {/* 图标 + 蓝色光晕 */}
        <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-info/10 text-info">
          <span
            className="absolute inset-0 rounded-lg bg-info/20 blur-md"
            aria-hidden
          />
          <span className="relative">{icon}</span>
        </div>

        {/* 数字 + 标签 */}
        <div className="min-w-0 text-left">
          <div className={cn('font-data text-[26px] font-bold leading-none', valueColor)}>
            {formatter(count)}
          </div>
          <div className="mt-1.5 text-xs text-text-muted">{label}</div>
        </div>
      </div>
    </motion.div>
  );
};
