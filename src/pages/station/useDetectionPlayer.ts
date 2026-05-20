/**
 * useDetectionPlayer
 *
 * 流式 AI 检测演示的时间线状态机。读入剧本数组，对外暴露 phase / 当前指针 /
 * 已浮现检测框 / 流式行 / 今日统计 / L1 告警可见 / 一组 actions。
 *
 * 内部用一组 setTimeout 和 requestAnimationFrame 驱动；卸载或 reset 时统一清理。
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  STEP_TIMELINE_MS,
  PIPELINE_INDEX,
  type ScriptedItem,
  type OcrChip,
} from './detection-script';

export type PlayerPhase =
  | 'idle' // 待机，等待用户点开始
  | 'detecting' // 检测中（5 步骤推进）
  | 'reviewing' // 检测完成，等待操作员确认结果或进入下一件
  | 'awaitingL2Action' // L2 警示完成，等待质检员选择处理动作
  | 'awaitingConfirm' // L1 已拍出，等待人工确认
  | 'finished'; // 队列全部播完

export type PipelineState = 'idle' | 'loading' | 'ready' | 'warning' | 'danger';

export interface StreamLine {
  /** 步骤索引 0..4 */
  step: number;
  /** 完整文本（最终态） */
  text: string;
  /** 当前已显示的字符数（打字机推进） */
  completedChars: number;
  /** 是否已完成打字（=true 时显示 ✓ 和 chips） */
  done: boolean;
  /** 该步骤产出的小数据芯片 */
  chips: OcrChip[];
}

export interface TodayStats {
  batches: number;
  pass: number;
  intercept: number;
  warning: number;
}

export interface DetectionPlayerState {
  phase: PlayerPhase;
  /** 当前正在/即将检测的剧本下标 0..script.length */
  cursor: number;
  /** 当前展示结果对应的剧本下标，未开始时为 null */
  displayIndex: number | null;
  /** 当前展示的物品引用：检测中为当前件，检测结束后保留最近一件结果 */
  currentItem: ScriptedItem | null;
  /** 当前推进到第几个步骤 -1..4 */
  currentStepIndex: number;
  /** 已浮现的检测框 id */
  revealedBoxIds: string[];
  /** 流式行（按已开始打字的步骤陆续 push） */
  streamLines: StreamLine[];
  /** 7 个 pipeline chip 状态 */
  pipelineStates: PipelineState[];
  /** 今日数据 */
  todayStats: TodayStats;
  /** L1 全屏告警可见 */
  alertOpen: boolean;
  /** 关联编号（异常态推送） */
  pushedBadges: { ae?: string; wo?: string; iq?: string; cl?: string } | null;
  /** 工单创建消息（用户在 L1 告警中点"创建工单"后追加到流） */
  workOrderMessage: string | null;
}

export interface DetectionPlayerActions {
  start(): void;
  /** 普通通过结果中点"确认通过" — 队列前移到下一件 */
  approvePass(): void;
  /** L2 警示中点"指派质检员" — 追加飞书指派消息，队列前移 */
  assignL2Review(): void;
  /** L2 警示中点"暂存待复核" — 追加暂存消息，队列前移 */
  holdL2ForReview(): void;
  /** L1 告警中点"确认拦截" — 关闭弹窗，队列前移到下一件 */
  confirmL1Block(): void;
  /** L1 告警中点"创建工单" — 关闭弹窗，追加工单消息，队列前移 */
  createWorkOrder(): void;
  /** 重置整个剧本（队列归零、统计回滚、流式区清空） */
  resetScript(): void;
}

/** 打字机速度：字符/秒 */
const TYPING_CPS = 60;

/** 初始今日统计（与左栏静态显示一致，逐件检测 +1） */
const INITIAL_STATS: TodayStats = {
  batches: 24,
  pass: 20,
  intercept: 3,
  warning: 1,
};

const INITIAL_PIPELINE: PipelineState[] = [
  'idle',
  'idle',
  'idle',
  'idle',
  'idle',
  'idle',
  'idle',
];

// ─── Web Audio 短哔（L1 拦截使用） ───
function playBeep(audioCtx: AudioContext) {
  const now = audioCtx.currentTime;
  for (let i = 0; i < 3; i++) {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'square';
    osc.frequency.value = 800;
    gain.gain.value = 0.04;
    osc.connect(gain).connect(audioCtx.destination);
    const startAt = now + i * 0.18;
    osc.start(startAt);
    osc.stop(startAt + 0.12);
  }
}

