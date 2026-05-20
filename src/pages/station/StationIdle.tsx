import type { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Monitor,
  TrendingUp,
  Activity,
  Wifi,
  WifiOff,
  PackageSearch,
  PackageCheck,
  AlertOctagon,
  AlertTriangle,
  ScanLine,
  ArrowRight,
  PlayCircle,
  Cpu,
  Eye,
  Tag,
  FileText,
  Layers,
  PackageX,
  Boxes,
  Clock,
  CircleDot,
  Loader2,
  RotateCcw,
  ShieldAlert,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useData } from '@/context/DataContext';
import { cn } from '@/lib/utils';
import { FullScreenAlert } from '@/components/shared';
import {
  detectionScript,
  type DetectionBox as DetectionBoxData,
} from './detection-script';
import { useDetectionPlayer } from './useDetectionPlayer';
import {
  PipelineChipRow,
  type PipelineChipDef,
} from './components/PipelineChipRow';
import { DetectionBox } from './components/DetectionBox';
import { AgentStreamPanel } from './components/AgentStreamPanel';

// ─── Camera live preview with optional detection overlay ───
interface CameraPreviewProps {
  cameraId: string;
  label: string;
  resolution: string;
  fps: number;
  imageUrl: string;
  online?: boolean;
  /** 检测中 / 待确认时叠加的检测框 */
  overlayBoxes?: DetectionBoxData[];
  revealedBoxIds?: string[];
  /** L1 拦截：相机面板红色脉冲光晕 */
  alertPulse?: boolean;
  /** detecting 时强化扫描线显示 */
  scanning?: boolean;
}

const CameraPreview: FC<CameraPreviewProps> = ({
  cameraId,
  label,
  resolution,
  fps,
  imageUrl,
  online = true,
  overlayBoxes = [],
  revealedBoxIds = [],
  alertPulse = false,
  scanning = false,
}) => (
  <div
    className={cn(
      'relative flex min-h-0 flex-1 overflow-hidden rounded-lg border bg-[#0F172A] transition-shadow',
      alertPulse
        ? 'border-l1-badge shadow-[0_0_0_2px_rgba(220,38,38,0.28)]'
        : 'border-border',
    )}
  >
    {/* Image */}
    <div className="relative h-full w-full overflow-hidden bg-gradient-to-br from-[#1E293B] to-[#0F172A]">
      <img
        src={imageUrl}
        alt={label}
        className="h-full w-full object-contain opacity-90"
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).style.opacity = '0';
        }}
      />

      {/* Center crosshair / framing reticle (only show when not actively detecting boxes) */}
      {revealedBoxIds.length === 0 && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="relative h-[55%] w-[55%]">
            <span className="absolute left-0 top-0 h-4 w-4 border-l-2 border-t-2 border-info/80" />
            <span className="absolute right-0 top-0 h-4 w-4 border-r-2 border-t-2 border-info/80" />
            <span className="absolute bottom-0 left-0 h-4 w-4 border-b-2 border-l-2 border-info/80" />
            <span className="absolute bottom-0 right-0 h-4 w-4 border-b-2 border-r-2 border-info/80" />
            <motion.div
              className={cn(
                'absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-info to-transparent',
                scanning && 'shadow-[0_0_8px_2px_rgba(59,130,246,0.5)]',
              )}
              initial={{ top: '0%' }}
              animate={{ top: ['0%', '100%', '0%'] }}
              transition={{
                duration: scanning ? 1.5 : 3,
                repeat: Infinity,
                ease: 'linear',
              }}
            />
          </div>
        </div>
      )}

      {/* Detection box overlay */}
      {overlayBoxes.map((box) => (
        <DetectionBox
          key={box.id}
          box={box}
          revealed={revealedBoxIds.includes(box.id)}
        />
      ))}

      {/* Top-left tag */}
      <div className="absolute left-2 top-2 flex items-center gap-1.5 rounded bg-black/60 px-2 py-1 backdrop-blur-sm">
        <CircleDot
          className={cn('h-3 w-3', online ? 'text-danger animate-pulse' : 'text-text-muted')}
        />
        <span className="text-[10px] font-medium text-white">REC</span>
        <span className="text-[10px] text-white/80">·</span>
        <span className="text-[10px] font-mono text-white/90">{cameraId}</span>
      </div>

      {/* Top-right specs */}
      <div className="absolute right-2 top-2 flex flex-col items-end gap-0.5">
        <span className="rounded bg-black/60 px-1.5 py-0.5 font-mono text-[9px] text-white/90 backdrop-blur-sm">
          {resolution}
        </span>
        <span className="rounded bg-black/60 px-1.5 py-0.5 font-mono text-[9px] text-white/90 backdrop-blur-sm">
          {fps}fps
        </span>
      </div>

      {/* Bottom label */}
      <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between bg-gradient-to-t from-black/70 to-transparent px-2 py-1.5">
        <span className="text-[11px] font-medium text-white">{label}</span>
        <span className="font-mono text-[10px] text-white/70">
          {scanning ? '检测中…' : '就绪'}
        </span>
      </div>
    </div>
  </div>
);

