import type { FC } from 'react';
import { Bot } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AgentSuggestionProps {
  suggestion: string;
  label?: string;
  className?: string;
}

export const AgentSuggestion: FC<AgentSuggestionProps> = ({
  suggestion,
  label = 'Agent建议：',
  className,
}) => (
  <div
    className={cn(
      'rounded-md border-l-[3px] border-l-info bg-primary p-3',
      className
    )}
  >
    <div className="flex items-start gap-2">
      <Bot className="mt-0.5 h-4 w-4 shrink-0 text-info" />
      <div className="min-w-0">
        <span className="text-xs font-semibold text-info">{label}</span>
        <p className="mt-0.5 text-xs leading-relaxed text-text-secondary">
          {suggestion}
        </p>
      </div>
    </div>
  </div>
);

export default AgentSuggestion;
