/**
 * 右栏流式 Agent 推理面板。
 *
 * 检测中态：顶部显示当前物品 + 进度，主体是 5 行 step 流式打字（光标 / 完成 ✓ / chips）。
 * 综合判定完成后追加：AI 判断摘要卡 + Agent 处置建议卡（含 L1/L2/通过 三种色调）。
 * 工单消息（L1 用户点"创建工单"后）追加在最末。
 */

import type { FC } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Check, CheckCircle2, AlertTriangle, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';
import type {
  PlayerPhase,
  StreamLine,
  DetectionPlayerState,
} from '../useDetectionPlayer';
import type { ScriptedItem, OcrChip } from '../detection-script';

interface AgentStreamPanelProps {
  phase: PlayerPhase;
  currentItem: ScriptedItem | null;
  streamLines: StreamLine[];
  pushedBadges: DetectionPlayerState['pushedBadges'];
  workOrderMessage: string | null;
  /** 用于 finished 阶段展示总数 */
  totalCount: number;
  /** 用于 finished 阶段展示当前指针 */
  cursor: number;
}

const STAGE_LABELS = ['接收图像', '视觉点数', '标签 OCR', '字段 OCR', '综合判定'];

// ─── Outcome 颜色映射 ───
const SUMMARY_TONE = {
  pass: {
    border: 'border-success',
    bar: 'bg-success',
    title: 'text-success',
    icon: <CheckCircle2 className="h-4 w-4 text-success" />,
  },
  l2: {
    border: 'border-l2-badge',
    bar: 'bg-l2-badge',
    title: 'text-l2-badge',
    icon: <AlertTriangle className="h-4 w-4 text-l2-badge" />,
  },
  l1: {
    border: 'border-l1-badge',
    bar: 'bg-l1-badge',
    title: 'text-l1-badge',
    icon: <ShieldAlert className="h-4 w-4 text-l1-badge" />,
  },
} as const;

const ChipPill: FC<{ chip: OcrChip; tone?: 'neutral' | 'good' | 'warn' | 'bad' }> = ({
  chip,
  tone = 'neutral',
}) => {
  const cls =
    tone === 'good'
      ? 'bg-success/10 text-success'
      : tone === 'warn'
        ? 'bg-l2-badge/10 text-l2-badge'
        : tone === 'bad'
          ? 'bg-l1-badge/10 text-l1-badge'
          : 'bg-[#F1F5F9] text-text-secondary';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] whitespace-nowrap',
        cls,
      )}
    >
      <span className="text-text-muted">{chip.label}</span>
      <span className="font-mono font-semibold">{chip.value}</span>
    </span>
  );
};

