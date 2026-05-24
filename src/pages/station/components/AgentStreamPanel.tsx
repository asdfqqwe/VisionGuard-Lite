/**
 * 右栏流式 Agent 推理面板。
 *
 * 检测中态：顶部显示当前物品，主体是推理流式打字（光标 / 完成 / chips）。
 * 综合判定完成后追加：AI 判断摘要卡 + Agent 处置建议卡（含 L1/L2/通过 三种色调）。
 * 工单消息（L1 用户点"创建工单"后）追加在最末。
 */

import type { FC } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Check, CheckCircle2, AlertTriangle, ShieldAlert, Send, Smartphone } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DemoStepBadge } from '@/components/shared';
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
  /** 用于 finished 阶段展示批次规模 */
  totalCount: number;
  /** 与检测播放器状态保持一致 */
  cursor: number;
  onApprovePass: () => void;
  onAssignL2Review: () => void;
  onHoldL2Review: () => void;
  onConfirmL1Block: () => void;
  onCreateWorkOrder: () => void;
  onGoToPdaReview?: () => void;
  passActionStep?: number;
  passActionLabel?: string;
  passActionHint?: string;
  passSuggestion?: string;
  l2ActionStep?: number;
  l2ActionLabel?: string;
  l2ActionHint?: string;
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
      {/* 状态点 */}
      <div className="flex w-4 shrink-0 flex-col items-center pt-0.5">
        <span
          className={cn(
            'flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold',
            line.done
              ? 'bg-success/20 text-success'
              : 'bg-info/20 text-info',
          )}
        >
          {line.done ? <Check className="h-2.5 w-2.5" /> : <span className="h-1.5 w-1.5 rounded-full bg-current" />}
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
  onApprovePass,
  onAssignL2Review,
  onHoldL2Review,
  onConfirmL1Block,
  onCreateWorkOrder,
  onGoToPdaReview,
  passActionStep = 8,
  passActionLabel = '确认通过并进入下一件',
  passActionHint = '操作员确认后，系统会归档检测截图与 OCR 结果。',
  passSuggestion = '未发现异常，Agent 已确认通过，可直接进入后续入库流程。',
  l2ActionStep = 9,
  l2ActionLabel = '下发 PDA 处置',
  l2ActionHint = 'Station 已完成正式检测。把异常结论下发给收货员 PDA，现场补拍、整改或隔离登记。',
}) => {
  if (!currentItem) {
    // finished 终态
    return (
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <CheckCircle2 className="h-10 w-10 text-success" />
        <h4 className="mt-3 text-sm font-semibold text-text-primary">本批检测完成</h4>
        <p className="mt-1 text-[11px] text-text-muted">
          已完成 {totalCount} 件检测，可重新发起本批任务
        </p>
      </div>
    );
  }

  const tone = SUMMARY_TONE[currentItem.outcome];
  const showFinalCards =
    streamLines.find((l) => l.step === 4)?.done === true;
  const isPass = currentItem.outcome === 'pass';

  return (
    <div className="flex h-full min-h-0 flex-col gap-1.5 overflow-y-auto pr-0.5">
      {/* 顶部物品上下文 */}
      <div className="flex items-center gap-2 rounded-lg bg-info/8 border border-info/20 px-2.5 py-1.5">
        <Bot className="h-4 w-4 shrink-0 text-info" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[11px] font-semibold text-text-primary">
            正在分析：{currentItem.materialName}
            <span className="ml-1 text-text-muted">· {currentItem.qty}</span>
          </p>
          <p className="font-mono text-[10px] text-text-muted">
            {currentItem.orderNo} · 批次检测中
          </p>
        </div>
        <span className="rounded bg-info/15 px-1.5 py-0.5 text-[10px] text-info">
          推理中
        </span>
      </div>

      {/* 流式行 */}
      <div className={cn(
        'rounded-lg bg-[#F8FAFC] p-2',
        showFinalCards ? 'space-y-1' : 'space-y-1.5',
      )}>
        <AnimatePresence initial={false}>
          {(showFinalCards ? streamLines.slice(-2) : streamLines).map((line) => (
            <StreamRow key={line.step} line={line} outcome={currentItem.outcome} />
          ))}
        </AnimatePresence>
        {streamLines.length === 0 && (
          <p className="py-2 text-center text-[11px] text-text-muted">
            <span className="inline-block animate-pulse">●</span> 等待 AI 推理流……
          </p>
        )}
      </div>

      {/* 综合判定卡 + Agent 处置建议 */}
      {showFinalCards && (
        <>
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn('overflow-hidden rounded-lg border', tone.border)}
          >
            <div className={cn('h-1', tone.bar)} />
            <div className="p-2">
              <div className="flex items-center gap-1.5">
                {tone.icon}
                <h4 className={cn('text-[12px] font-semibold', tone.title)}>
                  {currentItem.summary.title}
                </h4>
              </div>
              <div className="mt-1.5 grid grid-cols-3 gap-1">
                <div className="rounded bg-[#F1F5F9] px-1.5 py-0.5 text-center">
                  <p className="text-[9px] text-text-muted">置信度</p>
                  <p className="font-mono text-[11px] font-semibold text-text-primary">
                    {currentItem.summary.confidence}
                  </p>
                </div>
                <div className="rounded bg-[#F1F5F9] px-1.5 py-0.5 text-center">
                  <p className="text-[9px] text-text-muted">耗时</p>
                  <p className="font-mono text-[11px] font-semibold text-text-primary">
                    {currentItem.summary.latency}
                  </p>
                </div>
                <div className="rounded bg-[#F1F5F9] px-1.5 py-0.5 text-center">
                  <p className="text-[9px] text-text-muted">模型</p>
                  <p className="font-mono text-[10px] font-semibold text-text-primary">
                    {currentItem.summary.model}
                  </p>
                </div>
              </div>
              <div className="mt-1 space-y-0.5">
                {currentItem.summary.lines.slice(0, 3).map((l) => (
                  <div key={l.label} className="flex justify-between text-[11px]">
                    <span className="text-text-muted">{l.label}</span>
                    <span className="font-medium text-text-primary">{l.value}</span>
                  </div>
                ))}
              </div>
              {currentItem.summary.packageGroups && (
                <div className="mt-2 grid grid-cols-3 gap-1">
                  {currentItem.summary.packageGroups.map((group) => (
                    <div
                      key={group.label}
                      className="rounded border border-success/20 bg-success/5 px-1.5 py-1"
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[10px] font-semibold text-success">
                          {group.label}
                        </span>
                        <span className="font-mono text-[10px] text-text-primary">
                          {group.count}
                        </span>
                      </div>
                      <p className="mt-0.5 truncate text-[10px] text-text-secondary">
                        {group.tags}
                      </p>
                      <p className="mt-0.5 line-clamp-2 text-[9px] leading-tight text-text-muted">
                        {group.note}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          {/* Agent 处置建议 */}
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className={cn(
              'rounded-lg border p-2',
              isPass
                ? 'border-success/35 bg-success/8'
                : currentItem.outcome === 'l2'
                  ? 'border-l2-badge/35 bg-l2-badge/8'
                  : 'border-l1-badge/35 bg-l1-badge/8',
            )}
          >
            <div className="flex items-center gap-1.5">
              {isPass ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-success" />
              ) : (
                <Bot
                  className={cn(
                    'h-3.5 w-3.5',
                    currentItem.outcome === 'l2' ? 'text-l2-badge' : 'text-l1-badge',
                  )}
                />
              )}
              <span
                className={cn(
                  'text-[11px] font-semibold',
                  isPass
                    ? 'text-success'
                    : currentItem.outcome === 'l2'
                      ? 'text-l2-badge'
                      : 'text-l1-badge',
                )}
              >
                {isPass ? 'Agent 通过确认' : 'Agent 处置建议'}
              </span>
            </div>
            <p className="mt-1 text-[11px] leading-snug text-text-secondary">
              {isPass ? passSuggestion : currentItem.agentSuggestion}
            </p>
            {!isPass && (
              <div className="mt-2 rounded bg-white/60 px-2 py-1.5">
                <div className="flex items-center gap-1.5">
                  <Send className="h-3 w-3 text-info" />
                  <span className="text-[10px] font-semibold text-text-primary">
                    飞书推荐处理人
                  </span>
                </div>
                <p className="mt-1 text-[10px] leading-relaxed text-text-secondary">
                  {currentItem.outcome === 'l2'
                    ? currentItem.agentSuggestion.includes('标签破损') || currentItem.agentSuggestion.includes('覆膜遮挡')
                      ? '李娜（来料质检）· 当班在线 · 负责外观与标签复核'
                      : '周明（标签 OCR 复核）· 当班在线 · 负责标准号与条码复核'
                    : '王强（安全主管）+ 陈璐（危化品专员）· 当班在线 · 负责 L1 拦截处置'}
                </p>
              </div>
            )}
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

          {phase === 'reviewing' && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="sticky bottom-0 z-10 rounded-lg border border-success/30 bg-success/8 p-2 shadow-[0_-6px_16px_rgba(15,23,42,0.08)] backdrop-blur"
            >
              <p className="text-[11px] leading-snug text-text-secondary">
                {passActionHint}
              </p>
              <button
                onClick={onApprovePass}
                className="mt-1.5 flex w-full items-center justify-center gap-1.5 rounded bg-success px-2.5 py-1.5 text-[11px] font-medium text-white transition-colors hover:bg-success/90"
              >
                <DemoStepBadge step={passActionStep} />
                <CheckCircle2 className="h-3.5 w-3.5" />
                {passActionLabel}
              </button>
            </motion.div>
          )}

          {phase === 'awaitingL2Action' && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="sticky bottom-0 z-10 rounded-lg border border-l2-badge/40 bg-l2-badge/8 p-2.5 shadow-[0_-6px_16px_rgba(15,23,42,0.08)] backdrop-blur"
            >
              <p className="text-[11px] text-text-secondary">
                {l2ActionHint}
              </p>
              {onGoToPdaReview ? (
                <button
                  onClick={onGoToPdaReview}
                  className="mt-2 flex w-full items-center justify-center gap-1.5 rounded bg-l2-badge px-2.5 py-2 text-[11px] font-semibold text-white shadow-[0_0_0_3px_rgba(217,119,6,0.16)] transition-colors hover:bg-l2-badge/90"
                >
                  <DemoStepBadge step={l2ActionStep} />
                  <Smartphone className="h-3.5 w-3.5" />
                  {l2ActionLabel}
                </button>
              ) : (
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <button
                    onClick={onAssignL2Review}
                    className="rounded bg-l2-badge px-2 py-1.5 text-[11px] font-medium text-white transition-colors hover:bg-l2-badge/90"
                  >
                    飞书指派
                  </button>
                  <button
                    onClick={onHoldL2Review}
                    className="rounded border border-l2-badge/40 px-2 py-1.5 text-[11px] font-medium text-l2-badge transition-colors hover:bg-l2-badge/10"
                  >
                    暂存复核
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {phase === 'awaitingConfirm' && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="sticky bottom-0 z-10 rounded-lg border border-l1-badge/40 bg-l1-badge/8 p-2.5 shadow-[0_-6px_16px_rgba(15,23,42,0.08)] backdrop-blur"
            >
              <p className="text-[11px] text-text-secondary">
                红色告警已推荐飞书通知王强和陈璐，需同步创建安全处置工单。
              </p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <button
                  onClick={onCreateWorkOrder}
                  className="rounded bg-l1-badge px-2 py-1.5 text-[11px] font-medium text-white transition-colors hover:bg-l1-badge/90"
                >
                  创建并指派
                </button>
                <button
                  onClick={onConfirmL1Block}
                  className="rounded border border-l1-badge/40 px-2 py-1.5 text-[11px] font-medium text-l1-badge transition-colors hover:bg-l1-badge/10"
                >
                  仅确认拦截
                </button>
              </div>
            </motion.div>
          )}
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
