import type { FC, ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: ReactNode;
  className?: string;
}

export const PageHeader: FC<PageHeaderProps> = ({
  title,
  breadcrumbs = [],
  actions,
  className = '',
}) => (
  <div className={`mb-6 flex items-center justify-between ${className}`}>
    <div>
      {breadcrumbs.length > 0 && (
        <nav className="mb-1 flex items-center gap-1 text-xs text-text-muted">
          {breadcrumbs.map((item, i) => (
            <span key={i} className="flex items-center gap-1">
              {i > 0 && <ChevronRight className="h-3 w-3" />}
              {item.href ? (
                <a href={item.href} className="hover:text-text-secondary transition-colors">
                  {item.label}
                </a>
              ) : (
                <span className={i === breadcrumbs.length - 1 ? 'text-text-secondary' : ''}>
                  {item.label}
                </span>
              )}
            </span>
          ))}
        </nav>
      )}
      <h1 className="text-lg font-semibold text-text-primary">{title}</h1>
    </div>
    {actions && <div className="flex items-center gap-2">{actions}</div>}
  </div>
);

export default PageHeader;
