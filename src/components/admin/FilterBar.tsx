import type { FC } from 'react';
import { Search } from 'lucide-react';

export interface FilterOption {
  label: string;
  value: string;
}

export interface FilterField {
  key: string;
  label: string;
  options: FilterOption[];
}

interface FilterBarProps {
  filters: FilterField[];
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  extra?: React.ReactNode;
  className?: string;
}

export const FilterBar: FC<FilterBarProps> = ({
  filters,
  values,
  onChange,
  searchPlaceholder = '搜索...',
  searchValue = '',
  onSearchChange,
  extra,
  className = '',
}) => (
  <div className={`flex flex-wrap items-center gap-3 rounded-lg bg-gray-100 p-3 ${className}`}>
    {filters.map((field) => (
      <select
        key={field.key}
        value={values[field.key] || field.options[0]?.value}
        onChange={(e) => onChange(field.key, e.target.value)}
        className="h-8 rounded-md border border-border-light bg-[#F1F5F9] px-3 text-xs text-text-primary outline-none focus:border-info"
      >
        {field.options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    ))}
    {onSearchChange && (
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-muted" />
        <input
          type="text"
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="h-8 w-full rounded-md border border-border-light bg-[#F1F5F9] pl-8 pr-3 text-xs text-text-primary outline-none placeholder:text-text-muted focus:border-info"
        />
      </div>
    )}
    {extra && <div className="ml-auto flex items-center gap-2">{extra}</div>}
  </div>
);

export default FilterBar;