// ─── Queue item card ───
interface QueueItemProps {
  orderNo: string;
  materialName: string;
  qty: string;
  category: string;
  imageUrl: string;
  /** 队列内的相对索引：0=NEXT, 1+=#2 #3... */
  positionInQueue: number;
  /** 演示状态点缀：0=未触达 1=进行中 2=已完成（仅最末显示） */
  state?: 'pending' | 'detecting' | 'done';
  outcome?: 'pass' | 'l2' | 'l1';
}

const QueueItem: FC<QueueItemProps> = ({
  orderNo,
  materialName,
  qty,
  category,
  imageUrl,
  positionInQueue,
  state = 'pending',
  outcome,
}) => {
  const isNext = positionInQueue === 0;

  return (
    <div
      className={cn(
        'flex shrink-0 items-center gap-2 rounded-lg border p-1.5 transition-all',
        isNext
          ? state === 'detecting'
            ? 'border-info/70 bg-info/10 shadow-md ring-2 ring-info/30'
            : 'border-info bg-info/5 shadow-sm'
          : 'border-border bg-primary',
      )}
      style={{ width: 168 }}
    >
      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded bg-gradient-to-br from-[#E2E8F0] to-[#CBD5E1]">
        <img
          src={imageUrl}
          alt={materialName}
          className="h-full w-full object-cover"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.opacity = '0';
          }}
        />
        <span
          className={cn(
            'absolute left-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded px-1 font-mono text-[9px] font-bold',
            isNext ? 'bg-info text-white' : 'bg-white/85 text-text-secondary',
          )}
        >
          {state === 'done'
            ? '✓'
            : isNext
              ? state === 'detecting'
                ? '...'
                : 'NEXT'
              : `#${positionInQueue + 1}`}
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-mono text-[9px] text-text-muted">{orderNo}</p>
        <p className="truncate text-[11px] font-medium text-text-primary">{materialName}</p>
        <div className="mt-0.5 flex items-center justify-between">
          <span className="text-[10px] text-text-muted">{qty}</span>
          {outcome && state === 'done' ? (
            <span
              className={cn(
                'rounded px-1 py-0.5 text-[9px]',
                outcome === 'pass'
                  ? 'bg-success/15 text-success'
                  : outcome === 'l2'
                    ? 'bg-l2-badge/15 text-l2-badge'
                    : 'bg-l1-badge/15 text-l1-badge',
              )}
            >
              {outcome === 'pass' ? '通过' : outcome === 'l2' ? 'L2' : 'L1'}
            </span>
          ) : (
            <span
              className={cn(
                'rounded px-1 py-0.5 text-[9px]',
                category === '关键件'
                  ? 'bg-danger/10 text-danger'
                  : category === '特殊库'
                    ? 'bg-multi-modal-alert/10 text-multi-modal-alert'
                    : 'bg-info/10 text-info',
              )}
            >
              {category}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── 7 chip 流水线定义（与 PIPELINE_INDEX 一一对应） ───
const pipelineChips: PipelineChipDef[] = [
  { key: 'visualCount', name: '视觉件数', icon: <Boxes className="h-3.5 w-3.5" /> },
  { key: 'labelCompliance', name: '标签合规', icon: <Tag className="h-3.5 w-3.5" /> },
  { key: 'modelOcr', name: '型号OCR', icon: <FileText className="h-3.5 w-3.5" /> },
  { key: 'fieldOcr', name: '字段OCR', icon: <ScanLine className="h-3.5 w-3.5" /> },
  { key: 'multiModal', name: '多模态', icon: <Layers className="h-3.5 w-3.5" /> },
  { key: 'defect', name: '外观缺陷', icon: <PackageX className="h-3.5 w-3.5" /> },
  { key: 'videoViolation', name: '视频违规', icon: <Eye className="h-3.5 w-3.5" /> },
];

// ─── 静态 Agent 摘要（待机时显示） ───
interface AgentSummaryItemProps {
  time: string;
  content: string;
  type: 'info' | 'warning' | 'danger';
}

const AgentSummaryItem: FC<AgentSummaryItemProps> = ({ time, content, type }) => {
  const borderColor =
    type === 'info' ? 'border-l-info' : type === 'warning' ? 'border-l-warning' : 'border-l-danger';
  return (
    <div className={cn('rounded border-l-2 bg-[#F1F5F9] p-2.5', borderColor)}>
      <span className="text-[10px] text-text-muted">{time}</span>
      <p className="mt-0.5 text-[11px] leading-relaxed text-text-secondary">{content}</p>
    </div>
  );
};

const StationIdle: FC = () => {
  const navigate = useNavigate();
  const { dashboardData, agentEvents } = useData();
  const player = useDetectionPlayer(detectionScript);

  // 演示中态：cursor 指向下一件待检，currentItem 保留当前展示结果
  const isPlaying = player.phase === 'detecting' || player.phase === 'awaitingConfirm';
  const isAwaitingL2Action = player.phase === 'awaitingL2Action';
  const isReviewingPass = player.phase === 'reviewing';
  const isFinished = player.phase === 'finished';
  const hasDetectionResult = player.currentItem != null;

  // 静态摘要仅在尚未开始检测时显示，检测后右侧保留当前图片对应的 Agent 结论
  const showStaticSummary = !hasDetectionResult && player.phase === 'idle';

  const agentSummaries: AgentSummaryItemProps[] = [
    {
      time: '09:15',
      content:
        '批次PKG-2403检测到3件标签磨损，已自动标记L2警示。建议关注供应商华东物流。',
      type: 'warning',
    },
    {
      time: '09:42',
      content: 'L1拦截：批次PKG-2405发现严重外包装破损（2件），已通知质检主管。',
      type: 'danger',
    },
    {
      time: '10:05',
      content: '建议：今日拦截率12.5%，高于周均值8.3%，请关注。',
      type: 'info',
    },
  ];

  // 当前栈：cursor 起始的剩余待检件
  const remainingScript = detectionScript.slice(player.cursor);
  const completedItem =
    player.displayIndex != null ? detectionScript[player.displayIndex] : null;

  // 主按钮文案与颜色
  const renderMainButton = () => {
    if (player.phase === 'awaitingConfirm') {
      // 隐藏主按钮，由全屏告警内的按钮承接
      return (
        <div className="flex shrink-0 items-center gap-1.5 rounded-md bg-l1-badge/15 px-3 py-2 text-xs font-medium text-l1-badge">
          <ShieldAlert className="h-4 w-4" />
          等待人工确认拦截
        </div>
      );
    }
    if (player.phase === 'awaitingL2Action') {
      return (
        <div className="flex shrink-0 items-center gap-1.5 rounded-md bg-l2-badge/15 px-3 py-2 text-xs font-medium text-l2-badge">
          <AlertTriangle className="h-4 w-4" />
          等待质检员处理
        </div>
      );
    }
    if (player.phase === 'reviewing') {
      return (
        <button
          onClick={player.approvePass}
          className="flex shrink-0 items-center gap-1.5 rounded-md bg-success px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-success/90"
        >
          <PackageCheck className="h-4 w-4" />
          确认通过
        </button>
      );
    }
    if (player.phase === 'detecting') {
      return (
        <button
          disabled
          className="flex shrink-0 cursor-not-allowed items-center gap-1.5 rounded-md bg-info/60 px-3 py-2 text-xs font-medium text-white"
        >
          <Loader2 className="h-4 w-4 animate-spin" />
          检测中…
        </button>
      );
    }
    if (player.phase === 'finished') {
      return (
        <button
          onClick={player.resetScript}
          className="flex shrink-0 items-center gap-1.5 rounded-md bg-accent px-3 py-2 text-xs font-medium text-primary-dark transition-colors hover:bg-accent/90"
        >
          <RotateCcw className="h-4 w-4" />
          演示结束 · 重新开始
        </button>
      );
    }
    // idle
    return (
      <button
        onClick={player.start}
        className="flex shrink-0 items-center gap-1.5 rounded-md bg-info px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-info/90"
      >
        <PlayCircle className="h-4 w-4" />
        {hasDetectionResult ? '检测下一件' : '开始检测'}
      </button>
    );
  };

  // NEXT banner 物品
  const nextItem = remainingScript[0] ?? null;
  const bannerItem = isPlaying ? player.currentItem : nextItem;

  // Pending agent events
  const pendingEvents = agentEvents.filter((e) => e.status === '待人工确认');

  return (
    <div className="flex h-full">
      {/* LEFT COLUMN: Brand + Today Data */}
      <div className="flex h-full w-[300px] flex-col border-r border-border bg-primary p-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-info/20">
            <Monitor className="h-5 w-5 text-info" />
          </div>
          <div className="min-w-0">
            <h2 className="truncate text-sm font-semibold text-text-primary">
              智见 · 仓储质检AI系统
            </h2>
            <p className="text-[10px] text-text-muted">v3.2.1 · Station-03</p>
          </div>
        </div>

        <div className="my-2.5 h-px bg-border" />

        <div>
          <h3 className="text-xs font-semibold text-text-primary">今日数据</h3>
          <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1.5">
            <div className="flex justify-between">
              <span className="text-[11px] text-text-muted">检测</span>
              <motion.span
                key={player.todayStats.batches}
                initial={{ scale: 1.2, color: '#3B82F6' }}
                animate={{ scale: 1, color: '#0F172A' }}
                transition={{ duration: 0.4 }}
                className="font-mono text-xs font-semibold"
              >
                {player.todayStats.batches}
              </motion.span>
            </div>
            <div className="flex justify-between">
              <span className="text-[11px] text-text-muted">通过</span>
              <span className="font-mono text-xs font-semibold text-success">
                {player.todayStats.pass}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[11px] text-text-muted">拦截</span>
              <span className="font-mono text-xs font-semibold text-danger">
                {player.todayStats.intercept}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[11px] text-text-muted">警示</span>
              <span className="font-mono text-xs font-semibold text-warning">
                {player.todayStats.warning}
              </span>
            </div>
          </div>

          <div className="mt-2.5 rounded-lg bg-accent/15 p-2.5">
            <div className="flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5 text-accent" />
              <span className="text-[11px] text-text-muted">今日拦截价值</span>
            </div>
            <p className="mt-0.5 font-mono text-lg font-bold leading-tight text-accent">
              ¥38,600
            </p>
          </div>
        </div>

        <div className="mt-2 flex items-center gap-2 rounded-lg bg-[#F1F5F9] px-3 py-2">
          <Activity className="h-3.5 w-3.5 shrink-0 text-success" />
          <span className="text-[11px] text-text-muted">连续无异常</span>
          <span className="ml-auto font-mono text-base font-bold leading-none text-success">
            5
          </span>
          <span className="text-[10px] text-text-secondary">件</span>
        </div>

        {pendingEvents.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 rounded-lg bg-danger/15 p-2.5"
          >
            <div className="flex items-center gap-1.5">
              <AlertOctagon className="h-3.5 w-3.5 text-danger" />
              <span className="text-[11px] font-medium text-danger">
                {pendingEvents.length} 条待确认异常
              </span>
            </div>
            <div className="mt-1 space-y-0.5">
              {pendingEvents.map((e) => (
                <div
                  key={e.eventNo}
                  className="truncate text-[10px] leading-tight text-text-secondary"
                >
                  {e.eventNo} · {e.materialName} · {e.anomalyType}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        <div className="mt-auto space-y-1.5 pt-2.5">
          <h4 className="text-[11px] font-medium text-text-muted">切换模式</h4>
          <button
            onClick={() => navigate('/station/receive')}
            className="flex w-full items-center gap-2 rounded-lg bg-info/15 px-2.5 py-2 text-left transition-colors hover:bg-info/25"
          >
            <PackageSearch className="h-3.5 w-3.5 shrink-0 text-info" />
            <div className="min-w-0 flex-1">
              <span className="text-[11px] font-medium text-info">收货检测</span>
              <p className="truncate text-[10px] text-text-muted">
                入库质检 / AI检测 / 异常拦截
              </p>
            </div>
            <ArrowRight className="h-3 w-3 shrink-0 text-text-muted" />
          </button>
          <button
            onClick={() => navigate('/station/outbound')}
            className="flex w-full items-center gap-2 rounded-lg bg-success/15 px-2.5 py-2 text-left transition-colors hover:bg-success/25"
          >
            <PackageCheck className="h-3.5 w-3.5 shrink-0 text-success" />
            <div className="min-w-0 flex-1">
              <span className="text-[11px] font-medium text-success">出库复核</span>
              <p className="truncate text-[10px] text-text-muted">出库质检 / 复核打包</p>
            </div>
            <ArrowRight className="h-3 w-3 shrink-0 text-text-muted" />
          </button>
          <button
            onClick={() => navigate('/station/triage')}
            className="flex w-full items-center gap-2 rounded-lg bg-warning/15 px-2.5 py-2 text-left transition-colors hover:bg-warning/25"
          >
            <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-warning" />
            <div className="min-w-0 flex-1">
              <span className="text-[11px] font-medium text-warning">包装复核 / 异常分流</span>
              <p className="truncate text-[10px] text-text-muted">问题件处理 / 分流操作</p>
            </div>
            <ArrowRight className="h-3 w-3 shrink-0 text-text-muted" />
          </button>
        </div>
      </div>

      {/* CENTER COLUMN: NEXT banner / live camera / pipeline / queue */}
      <div className="flex flex-1 flex-col gap-2 overflow-hidden bg-[#F1F5F9] p-3">
        {/* Zone A: NEXT banner */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            'flex items-center gap-3 rounded-lg border px-3 py-2 transition-colors',
            isPlaying
              ? 'border-info bg-info/10'
              : isAwaitingL2Action
                ? 'border-l2-badge/50 bg-l2-badge/10'
                : isReviewingPass
                  ? 'border-success/50 bg-success/10'
              : isFinished
                ? 'border-success/40 bg-success/10'
                : 'border-info/40 bg-gradient-to-r from-info/15 to-info/5',
          )}
        >
          <div
            className={cn(
              'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
              isFinished ? 'bg-success/20' : 'bg-info/20',
            )}
          >
            {isPlaying ? (
              <Loader2 className="h-5 w-5 animate-spin text-info" />
            ) : isAwaitingL2Action ? (
              <AlertTriangle className="h-5 w-5 text-l2-badge" />
            ) : isFinished ? (
              <PackageCheck className="h-5 w-5 text-success" />
            ) : (
              <PackageSearch className="h-5 w-5 text-info" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            {isFinished ? (
              <>
                <p className="text-xs font-semibold text-success">
                  演示完成，4 件全部检测结束
                </p>
                <p className="mt-1 text-[10px] text-text-muted">
                  通过 {player.todayStats.pass - 20} · 警示{' '}
                  {player.todayStats.warning - 1} · 拦截 {player.todayStats.intercept - 3}
                </p>
              </>
            ) : bannerItem ? (
              <>
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      'rounded px-1.5 py-0.5 text-[10px] font-bold text-white',
                      isPlaying ? 'bg-info animate-pulse' : 'bg-info',
                    )}
                  >
                    {isPlaying ? '检测中' : isAwaitingL2Action ? 'L2' : isReviewingPass ? '通过' : 'NEXT'}
                  </span>
                  <span className="text-xs font-semibold text-text-primary">
                    {isPlaying
                      ? '正在分析'
                      : isAwaitingL2Action
                        ? '等待人工处理'
                        : isReviewingPass
                          ? '等待确认通过'
                          : '下一件待检'}
                  </span>
                  <span className="font-mono text-[11px] text-text-muted">
                    {bannerItem.orderNo}
                  </span>
                  <span className="text-xs text-text-primary">
                    · {bannerItem.materialName}
                  </span>
                  <span className="text-[11px] text-text-muted">{bannerItem.qty}</span>
                  <span className="rounded bg-info/15 px-1.5 py-0.5 text-[10px] text-info">
                    {bannerItem.category}
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-1.5">
                  <span className="rounded bg-success/15 px-1.5 py-0.5 text-[10px] text-success">
                    设备 4/4 在线
                  </span>
                  <span className="text-[10px] text-text-muted">
                    主相机 · 扫码枪 · 重力台 · 红外探头
                  </span>
                </div>
              </>
            ) : (
              <p className="text-xs font-semibold text-success">队列已清空</p>
            )}
          </div>

          {!isFinished && (
            <div className="flex items-center gap-1.5 text-text-muted">
              <Clock className="h-3.5 w-3.5" />
              <span className="font-mono text-[11px]">
                队列 {player.cursor + 1}/{detectionScript.length}
              </span>
            </div>
          )}

          {renderMainButton()}
        </motion.div>

        {/* Zone B: Live camera with detection overlay */}
        <CameraPreview
          cameraId="CAM-01"
          label={
            player.currentItem
              ? `${isPlaying ? '主相机 · 正在检测' : '主相机 · 最近结果'} ${player.currentItem.materialName}`
              : '主相机 · 顶视点数 + 标签 + OCR'
          }
          resolution="1920×1080"
          fps={30}
          imageUrl={
            player.currentItem
              ? player.currentItem.cameraImageUrl
              : '/images/station-cam/cam-01-shelf-overview.jpg'
          }
          overlayBoxes={player.currentItem?.boxes}
          revealedBoxIds={player.revealedBoxIds}
          alertPulse={player.phase === 'awaitingConfirm'}
          scanning={player.phase === 'detecting'}
        />

        {/* Zone C: AI pipeline ready bar */}
        <div className="shrink-0 rounded-lg border border-border bg-primary px-3 py-2">
          <div className="flex items-center gap-2">
            <Cpu className="h-3.5 w-3.5 text-info" />
            <h3 className="text-[11px] font-semibold text-text-primary">AI 检测流水线</h3>
            {isPlaying ? (
              <span className="rounded bg-info/15 px-1.5 py-0.5 text-[10px] text-info">
                推理中
              </span>
            ) : (
              <span className="rounded bg-success/15 px-1.5 py-0.5 text-[10px] text-success">
                全部就绪
              </span>
            )}
            <span className="ml-auto font-mono text-[10px] text-text-muted">
              推理延迟 ~ 1.2s/件
            </span>
          </div>
          <div className="mt-1.5">
            <PipelineChipRow chips={pipelineChips} states={player.pipelineStates} />
          </div>
        </div>

        {/* Zone D: Detection queue */}
        <div className="shrink-0 rounded-lg border border-border bg-primary px-3 py-2">
          <div className="flex items-center gap-2">
            <Boxes className="h-3.5 w-3.5 text-text-secondary" />
            <h3 className="text-[11px] font-semibold text-text-primary">待检任务队列</h3>
            <span className="rounded bg-[#F1F5F9] px-1.5 py-0.5 text-[10px] text-text-muted">
              剩余 {Math.max(0, detectionScript.length - player.cursor)} 件
            </span>
            {player.cursor > 0 && !isFinished && (
              <button
                onClick={player.resetScript}
                className="ml-auto flex items-center gap-1 text-[11px] text-text-muted transition-colors hover:text-text-primary"
              >
                <RotateCcw className="h-3 w-3" />
                重置剧本
              </button>
            )}
            {isFinished && (
              <button
                onClick={player.resetScript}
                className="ml-auto flex items-center gap-1 text-[11px] text-info transition-colors hover:text-info/80"
              >
                <RotateCcw className="h-3 w-3" />
                重置剧本
              </button>
            )}
          </div>
          <div className="mt-1.5 flex gap-2 overflow-x-auto">
            {isFinished && !completedItem ? (
              <div className="flex w-full items-center justify-center py-3 text-[11px] text-text-muted">
                所有任务已完成
              </div>
            ) : (
              <>
                {completedItem && !isPlaying && (
                  <QueueItem
                    key={`done-${completedItem.orderNo}`}
                    orderNo={completedItem.orderNo}
                    materialName={completedItem.materialName}
                    qty={completedItem.qty}
                    category={completedItem.category}
                    imageUrl={completedItem.thumbUrl}
                    positionInQueue={0}
                    state="done"
                    outcome={completedItem.outcome}
                  />
                )}
                {remainingScript.map((it, i) => (
                  <QueueItem
                    key={it.orderNo}
                    orderNo={it.orderNo}
                    materialName={it.materialName}
                    qty={it.qty}
                    category={it.category}
                    imageUrl={it.thumbUrl}
                    positionInQueue={completedItem && !isPlaying ? i + 1 : i}
                    state={i === 0 && player.phase === 'detecting' ? 'detecting' : 'pending'}
                  />
                ))}
                {isFinished && (
                  <div className="flex min-w-[180px] items-center justify-center py-3 text-[11px] text-text-muted">
                    所有任务已完成
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: static summary OR streaming agent */}
      <div className="flex h-full w-[320px] flex-col border-l border-border bg-primary p-3">
        <AnimatePresence mode="wait">
          {showStaticSummary ? (
            <motion.div
              key="static"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex h-full flex-col"
            >
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-info" />
                <h3 className="text-sm font-semibold text-text-primary">Agent 今日摘要</h3>
              </div>

              <div className="mt-2 grid grid-cols-3 gap-2">
                <div className="rounded bg-[#F1F5F9] px-2 py-1.5 text-center">
                  <p className="text-[10px] text-text-muted">识别事件</p>
                  <p className="mt-0.5 font-mono text-sm font-semibold text-text-primary">
                    {dashboardData.todayInterceptCount}
                  </p>
                </div>
                <div className="rounded bg-[#F1F5F9] px-2 py-1.5 text-center">
                  <p className="text-[10px] text-text-muted">异常事件</p>
                  <p className="mt-0.5 font-mono text-sm font-semibold text-danger">
                    {dashboardData.pendingExceptions}
                  </p>
                </div>
                <div className="rounded bg-[#F1F5F9] px-2 py-1.5 text-center">
                  <p className="text-[10px] text-text-muted">拦截价值</p>
                  <p className="mt-0.5 font-mono text-sm font-semibold text-accent">
                    ¥{(dashboardData.todayInterceptValue / 10000).toFixed(1)}万
                  </p>
                </div>
              </div>

              <div className="mt-2 flex-1 space-y-1.5 min-h-0 overflow-y-auto">
                {agentSummaries.map((s, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                  >
                    <AgentSummaryItem {...s} />
                  </motion.div>
                ))}
              </div>

              <div className="mt-2 rounded-lg bg-[#F1F5F9] px-2.5 py-1.5">
                <div className="flex items-center gap-1.5">
                  {dashboardData.onlineStations > 0 ? (
                    <Wifi className="h-3 w-3 text-success" />
                  ) : (
                    <WifiOff className="h-3 w-3 text-danger" />
                  )}
                  <span className="text-[10px] text-text-muted">
                    后台接收：
                    <span
                      className={cn(
                        'font-medium',
                        dashboardData.onlineStations > 0 ? 'text-success' : 'text-danger',
                      )}
                    >
                      {dashboardData.onlineStations > 0 ? '正常' : '离线'}
                    </span>
                  </span>
                  <span className="ml-auto font-mono text-[10px] text-text-muted">
                    10:24:36
                  </span>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="stream"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex h-full flex-col"
            >
              <AgentStreamPanel
                phase={player.phase}
                currentItem={player.currentItem}
                streamLines={player.streamLines}
                pushedBadges={player.pushedBadges}
                workOrderMessage={player.workOrderMessage}
                totalCount={detectionScript.length}
                cursor={player.cursor}
                onApprovePass={player.approvePass}
                onAssignL2Review={player.assignL2Review}
                onHoldL2Review={player.holdL2ForReview}
                onConfirmL1Block={player.confirmL1Block}
                onCreateWorkOrder={player.createWorkOrder}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Full-screen L1 alert */}
      <FullScreenAlert
        visible={player.alertOpen}
        severity="danger-deep"
        title={player.currentItem?.summary.title ?? 'L1 强拦截 · 多模态异常'}
        message={
          player.currentItem?.agentSuggestion ??
          '视觉变色 + 重力 +0.3kg + 红外 +12°C + VOC 超标，疑似危险品泄漏'
        }
        showClose={false}
        actionButtons={
          <>
            <button
              onClick={player.confirmL1Block}
              className="rounded bg-white px-4 py-2 text-sm font-medium text-l1-badge transition-colors hover:bg-white/90"
            >
              确认拦截
            </button>
            <button
              onClick={player.createWorkOrder}
              className="rounded border border-white/50 bg-transparent px-4 py-2 text-sm text-white transition-colors hover:bg-white/10"
            >
              创建并飞书指派王强 + 陈璐
            </button>
          </>
        }
      >
        <div className="mt-6 grid w-full max-w-md grid-cols-3 gap-2">
          <div className="rounded bg-white/10 p-2 text-center">
            <p className="text-[10px] text-white/70">视觉</p>
            <p className="mt-0.5 text-xs font-medium text-white">外观变色</p>
          </div>
          <div className="rounded bg-white/10 p-2 text-center">
            <p className="text-[10px] text-white/70">温度</p>
            <p className="mt-0.5 text-xs font-medium text-white">+12 °C</p>
          </div>
          <div className="rounded bg-white/10 p-2 text-center">
            <p className="text-[10px] text-white/70">VOC</p>
            <p className="mt-0.5 text-xs font-medium text-white">超标</p>
          </div>
        </div>
      </FullScreenAlert>
    </div>
  );
};

export default StationIdle;
