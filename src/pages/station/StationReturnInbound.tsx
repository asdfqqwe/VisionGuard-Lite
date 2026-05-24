import type { FC } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
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
  Shuffle,
  Smartphone,
  Tag,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { DemoStepBadge } from '@/components/shared';
import { DetectionBox } from './components/DetectionBox';
import { PipelineChipRow, type PipelineChipDef } from './components/PipelineChipRow';
import { AgentStreamPanel } from './components/AgentStreamPanel';
import type { DetectionBox as DetectionBoxData, ScriptedItem } from './detection-script';
import type { PipelineState, StreamLine } from './useDetectionPlayer';
import { returnInboundOrders } from '@/data/mockData';
import { cn } from '@/lib/utils';

const returnNo = 'TL2025060300017';
const stationReturnSlipNo = 'RTN-20240521-0085';
const workOrderNo = 'WO-20240521-0178';
const oldPartNo = 'A12345-01';
const newPartNo = 'A12345-01R';
const materialName = 'BRACKET, SUPPORT';
const qty = '25 PCS';
const targetLocation = 'A-01-02';

const pipelineChips: PipelineChipDef[] = [
  { key: 'visualCount', name: '视觉点数', icon: <Boxes className="h-3.5 w-3.5" /> },
  { key: 'labelCompliance', name: '标签合规', icon: <Tag className="h-3.5 w-3.5" /> },
  { key: 'returnSlipOcr', name: '退料单 OCR', icon: <FileText className="h-3.5 w-3.5" /> },
  { key: 'barcodeBind', name: '条码重绑', icon: <Barcode className="h-3.5 w-3.5" /> },
  { key: 'partFeature', name: '零件外观', icon: <ScanLine className="h-3.5 w-3.5" /> },
  { key: 'storageRule', name: '入库规则', icon: <Database className="h-3.5 w-3.5" /> },
  { key: 'finalDecision', name: '综合判定', icon: <Layers className="h-3.5 w-3.5" /> },
];

const detectionBoxes: DetectionBoxData[] = [
  {
    id: 'yellow-zone',
    x: 23.2,
    y: 15.2,
    w: 53.8,
    h: 39.8,
    label: '黄色检测区域',
    confidence: 99.0,
    type: 'pass',
    appearAtStep: 1,
  },
  {
    id: 'return-bin',
    x: 29.0,
    y: 7.4,
    w: 41.2,
    h: 39.0,
    label: '灰色周转箱',
    confidence: 98.7,
    type: 'pass',
    appearAtStep: 1,
  },
  {
    id: 'metal-parts',
    x: 31.0,
    y: 8.4,
    w: 37.8,
    h: 24.2,
    label: '支架件 25 PCS',
    confidence: 97.6,
    type: 'pass',
    ocr: [{ label: '数量', value: qty }],
    appearAtStep: 1,
  },
  {
    id: 'box-label',
    x: 43.2,
    y: 35.0,
    w: 13.6,
    h: 11.6,
    label: '箱体标签',
    confidence: 99.2,
    type: 'pass',
    ocr: [
      { label: '料号', value: oldPartNo },
      { label: '数量', value: '25' },
    ],
    appearAtStep: 2,
  },
  {
    id: 'old-labels',
    x: 5.3,
    y: 38.4,
    w: 15.8,
    h: 23.0,
    label: '旧标签堆',
    confidence: 98.4,
    type: 'pass',
    ocr: [{ label: '旧码', value: oldPartNo }],
    appearAtStep: 2,
  },
  {
    id: 'new-labels',
    x: 79.5,
    y: 39.0,
    w: 16.0,
    h: 20.8,
    label: '新标签堆',
    confidence: 98.8,
    type: 'pass',
    ocr: [{ label: '新码', value: newPartNo }],
    appearAtStep: 2,
  },
  {
    id: 'return-slip',
    x: 36.4,
    y: 57.3,
    w: 28.8,
    h: 26.2,
    label: '退料单',
    confidence: 98.6,
    type: 'pass',
    ocr: [
      { label: '单号', value: stationReturnSlipNo },
      { label: '工单', value: workOrderNo },
    ],
    appearAtStep: 3,
  },
];

