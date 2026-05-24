import type { FC } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import {
  Activity,
  Barcode,
  Boxes,
  CheckCircle2,
  CircleDot,
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
  ScanLine,
  Tag,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { DemoStepBadge } from '@/components/shared';
import { cn } from '@/lib/utils';
import { AgentStreamPanel } from './components/AgentStreamPanel';
import { DetectionBox } from './components/DetectionBox';
import { PipelineChipRow, type PipelineChipDef } from './components/PipelineChipRow';
import type { DetectionBox as DetectionBoxData, ScriptedItem } from './detection-script';
import type { PipelineState, StreamLine } from './useDetectionPlayer';

const taskNo = 'RC-001';
const locationCode = 'A-03-05';
const materialName = '矿泉水';
const skuCode = 'WATER-550ML';
const lotNo = 'B20260310A';
const systemQty = '3 箱';
const visualQty = '3 箱';
const diffQty = '0 箱';
const cameraImageUrl = '/images/inspect-water-line-overhead.png';

const pipelineChips: PipelineChipDef[] = [
  { key: 'shelfLocate', name: '库位定位', icon: <ScanLine className="h-3.5 w-3.5" /> },
  { key: 'visualCount', name: '视觉点数', icon: <Boxes className="h-3.5 w-3.5" /> },
  { key: 'labelOcr', name: '标签 OCR', icon: <Tag className="h-3.5 w-3.5" /> },
  { key: 'barcodeBind', name: '条码匹配', icon: <Barcode className="h-3.5 w-3.5" /> },
  { key: 'stockCompare', name: '账实比对', icon: <Database className="h-3.5 w-3.5" /> },
  { key: 'issueClassify', name: '问题分类', icon: <FileText className="h-3.5 w-3.5" /> },
  { key: 'finalDecision', name: '综合判定', icon: <Layers className="h-3.5 w-3.5" /> },
];

const detectionBoxes: DetectionBoxData[] = [
  {
    id: 'shelf-location',
    x: 7.8,
    y: 31.5,
    w: 22.2,
    h: 38.0,
    label: '水箱 #1 20 瓶',
    confidence: 98.8,
    type: 'pass',
    ocr: [{ label: 'BATCH', value: '20240524' }],
    appearAtStep: 1,
  },
  {
    id: 'carton-row-top',
    x: 39.6,
    y: 32.0,
    w: 21.8,
    h: 37.0,
    label: '水箱 #2 20 瓶',
    confidence: 97.9,
    type: 'pass',
    appearAtStep: 1,
  },
  {
    id: 'carton-row-middle',
    x: 72.0,
    y: 31.5,
    w: 21.8,
    h: 38.0,
    label: '水箱 #3 20 瓶',
    confidence: 97.2,
    type: 'pass',
    appearAtStep: 1,
  },
  {
    id: 'carton-row-bottom',
    x: 10.2,
    y: 60.5,
    w: 18.6,
    h: 10.5,
    label: '箱标 #1',
    confidence: 96.7,
    type: 'pass',
    appearAtStep: 1,
  },
  {
    id: 'empty-slot',
    x: 42.0,
    y: 60.3,
    w: 17.8,
    h: 10.6,
    label: '箱标 #2',
    confidence: 94.6,
    type: 'pass',
    ocr: [{ label: '数量', value: '20×500ml' }],
    appearAtStep: 2,
  },
  {
    id: 'label-cluster',
    x: 74.2,
    y: 60.2,
    w: 17.8,
    h: 10.6,
    label: '箱标 #3',
    confidence: 97.5,
    type: 'pass',
    ocr: [
      { label: 'SKU', value: skuCode },
      { label: 'LOT', value: lotNo },
    ],
    appearAtStep: 3,
  },
];

const recountAgentSteps = [
  {
    text: `固定相机已接收矿泉水抽检画面，识别对象为 3 箱 20 瓶装矿泉水。`,
    chips: [
      { label: '任务', value: taskNo },
      { label: '库位', value: locationCode },
    ],
  },
  {
    text: `识别输送线上的 ${materialName} 纸箱，现场可见数量为 ${visualQty}，每箱 20 瓶。`,
    chips: [
      { label: '现场', value: visualQty },
      { label: '系统', value: systemQty },
    ],
  },
  {
    text: `标签 OCR 读取到 ${skuCode}、${lotNo}、LOC ${locationCode}，10 张箱标可见。`,
    chips: [
      { label: 'SKU', value: skuCode },
      { label: 'LOT', value: lotNo },
    ],
  },
  {
    text: `数量复核完成：系统记录 ${systemQty}，视觉点数 ${visualQty}，差异 ${diffQty}。`,
    chips: [
      { label: '差异', value: diffQty },
      { label: '类型', value: '一致' },
    ],
  },
  {
    text: '综合判定：矿泉水数量和箱标读取均正常，Station 仅作为固定相机抽检展示，不进入在库盘点主流程。',
    chips: [
      { label: '结论', value: '通过' },
      { label: '建议', value: '归档' },
    ],
  },
] as const;

const recountScriptedItem: ScriptedItem = {
  orderNo: taskNo,
  materialName,
  qty: `${visualQty} / ${systemQty}`,
  category: '标准件',
  thumbUrl: cameraImageUrl,
  cameraImageUrl,
  outcome: 'pass',
  stepLines: [
    recountAgentSteps[0].text,
    recountAgentSteps[1].text,
    recountAgentSteps[2].text,
    recountAgentSteps[3].text,
    recountAgentSteps[4].text,
  ],
  stepChips: [
    [...recountAgentSteps[0].chips],
    [...recountAgentSteps[1].chips],
    [...recountAgentSteps[2].chips],
    [...recountAgentSteps[3].chips],
    [...recountAgentSteps[4].chips],
  ],
  boxes: detectionBoxes,
  summary: {
    title: '抽检通过',
    confidence: '97.6%',
    latency: '1.3s',
    model: 'Recount-v2',
    lines: [
      { label: '库位', value: locationCode },
      { label: '物料', value: materialName },
      { label: '系统库存', value: systemQty },
      { label: '视觉点数', value: visualQty },
      { label: '差异', value: diffQty },
      { label: '问题类型', value: '无' },
      { label: '说明', value: '固定相机抽检' },
    ],
  },
  agentSuggestion: '矿泉水箱数、瓶数和箱标字段均正常。此页保留为 Station 固定相机抽检展示，不作为在库循环盘点的默认步骤。',
};

const queueItems = [
  {
    orderNo: taskNo,
    material: materialName,
    qty: '3 箱 · 60 瓶',
    category: '抽检展示',
    imageUrl: cameraImageUrl,
  },
  {
    orderNo: 'RC-002',
    material: '前轮轴承',
    qty: '20 / 20 件',
    category: '动碰盘点',
    imageUrl: '/images/inspect-bearing-pass.jpg',
  },
];

const sampleRows = [
  { no: '01', barcode: locationCode, label: '库位码', status: '通过' },
  { no: '02', barcode: skuCode, label: '货物码', status: '通过' },
  { no: '03', barcode: lotNo, label: '批次', status: '通过' },
  { no: '04', barcode: visualQty, label: '视觉点数', status: '通过' },
  { no: '05', barcode: diffQty, label: '数量差异', status: '通过' },
];

function useRecountDetection(started: boolean) {
  const [typedChars, setTypedChars] = useState(0);
  const [visibleLineCount, setVisibleLineCount] = useState(0);
  const [revealedBoxIds, setRevealedBoxIds] = useState<string[]>([]);
  const fullLength = useMemo(
    () => recountAgentSteps.reduce((sum, line) => sum + line.text.length, 0),
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
      for (const line of recountAgentSteps) {
        if (charIndex > used) count += 1;
        used += line.text.length;
      }
      setVisibleLineCount(Math.min(recountAgentSteps.length, count));
      if (charIndex >= fullLength) {
        window.clearInterval(textTimer);
      }
    }, 18);

    const timers = [
      window.setTimeout(() => setRevealedBoxIds(['shelf-location', 'carton-row-top', 'carton-row-middle', 'carton-row-bottom']), 500),
      window.setTimeout(
        () => setRevealedBoxIds(['shelf-location', 'carton-row-top', 'carton-row-middle', 'carton-row-bottom', 'empty-slot']),
        1350,
      ),
      window.setTimeout(() => setRevealedBoxIds(detectionBoxes.map((box) => box.id)), 2200),
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
    return recountAgentSteps
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
    if (completed) return pipelineChips.map(() => 'ready');
    const activeCount = Math.min(pipelineChips.length, Math.max(1, visibleLineCount + 1));
    return pipelineChips.map((_, index) => {
      if (index < activeCount - 1) return 'ready';
      if (index === activeCount - 1) return 'loading';
      return 'idle';
    });
  }, [completed, started, visibleLineCount]);

  return { agentStreamLines, revealedBoxIds, pipelineStates, completed };
}

