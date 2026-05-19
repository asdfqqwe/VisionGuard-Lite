import type { FC } from 'react';
import { useState } from 'react';
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
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { cn } from '@/lib/utils';
import {
  AIReasoningPanel,
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

const StationOutbound: FC = () => {
  const { outboundOrders } = useData();
  const order = outboundOrders[0] || outboundOrderSO031;
  const [currentItemIndex] = useState(2); // Focus on the anomaly (雨刮电机)

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
                  {isAnomaly ? (
                    <L1Badge />
                  ) : (
                    <div className="h-2 w-2 rounded-full bg-success" />
                  )}
                </div>
              );
            })}
          </div>
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
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ClipboardCheck className="h-4 w-4 text-success" />
            <span className="text-xs font-medium text-success">出库复核中</span>
            <span className="text-[11px] text-text-muted">OB-2024-00892</span>
          </div>
          <span className="font-mono text-[11px] text-text-muted">10:24:36</span>
        </div>

        {/* Image area */}
        <ImageInspectArea
          imageUrl="/images/inspect-wiper-outbound.jpg"
          boxes={detectBoxes}
          infoText="复核中：包装完整性 | 包装置信度 96.1% | 标签置信度 99.2%"
          status="pass"
          overlayContent={
            anomalyItem && (
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
        {anomalyItem && (
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
      </div>

      {/* RIGHT COLUMN: AI judgment + Agent suggestion + Collaboration + Mini cards */}
      <div className="flex h-full w-[340px] flex-col gap-2 overflow-y-auto border-l border-border bg-primary p-3">
        {/* AI Reasoning Panel (collapsed) */}
        <AIReasoningPanel collapsed={true} />

        {/* AI Judgment Summary */}
        <div className="overflow-hidden rounded-lg border border-success bg-success/15">
          <div className="h-1 bg-success" />
          <div className="p-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-success" />
              <span className="text-sm font-semibold text-success">出库复核通过</span>
            </div>
            <div className="mt-2 space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-text-muted">复核项</span>
                <span className="font-medium text-text-primary">包装/标签/重量</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-text-muted">包装置信度</span>
                <span className="font-mono font-medium text-text-primary">96.1%</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-text-muted">标签置信度</span>
                <span className="font-mono font-medium text-text-primary">99.2%</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-text-muted">重量匹配</span>
                <span className="font-medium text-success">匹配</span>
              </div>
            </div>
          </div>
        </div>

        {/* Anomaly alert for 雨刮电机 */}
        {anomalyItem && (
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
            anomalyItem
              ? `出库复核发现${anomalyItem.materialName}型号不符。建议：1）退回拣货重新核对 2）通知拣货员核查库位${anomalyItem.location} 3）确认系统数据是否正确。已创建事件 AE-002。`
              : '出库复核通过。包装完整，标签清晰，重量匹配。可正常发货。建议优先处理要求14:00前发货的订单。'
          }
        />

        {/* Action buttons */}
        <div className="flex gap-2">
          <button className="flex-1 rounded bg-success py-2 text-xs font-medium text-white transition-colors hover:bg-success/90">
            确认出库
          </button>
          <button className="rounded bg-danger px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-danger/90">
            退回拣货
          </button>
        </div>

        {/* Collaboration receipt */}
        <CollaborationReceipt
          aeNo="AE-002"
          woNo="WO-002"
          reminderStatus="已提醒"
          backendStatus="处理中"
          handler="复核员-李"
          handlerComment="出库复核发现雨刮电机型号不符，已退回拣货"
          timestamp="2024-03-16 14:05"
        />

        {/* Three Mini Cards - outbound specific */}
        <ThreeMiniCards
          historyCard={{ title: '华南电商', value: '退货率 1.2%', valueColor: 'text-success' }}
          standardCard={{ title: '出库标准', value: '版本 v2.3' }}
          linkCard={{ title: '发货单', value: '待发货', valueColor: 'text-warning' }}
        />
      </div>
    </div>
  );
};

export default StationOutbound;