const returnAgentSteps = [
  {
    text: '固定相机已接收退料复检画面，检测区域内包含灰色周转箱、旧标签、新标签和纸质退料单。',
    chips: [
      { label: '帧', value: '#RTN-052321' },
      { label: '对象', value: '4 类' },
    ],
  },
  {
    text: `识别箱内金属支架件，数量估算为 ${qty}，与退料单 Returned Qty 一致。`,
    chips: [
      { label: '识别数量', value: qty },
      { label: '单据数量', value: qty },
    ],
  },
  {
    text: `箱体标签读取到 ${oldPartNo}、${materialName}、QTY: 25；旧标签堆为 ${oldPartNo}，新标签堆为 ${newPartNo}。`,
    chips: [
      { label: '旧码', value: oldPartNo },
      { label: '新码', value: newPartNo },
    ],
  },
  {
    text: `纸质退料单读取到 ${stationReturnSlipNo}、${workOrderNo}、${oldPartNo}、${materialName}、${qty}、Quality Issue、2024-05-21。`,
    chips: [
      { label: '退料单', value: stationReturnSlipNo },
      { label: '工单', value: workOrderNo },
    ],
  },
  {
    text: `标签、数量、退料单字段和重绑关系均通过，可登记回 ${targetLocation} 可用库存。`,
    chips: [
      { label: '结论', value: '通过' },
      { label: '库位', value: targetLocation },
    ],
  },
] as const;

const returnScriptedItem: ScriptedItem = {
  orderNo: stationReturnSlipNo,
  materialName,
  qty,
  category: '关键件',
  thumbUrl: '/images/return-station-reinspection-overhead.png',
  cameraImageUrl: '/images/return-station-reinspection-overhead.png',
  outcome: 'pass',
  stepLines: [
    returnAgentSteps[0].text,
    returnAgentSteps[1].text,
    returnAgentSteps[2].text,
    returnAgentSteps[3].text,
    returnAgentSteps[4].text,
  ],
  stepChips: [
    [...returnAgentSteps[0].chips],
    [...returnAgentSteps[1].chips],
    [...returnAgentSteps[2].chips],
    [...returnAgentSteps[3].chips],
    [...returnAgentSteps[4].chips],
  ],
  boxes: detectionBoxes,
  summary: {
    title: '检测通过',
    confidence: '98.8%',
    latency: '1.4s',
    model: 'Return-v2',
    lines: [
      { label: '包装分类', value: '周转箱 / 退料件' },
      { label: '标签读取', value: `${oldPartNo} → ${newPartNo}` },
      { label: '箱体标签', value: `${oldPartNo} / QTY: 25` },
      { label: '退料单', value: stationReturnSlipNo },
      { label: '工单', value: workOrderNo },
      { label: '箱内计数', value: qty },
      { label: '入库建议', value: targetLocation },
    ],
  },
  agentSuggestion: `旧标签 ${oldPartNo} 已识别并可作废，新标签 ${newPartNo} 与退料单字段一致。现场人员可在 PDA 登记 ${targetLocation} 可用库存。`,
};

const queueItems = [
  {
    orderNo: stationReturnSlipNo,
    material: materialName,
    qty,
    category: '关键件',
    imageUrl: '/images/return-station-reinspection-overhead.png',
  },
  {
    orderNo: 'RTN-20240521-0086',
    material: 'PLATE, MOUNTING',
    qty: '12 PCS',
    category: '标准件',
    imageUrl: '/images/return-pda-scan-first-person.png',
  },
];