const CameraPreview: FC<{
  started: boolean;
  revealedBoxIds: string[];
}> = ({ started, revealedBoxIds }) => (
  <div className="relative flex min-h-0 flex-1 overflow-hidden rounded-lg border border-border bg-[#0F172A]">
    <div className="relative h-full w-full overflow-hidden bg-gradient-to-br from-[#1E293B] to-[#0F172A]">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative aspect-[16/9] h-full max-h-full w-full max-w-full overflow-visible">
          <img
            src={cameraImageUrl}
            alt="矿泉水固定相机抽检画面"
            className="h-full w-full object-fill opacity-95"
          />
          {!started && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="relative h-[46%] w-[48%] translate-x-[22%]">
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
        <span className="font-data text-[10px] text-white/90">CAM-02</span>
      </div>
      <div className="absolute right-2 top-2 flex flex-col items-end gap-0.5">
        <span className="rounded bg-black/60 px-1.5 py-0.5 font-data text-[9px] text-white/90 backdrop-blur-sm">1920×1080</span>
        <span className="rounded bg-black/60 px-1.5 py-0.5 font-data text-[9px] text-white/90 backdrop-blur-sm">30fps</span>
      </div>
      <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between bg-gradient-to-t from-black/70 to-transparent px-2 py-1.5">
        <span className="text-[11px] font-medium text-white">主相机 · 矿泉水抽检</span>
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
      <img src={item.imageUrl} alt={item.material} className="h-full w-full object-cover" />
      <span
        className={cn(
          'absolute left-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded px-1 text-[9px] font-bold',
          active ? 'bg-info text-white' : done ? 'bg-success text-white' : 'bg-white/85 text-text-secondary',
        )}
      >
        {done ? '✓' : active ? '当前' : '待检'}
      </span>
    </div>
    <div className="min-w-0 flex-1">
      <p className="font-data text-[9px] text-text-muted">{item.orderNo}</p>
      <p className="truncate text-[11px] font-medium text-text-primary">{item.material}</p>
      <div className="mt-0.5 flex items-center justify-between">
        <span className="text-[10px] text-text-muted">{item.qty}</span>
        <span className="rounded bg-info/10 px-1 py-0.5 text-[9px] text-info">{item.category}</span>
      </div>
    </div>
  </div>
);

const RecountAgentPanel: FC<{
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
            { label: '盘点任务', value: '6' },
            { label: '一致', value: '4' },
            { label: '待处理', value: '2' },
          ].map((item) => (
            <div key={item.label} className="rounded bg-[#F1F5F9] px-2 py-1.5 text-center">
              <p className="text-[10px] text-text-muted">{item.label}</p>
              <p className="mt-0.5 font-data text-sm font-semibold text-text-primary">{item.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-2 flex-1 space-y-1.5 overflow-y-auto">
          {[
            `PDA 已上传 ${taskNo} 的库位码、货物码和现场照片。`,
            `Station 当前展示 ${materialName} 固定相机抽检，系统记录 ${systemQty}。`,
            '点击开始检测后，Station 会复核箱数、瓶数和箱标 OCR。',
          ].map((content, index) => (
            <div key={content} className="rounded border-l-2 border-l-info bg-[#F1F5F9] p-2.5">
              <span className="text-[10px] text-text-muted">10:{12 + index}</span>
              <p className="mt-0.5 text-[11px] leading-relaxed text-text-secondary">{content}</p>
            </div>
          ))}
        </div>

        <div className="mt-2 rounded-lg bg-[#F1F5F9] px-2.5 py-1.5">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-3 w-3 text-success" />
            <span className="text-[10px] text-text-muted">任务接收：正常</span>
            <span className="ml-auto font-data text-[10px] text-text-muted">10:14:36</span>
          </div>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <CheckCircle2 className="h-10 w-10 text-success" />
        <h4 className="mt-3 text-sm font-semibold text-text-primary">抽检记录已归档</h4>
        <p className="mt-1 text-[11px] leading-relaxed text-text-muted">
          矿泉水箱数、瓶数和箱标字段均正常。
        </p>
      </div>
    );
  }

  return (
    <AgentStreamPanel
      phase={completed ? 'reviewing' : 'detecting'}
      currentItem={recountScriptedItem}
      streamLines={streamLines}
      pushedBadges={null}
      workOrderMessage={null}
      totalCount={1}
      cursor={0}
      onApprovePass={onSubmit}
      onAssignL2Review={() => undefined}
      onHoldL2Review={() => undefined}
      onConfirmL1Block={() => undefined}
      onCreateWorkOrder={() => undefined}
      passActionStep={1}
      passActionLabel="完成抽检记录"
      passActionHint="确认后，系统会归档固定相机截图、箱数、瓶数和箱标 OCR 字段。"
      passSuggestion="矿泉水箱数、瓶数和箱标字段均正常。此页保留为 Station 固定相机抽检展示，不作为在库循环盘点的默认步骤。"
    />
  );
};

export const StationRecount: FC = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const hashSearchParams = useMemo(() => {
    if (typeof window === 'undefined') return new URLSearchParams();
    const [, search = ''] = window.location.hash.split('?');
    return new URLSearchParams(search);
  }, [location.key]);
  const isRecountGuide = (searchParams.get('scenario') ?? hashSearchParams.get('scenario')) === 'recount';
  const [started, setStarted] = useState(!isRecountGuide);
  const [submitted, setSubmitted] = useState(false);
  const { agentStreamLines, revealedBoxIds, pipelineStates, completed } = useRecountDetection(started);

  const handleMainButton = () => {
    if (!started) {
      setStarted(true);
      return;
    }
    setSubmitted(true);
  };

  const mainLabel = !started ? '开始矿泉水抽检' : submitted ? '抽检已完成' : completed ? '完成抽检记录' : '检测中…';
  const mainStep = 1;
  const mainDisabled = submitted || (started && !completed);

  return (
    <div className="flex h-full">
      <aside className="flex h-full w-[300px] flex-col border-r border-border bg-primary p-3">
        <div className="mb-2 rounded-lg border-2 border-info bg-info/10 p-2.5">
          <div className="inline-flex rounded-full bg-info px-2 py-0.5 text-[10px] font-bold text-white">
            Station 固定相机抽检
          </div>
          <p className="mt-2 text-xs font-semibold text-text-primary">矿泉水箱标与瓶数检测</p>
          <p className="mt-1 text-[10px] leading-relaxed text-text-secondary">
            此页为 Station 单独抽检展示，不是循环盘点主流程的必经步骤。
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-info/20">
            <Monitor className="h-5 w-5 text-info" />
          </div>
          <div className="min-w-0">
            <h2 className="truncate text-sm font-semibold text-text-primary">智见 · 仓储质检 AI 系统</h2>
            <p className="text-[10px] text-text-muted">v3.2.1 · Station-02</p>
          </div>
        </div>

        <div className="my-2.5 h-px bg-border" />

        <div>
          <h3 className="text-xs font-semibold text-text-primary">今日数据</h3>
          <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1.5">
            {[
              { label: '抽检', value: started ? '18' : '17', tone: 'text-text-primary' },
              { label: '通过', value: submitted ? '15' : '14', tone: 'text-success' },
              { label: '待检', value: submitted ? '1' : '2', tone: 'text-warning' },
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
            {[
              { label: '任务号', value: taskNo },
              { label: '库位', value: locationCode },
              { label: '物料', value: materialName },
              { label: '系统记录', value: systemQty },
              { label: '视觉点数', value: started ? visualQty : '待检测' },
              { label: '结果', value: completed ? '一致' : '待判定' },
            ].map((row) => (
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
              { label: '相机', value: 'CAM-02 货架视角' },
              { label: '模式', value: '矿泉水抽检' },
              { label: '规则', value: '视觉点数 + OCR' },
              { label: '处理', value: '自动归档' },
            ].map((item) => (
              <div key={item.label} className="rounded bg-white px-3 py-2">
                <p className="text-[10px] text-text-muted">{item.label}</p>
                <p className="mt-0.5 text-xs font-semibold text-text-primary">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-auto rounded-lg border border-warning/25 bg-warning/10 p-3">
          <p className="text-xs font-semibold text-text-primary">{submitted ? '抽检已完成' : started ? '抽检进行中' : '等待开始检测'}</p>
          <p className="mt-1 text-[11px] leading-relaxed text-text-secondary">
            {submitted
              ? '矿泉水抽检记录已归档。'
              : started
                ? '正在读取箱数、瓶数和箱标字段。'
                : '点击中间顶部的开始检测按钮。'}
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
              ? 'border-success/40 bg-success/10'
              : started
                ? 'border-info bg-info/10'
                : 'border-info/40 bg-gradient-to-r from-info/15 to-info/5',
          )}
        >
          <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg', submitted ? 'bg-success/20' : 'bg-info/20')}>
            {started && !completed ? (
              <Loader2 className="h-5 w-5 animate-spin text-info" />
            ) : submitted ? (
              <PackageCheck className="h-5 w-5 text-success" />
            ) : (
              <PackageSearch className="h-5 w-5 text-info" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className={cn('rounded px-1.5 py-0.5 text-[10px] font-bold text-white', submitted ? 'bg-success' : started ? 'bg-info animate-pulse' : 'bg-info')}>
                {submitted ? '已完成' : started ? '检测中' : '待检'}
              </span>
              <span className="text-xs font-semibold text-text-primary">{materialName}</span>
              <span className="font-data text-[11px] text-text-muted">{taskNo}</span>
              <span className="text-[11px] text-text-muted">{locationCode}</span>
              <span className="rounded bg-warning/15 px-1.5 py-0.5 text-[10px] text-warning">重点库位</span>
            </div>
            <div className="mt-1 flex items-center gap-1.5">
              <span className="rounded bg-success/15 px-1.5 py-0.5 text-[10px] text-success">设备 4/4 在线</span>
              <span className="text-[10px] text-text-muted">主相机 · OCR · 视觉点数 · 自动归档</span>
            </div>
          </div>

          <div className="hidden items-center gap-1.5 text-text-muted xl:flex">
            <Clock className="h-3.5 w-3.5" />
            <span className="text-[11px]">待检队列运行中</span>
          </div>

          <button
            type="button"
            disabled={mainDisabled}
            onClick={handleMainButton}
            className={cn(
              'flex shrink-0 items-center gap-1.5 rounded-md px-3 py-2 text-xs font-medium text-white transition-colors',
              mainDisabled ? 'cursor-not-allowed bg-info/60' : submitted ? 'bg-info hover:bg-info/90' : 'bg-success hover:bg-success/90',
            )}
          >
            {mainDisabled ? <Loader2 className="h-4 w-4 animate-spin" /> : <DemoStepBadge step={mainStep} />}
            {!started ? <PlayCircle className="h-4 w-4" /> : <PackageCheck className="h-4 w-4" />}
            {mainLabel}
          </button>
        </motion.div>

        <CameraPreview started={started} revealedBoxIds={revealedBoxIds} />

        <div className="shrink-0 rounded-lg border border-border bg-primary px-3 py-2">
          <div className="flex items-center gap-2">
            <Cpu className="h-3.5 w-3.5 text-info" />
            <h3 className="text-[11px] font-semibold text-text-primary">AI 检测流水线</h3>
            <span className={cn('rounded px-1.5 py-0.5 text-[10px]', completed ? 'bg-warning/15 text-warning' : started ? 'bg-info/15 text-info' : 'bg-text-muted/15 text-text-muted')}>
              {completed ? '检测通过' : started ? '推理中' : '全部就绪'}
            </span>
            <span className="ml-auto font-data text-[10px] text-text-muted">推理延迟 ~ 1.3s/件</span>
          </div>
          <div className="mt-1.5">
            <PipelineChipRow chips={pipelineChips} states={pipelineStates} />
          </div>
        </div>

        <div className="shrink-0 rounded-lg border border-border bg-primary px-3 py-2">
          <div className="flex items-center gap-2">
            <Boxes className="h-3.5 w-3.5 text-text-secondary" />
            <h3 className="text-[11px] font-semibold text-text-primary">待检任务队列</h3>
            <span className="rounded bg-[#F1F5F9] px-1.5 py-0.5 text-[10px] text-text-muted">
              剩余 {submitted ? 1 : 2} 件
            </span>
            <button
              onClick={() => {
                setStarted(!isRecountGuide);
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
              <QueueItem key={item.orderNo} item={item} active={index === 0 && !submitted} done={index === 0 && submitted} />
            ))}
          </div>
        </div>

        {started && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="shrink-0 rounded-lg bg-primary p-3"
          >
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-info" />
                <span className="text-xs font-semibold text-text-primary">抽中字段检测</span>
              </div>
              <span className="rounded bg-success/10 px-2 py-0.5 text-[11px] font-semibold text-success">5 / 5 通过</span>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {sampleRows.map((row) => (
                <div
                  key={row.no}
                  className={cn(
                    'rounded-md border p-2',
                    'border-success/30 bg-success/10',
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-data text-xs font-bold text-text-primary">{row.no}</span>
                    <span className="rounded bg-success/15 px-1.5 py-0.5 text-[10px] font-semibold text-success">
                      {row.status}
                    </span>
                  </div>
                  <p className="mt-1 truncate font-data text-[10px] text-text-muted">{row.barcode}</p>
                  <p className="mt-1 text-[10px] text-text-secondary">{row.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </main>

      <aside className="flex h-full w-[340px] flex-col border-l border-border bg-primary p-2.5">
        <AnimatePresence mode="wait">
          <motion.div
            key={started ? 'stream' : 'summary'}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex h-full min-h-0 flex-col"
          >
            <RecountAgentPanel
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

export default StationRecount;
