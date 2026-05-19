import type { FC } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Smartphone, Monitor, LayoutDashboard } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EntryItem {
  label: string;
  to: string;
  icon: typeof Home;
  /** Match function for active state */
  match: (path: string) => boolean;
}

const items: EntryItem[] = [
  {
    label: '首页',
    to: '/',
    icon: Home,
    match: (p) => p === '/' || p === '',
  },
  {
    label: 'PDA',
    to: '/pda',
    icon: Smartphone,
    match: (p) => p.startsWith('/pda'),
  },
  {
    label: 'Station',
    to: '/station',
    icon: Monitor,
    match: (p) => p.startsWith('/station'),
  },
  {
    label: 'Admin',
    to: '/admin',
    icon: LayoutDashboard,
    match: (p) => p.startsWith('/admin'),
  },
];

interface EntrySidebarProps {
  className?: string;
}

/**
 * Slim fixed left rail for jumping between the four entry points
 * (Home / PDA home / Station home / Admin home).
 *
 * Width: 64px. z-50 so it floats above frame content.
 */
export const EntrySidebar: FC<EntrySidebarProps> = ({ className }) => {
  const location = useLocation();

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-50 flex h-screen w-16 flex-col items-center gap-1 border-r border-border-light bg-white/95 py-4 shadow-sm backdrop-blur',
        className,
      )}
      aria-label="入口导航"
    >
      {/* Brand mark */}
      <Link
        to="/"
        className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10 text-accent transition-colors hover:bg-accent/20"
        title="智见Lite"
      >
        <span className="text-[13px] font-bold tracking-tight">智</span>
      </Link>

      <div className="my-1 h-px w-8 bg-border-light" />

      {items.map((item) => {
        const active = item.match(location.pathname);
        const Icon = item.icon;
        return (
          <Link
            key={item.to}
            to={item.to}
            title={item.label}
            className={cn(
              'group relative flex w-12 flex-col items-center gap-0.5 rounded-lg py-2 transition-all duration-150',
              active
                ? 'bg-info/10 text-info'
                : 'text-text-muted hover:bg-[#F1F5F9] hover:text-text-primary',
            )}
          >
            {active && (
              <span className="absolute left-0 top-1/2 h-6 w-0.5 -translate-y-1/2 rounded-r bg-info" />
            )}
            <Icon className="h-4 w-4" />
            <span className="text-[10px] font-medium leading-none">{item.label}</span>
          </Link>
        );
      })}
    </aside>
  );
};

export default EntrySidebar;
