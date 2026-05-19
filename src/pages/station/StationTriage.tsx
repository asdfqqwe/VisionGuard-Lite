import type { FC } from 'react';
import { useState } from 'react';
import {
  AlertTriangle,
  PackageX,
  Camera,
  FileText,
  Thermometer,
  TrendingUp,
  BookOpen,
  DollarSign,
  ArrowRight,
  ArrowLeftRight,
  Shield,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  AIReasoningPanel,
  ThreeMiniCards,
  CollaborationReceipt,
  ImageInspectArea,
} from '@/components/station';
import { AgentSuggestion, StatusBadge } from '@/components/shared';

// ─── Problem items data for triage ───
const problemItemsList = [
  {
    iqNo: 'IQ-2024-0003',
    materialName: '发动机线束',
    anomalyType: '型号不符',
    type: '外观缺陷',
    status: '已隔离' as const,
  },
  {
    iqNo: 'IQ-2024-0004',
    materialName: '一次性丁腈手套',
    anomalyType: '标签缺失',
    type: '标签缺失',
    status: '待处理' as const,
  },
  {
    iqNo: 'IQ-2024-0005',
    materialName: '矿泉水',
    anomalyType: '数量不符',
    type: '数量差异',
    status: '待索赔' as const,
  },
];

// ─── Evidence data ───
const evidenceList = [
  { name: 'AI检测图像', type: '图像' as const, status: '已采集' as const, icon: <Camera className="h-4 w-4" /> },
  { name: '摄像头录像', type: '视频' as const, status: '已采集' as const, icon: <FileText className="h-4 w-4" /> },
  { name: '人工复核照片', type: '图像' as const, status: '待采集' as const, icon: <Camera className="h-4 w-4" /> },
  { name: '温度记录', type: '数据' as const, status: '已采集' as const, icon: <Thermometer className="h-4 w-4" /> },
];

// ─── Triage options ───
const triageOptions = [
  { label: '退回供应商', color: 'bg-danger text-white hover:bg-danger/90', icon: <ArrowRight className="h-3.5 w-3.5" /> },
  { label: '降级处理', color: 'bg-warning text-primary-dark hover:bg-warning/90', icon: <TrendingUp className="h-3.5 w-3.5" /> },
  { label: '维修后入库', color: 'bg-info text-white hover:bg-info/90', icon: <BookOpen className="h-3.5 w-3.5" /> },
  { label: '报废处理', color: 'bg-text-muted text-white hover:bg-text-muted/80', icon: <PackageX className="h-3.5 w-3.5" /> },
];

