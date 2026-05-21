import type { FC } from 'react';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  Loader2,
  Circle,
  PackageCheck,
  Truck,
  ClipboardCheck,
  Package,
  AlertTriangle,
  Barcode,
  Camera,
  FileText,
  Gauge,
  PlayCircle,
  RotateCcw,
  ScanLine,
  Bot,
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { cn } from '@/lib/utils';
import {
  ThreeMiniCards,
  CollaborationReceipt,
  ImageInspectArea,
} from '@/components/station';
import { AgentSuggestion, L1Badge } from '@/components/shared';
import { outboundOrderSO031 } from '@/data/mockData';

// ─── Timeline data ───
interface TimelineStage {
  name: string;
  status: 'completed' | 'inProgress' | 'pending';
  time?: string;
  icon: React.ReactNode;
}

const timelineStages: TimelineStage[] = [
  {
    name: '拣货完成',
    status: 'completed',
    time: '09:15',
    icon: <PackageCheck className="h-4 w-4" />,
  },
  {
    name: '包装完成',
    status: 'completed',
    time: '10:02',
    icon: <Package className="h-4 w-4" />,
  },
  {
    name: 'AI复核中',
    status: 'inProgress',
    icon: <Loader2 className="h-4 w-4 animate-spin" />,
  },
  {
    name: '待发货',
    status: 'pending',
    icon: <Truck className="h-4 w-4" />,
  },
];

const outboundChecks = [
  { label: '视觉点数', expected: '3 件', actual: '3 件', status: '通过', icon: Camera },
  { label: '条码匹配', expected: 'SO-031 清单', actual: '3 条已匹配', status: '通过', icon: Barcode },
  { label: '标签合规', expected: '标签位置/可读性', actual: '3/3 合规', status: '通过', icon: ScanLine },
  { label: 'OCR 字段', expected: 'SKU/批次/数量', actual: '雨刮电机型号不符', status: '异常', icon: FileText },
];

const fieldRows = [
  { field: 'SKU', expected: 'WPM-2026-A', actual: 'WPM-2026-B', status: '异常' },
  { field: '批次', expected: 'B20260309C', actual: 'B20260309C', status: '通过' },
  { field: '数量', expected: '5 件', actual: '5 件', status: '通过' },
];

const outboundAgentLines = [
  '接收出库复核图像，当前包裹位于发货检测台中心。',
  '视觉点数完成：包装件数与 SO-031 发货清单一致。',
  '条码与标签读取完成：3 条条码已匹配，包装标签可读。',
  'OCR 字段比对发现雨刮电机 SKU 与系统清单不一致。',
  '建议退回拣货复核库位 B-03-02，暂不放行发货。',
];

const TypewriterAgent: FC<{ active: boolean; lines: string[] }> = ({ active, lines }) => {
  const [text, setText] = useState('');
  const fullText = lines.join('\n');

  useEffect(() => {
    setText('');
    if (!active) return undefined;

    let index = 0;
    const timer = window.setInterval(() => {
      index += 1;
      setText(fullText.slice(0, index));
      if (index >= fullText.length) {
        window.clearInterval(timer);
      }
    }, 24);

    return () => window.clearInterval(timer);
  }, [active, fullText]);

  const completed = active && text.length >= fullText.length;

  return (
    <div className="rounded-lg border border-info/25 bg-[#F8FAFC] p-3">
      <div className="flex items-center gap-2">
        <Bot className="h-4 w-4 text-info" />
        <span className="text-xs font-semibold text-text-primary">Agent 识别过程</span>
        <span className={cn('ml-auto rounded px-2 py-0.5 text-[10px] font-semibold', active ? 'bg-info/15 text-info' : 'bg-text-muted/15 text-text-muted')}>
          {active ? (completed ? '已完成' : '识别中') : '待检测'}
        </span>
      </div>
      <div className="mt-2 min-h-[142px] space-y-1.5">
        {active ? (
          text.split('\n').map((line, index) => (
            <p key={`${line}-${index}`} className="text-[11px] leading-relaxed text-text-secondary">
              {line}
              {index === text.split('\n').length - 1 && !completed && (
                <span className="ml-0.5 inline-block animate-pulse text-info">▍</span>
              )}
            </p>
          ))
        ) : (
          <div className="flex h-[118px] items-center justify-center text-[11px] text-text-muted">
            点击开始发货复核后显示识别过程
          </div>
        )}
      </div>
    </div>
  );
};