const sampleRows = [
  { no: '01', barcode: oldPartNo, label: '箱体标签', status: '通过' },
  { no: '02', barcode: oldPartNo, label: '旧标签堆', status: '通过' },
  { no: '03', barcode: newPartNo, label: '新标签堆', status: '通过' },
  { no: '04', barcode: stationReturnSlipNo, label: '退料单', status: '通过' },
  { no: '05', barcode: workOrderNo, label: '工单号', status: '通过' },
];

function useReturnDetection(started: boolean) {
  const [typedChars, setTypedChars] = useState(0);
  const [visibleLineCount, setVisibleLineCount] = useState(0);
  const [revealedBoxIds, setRevealedBoxIds] = useState<string[]>([]);
  const fullLength = useMemo(
    () => returnAgentSteps.reduce((sum, line) => sum + line.text.length, 0),
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
      for (const line of returnAgentSteps) {
        if (charIndex > used) count += 1;
        used += line.text.length;
      }
      setVisibleLineCount(Math.min(returnAgentSteps.length, count));
      if (charIndex >= fullLength) {
        window.clearInterval(textTimer);
      }
    }, 18);

    const timers = [
      window.setTimeout(() => setRevealedBoxIds(['yellow-zone', 'return-bin', 'metal-parts']), 500),
      window.setTimeout(
        () => setRevealedBoxIds(['yellow-zone', 'return-bin', 'metal-parts', 'box-label', 'old-labels', 'new-labels']),
        1350,
      ),
      window.setTimeout(
        () => setRevealedBoxIds(detectionBoxes.map((box) => box.id)),
        2200,
      ),
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
    return returnAgentSteps
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
      .filter((line) => line.completedChars > 0);
  }, [started, typedChars]);
  const pipelineStates: PipelineState[] = useMemo(() => {
    if (!started) return pipelineChips.map(() => 'idle');
    return pipelineChips.map((_, index) => {
      if (completed) return 'ready';
      if (index < visibleLineCount + 1) return 'loading';
      return 'idle';
    });
  }, [completed, started, visibleLineCount]);

  return { agentStreamLines, visibleLineCount, revealedBoxIds, pipelineStates, completed };
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
            src="/images/return-station-reinspection-overhead.png"
            alt="生产退料入库固定相机复检画面"
            className="h-full w-full object-fill opacity-95"
          />
          {!started && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="relative h-[52%] w-[58%]">
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
        <span className="font-data text-[10px] text-white/90">CAM-03</span>
      </div>
      <div className="absolute right-2 top-2 flex flex-col items-end gap-0.5">
        <span className="rounded bg-black/60 px-1.5 py-0.5 font-data text-[9px] text-white/90 backdrop-blur-sm">
          1920×1080
        </span>
        <span className="rounded bg-black/60 px-1.5 py-0.5 font-data text-[9px] text-white/90 backdrop-blur-sm">
          30fps
        </span>
      </div>
      <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between bg-gradient-to-t from-black/70 to-transparent px-2 py-1.5">
        <span className="text-[11px] font-medium text-white">主相机 · 退料复检顶视</span>
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

const ReturnAgentPanel: FC<{
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
            { label: '复检任务', value: '8' },
            { label: '通过', value: '6' },
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
            'PDA 已上传退料单 TL2025060300017 的现场扫码记录。',
            `待复检物料 ${materialName}，数量 ${qty}，目标库位 ${targetLocation}。`,
            '点击开始检测后，Station 会复核退料单、箱体标签、新旧标签和数量。',
          ].map((content, index) => (
            <div key={content} className="rounded border-l-2 border-l-info bg-[#F1F5F9] p-2.5">
              <span className="text-[10px] text-text-muted">09:{25 + index}</span>
              <p className="mt-0.5 text-[11px] leading-relaxed text-text-secondary">{content}</p>
            </div>
          ))}
        </div>

        <div className="mt-2 rounded-lg bg-[#F1F5F9] px-2.5 py-1.5">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-3 w-3 text-success" />
            <span className="text-[10px] text-text-muted">后台接收：正常</span>
            <span className="ml-auto font-data text-[10px] text-text-muted">09:27:36</span>
          </div>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <CheckCircle2 className="h-10 w-10 text-success" />
        <h4 className="mt-3 text-sm font-semibold text-text-primary">复检结论已提交</h4>
        <p className="mt-1 text-[11px] leading-relaxed text-text-muted">
          结果已同步给 PDA，现场人员可登记 {targetLocation} 可用库存。
        </p>
      </div>
    );
  }

  return (
    <AgentStreamPanel
      phase={completed ? 'reviewing' : 'detecting'}
      currentItem={returnScriptedItem}
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
      passActionStep={6}
      passActionLabel="提交复检结论"
      passActionHint="提交后，系统会归档复检截图、退料单 OCR、箱体标签和新旧码重绑结果。"
      passSuggestion={`旧标签 ${oldPartNo} 已识别并可作废，新标签 ${newPartNo} 与退料单字段一致。现场人员可在 PDA 登记 ${targetLocation} 可用库存。`}
    />
  );
};

