import type { FC, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

interface TerminalCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  to: string;
  delay: number;
  imageSrc: string;
  imageAlt: string;
}

export const TerminalCard: FC<TerminalCardProps> = ({
  icon,
  title,
  description,
  to,
  delay,
  imageSrc,
  imageAlt,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay: delay / 1000, ease: 'easeOut' }}
  >
    <Link
      to={to}
      className="group block overflow-hidden rounded-xl border border-border-light/70 bg-white shadow-[0_2px_12px_rgba(15,23,42,0.04)] transition-all duration-300 hover:-translate-y-1 hover:border-info/40 hover:shadow-[0_12px_36px_rgba(59,130,246,0.16)]"
    >
      {/* 封面区 */}
      <div className="aspect-[16/10] overflow-hidden bg-[#F1F5F9]">
        <img
          src={imageSrc}
          alt={imageAlt}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />
      </div>

      {/* 文案区 */}
      <div className="px-5 py-4">
        <div className="flex items-center gap-1.5">
          <span className="text-info/80">{icon}</span>
          <h3 className="text-base font-semibold tracking-wide text-text-primary transition-colors group-hover:text-accent">
            {title}
          </h3>
          <ChevronRight className="ml-auto h-4 w-4 text-text-muted transition-all duration-200 group-hover:translate-x-1 group-hover:text-accent" />
        </div>
        <p className="mt-1 text-xs leading-relaxed text-text-muted">{description}</p>
      </div>
    </Link>
  </motion.div>
);
