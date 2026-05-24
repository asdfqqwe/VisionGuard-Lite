import type { FC, ReactNode } from 'react';
import { motion } from 'framer-motion';

interface TerminalCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  delay: number;
  imageSrc: string;
  imageAlt: string;
}

export const TerminalCard: FC<TerminalCardProps> = ({
  icon,
  title,
  description,
  delay,
  imageSrc,
  imageAlt,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay: delay / 1000, ease: 'easeOut' }}
  >
    <div className="overflow-hidden rounded-xl border border-border-light/70 bg-white shadow-[0_2px_12px_rgba(15,23,42,0.04)]">
      <div className="aspect-[16/10] overflow-hidden bg-[#F1F5F9]">
        <img
          src={imageSrc}
          alt={imageAlt}
          loading="lazy"
          className="h-full w-full object-cover"
        />
      </div>

      <div className="px-5 py-4">
        <div className="flex items-center gap-1.5">
          <span className="text-info/80">{icon}</span>
          <h3 className="text-base font-semibold tracking-wide text-text-primary">
            {title}
          </h3>
        </div>
        <p className="mt-1 text-xs leading-relaxed text-text-muted">{description}</p>
      </div>
    </div>
  </motion.div>
);
