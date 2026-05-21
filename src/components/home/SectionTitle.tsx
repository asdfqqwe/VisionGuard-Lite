import type { FC, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SectionTitleProps {
  title: ReactNode;
  /** 右侧附加内容,如更新时间 + 进入入口 */
  extra?: ReactNode;
  underlineClassName?: string;
  hideUnderline?: boolean;
}

/**
 * 通用 section 标题:左侧标题 + 短下划线,右侧附加内容
 */
export const SectionTitle: FC<SectionTitleProps> = ({ title, extra, underlineClassName, hideUnderline }) => (
  <div className="mb-5 flex items-end justify-between gap-4">
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
    >
      <h2 className="text-xl font-semibold text-[#0F172A] md:text-2xl">{title}</h2>
      {hideUnderline ? null : (
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: 60 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className={cn('mt-2 h-1 rounded bg-accent', underlineClassName)}
        />
      )}
    </motion.div>
    {extra ? <div className="text-xs text-text-muted">{extra}</div> : null}
  </div>
);

export default SectionTitle;
