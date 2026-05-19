import type { FC, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useCountUp } from '@/hooks/use-count-up';
import { cn } from '@/lib/utils';
import { Sparkline } from './Sparkline';

interface KpiMetricCardProps {
  icon: ReactNode;
  value: number;
  /** 默认按千分位格式化,可自定义如 (n) => `¥${n}万` */
  formatter?: (n: number) => string;
  label: string;
  /** 数字颜色 token(text-accent / text-success 等) */
  valueColor?: string;
  /** 同比变化百分比,正数表示增长。例如 12.5 = +12.5% */
  trend?: number;
  /** sparkline 趋势数据 */
  sparkData?: number[];
  /** sparkline 颜色 */
  sparkColor?: string;
  delay?: number;
}

export const KpiMetricCard: FC<KpiMetricCardProps> = ({
  icon,
  value,
  formatter = (n) => n.toLocaleString(),
  label,
  valueColor = 'text-accent',
  trend,
  sparkData,
  sparkColor = '#3B82F6',
  delay = 0,
}) => {
  const count = useCountUp(value, 900, delay);

  const trendIsUp = (trend ?? 0) >= 0;
  const trendAbs = Math.abs(trend ?? 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: delay / 1000, ease: 'easeOut' }}
      className="group relative overflow-hidden rounded-xl border border-white/70 bg-white/70 px-5 py-4 shadow-[0_4px_20px_rgba(15,23,42,0.06)] backdrop-blur-md transition-shadow duration-300 hover:shadow-[0_6px_28px_rgba(59,130,246,0.12)]"
    >
      {/* 顶部:icon + 标签 */}
      <div className="flex items-center gap-2.5">
        <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-info/10 text-info">
          <span
            className="absolute inset-0 rounded-lg bg-info/15 blur-[6px]"
            aria-hidden
          />
          <span className="relative">{icon}</span>
        </div>
        <span className="text-xs text-text-muted">{label}</span>
      </div>

      {/* 数字 */}
      <div className={cn('mt-2 font-data text-[26px] font-bold leading-none', valueColor)}>
        {formatter(count)}
      </div>

      {/* 同比 + sparkline */}
      <div className="mt-2 flex items-end justify-between gap-3">
        {trend !== undefined ? (
          <div
            className={cn(
              'flex items-center gap-0.5 text-[11px] font-medium',
              trendIsUp ? 'text-success' : 'text-danger'
            )}
          >
            {trendIsUp ? (
              <ArrowUpRight className="h-3 w-3" />
            ) : (
              <ArrowDownRight className="h-3 w-3" />
            )}
            <span>较昨日 {trendIsUp ? '+' : '-'}{trendAbs}%</span>
          </div>
        ) : (
          <span />
        )}
        {sparkData && sparkData.length > 1 ? (
          <Sparkline data={sparkData} color={sparkColor} width={88} height={24} />
        ) : null}
      </div>

      {/* 底部 hover 扫描光 */}
      <span
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-info/40 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        aria-hidden
      />
    </motion.div>
  );
};
