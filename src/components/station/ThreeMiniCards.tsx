import type { FC } from 'react';
import { History, BookOpen, Link2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ThreeMiniCardsProps {
  historyCard?: {
    title: string;
    value: string;
    valueColor?: string;
  };
  standardCard?: {
    title: string;
    value: string;
  };
  linkCard?: {
    title: string;
    value: string;
    valueColor?: string;
  };
  className?: string;
}

export const ThreeMiniCards: FC<ThreeMiniCardsProps> = ({
  historyCard = { title: '江南华盛', value: '异常率 3.2%', valueColor: 'text-warning' },
  standardCard = { title: '外观标准', value: '版本 v2.1' },
  linkCard = { title: 'WO-0032', value: '处理中', valueColor: 'text-info' },
  className,
}) => (
  <div className={cn('grid grid-cols-3 gap-2', className)}>
    {/* 抽检依据 / History Card */}
    <div className="rounded-md bg-[#F1F5F9] p-2.5">
      <div className="flex items-center gap-1.5">
        <History className="h-3.5 w-3.5 text-info" />
        <span className="text-[10px] text-text-muted">抽检依据</span>
      </div>
      <p className="mt-1 truncate text-[11px] text-text-secondary">{historyCard.title}</p>
      <p className={cn('mt-0.5 text-xs font-semibold', historyCard.valueColor)}>
        {historyCard.value}
      </p>
    </div>

    {/* 质量标准 / Standard Card */}
    <div className="rounded-md bg-[#F1F5F9] p-2.5">
      <div className="flex items-center gap-1.5">
        <BookOpen className="h-3.5 w-3.5 text-info" />
        <span className="text-[10px] text-text-muted">质量标准</span>
      </div>
      <p className="mt-1 truncate text-[11px] text-text-secondary">{standardCard.title}</p>
      <p className="mt-0.5 text-xs font-semibold text-text-primary">
        {standardCard.value}
      </p>
    </div>

    {/* 问题件去向 / Link Card */}
    <div className="rounded-md bg-[#F1F5F9] p-2.5">
      <div className="flex items-center gap-1.5">
        <Link2 className="h-3.5 w-3.5 text-info" />
        <span className="text-[10px] text-text-muted">问题件去向</span>
      </div>
      <p className="mt-1 truncate text-[11px] text-text-secondary">{linkCard.title}</p>
      <p className={cn('mt-0.5 text-xs font-semibold', linkCard.valueColor)}>
        {linkCard.value}
      </p>
    </div>
  </div>
);

export default ThreeMiniCards;