// ─── 流式行 ───
const StreamRow: FC<{ line: StreamLine; outcome: ScriptedItem['outcome'] }> = ({
  line,
  outcome,
}) => {
  const visibleText = line.text.slice(0, line.completedChars);
  const isFinalStep = line.step === 4;
  // 综合判定行根据 outcome 染色
  const finalColor =
    isFinalStep && line.done
      ? outcome === 'l1'
        ? 'text-l1-badge'
        : outcome === 'l2'
          ? 'text-l2-badge'
          : 'text-success'
      : 'text-text-primary';

  // chip tone for final step
  const chipTone =
    isFinalStep && line.done
      ? outcome === 'l1'
        ? 'bad'
        : outcome === 'l2'
          ? 'warn'
          : 'good'
      : 'neutral';

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15 }}
      className="flex gap-2"
    >
      {/* 步骤序号 / 状态点 */}
      <div className="flex w-4 shrink-0 flex-col items-center pt-0.5">
        <span
          className={cn(
            'flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold',
            line.done
              ? 'bg-success/20 text-success'
              : 'bg-info/20 text-info',
          )}
        >
          {line.done ? <Check className="h-2.5 w-2.5" /> : line.step + 1}
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-semibold text-text-muted">
            {STAGE_LABELS[line.step]}
          </span>
        </div>
        <p className={cn('mt-0.5 text-[11px] leading-relaxed break-words', finalColor)}>
          {visibleText}
          {!line.done && (
            <span className="ml-0.5 inline-block w-[6px] animate-pulse text-info">▍</span>
          )}
        </p>
        {line.done && line.chips.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1">
            {line.chips.map((c, i) => (
              <ChipPill key={`${line.step}-${i}`} chip={c} tone={chipTone} />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export const AgentStreamPanel: FC<AgentStreamPanelProps> = ({
  phase,
  currentItem,
  streamLines,
  pushedBadges,
  workOrderMessage,
  totalCount,
  cursor,
}) => {
  if (!currentItem) {
    // finished 终态
    return (
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <CheckCircle2 className="h-10 w-10 text-success" />
        <h4 className="mt-3 text-sm font-semibold text-text-primary">演示完成</h4>
        <p className="mt-1 text-[11px] text-text-muted">
          已完成 {totalCount} 件检测，可点击下方按钮重置剧本
        </p>
      </div>
    );
  }

  const tone = SUMMARY_TONE[currentItem.outcome];
  const showFinalCards =
    streamLines.find((l) => l.step === 4)?.done === true;

  return (
    <div className="flex flex-1 flex-col gap-2 overflow-y-auto pr-0.5">
      {/* 顶部物品上下文 */}
      <div className="flex items-center gap-2 rounded-lg bg-info/8 border border-info/20 px-2.5 py-2">
        <Bot className="h-4 w-4 shrink-0 text-info" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[11px] font-semibold text-text-primary">
            正在分析：{currentItem.materialName}
            <span className="ml-1 text-text-muted">· {currentItem.qty}</span>
          </p>
          <p className="font-mono text-[10px] text-text-muted">
            {currentItem.orderNo} · 第 {cursor + 1}/{totalCount} 件
          </p>
        </div>
        <span className="rounded bg-info/15 px-1.5 py-0.5 text-[10px] text-info">
          {streamLines.filter((l) => l.done).length}/5
        </span>
      </div>

      {/* 流式行 */}
      <div className="space-y-2 rounded-lg bg-[#F8FAFC] p-2.5">
        <AnimatePresence initial={false}>
          {streamLines.map((line) => (
            <StreamRow key={line.step} line={line} outcome={currentItem.outcome} />
          ))}
        </AnimatePresence>
        {streamLines.length === 0 && (
          <p className="py-2 text-center text-[11px] text-text-muted">
            <span className="inline-block animate-pulse">●</span> 等待 AI 推理流……
          </p>
        )}
      </div>

      {/* 综合判定卡 + Agent 处置建议（仅 step 4 完成后） */}
      {showFinalCards && (
        <>
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn('overflow-hidden rounded-lg border', tone.border)}
          >
            <div className={cn('h-1', tone.bar)} />
            <div className="p-2.5">
              <div className="flex items-center gap-1.5">
                {tone.icon}
                <h4 className={cn('text-[12px] font-semibold', tone.title)}>
                  {currentItem.summary.title}
                </h4>
              </div>
              <div className="mt-2 grid grid-cols-3 gap-1.5">
                <div className="rounded bg-[#F1F5F9] px-1.5 py-1 text-center">
                  <p className="text-[9px] text-text-muted">置信度</p>
                  <p className="font-mono text-[11px] font-semibold text-text-primary">
                    {currentItem.summary.confidence}
                  </p>
                </div>
                <div className="rounded bg-[#F1F5F9] px-1.5 py-1 text-center">
                  <p className="text-[9px] text-text-muted">耗时</p>
                  <p className="font-mono text-[11px] font-semibold text-text-primary">
                    {currentItem.summary.latency}
                  </p>
                </div>
                <div className="rounded bg-[#F1F5F9] px-1.5 py-1 text-center">
                  <p className="text-[9px] text-text-muted">模型</p>
                  <p className="font-mono text-[10px] font-semibold text-text-primary">
                    {currentItem.summary.model}
                  </p>
                </div>
              </div>
              <div className="mt-2 space-y-1">
                {currentItem.summary.lines.map((l) => (
                  <div key={l.label} className="flex justify-between text-[11px]">
                    <span className="text-text-muted">{l.label}</span>
                    <span className="font-medium text-text-primary">{l.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Agent 处置建议 */}
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="rounded-lg border border-info/30 bg-info/5 p-2.5"
          >
            <div className="flex items-center gap-1.5">
              <Bot className="h-3.5 w-3.5 text-info" />
              <span className="text-[11px] font-semibold text-info">Agent 处置建议</span>
            </div>
            <p className="mt-1 text-[11px] leading-relaxed text-text-secondary">
              {currentItem.agentSuggestion}
            </p>
            {pushedBadges && (
              <div className="mt-2 flex flex-wrap gap-1">
                {pushedBadges.ae && (
                  <span className="rounded bg-danger/10 px-1.5 py-0.5 font-mono text-[10px] text-danger">
                    {pushedBadges.ae}
                  </span>
                )}
                {pushedBadges.wo && (
                  <span className="rounded bg-info/10 px-1.5 py-0.5 font-mono text-[10px] text-info">
                    {pushedBadges.wo}
                  </span>
                )}
                {pushedBadges.iq && (
                  <span className="rounded bg-l2-badge/10 px-1.5 py-0.5 font-mono text-[10px] text-l2-badge">
                    {pushedBadges.iq}
                  </span>
                )}
                {pushedBadges.cl && (
                  <span className="rounded bg-accent/15 px-1.5 py-0.5 font-mono text-[10px] text-accent">
                    {pushedBadges.cl}
                  </span>
                )}
              </div>
            )}
          </motion.div>
        </>
      )}

      {/* 工单创建消息 */}
      {workOrderMessage && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg border border-success/30 bg-success/10 px-2.5 py-2"
        >
          <div className="flex items-start gap-1.5">
            <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" />
            <p className="text-[11px] text-text-primary">{workOrderMessage}</p>
          </div>
        </motion.div>
      )}

      {/* phase 提示 */}
      {phase === 'awaitingConfirm' && (
        <div className="rounded-lg border border-l1-badge/40 bg-l1-badge/5 px-2.5 py-2 text-center">
          <p className="text-[11px] text-l1-badge">⚠ 等待人工确认拦截</p>
        </div>
      )}
    </div>
  );
};

export default AgentStreamPanel;
