import type { FC, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Activity, Smartphone, ShieldAlert, Cloud } from 'lucide-react';
import { useCountUp } from '@/hooks/use-count-up';
import { cn } from '@/lib/utils';

type Tone = 'success' | 'info' | 'warning' | 'muted' | 'danger';

const toneClasses: Record<Tone, { bg: string; text: string; halo: string }> = {
  success: { bg: 'bg-success/10', text: 'text-success', halo: 'bg-success/25' },
  info: { bg: 'bg-info/10', text: 'text-info', halo: 'bg-info/25' },
  warning: { bg: 'bg-accent/10', text: 'text-accent', halo: 'bg-accent/30' },
  danger: { bg: 'bg-danger/10', text: 'text-danger', halo: 'bg-danger/25' },
  muted: { bg: 'bg-text-muted/10', text: 'text-text-muted', halo: 'bg-text-muted/15' },
};

interface StatusItemConfig {
  icon: ReactNode;
  value: number;
  label: string;
  tone: Tone;
}

const StatusItem: FC<StatusItemConfig & { delay: number }> = ({
  icon,
  value,
  label,
  tone,
  delay,
}) => {
  const count = useCountUp(value, 700, delay);
  const c = toneClasses[tone];
  return (
    <div className="flex items-center gap-3 px-2 md:px-4">
      {/* 图标 + 呼吸光 */}
      <div
        className={cn(
          'relative flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
          c.bg,
          c.text
        )}
      >
        <span
          className={cn(
            'absolute inset-0 rounded-lg blur-md animate-pulse-glow',
            c.halo
          )}
          aria-hidden
        />
        <span className="relative">{icon}</span>
      </div>

      {/* 数字 + 标签 */}
      <div className="flex items-baseline gap-2">
        <span className={cn('font-data text-[26px] font-bold leading-none', c.text)}>
          {count}
        </span>
        <span className="text-xs text-text-muted">{label}</span>
      </div>
    </div>
  );
};

interface SystemStatusBarProps {
  onlineStations: number;
  onlinePDAs: number;
  pendingExceptions: number;
  l1Intercepting: number;
}

export const SystemStatusBar: FC<SystemStatusBarProps> = ({
  onlineStations,
  onlinePDAs,
  pendingExceptions,
  l1Intercepting,
}) => {
  const items: StatusItemConfig[] = [
    {
      icon: <Activity className="h-5 w-5" />,
      value: onlineStations,
      label: '在线Station',
      tone: 'success',
    },
    {
      icon: <Smartphone className="h-5 w-5" />,
      value: onlinePDAs,
      label: '在线PDA',
      tone: 'info',
    },
    {
      icon: <ShieldAlert className="h-5 w-5" />,
      value: pendingExceptions,
      label: '待处理异常',
      tone: 'warning',
    },
    {
      icon: <Cloud className="h-5 w-5" />,
      value: l1Intercepting,
      label: 'L1拦截中',
      // 0 时弱化为 muted,不过度警告
      tone: l1Intercepting > 0 ? 'danger' : 'muted',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="rounded-2xl border border-white/70 bg-white/65 px-4 py-5 shadow-[0_6px_28px_rgba(15,23,42,0.06)] backdrop-blur-md md:px-8"
    >
      <div className="grid grid-cols-2 gap-y-4 md:grid-cols-4 md:gap-y-0">
        {items.map((item, idx) => (
          <div
            key={item.label}
            className={cn(idx > 0 && 'md:border-l md:border-border-light/40')}
          >
            <StatusItem {...item} delay={idx * 80} />
          </div>
        ))}
      </div>
    </motion.div>
  );
};
