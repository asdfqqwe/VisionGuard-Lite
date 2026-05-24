import type { FC } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Activity,
  AlertTriangle,
  Barcode,
  Bot,
  Boxes,
  Check,
  CheckCircle2,
  CircleDot,
  ClipboardCheck,
  Clock,
  Cpu,
  Database,
  FileText,
  Layers,
  Loader2,
  Monitor,
  PackageCheck,
  PackageSearch,
  PlayCircle,
  RotateCcw,
  Scale,
  ScanLine,
  ShieldAlert,
  Tag,
  Truck,
} from 'lucide-react';
import { DemoStepBadge } from '@/components/shared';
import { cn } from '@/lib/utils';
import { DetectionBox } from './components/DetectionBox';
import { PipelineChipRow, type PipelineChipDef } from './components/PipelineChipRow';
import type { DetectionBox as DetectionBoxData, OcrChip } from './detection-script';
import type { PipelineState, StreamLine } from './useDetectionPlayer';

const orderNo = 'SO-031';
const shipmentNo = 'OB-2024-00892';
const customerName = '华南电商';
const routeName = '广州干线';
const packageNo = 'PKG-SO031-01';
const cameraImageUrl = '/images/inspect-wiper-outbound.jpg';

const pipelineChips: PipelineChipDef[] = [
  { key: 'packageLocate', name: '箱体定位', icon: <Boxes className="h-3.5 w-3.5" /> },
  { key: 'sealCheck', name: '封箱检查', icon: <PackageCheck className="h-3.5 w-3.5" /> },
  { key: 'labelRead', name: '面单读取', icon: <Tag className="h-3.5 w-3.5" /> },
  { key: 'barcodeRead', name: '箱码读取', icon: <Barcode className="h-3.5 w-3.5" /> },
  { key: 'weightCheck', name: '称重待接入', icon: <Scale className="h-3.5 w-3.5" /> },
  { key: 'orderCompare', name: '单据比对', icon: <Database className="h-3.5 w-3.5" /> },
  { key: 'finalDecision', name: '发货判定', icon: <Layers className="h-3.5 w-3.5" /> },
];

const detectionBoxes: DetectionBoxData[] = [
  {
    id: 'top-seal',
    x: 16.0,
    y: 37.4,
    w: 72.0,
    h: 5.6,
    label: '封箱胶带',
    confidence: 96.8,
    type: 'pass',
    ocr: [{ label: '状态', value: '连续' }],
    appearAtStep: 1,
  },
  {
    id: 'edge-compression',
    x: 18.0,
    y: 10.8,
    w: 8.2,
    h: 7.8,
    label: '左上压痕',
    confidence: 86.5,
    type: 'warning',
    ocr: [{ label: '破损', value: '未穿透' }],
    appearAtStep: 2,
  },
  {
    id: 'right-bottom-compression',
    x: 83.0,
    y: 61.0,
    w: 8.0,
    h: 9.0,
    label: '右下压痕',
    confidence: 82.8,
    type: 'warning',
    ocr: [{ label: '状态', value: '轻微' }],
    appearAtStep: 2,
  },
];

const outboundAgentSteps = [
  {
    text: `固定相机已接收 ${shipmentNo} 的复核画面，当前画面中可见 1 个封箱纸箱，未看到发货面单。`,
    chips: [
      { label: '出库单', value: orderNo },
      { label: '包裹', value: packageNo },
    ],
  },
  {
    text: '箱体定位完成：纸箱位于检测台中心，顶部封箱胶带连续，未发现开箱或明显破洞。',
    chips: [
      { label: '箱体', value: '1 箱' },
      { label: '封箱', value: '通过' },
    ],
  },
  {
    text: '外观检查：纸箱左上边角轻微受压，右下角也有压痕，但未看到穿透破损或开箱。',
    chips: [
      { label: '边角', value: '轻压' },
      { label: '破损', value: '未穿透' },
    ],
  },
  {
    text: '当前画面只看到纸箱顶部、封箱胶带和地面环境，没有看到发货面单、箱码或可读条码。',
    chips: [
      { label: '面单', value: '未入镜' },
      { label: '箱码', value: '未读取' },
    ],
  },
  {
    text: '发货判定：暂缓放行。建议复核员确认面单是否贴在侧面，旋转箱体或补贴面单后复扫。',
    chips: [
      { label: '结论', value: '暂缓发货' },
      { label: '处理', value: '人工确认' },
    ],
  },
] as const;

