import type { FC, ReactNode } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export type AlertSeverity = 'danger' | 'danger-deep' | 'warning';

interface FullScreenAlertProps {
  visible: boolean;
  severity: AlertSeverity;
  title: string;
  message: string;
  children?: ReactNode;
  onClose?: () => void;
  showClose?: boolean;
  actionButtons?: ReactNode;
}

const severityStyles: Record<AlertSeverity, { bg: string; topBar: string; titleColor: string }> = {
  danger: {
    bg: 'bg-danger-gradient',
    topBar: 'bg-danger',
    titleColor: 'text-white',
  },
  'danger-deep': {
    bg: 'bg-multi-modal-alert',
    topBar: 'bg-danger-deep',
    titleColor: 'text-white',
  },
  warning: {
    bg: 'bg-warning/20',
    topBar: 'bg-warning',
    titleColor: 'text-text-primary',
  },
};

export const FullScreenAlert: FC<FullScreenAlertProps> = ({
  visible,
  severity,
  title,
  message,
  children,
  onClose,
  showClose = true,
  actionButtons,
}) => {
  const styles = severityStyles[severity];

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number] }}
          className={cn(
            'fixed inset-0 z-[100] flex flex-col items-center justify-center',
            styles.bg,
            severity !== 'warning' && 'animate-flash-alert'
          )}
        >
          {/* Top alert bar */}
          <div className={cn('absolute top-0 left-0 right-0 h-2', styles.topBar)} />

          {/* Close button */}
          {showClose && onClose && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 rounded-full bg-white/10 p-2 text-white/80 backdrop-blur-sm transition-colors hover:bg-white/20 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          )}

          {/* Content */}
          <div className="flex flex-col items-center px-6 text-center">
            <h2 className={cn('text-2xl font-bold md:text-3xl', styles.titleColor)}>
              {title}
            </h2>
            <p className={cn('mt-4 max-w-md text-base', severity === 'warning' ? 'text-text-secondary' : 'text-white/90')}>
              {message}
            </p>
            {children}
          </div>

          {/* Action buttons */}
          {actionButtons && (
            <div className="mt-8 flex gap-3">
              {actionButtons}
            </div>
          )}

          {/* Fire alert indicator for multi-modal */}
          {severity === 'danger-deep' && (
            <div className="absolute bottom-8 flex items-center gap-2">
              <div className="h-3 w-3 animate-pulse rounded-full bg-danger" />
              <span className="text-sm font-medium text-white/80">消防联动已激活</span>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FullScreenAlert;
