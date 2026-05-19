import type { ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  rowKey: (row: T) => string;
  pageSize?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  onRowClick?: (row: T) => void;
  selectedRow?: T | null;
  className?: string;
  emptyText?: string;
}

export function DataTable<T>({
  columns,
  data,
  rowKey,
  pageSize = 10,
  currentPage = 1,
  onPageChange,
  onRowClick,
  selectedRow,
  className,
  emptyText = '暂无数据',
}: DataTableProps<T>) {
  const totalPages = Math.ceil(data.length / pageSize);
  const startIdx = (currentPage - 1) * pageSize;
  const pageData = data.slice(startIdx, startIdx + pageSize);

  return (
    <div className={cn('overflow-hidden rounded-lg border border-border-light', className)}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-primary border-b border-border-light">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    'px-4 py-2.5 text-left text-xs font-semibold text-text-muted',
                    col.align === 'center' && 'text-center',
                    col.align === 'right' && 'text-right'
                  )}
                  style={{ width: col.width }}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-8 text-center text-sm text-text-muted">
                  {emptyText}
                </td>
              </tr>
            ) : (
              pageData.map((row) => (
                <tr
                  key={rowKey(row)}
                  onClick={() => onRowClick?.(row)}
                  className={cn(
                    'border-b border-border-light/50 transition-colors duration-100',
                    onRowClick && 'cursor-pointer',
                    selectedRow && rowKey(selectedRow) === rowKey(row)
                      ? 'bg-info/10'
                      : 'hover:bg-primary'
                  )}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={cn(
                        'px-4 py-3 text-xs text-text-primary',
                        col.align === 'center' && 'text-center',
                        col.align === 'right' && 'text-right'
                      )}
                    >
                      {col.render ? col.render(row) : (row as Record<string, unknown>)[col.key] as ReactNode}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && onPageChange && (
        <div className="flex items-center justify-center gap-1 border-t border-border-light bg-gray-100 px-4 py-2">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="rounded p-1 text-text-muted transition-colors hover:bg-primary hover:text-text-primary disabled:opacity-30"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={cn(
                'h-6 min-w-[24px] rounded px-1.5 text-xs font-medium transition-colors',
                page === currentPage
                  ? 'bg-info text-white'
                  : 'text-text-muted hover:bg-primary hover:text-text-primary'
              )}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="rounded p-1 text-text-muted transition-colors hover:bg-primary hover:text-text-primary disabled:opacity-30"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}

export default DataTable;