const taskRows = [
  { label: '出库单', value: orderNo },
  { label: '发货批次', value: shipmentNo },
  { label: '客户', value: customerName },
  { label: '线路', value: routeName },
  { label: '包裹号', value: packageNo },
  { label: '要求发货', value: '14:00 前' },
];

const checklistRows = [
  { label: '封箱状态', value: '胶带连续', status: '通过', icon: PackageCheck },
  { label: '包装外观', value: '左上和右下边角有压痕，未穿透', status: '注意', icon: Boxes },
  { label: '发货面单', value: '顶部画面未见，可能在侧面', status: '待确认', icon: FileText },
  { label: '箱码读取', value: '顶部画面未见，需旋转复扫', status: '待确认', icon: Barcode },
  { label: '称重结果', value: '待复核台接入', status: '待确认', icon: Scale },
];

const queueItems = [
  {
    orderNo,
    packageNo,
    customer: customerName,
    status: '当前复核',
    imageUrl: cameraImageUrl,
  },
  {
    orderNo: 'SO-032',
    packageNo: 'PKG-SO032-01',
    customer: '华东门店',
    status: '待复核',
    imageUrl: '/images/case-damaged-package.jpg',
  },
];

function useOutboundDetection(started: boolean) {
  const [typedChars, setTypedChars] = useState(0);
  const [visibleLineCount, setVisibleLineCount] = useState(0);
  const [revealedBoxIds, setRevealedBoxIds] = useState<string[]>([]);
  const fullLength = useMemo(
    () => outboundAgentSteps.reduce((sum, line) => sum + line.text.length, 0),
    [],
  );

  useEffect(() => {
    setTypedChars(0);
    setVisibleLineCount(0);
    setRevealedBoxIds([]);
    if (!started) return undefined;

    let charIndex = 0;
    const textTimer = window.setInterval(() => {
      charIndex += 1;
      setTypedChars(charIndex);
      let used = 0;
      let count = 0;
      for (const line of outboundAgentSteps) {
        if (charIndex > used) count += 1;
        used += line.text.length;
      }
      setVisibleLineCount(Math.min(outboundAgentSteps.length, count));
      if (charIndex >= fullLength) {
        window.clearInterval(textTimer);
      }
    }, 18);

    const timers = [
      window.setTimeout(() => setRevealedBoxIds(['top-seal']), 480),
      window.setTimeout(
        () => setRevealedBoxIds(['top-seal', 'edge-compression', 'right-bottom-compression']),
        1400,
      ),
      window.setTimeout(() => setRevealedBoxIds(detectionBoxes.map((box) => box.id)), 2300),
    ];

    return () => {
      window.clearInterval(textTimer);
      timers.forEach(window.clearTimeout);
    };
  }, [fullLength, started]);

  const completed = started && typedChars >= fullLength;

  const agentStreamLines: StreamLine[] = useMemo(() => {
    if (!started) return [];
    let remaining = typedChars;
    return outboundAgentSteps
      .map((line, step) => {
        const completedChars = Math.max(0, Math.min(line.text.length, remaining));
        remaining -= line.text.length;
        return {
          step,
          text: line.text,
          completedChars,
          done: completedChars >= line.text.length,
          chips: [...line.chips],
        };
      })
      .filter((line) => line.completedChars > 0 || line.step < visibleLineCount);
  }, [started, typedChars, visibleLineCount]);

  const pipelineStates: PipelineState[] = useMemo(() => {
    if (!started) return pipelineChips.map(() => 'idle');
    if (completed) return pipelineChips.map((_, index) => (index >= 2 ? 'warning' : 'ready'));
    const activeCount = Math.min(pipelineChips.length, Math.max(1, visibleLineCount + 1));
    return pipelineChips.map((_, index) => {
      if (index < activeCount - 1) return index >= 2 ? 'warning' : 'ready';
      if (index === activeCount - 1) return 'loading';
      return 'idle';
    });
  }, [completed, started, visibleLineCount]);

  return { agentStreamLines, revealedBoxIds, pipelineStates, completed };
}