const StationTriage: FC = () => {
  const [selectedProblemItem, setSelectedProblemItem] = useState(0);
  const [selectedEvidence, setSelectedEvidence] = useState(0);

  const currentItem = problemItemsList[selectedProblemItem];
  const currentEvidence = evidenceList[selectedEvidence];

  return (
    <div className="flex h-full">
      {/* LEFT COLUMN: Triage task info */}
      <div className="h-full w-[320px] overflow-y-auto border-r border-border bg-primary p-3">
        {/* Task card */}
        <div className="rounded-lg border border-warning/30 bg-[#F1F5F9] p-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-warning" />
            <h3 className="text-xs font-semibold text-warning">分流任务</h3>
          </div>
          <div className="mt-2 space-y-2">
            <div className="flex justify-between">
              <span className="text-[11px] text-text-muted">任务编号</span>
              <span className="font-mono text-xs font-bold text-warning">CL-2024-0051</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[11px] text-text-muted">来源批次</span>
              <span className="font-mono text-xs text-text-primary">PKG-2024-001247</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[11px] text-text-muted">异常件数</span>
              <span className="font-mono text-xs font-bold text-danger">3</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[11px] text-text-muted">分流类型</span>
              <span className="text-xs text-text-primary">外观缺陷/标签缺失</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[11px] text-text-muted">触发方式</span>
              <span className="text-xs text-text-primary">AI自动/人工标记</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[11px] text-text-muted">检验模式</span>
              <span className="text-xs text-info">抽检</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[11px] text-text-muted">仓内状态</span>
              <span className="rounded bg-warning/20 px-1.5 py-0.5 text-[10px] text-warning">待索赔</span>
            </div>
          </div>
        </div>

        {/* IQ and CL numbers display */}
        <div className="mt-3 rounded-lg bg-danger/15 p-3">
          <h4 className="text-xs font-medium text-danger">关联编号</h4>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <div className="rounded bg-[#F1F5F9] p-2">
              <span className="text-[10px] text-text-muted">IQ-问题件</span>
              <p className="font-mono text-xs font-bold text-warning">IQ-001</p>
            </div>
            <div className="rounded bg-[#F1F5F9] p-2">
              <span className="text-[10px] text-text-muted">CL-索赔</span>
              <p className="font-mono text-xs font-bold text-accent">CL-001</p>
            </div>
            <div className="rounded bg-[#F1F5F9] p-2">
              <span className="text-[10px] text-text-muted">WO-工单</span>
              <p className="font-mono text-xs font-bold text-info">WO-001</p>
            </div>
            <div className="rounded bg-[#F1F5F9] p-2">
              <span className="text-[10px] text-text-muted">AE-事件</span>
              <p className="font-mono text-xs font-bold text-danger">AE-001</p>
            </div>
          </div>
        </div>

        {/* Problem items list */}
        <div className="mt-3 rounded-lg bg-[#F1F5F9]">
          <div className="border-b border-border px-3 py-2">
            <h3 className="text-xs font-semibold text-text-primary">
              问题件列表（{problemItemsList.length}件）
            </h3>
          </div>
          <div className="p-1.5">
            {problemItemsList.map((item, idx) => (
              <button
                key={item.iqNo}
                onClick={() => setSelectedProblemItem(idx)}
                className={cn(
                  'flex w-full items-center gap-2 rounded px-2 py-2 text-left transition-colors',
                  selectedProblemItem === idx
                    ? 'bg-warning/15'
                    : 'hover:bg-primary/30'
                )}
              >
                <div
                  className={cn(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded',
                    item.status === '已隔离'
                      ? 'bg-danger/20'
                      : item.status === '待索赔'
                        ? 'bg-warning/20'
                        : 'bg-info/20'
                  )}
                >
                  <PackageX className="h-4 w-4 text-danger" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[11px] font-bold text-text-primary">
                      {item.iqNo}
                    </span>
                    <StatusBadge
                      status={
                        item.type === '外观缺陷'
                          ? 'NG外观'
                          : item.type === '标签缺失'
                            ? '标签缺失'
                            : 'L2警示'
                      }
                      size="sm"
                    />
                  </div>
                  <p className="truncate text-[11px] text-text-secondary">{item.materialName}</p>
                </div>
                <span
                  className={cn(
                    'shrink-0 rounded px-1.5 py-0.5 text-[10px]',
                    item.status === '已隔离'
                      ? 'bg-danger/20 text-danger'
                      : item.status === '待索赔'
                        ? 'bg-warning/20 text-warning'
                        : 'bg-info/20 text-info'
                  )}
                >
                  {item.status}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Triage action buttons */}
        <div className="mt-3 space-y-2">
          <h4 className="text-xs font-medium text-text-muted">分流去向</h4>
          <div className="grid grid-cols-2 gap-2">
            {triageOptions.map((opt) => (
              <button
                key={opt.label}
                className={cn(
                  'flex items-center justify-center gap-1.5 rounded py-2 text-xs font-medium transition-colors',
                  opt.color
                )}
              >
                {opt.icon}
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* CENTER COLUMN: Monitoring evidence + image */}
      <div className="flex flex-1 flex-col bg-[#F1F5F9] p-3">
        {/* Evidence entry */}
        <div className="mb-3">
          <h3 className="flex items-center gap-2 text-xs font-semibold text-text-primary">
            <Shield className="h-4 w-4 text-info" />
            监控证据
          </h3>
          <div className="mt-2 grid grid-cols-4 gap-2">
            {evidenceList.map((ev, idx) => (
              <button
                key={ev.name}
                onClick={() => setSelectedEvidence(idx)}
                className={cn(
                  'flex flex-col items-center gap-1.5 rounded-lg p-2.5 transition-all',
                  selectedEvidence === idx
                    ? 'border border-info bg-info/15'
                    : 'bg-primary hover:bg-gray-100'
                )}
              >
                <span className={cn('text-info', selectedEvidence === idx && 'scale-110')}>
                  {ev.icon}
                </span>
                <span className="text-[10px] text-text-secondary">{ev.name}</span>
                <div className="flex items-center gap-1">
                  <div
                    className={cn(
                      'h-1.5 w-1.5 rounded-full',
                      ev.status === '已采集' ? 'bg-success' : 'bg-warning'
                    )}
                  />
                  <span className="text-[10px] text-text-muted">{ev.status}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Image area */}
        <ImageInspectArea
          imageUrl="/images/inspect-harness-fail.jpg"
          boxes={[
            { x: 20, y: 25, w: 35, h: 30, label: '缺陷区域', type: 'danger' },
            { x: 60, y: 20, w: 25, h: 25, label: '标签区域', type: 'warning' },
          ]}
          infoText={`证据查看：${currentEvidence.name} | ${currentEvidence.status}`}
          status="danger"
          overlayContent={
            <div className="absolute top-3 left-3 flex items-center gap-2 rounded bg-danger/90 px-2 py-1 backdrop-blur-sm">
              <PackageX className="h-4 w-4 text-white" />
              <span className="text-xs font-bold text-white">
                {currentItem?.iqNo} · {currentItem?.materialName}
              </span>
            </div>
          }
        />
      </div>

      {/* RIGHT COLUMN: Triage judgment + Agent suggestion + Collaboration + Mini cards */}
      <div className="flex h-full w-[340px] flex-col gap-2 overflow-y-auto border-l border-border bg-primary p-3">
        {/* AI Reasoning Panel (collapsed) */}
        <AIReasoningPanel collapsed={true} />

        {/* Triage judgment card */}
        <div className="overflow-hidden rounded-lg border border-warning bg-warning/15">
          <div className="h-1 bg-warning" />
          <div className="p-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-warning" />
              <span className="text-sm font-semibold text-warning">分流判定</span>
            </div>
            <div className="mt-2 space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-text-muted">当前判定</span>
                <span className="font-medium text-warning">退回供应商</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-text-muted">异常类型</span>
                <span className="font-medium text-text-primary">{currentItem?.type}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-text-muted">AI置信度</span>
                <span className="font-mono font-medium text-text-primary">87.3%</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-text-muted">涉及金额</span>
                <span className="font-mono font-medium text-accent">¥12,500</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <button className="flex flex-1 items-center justify-center gap-1 rounded bg-danger py-2 text-xs font-medium text-white transition-colors hover:bg-danger/90">
            <PackageX className="h-3.5 w-3.5" />
            移入问题件区
          </button>
        </div>
        <div className="flex gap-2">
          <button className="flex flex-1 items-center justify-center gap-1 rounded bg-accent py-2 text-xs font-medium text-primary-dark transition-colors hover:bg-accent/90">
            <DollarSign className="h-3.5 w-3.5" />
            发起索赔
          </button>
          <button className="flex flex-1 items-center justify-center gap-1 rounded bg-info py-2 text-xs font-medium text-white transition-colors hover:bg-info/90">
            <ArrowLeftRight className="h-3.5 w-3.5" />
            调拨
          </button>
        </div>

        {/* Agent suggestion */}
        <AgentSuggestion
          suggestion={`该批次3件异常建议分类处理：2件外观缺陷建议退回供应商（历史退货率3.2%可接受），1件标签缺失建议降级入库后补签。预计处理时间15分钟。当前选中：${currentItem?.materialName}（${currentItem?.iqNo}），建议退回供应商。`}
        />

        {/* Collaboration receipt */}
        <CollaborationReceipt
          aeNo="AE-001"
          woNo="WO-001"
          iqNo="IQ-001"
          clNo="CL-001"
          reminderStatus="已提醒"
          backendStatus="处理中"
          handler="收货主管-张"
          handlerComment="分流处理中，等待供应商确认"
          timestamp="2024-03-15 09:35"
        />

        {/* Three Mini Cards - triage specific */}
        <ThreeMiniCards
          historyCard={{ title: '江南华盛', value: '退货率 3.2%', valueColor: 'text-warning' }}
          standardCard={{ title: '分流标准', value: '版本 v2.2' }}
          linkCard={{ title: 'CL-001', value: '索赔中', valueColor: 'text-accent' }}
        />
      </div>
    </div>
  );
};

export default StationTriage;