export function useDetectionPlayer(
  script: ScriptedItem[],
): DetectionPlayerState & DetectionPlayerActions {
  const [phase, setPhase] = useState<PlayerPhase>('idle');
  const [cursor, setCursor] = useState(0);
  const [displayIndex, setDisplayIndex] = useState<number | null>(null);
  const [displayItem, setDisplayItem] = useState<ScriptedItem | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [revealedBoxIds, setRevealedBoxIds] = useState<string[]>([]);
  const [streamLines, setStreamLines] = useState<StreamLine[]>([]);
  const [pipelineStates, setPipelineStates] = useState<PipelineState[]>(INITIAL_PIPELINE);
  const [todayStats, setTodayStats] = useState<TodayStats>(INITIAL_STATS);
  const [alertOpen, setAlertOpen] = useState(false);
  const [pushedBadges, setPushedBadges] =
    useState<DetectionPlayerState['pushedBadges']>(null);
  const [workOrderMessage, setWorkOrderMessage] = useState<string | null>(null);

  const timeoutsRef = useRef<number[]>([]);
  const rafRef = useRef<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const currentItem = displayItem;

  // ─── 统一清理 ─────────────────────────────────────────────
  const clearTimeline = useCallback(() => {
    timeoutsRef.current.forEach((id) => clearTimeout(id));
    timeoutsRef.current = [];
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  // 卸载时清理
  useEffect(() => {
    return () => {
      clearTimeline();
      audioCtxRef.current?.close().catch(() => undefined);
    };
  }, [clearTimeline]);

  // ─── 打字机推进 ────────────────────────────────────────────
  const startTypingFor = useCallback((stepIdx: number, fullText: string) => {
    const startAt = performance.now();
    const totalChars = fullText.length;
    const durationMs = (totalChars / TYPING_CPS) * 1000;

    const tick = (now: number) => {
      const elapsed = now - startAt;
      const ratio = Math.min(1, elapsed / durationMs);
      const chars = Math.floor(ratio * totalChars);
      setStreamLines((lines) =>
        lines.map((l) =>
          l.step === stepIdx
            ? {
                ...l,
                completedChars: chars,
                done: chars >= totalChars,
              }
            : l,
        ),
      );
      if (ratio < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        rafRef.current = null;
      }
    };
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const advanceCursor = useCallback(() => {
    setCursor((c) => {
      const next = c + 1;
      if (next >= script.length) {
        setPhase('finished');
      } else {
        setPhase('idle');
      }
      return next;
    });
  }, [script.length]);

  // ─── 调度单件检测时间线 ───────────────────────────────────
  const scheduleItem = useCallback(
    (item: ScriptedItem) => {
      const at = (ms: number, fn: () => void) => {
        const id = window.setTimeout(fn, ms);
        timeoutsRef.current.push(id);
      };

      // 推一个新流式行 + 启动打字
      const pushLine = (stepIdx: number) => {
        setStreamLines((lines) => [
          ...lines,
          {
            step: stepIdx,
            text: item.stepLines[stepIdx],
            completedChars: 0,
            done: false,
            chips: item.stepChips[stepIdx],
          },
        ]);
        setCurrentStepIndex(stepIdx);
        startTypingFor(stepIdx, item.stepLines[stepIdx]);
      };

      // T+0：phase + reset 当前件视觉状态
      const itemIndex = script.indexOf(item);
      setDisplayIndex(itemIndex >= 0 ? itemIndex : null);
      setDisplayItem(item);
      setPhase('detecting');
      setRevealedBoxIds([]);
      setStreamLines([]);
      setPipelineStates(INITIAL_PIPELINE);
      setPushedBadges(null);

      // step 0：接收图像
      at(STEP_TIMELINE_MS.start, () => pushLine(0));

      // step 1：视觉点数 + chip[visualCount] loading→ready，浮现视觉框
      at(STEP_TIMELINE_MS.step1_visualCount, () => {
        pushLine(1);
        setPipelineStates((s) => {
          let next = updateAt(s, PIPELINE_INDEX.visualCount, 'loading');
          next = updateAt(next, PIPELINE_INDEX.defect, 'loading');
          return next;
        });
      });
      // 视觉框 stagger 浮现
      const visualBoxes = item.boxes.filter((b) => b.appearAtStep === 1);
      visualBoxes.forEach((b, i) => {
        at(STEP_TIMELINE_MS.step1_visualCount + 200 + i * 80, () => {
          setRevealedBoxIds((ids) => [...ids, b.id]);
        });
      });
      at(STEP_TIMELINE_MS.step1_visualCount + 600, () => {
        setPipelineStates((s) => {
          let next = updateAt(s, PIPELINE_INDEX.visualCount, 'ready');
          next = updateAt(
            next,
            PIPELINE_INDEX.defect,
            getStepSeverity(item, 1, item.outcome === 'l1' ? 'danger' : 'ready'),
          );
          return next;
        });
      });

      // step 2：标签 OCR
      at(STEP_TIMELINE_MS.step2_labelOcr, () => {
        pushLine(2);
        setPipelineStates((s) => updateAt(s, PIPELINE_INDEX.labelCompliance, 'loading'));
      });
      const labelBoxes = item.boxes.filter((b) => b.appearAtStep === 2);
      labelBoxes.forEach((b, i) => {
        at(STEP_TIMELINE_MS.step2_labelOcr + 150 + i * 80, () => {
          setRevealedBoxIds((ids) => [...ids, b.id]);
        });
      });
      at(STEP_TIMELINE_MS.step2_labelOcr + 450, () => {
        setPipelineStates((s) =>
          updateAt(s, PIPELINE_INDEX.labelCompliance, getStepSeverity(item, 2)),
        );
      });

      // step 3：字段 OCR — 同时触发型号OCR + 字段OCR 两个 chip
      at(STEP_TIMELINE_MS.step3_fieldOcr, () => {
        pushLine(3);
        setPipelineStates((s) => {
          let next = updateAt(s, PIPELINE_INDEX.modelOcr, 'loading');
          next = updateAt(next, PIPELINE_INDEX.fieldOcr, 'loading');
          if (item.outcome === 'l1') {
            next = updateAt(next, PIPELINE_INDEX.multiModal, 'loading');
          }
          return next;
        });
      });
      const fieldBoxes = item.boxes.filter((b) => b.appearAtStep === 3);
      fieldBoxes.forEach((b, i) => {
        at(STEP_TIMELINE_MS.step3_fieldOcr + 200 + i * 80, () => {
          setRevealedBoxIds((ids) => [...ids, b.id]);
        });
      });
      at(STEP_TIMELINE_MS.step3_fieldOcr + 550, () => {
        setPipelineStates((s) => {
          const fieldSeverity = getStepSeverity(item, 3);
          let next = updateAt(s, PIPELINE_INDEX.modelOcr, fieldSeverity);
          next = updateAt(next, PIPELINE_INDEX.fieldOcr, fieldSeverity);
          if (item.outcome === 'l1') {
            next = updateAt(next, PIPELINE_INDEX.multiModal, 'danger');
          }
          return next;
        });
      });

      // step 4：综合判定（含多模态分支）
      at(STEP_TIMELINE_MS.step4_finalJudgment, () => {
        pushLine(4);
        setPipelineStates((s) => {
          let next = s;
          if (item.outcome !== 'l1') {
            next = updateAt(next, PIPELINE_INDEX.multiModal, 'loading');
          }
          next = updateAt(next, PIPELINE_INDEX.videoViolation, 'loading');
          return next;
        });
      });

      // 收尾分支
      const finishAt = STEP_TIMELINE_MS.step4_finalJudgment + 650;
      at(finishAt, () => {
        setPipelineStates((s) => {
          let next = s;
          if (item.outcome !== 'l1') {
            next = updateAt(next, PIPELINE_INDEX.multiModal, 'ready');
          }
          next = updateAt(next, PIPELINE_INDEX.videoViolation, 'ready');
          return next;
        });

        if (item.outcome === 'pass') {
          setTodayStats((st) => ({ ...st, batches: st.batches + 1, pass: st.pass + 1 }));
          setPhase('reviewing');
        } else if (item.outcome === 'l2') {
          setPushedBadges(item.badges ?? null);
          setTodayStats((st) => ({ ...st, batches: st.batches + 1, warning: st.warning + 1 }));
          setPhase('awaitingL2Action');
        }
      });

      if (item.outcome === 'l1') {
        // L1 在略晚一点拍出全屏告警 + 蜂鸣 + multiModal chip 转 danger
        at(STEP_TIMELINE_MS.l1AlertAt, () => {
          setPipelineStates((s) => updateAt(s, PIPELINE_INDEX.multiModal, 'danger'));
          setPushedBadges(item.badges ?? null);
          setTodayStats((st) => ({
            ...st,
            batches: st.batches + 1,
            intercept: st.intercept + 1,
          }));
          setAlertOpen(true);
          setPhase('awaitingConfirm');
          // 蜂鸣（用户已在 start() 内点击过，可以播放）
          if (audioCtxRef.current) {
            playBeep(audioCtxRef.current);
          }
        });
      }
    },
    [startTypingFor, script],
  );

  // ─── Actions ─────────────────────────────────────────────
  const start = useCallback(() => {
    if (
      phase === 'detecting' ||
      phase === 'awaitingConfirm' ||
      phase === 'awaitingL2Action' ||
      phase === 'reviewing'
    ) {
      return;
    }
    if (cursor >= script.length) return; // finished

    // 借势用户点击解锁 AudioContext
    if (!audioCtxRef.current) {
      try {
        const Ctx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext?: typeof AudioContext })
            .webkitAudioContext;
        if (Ctx) audioCtxRef.current = new Ctx();
      } catch {
        // 忽略：浏览器不支持或被拒
      }
    }
    audioCtxRef.current?.resume().catch(() => undefined);

    clearTimeline();
    setWorkOrderMessage(null);
    const item = script[cursor];
    scheduleItem(item);
  }, [phase, cursor, script, scheduleItem, clearTimeline]);

  const approvePass = useCallback(() => {
    setWorkOrderMessage('已确认通过，检测记录已归档，任务进入上架队列');
    advanceCursor();
  }, [advanceCursor]);

  const assignL2Review = useCallback(() => {
    const assignee =
      currentItem?.materialName === '前保险杠'
        ? '李娜（来料质检）'
        : '周明（标签 OCR 复核）';
    setWorkOrderMessage(`已通过飞书指派 ${assignee} 处理，附带检测截图、OCR 结果和异常编号`);
    advanceCursor();
  }, [currentItem, advanceCursor]);

  const holdL2ForReview = useCallback(() => {
    setWorkOrderMessage('已标记暂存待复核，物料移入 L2 待检区，飞书同步通知当班质检员');
    advanceCursor();
  }, [advanceCursor]);

  const confirmL1Block = useCallback(() => {
    setAlertOpen(false);
    advanceCursor();
  }, [advanceCursor]);

  const createWorkOrder = useCallback(() => {
    if (currentItem?.badges) {
      const parts: string[] = [];
      if (currentItem.badges.wo) parts.push(currentItem.badges.wo);
      if (currentItem.badges.iq) parts.push(currentItem.badges.iq);
      if (currentItem.badges.cl) parts.push(currentItem.badges.cl);
      setWorkOrderMessage(`已创建 ${parts.join(' + ')}，并通过飞书指派王强（安全主管）+ 陈璐（危化品专员）`);
    } else {
      setWorkOrderMessage('已创建工单，已通知相关责任人');
    }
    setAlertOpen(false);
    advanceCursor();
  }, [currentItem, advanceCursor]);

  const resetScript = useCallback(() => {
    clearTimeline();
    setPhase('idle');
    setCursor(0);
    setDisplayIndex(null);
    setDisplayItem(null);
    setCurrentStepIndex(-1);
    setRevealedBoxIds([]);
    setStreamLines([]);
    setPipelineStates(INITIAL_PIPELINE);
    setTodayStats(INITIAL_STATS);
    setAlertOpen(false);
    setPushedBadges(null);
    setWorkOrderMessage(null);
  }, [clearTimeline]);

  return useMemo(
    () => ({
      phase,
      cursor,
      displayIndex,
      currentItem,
      currentStepIndex,
      revealedBoxIds,
      streamLines,
      pipelineStates,
      todayStats,
      alertOpen,
      pushedBadges,
      workOrderMessage,
      start,
      approvePass,
      assignL2Review,
      holdL2ForReview,
      confirmL1Block,
      createWorkOrder,
      resetScript,
    }),
    [
      phase,
      cursor,
      displayIndex,
      currentItem,
      currentStepIndex,
      revealedBoxIds,
      streamLines,
      pipelineStates,
      todayStats,
      alertOpen,
      pushedBadges,
      workOrderMessage,
      start,
      approvePass,
      assignL2Review,
      holdL2ForReview,
      confirmL1Block,
      createWorkOrder,
      resetScript,
    ],
  );
}

// ─── Helpers ─────────────────────────────────────────────────
function updateAt<T>(arr: T[], idx: number, value: T): T[] {
  const next = arr.slice();
  next[idx] = value;
  return next;
}

function getStepSeverity(
  item: ScriptedItem,
  step: 1 | 2 | 3,
  fallback: PipelineState = 'ready',
): PipelineState {
  const severityOrder: Record<PipelineState, number> = {
    idle: 0,
    loading: 1,
    ready: 2,
    warning: 3,
    danger: 4,
  };

  return item.boxes
    .filter((box) => box.appearAtStep === step)
    .reduce<PipelineState>((result, box) => {
      const next = box.type === 'danger' ? 'danger' : box.type === 'warning' ? 'warning' : 'ready';
      return severityOrder[next] > severityOrder[result] ? next : result;
    }, fallback);
}