const StreamChip: FC<{ chip: OcrChip; warn?: boolean }> = ({ chip, warn }) => (
  <span
    className={cn(
      'inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] whitespace-nowrap',
      warn ? 'bg-warning/10 text-warning' : 'bg-[#F1F5F9] text-text-secondary',
    )}
  >
    <span className="text-text-muted">{chip.label}</span>
    <span className="font-mono font-semibold">{chip.value}</span>
  </span>
);

const StreamRow: FC<{ line: StreamLine }> = ({ line }) => {
  const visibleText = line.text.slice(0, line.completedChars);
  const warn = line.step >= 3 && line.done;

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15 }}
      className="flex gap-2"
    >
      <div className="flex w-4 shrink-0 flex-col items-center pt-0.5">
        <span
          className={cn(
            'flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold',
            line.done ? 'bg-success/20 text-success' : 'bg-info/20 text-info',
          )}
        >
          {line.done ? <Check className="h-2.5 w-2.5" /> : <span className="h-1.5 w-1.5 rounded-full bg-current" />}
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <span className="text-[10px] font-semibold text-text-muted">
          {['接收图像', '包装检查', '外观检查', '面单箱码', '发货判定'][line.step]}
        </span>
        <p className={cn('mt-0.5 break-words text-[11px] leading-relaxed', warn ? 'text-warning' : 'text-text-primary')}>
          {visibleText}
          {!line.done && <span className="ml-0.5 inline-block w-[6px] animate-pulse text-info">▍</span>}
        </p>
        {line.done && line.chips.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1">
            {line.chips.map((chip, index) => (
              <StreamChip key={`${line.step}-${index}`} chip={chip} warn={warn} />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

const CameraPreview: FC<{
  started: boolean;
  revealedBoxIds: string[];
}> = ({ started, revealedBoxIds }) => (
  <div className="relative flex min-h-0 flex-1 overflow-hidden rounded-lg border border-border bg-[#0F172A]">
    <div className="relative h-full w-full overflow-hidden bg-gradient-to-br from-[#1E293B] to-[#0F172A]">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative aspect-[1/1] h-full max-h-full w-full max-w-full overflow-hidden">
          <img
            src={cameraImageUrl}
            alt="出库发货复核固定相机画面"
            className="h-full w-full object-cover opacity-95"
          />
          {!started && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="relative h-[58%] w-[68%] -translate-y-[4%]">
                <span className="absolute left-0 top-0 h-5 w-5 border-l-2 border-t-2 border-info/90" />
                <span className="absolute right-0 top-0 h-5 w-5 border-r-2 border-t-2 border-info/90" />
                <span className="absolute bottom-0 left-0 h-5 w-5 border-b-2 border-l-2 border-info/90" />
                <span className="absolute bottom-0 right-0 h-5 w-5 border-b-2 border-r-2 border-info/90" />
                <motion.div
                  className="absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-info to-transparent"
                  initial={{ top: '0%' }}
                  animate={{ top: ['0%', '100%', '0%'] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                />
              </div>
            </div>
          )}
          {detectionBoxes.map((box) => (
            <DetectionBox key={box.id} box={box} revealed={revealedBoxIds.includes(box.id)} />
          ))}
        </div>
      </div>

      <div className="absolute left-2 top-2 flex items-center gap-1.5 rounded bg-black/60 px-2 py-1 backdrop-blur-sm">
        <CircleDot className="h-3 w-3 animate-pulse text-danger" />
        <span className="text-[10px] font-medium text-white">REC</span>
        <span className="text-[10px] text-white/80">·</span>
        <span className="font-data text-[10px] text-white/90">CAM-05</span>
      </div>
      <div className="absolute right-2 top-2 flex flex-col items-end gap-0.5">
        <span className="rounded bg-black/60 px-1.5 py-0.5 font-data text-[9px] text-white/90 backdrop-blur-sm">1920×1080</span>
        <span className="rounded bg-black/60 px-1.5 py-0.5 font-data text-[9px] text-white/90 backdrop-blur-sm">30fps</span>
      </div>
      <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between bg-gradient-to-t from-black/70 to-transparent px-2 py-1.5">
        <span className="text-[11px] font-medium text-white">主相机 · 出库复核台</span>
        <span className="font-data text-[10px] text-white/70">{started ? '检测中' : '就绪'}</span>
      </div>
    </div>
  </div>
);

const QueueItem: FC<{
  item: (typeof queueItems)[number];
  active?: boolean;
  done?: boolean;
}> = ({ item, active, done }) => (
  <div
    className={cn(
      'flex shrink-0 items-center gap-2 rounded-lg border p-1.5 transition-all',
      active ? 'border-info bg-info/10 shadow-md ring-2 ring-info/30' : 'border-border bg-primary',
    )}
    style={{ width: 190 }}
  >
    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded bg-[#E2E8F0]">
      <img src={item.imageUrl} alt={item.packageNo} className="h-full w-full object-cover" />
      <span
        className={cn(
          'absolute left-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded px-1 text-[9px] font-bold',
          active ? 'bg-info text-white' : done ? 'bg-warning text-white' : 'bg-white/85 text-text-secondary',
        )}
      >
        {done ? '已记' : active ? '当前' : '待检'}
      </span>
    </div>
    <div className="min-w-0 flex-1">
      <p className="font-data text-[9px] text-text-muted">{item.orderNo}</p>
      <p className="truncate text-[11px] font-medium text-text-primary">{item.packageNo}</p>
      <div className="mt-0.5 flex items-center justify-between">
        <span className="text-[10px] text-text-muted">{item.customer}</span>
        <span className="rounded bg-info/10 px-1 py-0.5 text-[9px] text-info">{item.status}</span>
      </div>
    </div>
  </div>
);

const OutboundAgentPanel: FC<{
  started: boolean;
  submitted: boolean;
  streamLines: StreamLine[];
  completed: boolean;
  onSubmit: () => void;
}> = ({ started, submitted, streamLines, completed, onSubmit }) => {
  if (!started) {
    return (
      <div className="flex h-full flex-col">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-info" />
          <h3 className="text-sm font-semibold text-text-primary">Agent 今日摘要</h3>
        </div>

        <div className="mt-2 grid grid-cols-3 gap-2">
          {[
            { label: '待复核', value: '12' },
            { label: '可发货', value: '8' },
            { label: '待人工', value: '3' },
          ].map((item) => (
            <div key={item.label} className="rounded bg-[#F1F5F9] px-2 py-1.5 text-center">
              <p className="text-[10px] text-text-muted">{item.label}</p>
              <p className="mt-0.5 font-data text-sm font-semibold text-text-primary">{item.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-2 flex-1 space-y-1.5 overflow-y-auto">
          {[
            `${orderNo} 已完成拣货和包装，当前演示采用固定复核台检查。`,
            '这个场景只根据相机画面判断包装、封箱、面单和箱码是否满足发货要求。',
            '点击开始复核后，Agent 会一次读取当前画面并给出处置建议。',
          ].map((content, index) => (
            <div key={content} className="rounded border-l-2 border-l-info bg-[#F1F5F9] p-2.5">
              <span className="text-[10px] text-text-muted">13:{28 + index}</span>
              <p className="mt-0.5 text-[11px] leading-relaxed text-text-secondary">{content}</p>
            </div>
          ))}
        </div>

        <div className="mt-2 rounded-lg bg-[#F1F5F9] px-2.5 py-1.5">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-3 w-3 text-success" />
            <span className="text-[10px] text-text-muted">复核台在线：正常</span>
            <span className="ml-auto font-data text-[10px] text-text-muted">13:31:09</span>
          </div>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <ShieldAlert className="h-10 w-10 text-warning" />
        <h4 className="mt-3 text-sm font-semibold text-text-primary">复核记录已提交</h4>
        <p className="mt-1 text-[11px] leading-relaxed text-text-muted">
          系统已暂缓 {packageNo} 发货，等待复核员确认面单和箱码后再放行。
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-1.5 overflow-y-auto pr-0.5">
      <div className="flex items-center gap-2 rounded-lg border border-info/20 bg-info/8 px-2.5 py-1.5">
        <Bot className="h-4 w-4 shrink-0 text-info" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[11px] font-semibold text-text-primary">
            正在分析：{packageNo}
            <span className="ml-1 text-text-muted">· {customerName}</span>
          </p>
          <p className="font-mono text-[10px] text-text-muted">{shipmentNo} · 发货复核中</p>
        </div>
        <span className={cn('rounded px-1.5 py-0.5 text-[10px]', completed ? 'bg-warning/15 text-warning' : 'bg-info/15 text-info')}>
          {completed ? '待人工' : '推理中'}
        </span>
      </div>

      <div className={cn('rounded-lg bg-[#F8FAFC] p-2', completed ? 'space-y-1' : 'space-y-1.5')}>
        <AnimatePresence initial={false}>
          {(completed ? streamLines.slice(-3) : streamLines).map((line) => (
            <StreamRow key={line.step} line={line} />
          ))}
        </AnimatePresence>
        {streamLines.length === 0 && (
          <p className="py-2 text-center text-[11px] text-text-muted">
            <span className="inline-block animate-pulse">●</span> 等待 AI 推理流……
          </p>
        )}
      </div>

      {completed && (
        <>
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="overflow-hidden rounded-lg border border-warning"
          >
            <div className="h-1 bg-warning" />
            <div className="p-2">
              <div className="flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4 text-warning" />
                <h4 className="text-[12px] font-semibold text-warning">暂缓发货 · 面单箱码未确认</h4>
              </div>
              <div className="mt-1.5 grid grid-cols-3 gap-1">
                {[
                  { label: '置信度', value: '96.8%' },
                  { label: '耗时', value: '1.2s' },
                  { label: '模型', value: 'Outbound-v1' },
                ].map((item) => (
                  <div key={item.label} className="rounded bg-[#F1F5F9] px-1.5 py-0.5 text-center">
                    <p className="text-[9px] text-text-muted">{item.label}</p>
                    <p className="font-mono text-[10px] font-semibold text-text-primary">{item.value}</p>
                  </div>
                ))}
              </div>
              <div className="mt-1 space-y-0.5">
                {[
                  { label: '箱体', value: '1 箱，封箱通过' },
                  { label: '外观', value: '边角压痕，未穿透' },
                  { label: '缺口', value: '顶部无面单 / 箱码' },
                ].map((line) => (
                  <div key={line.label} className="flex justify-between gap-2 text-[11px]">
                    <span className="text-text-muted">{line.label}</span>
                    <span className="truncate font-medium text-text-primary">{line.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="rounded-lg border border-warning/35 bg-warning/8 p-2"
          >
            <div className="flex items-center gap-1.5">
              <Bot className="h-3.5 w-3.5 text-warning" />
              <span className="text-[11px] font-semibold text-warning">Agent 处理建议</span>
            </div>
            <p className="mt-1 text-[11px] leading-snug text-text-secondary">
              当前画面只证明封箱和顶部外观可接受，无法证明包裹与 {shipmentNo} 的面单、箱码一致。建议暂缓发货，由复核员查看侧面标签，或把箱体旋转到标签面后重新扫描。
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="sticky bottom-0 z-10 rounded-lg border border-warning/30 bg-warning/8 p-2 shadow-[0_-6px_16px_rgba(15,23,42,0.08)] backdrop-blur"
          >
            <p className="text-[11px] leading-snug text-text-secondary">
              提交后，系统记录当前截图、包装结论和待人工确认项；包裹不进入发货装车队列。
            </p>
            <button
              onClick={onSubmit}
              className="mt-1.5 flex w-full items-center justify-center gap-1.5 rounded bg-warning px-2.5 py-1.5 text-[11px] font-medium text-white transition-colors hover:bg-warning/90"
            >
              <DemoStepBadge step={2} />
              <ClipboardCheck className="h-3.5 w-3.5" />
              提交复核记录
            </button>
          </motion.div>
        </>
      )}
    </div>
  );
};

export const StationOutbound: FC = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const hashSearchParams = useMemo(() => {
    if (typeof window === 'undefined') return new URLSearchParams();
    const [, search = ''] = window.location.hash.split('?');
    return new URLSearchParams(search);
  }, [location.key]);
  const isOutboundGuide = (searchParams.get('scenario') ?? hashSearchParams.get('scenario')) === 'outbound-review';
  const [started, setStarted] = useState(!isOutboundGuide);
  const [submitted, setSubmitted] = useState(false);
  const { agentStreamLines, revealedBoxIds, pipelineStates, completed } = useOutboundDetection(started);

  useEffect(() => {
    if (!isOutboundGuide) return;
    setStarted(false);
    setSubmitted(false);
  }, [isOutboundGuide, location.key]);

  const handleMainButton = () => {
    if (!started) {
      setStarted(true);
      return;
    }
    if (completed) {
      setSubmitted(true);
    }
  };

  const mainLabel = !started ? '开始发货复核' : submitted ? '复核已提交' : completed ? '提交复核记录' : '检测中…';
  const mainDisabled = submitted || (started && !completed);

  return (
    <div className="flex h-full">
      <aside className="flex h-full w-[300px] flex-col border-r border-border bg-primary p-3">
        <div className="mb-2 rounded-lg border-2 border-info bg-info/10 p-2.5">
          <div className="inline-flex rounded-full bg-info px-2 py-0.5 text-[10px] font-bold text-white">
            Station 出库复核台
          </div>
          <p className="mt-2 text-xs font-semibold text-text-primary">发货前包装与面单检查</p>
          <p className="mt-1 text-[10px] leading-relaxed text-text-secondary">
            当前演示采用固定复核台模式：检查箱体、封箱、面单、箱码和称重状态，再决定是否发货。
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-info/20">
            <Monitor className="h-5 w-5 text-info" />
          </div>
          <div className="min-w-0">
            <h2 className="truncate text-sm font-semibold text-text-primary">智见 · 仓储质检 AI 系统</h2>
            <p className="text-[10px] text-text-muted">v3.2.1 · Station-05</p>
          </div>
        </div>

        <div className="my-2.5 h-px bg-border" />

        <div>
          <h3 className="text-xs font-semibold text-text-primary">今日数据</h3>
          <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1.5">
            {[
              { label: '复核', value: started ? '46' : '45', tone: 'text-text-primary' },
              { label: '放行', value: '38', tone: 'text-success' },
              { label: '暂缓', value: submitted ? '4' : '3', tone: 'text-warning' },
              { label: '在线', value: '4/4', tone: 'text-success' },
            ].map((item) => (
              <div key={item.label} className="flex justify-between">
                <span className="text-[11px] text-text-muted">{item.label}</span>
                <span className={cn('font-data text-xs font-semibold', item.tone)}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-3 rounded-lg bg-[#F1F5F9] p-3">
          <div className="flex items-center gap-2">
            <PackageSearch className="h-4 w-4 text-info" />
            <h3 className="text-xs font-semibold text-text-primary">当前任务</h3>
          </div>
          <div className="mt-2 space-y-1.5">
            {taskRows.map((row) => (
              <div key={row.label} className="flex justify-between gap-2 text-[11px]">
                <span className="shrink-0 text-text-muted">{row.label}</span>
                <span className="truncate font-data font-semibold text-text-primary">{row.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-3 rounded-lg bg-[#F1F5F9] p-3">
          <div className="flex items-center gap-2">
            <Cpu className="h-4 w-4 text-info" />
            <h3 className="text-xs font-semibold text-text-primary">检测配置</h3>
          </div>
          <div className="mt-2 space-y-2">
            {[
              { label: '相机', value: 'CAM-05 顶视' },
              { label: '模式', value: '固定复核台' },
              { label: '规则', value: '包装 + 面单 + 箱码' },
              { label: '结果', value: submitted ? '已暂缓' : completed ? '待提交' : '待判定' },
            ].map((item) => (
              <div key={item.label} className="rounded bg-white px-3 py-2">
                <p className="text-[10px] text-text-muted">{item.label}</p>
                <p className="mt-0.5 text-xs font-semibold text-text-primary">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-auto rounded-lg border border-warning/25 bg-warning/10 p-3">
          <p className="text-xs font-semibold text-text-primary">{submitted ? '复核记录已提交' : started ? '发货复核进行中' : '等待开始复核'}</p>
          <p className="mt-1 text-[11px] leading-relaxed text-text-secondary">
            {submitted
              ? '包裹已暂缓发货，等待复核员确认面单和箱码。'
              : started
                ? '正在读取封箱、包装、面单和箱码状态。'
                : '点击中间顶部的开始复核按钮。'}
          </p>
        </div>
      </aside>

      <main className="flex flex-1 flex-col gap-2 overflow-hidden bg-[#F1F5F9] p-3">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            'flex items-center gap-3 rounded-lg border px-3 py-2 transition-colors',
            submitted
              ? 'border-warning/40 bg-warning/10'
              : started
                ? 'border-info bg-info/10'
                : 'border-info/40 bg-gradient-to-r from-info/15 to-info/5',
          )}
        >
          <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg', submitted ? 'bg-warning/20' : 'bg-info/20')}>
            {started && !completed ? (
              <Loader2 className="h-5 w-5 animate-spin text-info" />
            ) : submitted ? (
              <ClipboardCheck className="h-5 w-5 text-warning" />
            ) : (
              <Truck className="h-5 w-5 text-info" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className={cn('rounded px-1.5 py-0.5 text-[10px] font-bold text-white', submitted ? 'bg-warning' : started ? 'bg-info animate-pulse' : 'bg-info')}>
                {submitted ? '已提交' : started ? '检测中' : '待检'}
              </span>
              <span className="text-xs font-semibold text-text-primary">{packageNo}</span>
              <span className="font-data text-[11px] text-text-muted">{shipmentNo}</span>
              <span className="text-[11px] text-text-muted">{customerName}</span>
              <span className="rounded bg-warning/15 px-1.5 py-0.5 text-[10px] text-warning">发货前复核</span>
            </div>
            <div className="mt-1 flex items-center gap-1.5">
              <span className="rounded bg-success/15 px-1.5 py-0.5 text-[10px] text-success">设备 4/4 在线</span>
              <span className="text-[10px] text-text-muted">主相机 · 条码读取 · 面单 OCR · 称重接口</span>
            </div>
          </div>

          <div className="hidden items-center gap-1.5 text-text-muted xl:flex">
            <Clock className="h-3.5 w-3.5" />
            <span className="text-[11px]">复核队列运行中</span>
          </div>

          <button
            type="button"
            disabled={mainDisabled}
            onClick={handleMainButton}
            className={cn(
              'flex shrink-0 items-center gap-1.5 rounded-md px-3 py-2 text-xs font-medium text-white transition-colors',
              mainDisabled ? 'cursor-not-allowed bg-info/60' : completed ? 'bg-warning hover:bg-warning/90' : 'bg-success hover:bg-success/90',
            )}
          >
            {mainDisabled ? <Loader2 className="h-4 w-4 animate-spin" /> : <DemoStepBadge step={completed ? 2 : 1} />}
            {!started ? <PlayCircle className="h-4 w-4" /> : <ClipboardCheck className="h-4 w-4" />}
            {mainLabel}
          </button>
        </motion.div>

        <CameraPreview started={started} revealedBoxIds={revealedBoxIds} />

        <div className="shrink-0 rounded-lg border border-border bg-primary px-3 py-2">
          <div className="flex items-center gap-2">
            <Cpu className="h-3.5 w-3.5 text-info" />
            <h3 className="text-[11px] font-semibold text-text-primary">AI 检测流水线</h3>
            <span className={cn('rounded px-1.5 py-0.5 text-[10px]', completed ? 'bg-warning/15 text-warning' : started ? 'bg-info/15 text-info' : 'bg-text-muted/15 text-text-muted')}>
              {completed ? '待人工确认' : started ? '推理中' : '全部就绪'}
            </span>
            <span className="ml-auto font-data text-[10px] text-text-muted">推理延迟 ~ 1.2s/件</span>
          </div>
          <div className="mt-1.5">
            <PipelineChipRow chips={pipelineChips} states={pipelineStates} />
          </div>
        </div>

        <div className="shrink-0 rounded-lg border border-border bg-primary px-3 py-2">
          <div className="flex items-center gap-2">
            <Boxes className="h-3.5 w-3.5 text-text-secondary" />
            <h3 className="text-[11px] font-semibold text-text-primary">待复核包裹</h3>
            <span className="rounded bg-[#F1F5F9] px-1.5 py-0.5 text-[10px] text-text-muted">
              剩余 {submitted ? 1 : 2} 件
            </span>
            <button
              onClick={() => {
                setStarted(!isOutboundGuide);
                setSubmitted(false);
              }}
              className="ml-auto flex items-center gap-1 text-[11px] text-text-muted transition-colors hover:text-text-primary"
            >
              <RotateCcw className="h-3 w-3" />
              重置任务
            </button>
          </div>
          <div className="mt-1.5 flex gap-2 overflow-x-auto">
            {queueItems.map((item, index) => (
              <QueueItem key={item.packageNo} item={item} active={index === 0 && !submitted} done={index === 0 && submitted} />
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="shrink-0 rounded-lg bg-primary p-3"
        >
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ScanLine className="h-4 w-4 text-info" />
                <span className="text-xs font-semibold text-text-primary">复核项目</span>
              </div>
              <span className={cn('rounded px-2 py-0.5 text-[11px] font-semibold', started ? 'bg-warning/10 text-warning' : 'bg-text-muted/10 text-text-muted')}>
                {started ? '2 通过 / 3 待确认' : '等待开始复核'}
              </span>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {checklistRows.map((row) => {
                const Icon = row.icon;
                const passed = started && row.status === '通过';
                return (
                  <div
                    key={row.label}
                    className={cn(
                      'rounded-md border p-2',
                      !started
                        ? 'border-border bg-[#F8FAFC]'
                        : passed
                          ? 'border-success/30 bg-success/10'
                          : 'border-warning/30 bg-warning/10',
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <Icon className={cn('h-3.5 w-3.5', !started ? 'text-text-muted' : passed ? 'text-success' : 'text-warning')} />
                      <span
                        className={cn(
                          'rounded px-1.5 py-0.5 text-[10px] font-semibold',
                          !started
                            ? 'bg-text-muted/10 text-text-muted'
                            : passed
                              ? 'bg-success/15 text-success'
                              : 'bg-warning/15 text-warning',
                        )}
                      >
                        {started ? row.status : '待检'}
                      </span>
                    </div>
                    <p className="mt-1 text-[10px] font-semibold text-text-primary">{row.label}</p>
                    <p className="mt-1 line-clamp-2 text-[10px] leading-tight text-text-secondary">
                      {started ? row.value : '--'}
                    </p>
                  </div>
                );
              })}
            </div>
        </motion.div>
      </main>

      <aside className="flex h-full w-[340px] flex-col border-l border-border bg-primary p-2.5">
        <AnimatePresence mode="wait">
          <motion.div
            key={started ? (submitted ? 'submitted' : 'stream') : 'summary'}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex h-full min-h-0 flex-col"
          >
            <OutboundAgentPanel
              started={started}
              submitted={submitted}
              streamLines={agentStreamLines}
              completed={completed}
              onSubmit={() => setSubmitted(true)}
            />
          </motion.div>
        </AnimatePresence>
      </aside>
    </div>
  );
};

export default StationOutbound;
