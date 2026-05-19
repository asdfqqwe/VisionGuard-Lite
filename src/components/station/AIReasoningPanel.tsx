import type { FC } from 'react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  ScanLine,
  FileSearch,
  Tag,
  Type,
  Barcode,
  Eye,
  PackageSearch,
  Layers,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ReasoningItem {
  name: string;
  status: 'pending' | 'running' | 'done' | 'error';
  confidence?: number;
  detail?: string;
}

interface AIReasoningPanelProps {
  items?: ReasoningItem[];
  collapsed?: boolean;
  className?: string;
}

const defaultItems: ReasoningItem[] = [
  { name: '目标检测', status: 'done', confidence: 99.2, detail: '检测到2件目标物' },
  { name: '分类匹配', status: 'done', confidence: 98.8, detail: '物资分类：关键零部件' },
  { name: 'OCR/条码核验', status: 'done', confidence: 97.5, detail: '条码：B20260309C' },
  { name: '标签完整性检测', status: 'done', confidence: 96.3, detail: '标签完整，无破损' },
  { name: '关键字段OCR抽检', status: 'done', confidence: 95.1, detail: '料号/批次/日期已核验' },
  { name: '条码合规核验', status: 'done', confidence: 98.0, detail: '格式/校验位/编码规则合规' },
  { name: '外观缺陷检测', status: 'done', confidence: 94.7, detail: 'OK件：2件，NG件：0件' },
  { name: '视觉件数清点', status: 'done', confidence: 99.5, detail: '清点：2件，预期：2件' },
  { name: '多模态交叉验证', status: 'done', confidence: 98.2, detail: '视觉+重力+红外三模通过' },
];

const iconMap: Record<string, React.ReactNode> = {
  '目标检测': <ScanLine className="h-3.5 w-3.5" />,
  '分类匹配': <PackageSearch className="h-3.5 w-3.5" />,
  'OCR/条码核验': <Barcode className="h-3.5 w-3.5" />,
  '标签完整性检测': <Tag className="h-3.5 w-3.5" />,
  '关键字段OCR抽检': <Type className="h-3.5 w-3.5" />,
  '条码合规核验': <FileSearch className="h-3.5 w-3.5" />,
  '外观缺陷检测': <Eye className="h-3.5 w-3.5" />,
  '视觉件数清点': <CheckCircle2 className="h-3.5 w-3.5" />,
  '多模态交叉验证': <Layers className="h-3.5 w-3.5" />,
};

const statusColor: Record<string, string> = {
  pending: 'text-text-muted',
  running: 'text-info',
  done: 'text-success',
  error: 'text-danger',
};

const statusBg: Record<string, string> = {
  pending: 'bg-text-muted',
  running: 'bg-info',
  done: 'bg-success',
  error: 'bg-danger',
};

export const AIReasoningPanel: FC<AIReasoningPanelProps> = ({
  items = defaultItems,
  collapsed: initialCollapsed = false,
  className,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(initialCollapsed);

  const doneCount = items.filter((i) => i.status === 'done').length;
  const totalCount = items.length;

  return (
    <div className={cn('rounded-lg bg-[#F1F5F9] p-3', className)}>
      {/* Header - always visible */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="flex w-full items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-text-primary">
            AI推理过程
          </span>
          <span className="rounded bg-success/20 px-1.5 py-0.5 text-[11px] font-medium text-success">
            {doneCount}/{totalCount}
          </span>
        </div>
        {isCollapsed ? (
          <ChevronRight className="h-4 w-4 text-text-muted" />
        ) : (
          <ChevronDown className="h-4 w-4 text-text-muted" />
        )}
      </button>

      {/* Collapsed summary row */}
      {isCollapsed && (
        <div className="mt-2 flex gap-1">
          {items.map((item, i) => (
            <div
              key={i}
              className={cn(
                'h-1.5 flex-1 rounded-full',
                statusBg[item.status]
              )}
              title={`${item.name}: ${item.status === 'done' ? '完成' : item.status === 'running' ? '进行中' : item.status === 'error' ? '异常' : '待处理'}`}
            />
          ))}
        </div>
      )}

      {/* Expanded items */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-2 space-y-1 overflow-hidden"
          >
            {items.map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-2 rounded px-1.5 py-1 transition-colors hover:bg-primary/50"
              >
                {/* Icon */}
                <span className={cn('shrink-0', statusColor[item.status])}>
                  {item.status === 'running' ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    iconMap[item.name] || <CheckCircle2 className="h-3.5 w-3.5" />
                  )}
                </span>

                {/* Name */}
                <span
                  className={cn(
                    'flex-1 text-xs',
                    item.status === 'pending'
                      ? 'text-text-muted'
                      : 'text-text-secondary'
                  )}
                >
                  {item.name}
                </span>

                {/* Confidence */}
                {item.confidence !== undefined && item.status !== 'pending' && (
                  <span className="font-mono text-[11px] text-text-muted">
                    {item.confidence.toFixed(1)}%
                  </span>
                )}

                {/* Status dot */}
                <div
                  className={cn(
                    'h-2 w-2 shrink-0 rounded-full',
                    statusBg[item.status]
                  )}
                />
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AIReasoningPanel;