const inspectionPolicy = {
  mode: '全检',
  reason: '同供应商 7 日内 3 次异常，关键零部件出库需逐件复核',
  source: 'Admin 出库复核策略 R-OUT-02',
};

const StationOutbound: FC = () => {
  const [searchParams] = useSearchParams();
  const { outboundOrders } = useData();
  const order = outboundOrders[0] || outboundOrderSO031;
  const [currentItemIndex] = useState(2); // Focus on the anomaly (雨刮电机)
  const isScenarioGuide = searchParams.get('scenario') === 'outbound-review';
  const [detectionStarted, setDetectionStarted] = useState(!isScenarioGuide);

  // Outbound-specific detect boxes
  const detectBoxes = [
    { x: 15, y: 20, w: 30, h: 25, label: '包装', confidence: 96.1, type: 'pass' as const },
    { x: 55, y: 30, w: 25, h: 20, label: '标签', confidence: 99.2, type: 'pass' as const },
    { x: 35, y: 55, w: 30, h: 20, label: '重量匹配', type: 'pass' as const },
  ];

  // The anomaly item (雨刮电机)
  const anomalyItem = order.items.find((i) => i.status === '拦截');

  return (
    <div className="flex h-full">
      {/* LEFT COLUMN: Outbound order info + 4-stage timeline */}
      <div className="h-full w-[320px] overflow-y-auto border-r border-border bg-primary p-3">
        {/* Outbound order info */}
        <div className="rounded-lg bg-[#F1F5F9] p-3">
          <h3 className="text-xs font-semibold text-text-primary">出库单信息</h3>
          <div className="mt-2 space-y-2">
            <div className="flex justify-between">
              <span className="text-[11px] text-text-muted">出库单号</span>
              <span className="font-mono text-xs text-text-primary">{order.orderNo}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[11px] text-text-muted">订单类型</span>
              <span className="text-xs text-text-primary">普通出库</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[11px] text-text-muted">客户</span>
              <span className="text-xs text-text-primary">华南电商</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[11px] text-text-muted">要求发货时间</span>
              <span className="font-mono text-xs text-text-primary">14:00</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[11px] text-text-muted">总件数</span>
              <span className="font-mono text-xs text-text-primary">{order.items.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[11px] text-text-muted">目的地</span>
              <span className="text-xs text-text-primary">广州仓</span>
            </div>
          </div>
        </div>

        {/* 4-stage timeline */}
        <div className="mt-3 rounded-lg bg-[#F1F5F9] p-3">
          <h3 className="text-xs font-semibold text-text-primary">出库流程</h3>
          <div className="mt-3 space-y-0">
            {timelineStages.map((stage, idx) => {
              const isLast = idx === timelineStages.length - 1;
              const dotColor =
                stage.status === 'completed'
                  ? 'bg-success text-success'
                  : stage.status === 'inProgress'
                    ? 'bg-info text-info'
                    : 'bg-text-muted text-text-muted';

              return (
                <div key={idx} className="flex gap-3">
                  {/* Timeline line */}
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        'flex h-6 w-6 items-center justify-center rounded-full',
                        stage.status === 'completed'
                          ? 'bg-success/20'
                          : stage.status === 'inProgress'
                            ? 'bg-info/20'
                            : 'bg-text-muted/20'
                      )}
                    >
                      <span className={cn('scale-75', dotColor)}>
                        {stage.status === 'completed' ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : stage.status === 'inProgress' ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Circle className="h-4 w-4" />
                        )}
                      </span>
                    </div>
                    {!isLast && (
                      <div
                        className={cn(
                          'mt-1 h-6 w-0.5',
                          stage.status === 'completed' ? 'bg-success/40' : 'bg-text-muted/20'
                        )}
                      />
                    )}
                  </div>
                  {/* Content */}
                  <div className="pb-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          'text-xs font-medium',
                          stage.status === 'pending' ? 'text-text-muted' : 'text-text-primary'
                        )}
                      >
                        {stage.name}
                      </span>
                      {stage.status === 'inProgress' && (
                        <span className="rounded bg-info/20 px-1.5 py-0.5 text-[10px] text-info">
                          进行中
                        </span>
                      )}
                    </div>
                    {stage.time && (
                      <span className="font-mono text-[10px] text-text-muted">{stage.time}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Item list */}
        <div className="mt-3 rounded-lg bg-[#F1F5F9]">
          <div className="border-b border-border px-3 py-2">
            <h3 className="text-xs font-semibold text-text-primary">
              出库清单（{order.items.length}件）
            </h3>
          </div>
          <div className="p-1.5">
            {order.items.map((item, idx) => {
              const isAnomaly = item.status === '拦截';
              return (
                <div
                  key={item.id}
                  className={cn(
                    'flex items-center gap-2 rounded px-2 py-1.5',
                    isAnomaly && 'bg-danger/15',
                    !isAnomaly && idx === currentItemIndex && 'bg-info/15'
                  )}
                >
                  <span className="w-5 text-[10px] text-text-muted">{item.lineNo}</span>
                  <span className="flex-1 truncate text-[11px] text-text-primary">
                    {item.materialName}
                  </span>
                  <span className="text-[10px] text-text-muted">{item.location}</span>
                  {detectionStarted && isAnomaly ? (
                    <L1Badge />
                  ) : (
                    <div className={cn('h-2 w-2 rounded-full', detectionStarted ? 'bg-success' : 'bg-text-muted/40')} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-3 rounded-lg bg-[#F1F5F9] p-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-text-primary">检测策略</h3>
            <span className="rounded bg-info/15 px-2 py-0.5 text-[10px] font-bold text-info">
              {inspectionPolicy.mode}
            </span>
          </div>
          <p className="mt-2 text-[11px] leading-relaxed text-text-secondary">{inspectionPolicy.reason}</p>
          <p className="mt-1 font-data text-[10px] text-text-muted">{inspectionPolicy.source}</p>
        </div>

        {/* Bottom buttons */}
        <div className="mt-3 flex gap-2">
          <button className="flex-1 rounded bg-[#F1F5F9] py-2 text-xs text-text-secondary transition-colors hover:bg-gray-100">
            重新复核
          </button>
          <button className="flex-1 rounded bg-success py-2 text-xs font-medium text-white transition-colors hover:bg-success/90">
            确认出库
          </button>
        </div>
      </div>

      {/* CENTER COLUMN: Image area */}
      <div className="flex flex-1 flex-col bg-[#F1F5F9] p-3">
        {/* Status bar */}
        <div className="mb-2 flex items-center justify-between rounded-lg border border-info/25 bg-primary px-3 py-2">
          <div className="flex items-center gap-2">
            <ClipboardCheck className="h-4 w-4 text-success" />
            <span className={cn('text-xs font-medium', detectionStarted ? 'text-success' : 'text-info')}>
              {detectionStarted ? '出库复核中' : '出库复核待启动'}
            </span>
            <span className="text-[11px] text-text-muted">OB-2024-00892</span>
          </div>
          <button
            type="button"
            onClick={() => setDetectionStarted((value) => !value)}
            className={cn(
              'flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-semibold',
              detectionStarted ? 'bg-[#F1F5F9] text-text-secondary' : 'bg-info text-white',
            )}
          >
            {detectionStarted ? <RotateCcw className="h-4 w-4" /> : <PlayCircle className="h-4 w-4" />}
            {detectionStarted ? '重新复核' : '开始发货复核'}
          </button>
        </div>

        {/* Image area */}
        <ImageInspectArea
          className="min-h-0 flex-1 !h-auto"
          imageUrl="/images/inspect-wiper-outbound.jpg"
          boxes={detectionStarted ? detectBoxes : []}
          infoText={detectionStarted ? '复核中：包装完整性 | 包装置信度 96.1% | 标签置信度 99.2%' : '发货复核待启动：请点击上方按钮'}
          status={detectionStarted ? 'pass' : 'warning'}
          overlayContent={
            !detectionStarted ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative h-[52%] w-[58%]">
                  <span className="absolute left-0 top-0 h-5 w-5 border-l-2 border-t-2 border-info" />
                  <span className="absolute right-0 top-0 h-5 w-5 border-r-2 border-t-2 border-info" />
                  <span className="absolute bottom-0 left-0 h-5 w-5 border-b-2 border-l-2 border-info" />
                  <span className="absolute bottom-0 right-0 h-5 w-5 border-b-2 border-r-2 border-info" />
                </div>
              </div>
            ) : anomalyItem && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute top-3 left-3 flex items-center gap-2 rounded bg-danger/90 px-2 py-1 backdrop-blur-sm"
              >
                <AlertTriangle className="h-4 w-4 text-white" />
                <div>
                  <span className="text-xs font-bold text-white">
                    {anomalyItem.materialName} - 型号不符
                  </span>
                  <L1Badge className="ml-2" />
                </div>
              </motion.div>
            )
          }
        />

        {/* Anomaly detail for 雨刮电机 */}
        {detectionStarted && anomalyItem && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 rounded-lg border border-danger bg-danger/15 p-3"
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-danger" />
              <span className="text-xs font-bold text-danger">异常项</span>
              <L1Badge />
            </div>
            <div className="mt-2 grid grid-cols-3 gap-2">
              <div>
                <span className="text-[10px] text-text-muted">物资</span>
                <p className="text-xs font-medium text-text-primary">{anomalyItem.materialName}</p>
              </div>
              <div>
                <span className="text-[10px] text-text-muted">库位</span>
                <p className="font-mono text-xs text-text-primary">{anomalyItem.location}</p>
              </div>
              <div>
                <span className="text-[10px] text-text-muted">状态</span>
                <p className="text-xs font-medium text-danger">{anomalyItem.result}</p>
              </div>
            </div>
          </motion.div>
        )}

        <div className="mt-2 grid shrink-0 grid-cols-4 gap-2">
          {outboundChecks.map((check) => {
            const Icon = check.icon;
            const abnormal = check.status === '异常';
            return (
              <div
                key={check.label}
                className={cn(
                  'rounded-lg border bg-primary p-1.5',
                  !detectionStarted ? 'border-border bg-primary' : abnormal ? 'border-danger/40 bg-danger/10' : 'border-success/30 bg-success/10'
                )}
              >
                <div className="flex items-center justify-between">
                  <Icon className={cn('h-4 w-4', !detectionStarted ? 'text-text-muted' : abnormal ? 'text-danger' : 'text-success')} />
                  <span
                    className={cn(
                      'rounded px-1.5 py-0.5 text-[10px] font-bold',
                      !detectionStarted ? 'bg-text-muted/15 text-text-muted' : abnormal ? 'bg-danger/15 text-danger' : 'bg-success/15 text-success'
                    )}
                  >
                    {detectionStarted ? check.status : '待检'}
                  </span>
                </div>
                <p className="mt-1 text-[11px] font-semibold text-text-primary">{check.label}</p>
                <p className="mt-0.5 text-[10px] text-text-muted">{check.expected}</p>
                <p className={cn('mt-0.5 text-[11px] font-medium', !detectionStarted ? 'text-text-muted' : abnormal ? 'text-danger' : 'text-success')}>
                  {detectionStarted ? check.actual : '--'}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* RIGHT COLUMN: AI judgment + Agent suggestion + Collaboration + Mini cards */}
      <div className="flex h-full w-[340px] flex-col gap-2 overflow-y-auto border-l border-border bg-primary p-3">
        <TypewriterAgent active={detectionStarted} lines={outboundAgentLines} />

        {/* AI Judgment Summary */}
        <div className={cn('overflow-hidden rounded-lg border', detectionStarted ? 'border-warning bg-warning/15' : 'border-border bg-[#F1F5F9]')}>
          <div className={cn('h-1', detectionStarted ? 'bg-warning' : 'bg-text-muted/30')} />
          <div className="p-3">
            <div className="flex items-center gap-2">
              {detectionStarted ? (
                <AlertTriangle className="h-4 w-4 text-warning" />
              ) : (
                <ClipboardCheck className="h-4 w-4 text-text-muted" />
              )}
              <span className={cn('text-sm font-semibold', detectionStarted ? 'text-warning' : 'text-text-muted')}>
                {detectionStarted ? '出库复核异常' : '等待发货复核'}
              </span>
            </div>
            <div className="mt-2 space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-text-muted">复核项</span>
                <span className="font-medium text-text-primary">{detectionStarted ? '包装/标签/OCR' : '--'}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-text-muted">包装置信度</span>
                <span className="font-mono font-medium text-text-primary">{detectionStarted ? '96.1%' : '--'}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-text-muted">标签置信度</span>
                <span className="font-mono font-medium text-text-primary">{detectionStarted ? '99.2%' : '--'}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-text-muted">重量匹配</span>
                <span className={cn('font-medium', detectionStarted ? 'text-warning' : 'text-text-muted')}>
                  {detectionStarted ? 'SKU 异常' : '--'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-[#F1F5F9] p-3">
          <div className="mb-2 flex items-center gap-2">
            <Gauge className="h-4 w-4 text-info" />
            <span className="text-xs font-semibold text-text-primary">字段核验</span>
          </div>
          <div className="space-y-1">
            {fieldRows.map((row) => {
              const abnormal = detectionStarted && row.status === '异常';
              return (
                <div key={row.field} className="grid grid-cols-[56px_1fr_1fr_42px] gap-2 rounded bg-primary px-2 py-1.5 text-[11px]">
                  <span className="text-text-muted">{row.field}</span>
                  <span className="font-data text-text-secondary">{detectionStarted ? row.expected : '--'}</span>
                  <span className={cn('font-data', abnormal ? 'text-danger' : detectionStarted ? 'text-text-primary' : 'text-text-muted')}>
                    {detectionStarted ? row.actual : '--'}
                  </span>
                  <span className={cn('text-right font-semibold', abnormal ? 'text-danger' : detectionStarted ? 'text-success' : 'text-text-muted')}>
                    {detectionStarted ? row.status : '待检'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Anomaly alert for 雨刮电机 */}
        {detectionStarted && anomalyItem && (
          <div className="overflow-hidden rounded-lg border border-danger bg-danger/15">
            <div className="h-1 bg-danger" />
            <div className="p-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-danger" />
                <span className="text-sm font-semibold text-danger">
                  {anomalyItem.materialName} - 异常
                </span>
                <L1Badge />
              </div>
              <p className="mt-1 text-xs text-danger">{anomalyItem.result}</p>
            </div>
          </div>
        )}

        {/* Agent suggestion */}
        <AgentSuggestion
          suggestion={
            !detectionStarted
              ? '点击开始发货复核后，系统会读取包装、条码、标签和 OCR 字段，并给出放行或退回建议。'
              : anomalyItem
              ? `出库复核发现${anomalyItem.materialName}型号不符。建议：1）退回拣货重新核对 2）通知拣货员核查库位${anomalyItem.location} 3）确认系统数据是否正确。已创建事件 AE-002。`
              : '出库复核通过。包装完整，标签清晰，重量匹配。可正常发货。建议优先处理要求14:00前发货的订单。'
          }
        />

        {/* Action buttons */}
        <div className="flex gap-2">
          <button
            disabled={!detectionStarted}
            className={cn(
              'flex-1 rounded py-2 text-xs font-medium text-white transition-colors',
              detectionStarted ? 'bg-success hover:bg-success/90' : 'cursor-not-allowed bg-text-muted/40',
            )}
          >
            确认出库
          </button>
          <button
            disabled={!detectionStarted}
            className={cn(
              'rounded px-3 py-2 text-xs font-medium text-white transition-colors',
              detectionStarted ? 'bg-danger hover:bg-danger/90' : 'cursor-not-allowed bg-text-muted/40',
            )}
          >
            退回拣货
          </button>
        </div>

        {detectionStarted && (
          <CollaborationReceipt
            aeNo="AE-002"
            woNo="WO-002"
            reminderStatus="已提醒"
            backendStatus="处理中"
            handler="复核员-李"
            handlerComment="出库复核发现雨刮电机型号不符，已退回拣货"
            timestamp="2024-03-16 14:05"
          />
        )}

        {/* Three Mini Cards - outbound specific */}
        {detectionStarted && (
          <ThreeMiniCards
            historyCard={{ title: '华南电商', value: '退货率 1.2%', valueColor: 'text-success' }}
            standardCard={{ title: '出库标准', value: '版本 v2.3' }}
            linkCard={{ title: '发货单', value: '待发货', valueColor: 'text-warning' }}
          />
        )}
      </div>
    </div>
  );
};

export default StationOutbound;