export const StationReturnInbound: FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const hashSearchParams = useMemo(() => {
    if (typeof window === 'undefined') return new URLSearchParams();
    const [, search = ''] = window.location.hash.split('?');
    return new URLSearchParams(search);
  }, [location.key]);
  const stateReturnNo = (location.state as { returnNo?: string } | null)?.returnNo;
  const order = useMemo(
    () => returnInboundOrders.find((item) => item.returnNo === stateReturnNo) ?? returnInboundOrders[0],
    [stateReturnNo],
  );
  const isProductionReturnGuide =
    (searchParams.get('scenario') ?? hashSearchParams.get('scenario')) === 'production-return';
  const [started, setStarted] = useState(!isProductionReturnGuide);
  const [submitted, setSubmitted] = useState(false);
  const { agentStreamLines, revealedBoxIds, pipelineStates, completed } = useReturnDetection(started);

  const handleMainButton = () => {
    if (!started) {
      setStarted(true);
      return;
    }
    if (!submitted) {
      setSubmitted(true);
      return;
    }
    navigate('/pda/return/detail?scenario=production-return&phase=storage', {
      state: { returnNo: order.returnNo },
    });
  };

  const mainLabel = !started ? '开始退料复检' : submitted ? '回到 PDA 入库登记' : completed ? '提交复检结论' : '检测中…';
  const mainStep = !started ? 5 : submitted ? 7 : 6;
  const mainDisabled = started && !completed;

  return (
    <div className="flex h-full">
      <aside className="flex h-full w-[300px] flex-col border-r border-border bg-primary p-3">
        <div className="mb-2 rounded-lg border-2 border-info bg-info/10 p-2.5">
          <div className="inline-flex rounded-full bg-info px-2 py-0.5 text-[10px] font-bold text-white">
            Station 已接收退料任务
          </div>
          <p className="mt-2 text-xs font-semibold text-text-primary">执行正式复检</p>
          <p className="mt-1 text-[10px] leading-relaxed text-text-secondary">
            PDA 已完成现场扫码；本站复核数量、退料单 OCR、新旧标签和条码重绑关系。
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-info/20">
            <Monitor className="h-5 w-5 text-info" />
          </div>
          <div className="min-w-0">
            <h2 className="truncate text-sm font-semibold text-text-primary">智见 · 仓储质检 AI 系统</h2>
            <p className="text-[10px] text-text-muted">v3.2.1 · Station-03</p>
          </div>
        </div>

        <div className="my-2.5 h-px bg-border" />

        <div>
          <h3 className="text-xs font-semibold text-text-primary">今日数据</h3>
          <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1.5">
            {[
              { label: '复检', value: started ? '25' : '24', tone: 'text-text-primary' },
              { label: '通过', value: submitted ? '22' : '21', tone: 'text-success' },
              { label: '待处理', value: submitted ? '2' : '3', tone: 'text-warning' },
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
              { label: '退料单', value: returnNo },
              { label: '纸面单号', value: stationReturnSlipNo },
              { label: '工单', value: workOrderNo },
              { label: '物料', value: materialName },
              { label: '数量', value: qty },
              { label: '目标库位', value: targetLocation },
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
              { label: '相机', value: 'CAM-03 顶视' },
              { label: '模式', value: '退料复检' },
              { label: '规则', value: '新旧码重绑 + OCR' },
              { label: '库区', value: '可用库存区' },
            ].map((item) => (
              <div key={item.label} className="rounded bg-white px-3 py-2">
                <p className="text-[10px] text-text-muted">{item.label}</p>
                <p className="mt-0.5 text-xs font-semibold text-text-primary">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-auto rounded-lg border border-success/25 bg-success/10 p-3">
          <p className="text-xs font-semibold text-text-primary">{submitted ? '复检结论已提交' : started ? '复检进行中' : '等待开始检测'}</p>
          <p className="mt-1 text-[11px] leading-relaxed text-text-secondary">
            {submitted
              ? '结果已同步给 PDA，现场人员继续做入库登记。'
              : started
                ? '正在读取画面中的退料单、标签和金属件数量。'
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
                {submitted ? '已提交' : started ? '检测中' : '待检'}
              </span>
              <span className="text-xs font-semibold text-text-primary">{materialName}</span>
              <span className="font-data text-[11px] text-text-muted">{stationReturnSlipNo}</span>
              <span className="text-[11px] text-text-muted">{qty}</span>
              <span className="rounded bg-info/15 px-1.5 py-0.5 text-[10px] text-info">关键件</span>
            </div>
            <div className="mt-1 flex items-center gap-1.5">
              <span className="rounded bg-success/15 px-1.5 py-0.5 text-[10px] text-success">设备 4/4 在线</span>
              <span className="text-[10px] text-text-muted">主相机 · 条码读取 · OCR · 规则引擎</span>
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
            {!started ? <PlayCircle className="h-4 w-4" /> : submitted ? <Smartphone className="h-4 w-4" /> : <PackageCheck className="h-4 w-4" />}
            {mainLabel}
          </button>
        </motion.div>

        <CameraPreview started={started} revealedBoxIds={revealedBoxIds} />

        <div className="shrink-0 rounded-lg border border-border bg-primary px-3 py-2">
          <div className="flex items-center gap-2">
            <Cpu className="h-3.5 w-3.5 text-info" />
            <h3 className="text-[11px] font-semibold text-text-primary">AI 检测流水线</h3>
            <span className={cn('rounded px-1.5 py-0.5 text-[10px]', completed ? 'bg-success/15 text-success' : started ? 'bg-info/15 text-info' : 'bg-text-muted/15 text-text-muted')}>
              {completed ? '全部通过' : started ? '推理中' : '全部就绪'}
            </span>
            <span className="ml-auto font-data text-[10px] text-text-muted">推理延迟 ~ 1.4s/件</span>
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
                setStarted(!isProductionReturnGuide);
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
                <Shuffle className="h-4 w-4 text-info" />
                <span className="text-xs font-semibold text-text-primary">抽中字段检测</span>
              </div>
              <span className="rounded bg-info/10 px-2 py-0.5 text-[11px] font-semibold text-info">5 / 5 通过</span>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {sampleRows.map((row) => (
                <div key={row.no} className="rounded-md border border-success/30 bg-success/10 p-2">
                  <div className="flex items-center justify-between">
                    <span className="font-data text-xs font-bold text-text-primary">{row.no}</span>
                    <span className="rounded bg-success/15 px-1.5 py-0.5 text-[10px] font-semibold text-success">{row.status}</span>
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
            <ReturnAgentPanel
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

export default StationReturnInbound;
