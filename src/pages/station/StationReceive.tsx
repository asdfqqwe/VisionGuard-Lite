import type { FC } from 'react';
import { useState, useCallback, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  CheckCircle2,
  AlertTriangle,
  ScanLine,
  Barcode,
  Boxes,
  Bot,
  FileText,
  PlayCircle,
  RotateCcw,
  Tag,
  PackageX,
  ShieldAlert,
  Flame,
  Volume2,
  VolumeX,
  Bell,
  Clock,
  CheckCircle,
  BookOpen,
  Shuffle,
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { cn } from '@/lib/utils';
import {
  AIReasoningPanel,
  ThreeMiniCards,
  CollaborationReceipt,
  TaskInfoPanel,
  ImageInspectArea,
  StateSwitcher,
  type DetectionState,
} from '@/components/station';
import {
  StatusBadge,
  AgentSuggestion,
  FullScreenAlert,
  L1Badge,
  L2Badge,
} from '@/components/shared';
import { deliveryOrderPO007 } from '@/data/mockData';
import type { DetectBox } from '@/components/station/ImageInspectArea';

type CapabilityDemoKey = 'counting' | 'label-check' | 'ocr' | 'barcode';

interface CapabilityDemoConfig {
  key: CapabilityDemoKey;
  title: string;
  subtitle: string;
  taskNo: string;
  imageUrl: string;
  imageFrameClass: string;
  status: 'pass' | 'warning' | 'danger' | 'tagMissing';
  readyText: string;
  infoText: string;
  boxes: DetectBox[];
  metrics: { label: string; value: string; tone: string }[];
  details: { label: string; value: string; tone: string }[];
  agentLines: string[];
  suggestion: string;
}

const capabilityDemoConfigs: Record<CapabilityDemoKey, CapabilityDemoConfig> = {
  counting: {
    key: 'counting',
    title: '视觉自动点数',
    subtitle: '整托纸箱 · 固定式视觉相机',
    taskNo: 'CAP-COUNT-0522',
    imageUrl: '/images/purchase-receive-station-overhead.png',
    imageFrameClass: 'aspect-[16/9]',
    status: 'pass',
    readyText: '固定相机已就绪：等待检测',
    infoText: '视觉点数：识别 6 个外箱，箱规 50 EA/箱，总数 300 EA',
    boxes: [
      { x: 33, y: 18, w: 12, h: 16, label: '箱 #1', confidence: 99.1, type: 'pass' },
      { x: 46, y: 18, w: 12, h: 16, label: '箱 #2', confidence: 98.6, type: 'pass' },
      { x: 33, y: 35, w: 12, h: 16, label: '箱 #3', confidence: 98.4, type: 'pass' },
      { x: 46, y: 35, w: 12, h: 16, label: '箱 #4', confidence: 99.4, type: 'pass' },
      { x: 33, y: 52, w: 12, h: 16, label: '箱 #5', confidence: 97.8, type: 'pass' },
      { x: 46, y: 52, w: 12, h: 16, label: '箱 #6', confidence: 98.1, type: 'pass' },
    ],
    metrics: [
      { label: '识别外箱', value: '6 / 6', tone: 'text-success' },
      { label: '箱规', value: '50 EA', tone: 'text-info' },
      { label: '总数', value: '300 EA', tone: 'text-success' },
    ],
    details: [
      { label: '托码', value: 'PLT-20260315-007', tone: 'text-success' },
      { label: '箱码', value: 'CTN-007-001 起', tone: 'text-success' },
      { label: '包装', value: '整托 / 盒装', tone: 'text-info' },
      { label: '结果', value: '数量一致', tone: 'text-success' },
    ],
    agentLines: [
      '接收固定相机图像，检测区域为黄色边框内的整托纸箱。',
      '已识别 6 个外箱，未发现明显遮挡或重叠。',
      '按箱规 50 EA/箱计算，本托合计 300 EA。',
      '数量与到货任务一致，建议进入后续标签和 OCR 抽检。',
    ],
    suggestion: '数量已确认，可继续执行标签合规检测和关键字段 OCR 抽检。',
  },
  'label-check': {
    key: 'label-check',
    title: '标签存在性检测',
    subtitle: '质量抽检点 · 外箱标签复核',
    taskNo: 'CAP-LABEL-0522',
    imageUrl: '/images/inspect-gloves-tag-missing.jpg',
    imageFrameClass: 'aspect-square max-w-[640px]',
    status: 'tagMissing',
    readyText: '标签检测相机已就绪：等待检测',
    infoText: '标签检测：右侧预期贴标区域未识别到产品标签',
    boxes: [
      { x: 47, y: 31, w: 39, h: 36, label: '预期标签区缺失', confidence: 91.7, type: 'danger' },
      { x: 12, y: 26, w: 22, h: 26, label: '箱体印刷', confidence: 96.4, type: 'pass' },
    ],
    metrics: [
      { label: '标签', value: '缺失', tone: 'text-danger' },
      { label: '箱体', value: '完整', tone: 'text-success' },
      { label: '风险', value: 'L2', tone: 'text-warning' },
    ],
    details: [
      { label: '物资', value: '丁腈手套', tone: 'text-text-primary' },
      { label: '位置', value: '右侧贴标区', tone: 'text-warning' },
      { label: '遮挡', value: '未发现', tone: 'text-success' },
      { label: '建议', value: '补标后复检', tone: 'text-warning' },
    ],
    agentLines: [
      '图像已接收，外箱表面完整，未发现破损。',
      '系统在预期贴标区域未识别到产品标签。',
      '箱体印刷信息可见，但无法替代产品标签字段。',
      '建议暂缓通过，补贴产品标签后再次检测。',
    ],
    suggestion: '该箱缺少产品标签，建议补标并保留复检照片。',
  },
  ocr: {
    key: 'ocr',
    title: '关键字段 OCR 抽检',
    subtitle: '箱标近景 · 供应商 / 批次 / 日期',
    taskNo: 'CAP-OCR-0522',
    imageUrl: '/images/purchase-receive-ocr-label.png',
    imageFrameClass: 'aspect-[4/3] max-w-[720px]',
    status: 'pass',
    readyText: 'OCR 相机已就绪：等待检测',
    infoText: 'OCR 抽检：供应商、料号、批次、生产日期、数量、有效期均可读',
    boxes: [
      { x: 18, y: 13, w: 34, h: 13, label: '供应商 SUP5678', confidence: 99.0, type: 'pass' },
      { x: 18, y: 29, w: 34, h: 14, label: '批次 L20260315A', confidence: 98.6, type: 'pass' },
      { x: 18, y: 44, w: 34, h: 12, label: '生产日期', confidence: 98.2, type: 'pass' },
      { x: 18, y: 58, w: 34, h: 11, label: '数量 250', confidence: 97.8, type: 'pass' },
      { x: 52, y: 17, w: 33, h: 18, label: '料号 APX-74218', confidence: 99.1, type: 'pass' },
      { x: 59, y: 69, w: 27, h: 15, label: '条码', confidence: 98.5, type: 'pass' },
    ],
    metrics: [
      { label: '字段', value: '6 / 6', tone: 'text-success' },
      { label: '最低置信度', value: '97.8%', tone: 'text-success' },
      { label: '抽检', value: '通过', tone: 'text-success' },
    ],
    details: [
      { label: '供应商', value: 'SUP5678', tone: 'text-success' },
      { label: '料号', value: 'APX-74218', tone: 'text-success' },
      { label: '批次', value: 'L20260315A', tone: 'text-success' },
      { label: '有效期', value: '2027-03-15', tone: 'text-success' },
    ],
    agentLines: [
      '已锁定箱标主体区域，开始读取关键字段。',
      '供应商编码 SUP5678、料号 APX-74218、批次 L20260315A 已读取。',
      '生产日期 2025-03-15、数量 250、有效期 2027-03-15 已读取。',
      '字段完整且置信度稳定，建议写入抽检记录。',
    ],
    suggestion: '箱标字段完整，OCR 结果可作为本批抽检记录。',
  },
  barcode: {
    key: 'barcode',
    title: '条码自动采集',
    subtitle: 'PDA 扫码 · 货架多标签采集',
    taskNo: 'CAP-BARCODE-0522',
    imageUrl: '/assets/placeholders/capability-barcode.png',
    imageFrameClass: 'aspect-[16/9]',
    status: 'pass',
    readyText: 'PDA 扫码图像已就绪：等待检测',
    infoText: '条码采集：已锁定 8 处货架标签，7 处可读，1 处需近距补扫',
    boxes: [
      { x: 11, y: 39, w: 6, h: 7, label: '左侧箱码', confidence: 96.8, type: 'pass' },
      { x: 18, y: 38, w: 6, h: 7, label: '左侧箱码', confidence: 96.2, type: 'pass' },
      { x: 61, y: 36, w: 7, h: 7, label: '右侧箱码', confidence: 97.5, type: 'pass' },
      { x: 81, y: 16, w: 8, h: 7, label: '上层条码', confidence: 98.4, type: 'pass' },
      { x: 70, y: 62, w: 7, h: 8, label: '周转箱码', confidence: 95.7, type: 'pass' },
      { x: 86, y: 62, w: 8, h: 9, label: '近端条码', confidence: 93.1, type: 'warning' },
    ],
    metrics: [
      { label: '采集', value: '7 / 8', tone: 'text-warning' },
      { label: '重复码', value: '0', tone: 'text-success' },
      { label: '补扫', value: '1', tone: 'text-warning' },
    ],
    details: [
      { label: '库位', value: 'A-01-02', tone: 'text-info' },
      { label: '箱码', value: '7 条可读', tone: 'text-success' },
      { label: '重复', value: '未发现', tone: 'text-success' },
      { label: '动作', value: '近距补扫', tone: 'text-warning' },
    ],
    agentLines: [
      'PDA 扫码图像已接收，正在锁定货架和周转箱标签。',
      '已识别 8 处候选条码，其中 7 处读取成功。',
      '近端右侧标签反光较强，建议靠近补扫一次。',
      '未发现重复条码或无效条码，采集结果可关联当前库位。',
    ],
    suggestion: '先补扫右侧近端标签，再提交本库位采集结果。',
  },
};

const isCapabilityDemoKey = (value: string | null): value is CapabilityDemoKey =>
  value === 'counting' || value === 'label-check' || value === 'ocr' || value === 'barcode';

const DemoAgentPanel: FC<{
  started: boolean;
  config: CapabilityDemoConfig;
}> = ({ started, config }) => {
  const [visibleText, setVisibleText] = useState('');
  const fullText = config.agentLines.join('\n');
  const completed = started && visibleText.length >= fullText.length;

  useEffect(() => {
    setVisibleText('');
    if (!started) return undefined;

    let index = 0;
    const timer = window.setInterval(() => {
      index += 1;
      setVisibleText(fullText.slice(0, index));
      if (index >= fullText.length) {
        window.clearInterval(timer);
      }
    }, 22);

    return () => window.clearInterval(timer);
  }, [fullText, started]);

  return (
    <aside className="flex h-full w-[340px] flex-col border-l border-border bg-primary p-3">
      <div className="flex items-center gap-2">
        <Bot className="h-4 w-4 text-info" />
        <h3 className="text-sm font-semibold text-text-primary">Agent 识别建议</h3>
        <span className={cn('ml-auto rounded px-2 py-0.5 text-[10px] font-semibold', started ? 'bg-info/15 text-info' : 'bg-text-muted/15 text-text-muted')}>
          {started ? (completed ? '已完成' : '识别中') : '待检测'}
        </span>
      </div>

      <div className="mt-3 min-h-[220px] rounded-lg bg-[#F8FAFC] p-3">
        {started ? (
          <div className="space-y-2">
            {visibleText.split('\n').map((line, index) => (
              <p key={`${line}-${index}`} className="text-xs leading-relaxed text-text-secondary">
                {line}
                {index === visibleText.split('\n').length - 1 && !completed && (
                  <span className="ml-0.5 inline-block animate-pulse text-info">▍</span>
                )}
              </p>
            ))}
          </div>
        ) : (
          <div className="flex h-[190px] items-center justify-center text-center">
            <div>
              <PlayCircle className="mx-auto h-9 w-9 text-info/45" />
              <p className="mt-3 text-xs text-text-muted">点击开始检测后显示识别过程</p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        {config.metrics.map((item) => (
          <div key={item.label} className="rounded bg-[#F1F5F9] px-2 py-2 text-center">
            <p className="text-[10px] text-text-muted">{item.label}</p>
            <p className={cn('mt-1 font-data text-sm font-bold', started ? item.tone : 'text-text-muted')}>
              {started ? item.value : '--'}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-3 rounded-lg bg-[#F1F5F9] p-3">
        <h4 className="text-xs font-semibold text-text-primary">识别明细</h4>
        <div className="mt-2 space-y-2">
          {config.details.map((item) => (
            <div key={item.label} className="flex items-center justify-between rounded bg-white px-3 py-2 text-xs">
              <span className="text-text-muted">{item.label}</span>
              <span className={cn('font-semibold', started ? item.tone : 'text-text-muted')}>
                {started ? item.value : '待识别'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {completed && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            'mt-3 rounded-lg border p-3',
            config.status === 'pass' ? 'border-success/30 bg-success/10' : 'border-warning/40 bg-warning/10',
          )}
        >
          <div className="flex items-center gap-2">
            {config.status === 'pass' ? (
              <CheckCircle2 className="h-4 w-4 text-success" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-warning" />
            )}
            <span className={cn('text-xs font-semibold', config.status === 'pass' ? 'text-success' : 'text-warning')}>
              Agent 建议
            </span>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-text-secondary">{config.suggestion}</p>
        </motion.div>
      )}
    </aside>
  );
};

const CapabilityDemoStation: FC<{ config: CapabilityDemoConfig }> = ({ config }) => {
  const [started, setStarted] = useState(false);

  useEffect(() => {
    setStarted(false);
  }, [config.key]);

  return (
    <div className="grid h-full grid-cols-[300px_1fr_340px] bg-primary">
      <aside className="flex min-h-0 flex-col border-r border-border bg-primary p-3">
        <div className="rounded-lg bg-[#F1F5F9] p-3">
          <div className="flex items-center gap-2">
            {config.key === 'counting' && <Boxes className="h-4 w-4 text-info" />}
            {config.key === 'label-check' && <Tag className="h-4 w-4 text-info" />}
            {config.key === 'ocr' && <FileText className="h-4 w-4 text-info" />}
            {config.key === 'barcode' && <Barcode className="h-4 w-4 text-info" />}
            <h2 className="text-sm font-semibold text-text-primary">{config.title}</h2>
          </div>
          <p className="mt-2 text-xs text-text-secondary">{config.subtitle}</p>
          <div className="mt-3 rounded bg-white px-3 py-2">
            <p className="text-[10px] text-text-muted">任务编号</p>
            <p className="mt-1 font-data text-xs font-semibold text-info">{config.taskNo}</p>
          </div>
        </div>

        <div className="mt-3 rounded-lg bg-[#F1F5F9] p-3">
          <h3 className="text-xs font-semibold text-text-primary">检测项</h3>
          <div className="mt-2 space-y-2">
            {config.details.map((item) => (
              <div key={item.label} className="rounded bg-white px-3 py-2">
                <p className="text-[10px] text-text-muted">{item.label}</p>
                <p className={cn('mt-1 text-xs font-semibold', started ? item.tone : 'text-text-primary')}>
                  {started ? item.value : '待识别'}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-auto rounded-lg border border-info/25 bg-info/10 p-3">
          <p className="text-xs font-semibold text-text-primary">{started ? '检测已启动' : '检测待启动'}</p>
          <p className="mt-1 text-[11px] leading-relaxed text-text-secondary">
            {started ? config.infoText : config.readyText}
          </p>
        </div>
      </aside>

      <main className="flex min-h-0 flex-col gap-3 bg-[#F1F5F9] p-3">
        <div className="flex items-center justify-between rounded-lg border border-info/25 bg-primary px-4 py-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded bg-info px-2 py-0.5 text-[11px] font-bold text-white">DEMO</span>
              <h1 className="text-sm font-semibold text-text-primary">{config.title}</h1>
              <span className="font-data text-xs text-text-muted">{config.taskNo}</span>
            </div>
            <p className="mt-1 text-xs text-text-muted">{started ? config.infoText : config.readyText}</p>
          </div>
          <button
            type="button"
            onClick={() => setStarted((value) => !value)}
            className={cn(
              'flex items-center gap-1.5 rounded-md px-3 py-2 text-xs font-semibold transition-colors',
              started
                ? 'bg-[#F1F5F9] text-text-secondary hover:bg-gray-100'
                : 'bg-info text-white hover:bg-info/90',
            )}
          >
            {started ? <RotateCcw className="h-4 w-4" /> : <PlayCircle className="h-4 w-4" />}
            {started ? '重新检测' : '开始检测'}
          </button>
        </div>

        <section className={cn('mx-auto flex min-h-0 w-full flex-1 flex-col', config.imageFrameClass)}>
          <ImageInspectArea
            imageUrl={config.imageUrl}
            boxes={started ? config.boxes : []}
            status={started ? config.status : 'warning'}
            infoText={started ? config.infoText : config.readyText}
            overlayContent={
              !started ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative h-[58%] w-[58%]">
                    <span className="absolute left-0 top-0 h-5 w-5 border-l-2 border-t-2 border-info" />
                    <span className="absolute right-0 top-0 h-5 w-5 border-r-2 border-t-2 border-info" />
                    <span className="absolute bottom-0 left-0 h-5 w-5 border-b-2 border-l-2 border-info" />
                    <span className="absolute bottom-0 right-0 h-5 w-5 border-b-2 border-r-2 border-info" />
                  </div>
                </div>
              ) : undefined
            }
          />
        </section>

        <section className="grid grid-cols-3 gap-3">
          {config.metrics.map((item) => (
            <div key={item.label} className="rounded-lg bg-primary p-3">
              <p className="text-[11px] text-text-muted">{item.label}</p>
              <p className={cn('mt-1 font-data text-lg font-bold', started ? item.tone : 'text-text-muted')}>
                {started ? item.value : '--'}
              </p>
            </div>
          ))}
        </section>
      </main>

      <DemoAgentPanel started={started} config={config} />
    </div>
  );
};

// ─── State configurations ───
interface StateConfig {
  title: string;
  badge: React.ReactNode;
  resultCardType: 'pass' | 'warning' | 'danger';
  alertSeverity?: 'danger' | 'danger-deep' | 'warning';
  alertTitle?: string;
  alertMessage?: string;
  agentSuggestion: string;
  lines: { label: string; value: string }[];
  infoText: string;
  boxes: DetectBox[];
  imageUrl: string;
  miniCards: {
    history: { title: string; value: string; valueColor?: string };
    standard: { title: string; value: string };
    link: { title: string; value: string; valueColor?: string };
  };
  collaboration: {
    aeNo?: string;
    woNo?: string;
    iqNo?: string;
    clNo?: string;
    reminderStatus: '待提醒' | '已提醒' | '已确认' | '已驳回';
    backendStatus: '待接收' | '已接收' | '处理中' | '已完结';
    handler: string;
    handlerComment: string;
  };
}

const stateConfigs: Record<DetectionState, StateConfig> = {
  pass: {
    title: '检测通过',
    badge: <StatusBadge status="通过" />,
    resultCardType: 'pass',
    agentSuggestion:
      'AI检测全部通过，该包裹可正常入库。建议按标准流程移交上架环节。',
    lines: [
      { label: '检测项', value: '外包装完整性' },
      { label: '置信度', value: '98.2%' },
      { label: '处理耗时', value: '1.1s' },
      { label: 'AI模型', value: 'Quality-v3.2' },
    ],
    infoText: '检测完成：外包装完整性 | 置信度 98.2%',
    boxes: [
      { x: 15, y: 20, w: 30, h: 25, label: '外包装', confidence: 98.2, type: 'pass' },
      { x: 55, y: 30, w: 25, h: 20, label: '标签', confidence: 99.1, type: 'pass' },
    ],
    imageUrl: '/images/inspect-bumper-pass.jpg',
    miniCards: {
      history: { title: '江南华盛', value: '异常率 2.1%', valueColor: 'text-success' },
      standard: { title: '外观标准', value: '版本 v2.1' },
      link: { title: 'PUT-001', value: '已生成', valueColor: 'text-success' },
    },
    collaboration: {
      reminderStatus: '已确认',
      backendStatus: '已接收',
      handler: '收货员-李',
      handlerComment: '检测通过，已确认',
    },
  },
  warning: {
    title: '检测警示',
    badge: <L2Badge />,
    resultCardType: 'warning',
    agentSuggestion:
      '检测到标签轻微磨损，置信度低于标准阈值。建议人工复核后决定是否接收，或降级处理。',
    lines: [
      { label: '检测项', value: '标签完整性' },
      { label: '置信度', value: '85.3%' },
      { label: '检测结果', value: '标签轻微磨损' },
      { label: 'AI模型', value: 'Quality-v3.2' },
    ],
    infoText: '检测中：标签完整性 | 置信度 85.3% | 标签轻微磨损',
    boxes: [
      { x: 15, y: 20, w: 30, h: 25, label: '外包装', confidence: 97.5, type: 'pass' },
      { x: 55, y: 30, w: 25, h: 20, label: '标签', confidence: 85.3, type: 'warning' },
    ],
    imageUrl: '/images/inspect-water-pass.jpg',
    miniCards: {
      history: { title: '江南华盛', value: '异常率 3.2%', valueColor: 'text-warning' },
      standard: { title: '标签标准', value: '版本 v1.8' },
      link: { title: 'WO-0031', value: '处理中', valueColor: 'text-info' },
    },
    collaboration: {
      reminderStatus: '已提醒',
      backendStatus: '已接收',
      handler: '收货员-李',
      handlerComment: '标签轻微磨损，建议人工复核',
    },
  },
  blur: {
    title: '图像不清晰',
    badge: <StatusBadge status="不清晰" />,
    resultCardType: 'warning',
    agentSuggestion:
      'OCR识别置信度不足（61.3% < 80%），可能因光线不足或条码模糊。建议调整包裹位置重新扫描，或切换至高清摄像头。',
    lines: [
      { label: '检测项', value: 'OCR标准号识别' },
      { label: 'OCR置信度', value: '61.3%' },
      { label: '阈值', value: '80%' },
      { label: 'AI模型', value: 'OCR-v2.1' },
    ],
    infoText: 'OCR识别中：标准号读取 | 置信度 61.3% | 低于阈值',
    boxes: [
      { x: 20, y: 25, w: 35, h: 30, label: '标准号区域', confidence: 61.3, type: 'blur' },
    ],
    imageUrl: '/images/inspect-oil-blur.jpg',
    miniCards: {
      history: { title: '江南华盛', value: 'OCR失败率 5.8%', valueColor: 'text-warning' },
      standard: { title: 'OCR标准', value: '版本 v2.1' },
      link: { title: 'AE-005', value: '转人工', valueColor: 'text-warning' },
    },
    collaboration: {
      aeNo: 'AE-005',
      reminderStatus: '已提醒',
      backendStatus: '处理中',
      handler: '质检员-赵',
      handlerComment: 'OCR置信度不足，建议人工复核',
    },
  },
  tagMissing: {
    title: '标签缺失',
    badge: <StatusBadge status="标签缺失" />,
    resultCardType: 'danger',
    alertSeverity: 'warning',
    alertTitle: '标签缺失',
    alertMessage: '未识别到产品标识标签，不符合合规要求',
    agentSuggestion:
      '标签缺失属于L2级别异常。建议立即通知供应商补签，同时将该批次暂存至隔离区。历史数据显示该供应商标签缺失率1.8%，在可控范围内。',
    lines: [
      { label: '检测项', value: '标签完整性' },
      { label: '识别结果', value: '未检测到产品标识标签' },
      { label: '合规依据', value: '《仓储质检规范》第4.2条' },
      { label: '风险等级', value: 'L1' },
    ],
    infoText: '标签检测：未识别到产品标识标签 | 合规异常',
    boxes: [
      { x: 30, y: 30, w: 40, h: 35, label: '标签区域-缺失', type: 'danger' },
    ],
    imageUrl: '/images/inspect-gloves-tag-missing.jpg',
    miniCards: {
      history: { title: '江南华盛', value: '标签缺失率 1.8%', valueColor: 'text-warning' },
      standard: { title: '标签标准', value: '版本 v2.0' },
      link: { title: 'WO-004', value: '待处理', valueColor: 'text-danger' },
    },
    collaboration: {
      aeNo: 'AE-004',
      woNo: 'WO-004',
      reminderStatus: '待提醒',
      backendStatus: '已接收',
      handler: '收货主管-张',
      handlerComment: '标签缺失，暂缓签收，已创建工单',
    },
  },
  defect: {
    title: '外观缺陷',
    badge: <StatusBadge status="NG外观" />,
    resultCardType: 'warning',
    alertSeverity: 'warning',
    alertTitle: '外观缺陷检测：NG件',
    alertMessage: '检测到外包装破损，需人工复核',
    agentSuggestion:
      '外观缺陷判定为NG件。建议拍照存档，标记问题件编号IQ-2024-0003，移交至问题件处理流程。',
    lines: [
      { label: '缺陷类型', value: '外包装破损' },
      { label: '影响件数', value: '2/12' },
      { label: '缺陷位置', value: '箱体右下角' },
      { label: '风险等级', value: 'NG' },
    ],
    infoText: '外观检测：外包装破损 | NG件 2/12 | 箱体右下角',
    boxes: [
      { x: 15, y: 20, w: 30, h: 25, label: 'OK件', confidence: 98.5, type: 'pass' },
      { x: 55, y: 55, w: 25, h: 20, label: '破损区域', type: 'defect' },
    ],
    imageUrl: '/images/inspect-bumper-pass.jpg',
    miniCards: {
      history: { title: '供应商', value: 'NG率 2.5%', valueColor: 'text-defect-badge' },
      standard: { title: '外观标准', value: '版本 v2.1' },
      link: { title: 'IQ-003', value: '待处理', valueColor: 'text-danger' },
    },
    collaboration: {
      iqNo: 'IQ-003',
      reminderStatus: '待提醒',
      backendStatus: '已接收',
      handler: '收货员-李',
      handlerComment: 'NG件已拍照存档，待移交问题件区',
    },
  },
  intercept: {
    title: 'L1 强制拦截',
    badge: <L1Badge />,
    resultCardType: 'danger',
    alertSeverity: 'danger',
    alertTitle: 'L1 强制拦截',
    alertMessage: '严重外包装破损（3件）+ 标签完全缺失',
    agentSuggestion:
      'L1强拦截已触发。该批次存在严重质量问题（3件破损+标签缺失），不建议入库。已自动：1）通知质检主管 2）生成问题件编号 3）记录拦截日志。请等待人工复核或联系主管授权处理。',
    lines: [
      { label: '拦截原因', value: '严重外包装破损+标签缺失' },
      { label: '涉及金额', value: '¥12,800' },
      { label: '风险等级', value: 'L1 强拦截' },
      { label: '处理状态', value: '等待人工确认' },
    ],
    infoText: 'L1拦截：严重破损+标签缺失 | ¥12,800 | 等待人工确认',
    boxes: [
      { x: 10, y: 15, w: 40, h: 30, label: '严重破损x3', type: 'danger' },
      { x: 55, y: 20, w: 30, h: 25, label: '标签缺失', type: 'danger' },
    ],
    imageUrl: '/images/inspect-harness-fail.jpg',
    miniCards: {
      history: { title: '江南华盛', value: '拦截率 8.5%', valueColor: 'text-danger' },
      standard: { title: '拦截标准', value: '版本 v3.0' },
      link: { title: 'IQ-001', value: '已隔离', valueColor: 'text-danger' },
    },
    collaboration: {
      aeNo: 'AE-001',
      woNo: 'WO-001',
      iqNo: 'IQ-001',
      clNo: 'CL-001',
      reminderStatus: '已提醒',
      backendStatus: '处理中',
      handler: '收货主管-张',
      handlerComment: 'L1拦截已触发，等待人工复核',
    },
  },
  multiModal: {
    title: '多模态异常',
    badge: <L1Badge />,
    resultCardType: 'danger',
    alertSeverity: 'danger-deep',
    alertTitle: '多模态异常检测',
    alertMessage: '视觉+重力+红外三模交叉验证失败',
    agentSuggestion:
      '多模态异常检测触发——同时满足视觉异常+温度异常+气体异常三个条件，风险等级最高。已自动联动消防预警系统。请立即：1）疏散周边人员 2）启动应急预案 3）等待安全部门到场。切勿擅自处理。',
    lines: [
      { label: '异常类型', value: '疑似危险品泄漏' },
      { label: '关联模态', value: '视觉+温度+气体' },
      { label: '温度异常', value: '高出常温12°C' },
      { label: 'VOC浓度', value: '超标' },
    ],
    infoText: '多模态异常：视觉+重力+红外 | 疑似危险品泄漏 | 立即隔离',
    boxes: [
      { x: 20, y: 20, w: 35, h: 30, label: '外观变色', type: 'danger' },
      { x: 60, y: 15, w: 25, h: 25, label: '温度异常', type: 'danger' },
    ],
    imageUrl: '/images/inspect-battery-multimodal.jpg',
    miniCards: {
      history: { title: '北方能源', value: '多模态异常 1次', valueColor: 'text-danger' },
      standard: { title: '安全标准', value: '版本 v3.2' },
      link: { title: 'IQ-005', value: '已隔离', valueColor: 'text-danger' },
    },
    collaboration: {
      aeNo: 'AE-006',
      woNo: 'WO-005',
      iqNo: 'IQ-005',
      clNo: 'CL-002',
      reminderStatus: '已提醒',
      backendStatus: '处理中',
      handler: '安全主管-赵',
      handlerComment: '多模态异常，已联动消防预警，等待安全部门',
    },
  },
};

const stationSampleRows = [
  { no: '#02', barcode: 'BPR-2405-002', label: '标签清晰', ocr: '98.1%', status: '通过' },
  { no: '#05', barcode: 'BPR-2405-005', label: '轻微磨损', ocr: '84.7%', status: '复核' },
  { no: '#08', barcode: 'BPR-2405-008', label: '标签清晰', ocr: '96.9%', status: '通过' },
  { no: '#11', barcode: 'BPR-2405-011', label: '待检测', ocr: '-', status: '待检' },
  { no: '#14', barcode: 'BPR-2405-014', label: '待检测', ocr: '-', status: '待检' },
];

const batchCheckRows = [
  { label: '已检', value: '12 件', tone: 'text-info' },
  { label: '通过', value: '10 件', tone: 'text-success' },
  { label: '待复核', value: '1 件', tone: 'text-warning' },
  { label: '拦截', value: '1 件', tone: 'text-danger' },
];

const showAlertStates: DetectionState[] = ['tagMissing', 'defect', 'intercept', 'multiModal'];

// ─── Main component ───
const StationReceiveDefault: FC = () => {
  const [currentState, setCurrentState] = useState<DetectionState>('pass');
  const [alertOpen, setAlertOpen] = useState(false);
  const [beepEnabled, setBeepEnabled] = useState(true);
  const { deliveryOrders } = useData();

  const order = deliveryOrders[0] || deliveryOrderPO007;
  const config = stateConfigs[currentState];

  const handleStateChange = useCallback(
    (state: DetectionState) => {
      setCurrentState(state);
      if (showAlertStates.includes(state)) {
        setAlertOpen(true);
      } else {
        setAlertOpen(false);
      }
    },
    []
  );

  // Compute current item based on state
  const currentItemIndex = useMemo(() => {
    const map: Record<DetectionState, number> = {
      pass: 0,
      warning: 1,
      blur: 5,
      tagMissing: 3,
      defect: 3,
      intercept: 1,
      multiModal: 6,
    };
    return map[currentState] ?? 0;
  }, [currentState]);

  // Agent action buttons based on state
  const renderActionButtons = () => {
    switch (currentState) {
      case 'pass':
        return (
          <div className="flex gap-2">
            <button className="flex-1 rounded bg-success py-2 text-xs font-medium text-white transition-colors hover:bg-success/90">
              确认通过
            </button>
            <button className="rounded bg-[#F1F5F9] px-3 py-2 text-xs text-text-secondary transition-colors hover:bg-gray-100">
              重新检测
            </button>
          </div>
        );
      case 'warning':
        return (
          <div className="flex gap-2">
            <button className="flex-1 rounded bg-warning py-2 text-xs font-medium text-primary-dark transition-colors hover:bg-warning/90">
              人工复查
            </button>
            <button className="rounded bg-[#F1F5F9] px-3 py-2 text-xs text-text-secondary transition-colors hover:bg-gray-100">
              标记警示
            </button>
          </div>
        );
      case 'blur':
        return (
          <div className="flex gap-2">
            <button className="flex-1 rounded bg-warning py-2 text-xs font-medium text-primary-dark transition-colors hover:bg-warning/90">
              人工复核
            </button>
            <button className="rounded bg-[#F1F5F9] px-3 py-2 text-xs text-text-secondary transition-colors hover:bg-gray-100">
              切换摄像头
            </button>
          </div>
        );
      case 'tagMissing':
        return (
          <div className="flex gap-2">
            <button className="flex-1 rounded bg-white py-2 text-xs font-medium text-danger transition-colors hover:bg-white/90">
              通知供应商
            </button>
            <button className="rounded border border-white/50 bg-transparent px-3 py-2 text-xs text-white transition-colors hover:bg-white/10">
              暂存待处理
            </button>
          </div>
        );
      case 'defect':
        return (
          <div className="flex gap-2">
            <button className="flex-1 rounded bg-white py-2 text-xs font-medium text-defect-badge transition-colors hover:bg-white/90">
              人工复核
            </button>
            <button className="rounded border border-white/50 bg-transparent px-3 py-2 text-xs text-white transition-colors hover:bg-white/10">
              创建工单
            </button>
          </div>
        );
      case 'intercept':
        return (
          <div className="flex gap-2">
            <button className="flex-1 rounded bg-white py-2 text-xs font-medium text-danger transition-colors hover:bg-white/90">
              人工复核
            </button>
            <button className="rounded border border-white/50 bg-transparent px-3 py-2 text-xs text-white transition-colors hover:bg-white/10">
              拍照存档
            </button>
          </div>
        );
      case 'multiModal':
        return (
          <div className="flex gap-2">
            <button className="flex-1 rounded bg-danger py-2 text-xs font-medium text-white transition-colors hover:bg-danger/90">
              启动应急预案
            </button>
            <button className="rounded border border-white/50 bg-transparent px-3 py-2 text-xs text-white transition-colors hover:bg-white/10">
              通知安全部门
            </button>
          </div>
        );
    }
  };

  // State icon for the center image area
  const renderStateIcon = () => {
    switch (currentState) {
      case 'pass':
        return <CheckCircle2 className="h-8 w-8 text-success" />;
      case 'warning':
        return <AlertTriangle className="h-8 w-8 text-warning" />;
      case 'blur':
        return <ScanLine className="h-8 w-8 text-warning" />;
      case 'tagMissing':
        return <Tag className="h-8 w-8 text-danger" />;
      case 'defect':
        return <PackageX className="h-8 w-8 text-defect-badge" />;
      case 'intercept':
        return <ShieldAlert className="h-8 w-8 text-danger" />;
      case 'multiModal':
        return <Flame className="h-8 w-8 text-danger" />;
    }
  };

  return (
    <div className="relative flex h-full">
      {/* LEFT COLUMN: Task info */}
      <div className="h-full w-[320px] border-r border-border bg-primary p-3">
        <TaskInfoPanel
          type="receive"
          orderNo={order.orderNo}
          supplier={order.supplier}
          source={`收货台 PKG-01`}
          totalItems={order.items.length}
          weight="23.5kg"
          arrivalTime="09:32:15"
          items={order.items}
          currentItemIndex={currentItemIndex}
        />
      </div>

      {/* CENTER COLUMN: Image area */}
      <div className="flex flex-1 flex-col bg-[#F1F5F9] p-3">
        {/* State switcher toolbar */}
        <div className="mb-2 flex items-center justify-between">
          <StateSwitcher currentState={currentState} onStateChange={handleStateChange} />
          <div className="flex items-center gap-2">
            {showAlertStates.includes(currentState) && (
              <button
                onClick={() => setAlertOpen(!alertOpen)}
                className="rounded bg-primary px-2 py-1 text-[11px] text-text-secondary transition-colors hover:bg-gray-100"
              >
                {alertOpen ? '关闭弹窗' : '显示弹窗'}
              </button>
            )}
            <button
              onClick={() => setBeepEnabled(!beepEnabled)}
              className="rounded bg-primary p-1.5 text-text-secondary transition-colors hover:bg-gray-100"
              title={beepEnabled ? '关闭蜂鸣' : '开启蜂鸣'}
            >
              {beepEnabled ? (
                <Volume2 className="h-3.5 w-3.5" />
              ) : (
                <VolumeX className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
        </div>

        {/* Image inspection area */}
        <ImageInspectArea
          imageUrl={config.imageUrl}
          boxes={config.boxes}
          infoText={config.infoText}
          status={
            currentState === 'tagMissing'
              ? 'tagMissing'
              : currentState === 'defect'
                ? 'defect'
                : currentState === 'multiModal'
                  ? 'multiModal'
                  : currentState === 'pass'
                    ? 'pass'
                    : 'danger'
          }
          overlayContent={
            <div className="absolute top-3 left-3 flex items-center gap-2 rounded bg-[#F1F5F9]/80 px-2 py-1 backdrop-blur-sm">
              {renderStateIcon()}
              <div>
                <span className="text-xs font-medium text-text-primary">{config.title}</span>
                {config.badge}
              </div>
            </div>
          }
        />

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 rounded-lg bg-primary p-3"
        >
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shuffle className="h-4 w-4 text-info" />
              <span className="text-xs font-semibold text-text-primary">抽中样本检测</span>
            </div>
            <span className="rounded bg-info/10 px-2 py-0.5 text-[11px] font-semibold text-info">
              随机 5 / 20 件
            </span>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {stationSampleRows.map((row) => (
              <div
                key={row.no}
                className={cn(
                  'rounded-md border p-2',
                  row.status === '通过'
                    ? 'border-success/30 bg-success/10'
                    : row.status === '复核'
                      ? 'border-warning/40 bg-warning/10'
                      : 'border-border-light bg-white'
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="font-data text-xs font-bold text-text-primary">{row.no}</span>
                  <span
                    className={cn(
                      'rounded px-1.5 py-0.5 text-[10px] font-semibold',
                      row.status === '通过'
                        ? 'bg-success/15 text-success'
                        : row.status === '复核'
                          ? 'bg-warning/15 text-warning'
                          : 'bg-text-muted/15 text-text-muted'
                    )}
                  >
                    {row.status}
                  </span>
                </div>
                <p className="mt-1 truncate font-data text-[10px] text-text-muted">{row.barcode}</p>
                <p className="mt-1 text-[10px] text-text-secondary">{row.label}</p>
                <p className="font-data text-[10px] text-info">OCR {row.ocr}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* OCR confidence bar for blur state */}
        {currentState === 'blur' && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 rounded-lg bg-warning/15 p-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-warning">OCR置信度</span>
              <span className="font-mono text-xs font-bold text-warning">61.3%</span>
            </div>
            <div className="relative mt-2 h-2 overflow-hidden rounded-full bg-border">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '61.3%' }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="h-full rounded-full bg-warning"
              />
              {/* Threshold line at 80% */}
              <div
                className="absolute top-0 h-full w-0.5 bg-danger"
                style={{ left: '80%' }}
              />
            </div>
            <div className="mt-1 flex justify-between">
              <span className="text-[10px] text-text-muted">0%</span>
              <span className="text-[10px] text-danger">阈值 80%</span>
              <span className="text-[10px] text-text-muted">100%</span>
            </div>
            <p className="mt-1 text-[11px] text-warning">
              低于80%阈值，建议重新扫描
            </p>
          </motion.div>
        )}
      </div>

      {/* RIGHT COLUMN: AI judgment + Agent suggestion + Collaboration + Mini cards */}
      <div className="flex h-full w-[340px] flex-col gap-2 overflow-y-auto border-l border-border bg-primary p-3">
        {/* AI Reasoning Panel */}
        <AIReasoningPanel collapsed={true} />

        {/* AI Judgment Summary */}
        <div
          className={cn(
            'overflow-hidden rounded-lg border',
            config.resultCardType === 'pass'
              ? 'border-success bg-success/15'
              : config.resultCardType === 'warning'
                ? 'border-warning bg-warning/15'
                : 'border-danger bg-danger/20'
          )}
        >
          <div
            className={cn(
              'h-1',
              config.resultCardType === 'pass'
                ? 'bg-success'
                : config.resultCardType === 'warning'
                  ? 'bg-warning'
                  : 'bg-danger'
            )}
          />
          <div className="p-3">
            <div className="flex items-center gap-2">
              {config.badge}
              <h4 className="text-sm font-semibold text-text-primary">{config.title}</h4>
            </div>
            <div className="mt-2 space-y-1">
              {config.lines.map((line, i) => (
                <div key={i} className="flex justify-between text-xs">
                  <span className="text-text-muted">{line.label}</span>
                  <span className="font-medium text-text-primary">{line.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Agent suggestion */}
        <AgentSuggestion suggestion={config.agentSuggestion} />

        {(currentState === 'tagMissing' || currentState === 'intercept' || currentState === 'defect') && (
          <div className="rounded-lg bg-white p-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-text-primary">同批次排查</h4>
              <span className="rounded bg-warning/15 px-2 py-0.5 text-[10px] font-semibold text-warning">已触发</span>
            </div>
            <div className="mt-3 grid grid-cols-4 gap-2">
              {batchCheckRows.map((item) => (
                <div key={item.label} className="rounded bg-primary px-2 py-2 text-center">
                  <p className="text-[10px] text-text-muted">{item.label}</p>
                  <p className={`font-data text-sm font-bold ${item.tone}`}>{item.value}</p>
                </div>
              ))}
            </div>
            <p className="mt-2 text-[11px] text-text-secondary">
              系统已把剩余样本加入待检队列，完成后回写到 Admin 工单。
            </p>
          </div>
        )}

        {/* Action buttons */}
        {renderActionButtons()}

        {/* Collaboration receipt */}
        <CollaborationReceipt
          aeNo={config.collaboration.aeNo}
          woNo={config.collaboration.woNo}
          iqNo={config.collaboration.iqNo}
          clNo={config.collaboration.clNo}
          reminderStatus={config.collaboration.reminderStatus}
          backendStatus={config.collaboration.backendStatus}
          handler={config.collaboration.handler}
          handlerComment={config.collaboration.handlerComment}
        />

        {/* Three Mini Cards */}
        <ThreeMiniCards
          historyCard={config.miniCards.history}
          standardCard={config.miniCards.standard}
          linkCard={config.miniCards.link}
        />
      </div>

      {/* FULL-SCREEN ALERTS */}
      <AnimatePresence>
        {alertOpen && currentState === 'tagMissing' && (
          <FullScreenAlert
            visible={alertOpen}
            severity="warning"
            title="标签缺失"
            message="未识别到产品标识标签，不符合合规要求"
            onClose={() => setAlertOpen(false)}
            actionButtons={
              <>
                <button className="rounded bg-white px-4 py-2 text-sm font-medium text-danger transition-colors hover:bg-white/90">
                  通知供应商
                </button>
                <button className="rounded border border-white/50 bg-transparent px-4 py-2 text-sm text-white transition-colors hover:bg-white/10">
                  暂存待处理
                </button>
              </>
            }
          >
            <div className="mt-4 max-w-md rounded-lg bg-white/10 p-3">
              <div className="flex items-start gap-2">
                <BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-white/80" />
                <p className="text-xs leading-relaxed text-white/90">
                  依据《仓储质检规范》第4.2条：入库货品必须具备完整标签，缺失标签的货品应暂停入库并通知供应商补充。
                </p>
              </div>
            </div>
            <div className="mt-3 rounded bg-white/10 p-3 text-left">
              <AgentSuggestion
                label="Agent建议："
                suggestion="标签缺失属于L2级别异常。建议立即通知供应商补签，同时将该批次暂存至隔离区。历史数据显示该供应商标签缺失率1.8%，在可控范围内。"
              />
            </div>
          </FullScreenAlert>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {alertOpen && currentState === 'defect' && (
          <FullScreenAlert
            visible={alertOpen}
            severity="warning"
            title="外观缺陷检测：NG件"
            message="检测到外包装破损，需人工复核"
            onClose={() => setAlertOpen(false)}
            actionButtons={
              <>
                <button className="rounded bg-white px-4 py-2 text-sm font-medium text-defect-badge transition-colors hover:bg-white/90">
                  人工复核
                </button>
                <button className="rounded border border-white/50 bg-transparent px-4 py-2 text-sm text-white transition-colors hover:bg-white/10">
                  创建工单
                </button>
              </>
            }
          >
            <div className="mt-4 grid grid-cols-3 gap-3 text-center">
              <div className="rounded bg-white/10 p-2">
                <p className="text-[10px] text-white/70">缺陷类型</p>
                <p className="text-sm font-medium text-white">外包装破损</p>
              </div>
              <div className="rounded bg-white/10 p-2">
                <p className="text-[10px] text-white/70">影响件数</p>
                <p className="font-mono text-lg font-bold text-accent">2/12</p>
              </div>
              <div className="rounded bg-white/10 p-2">
                <p className="text-[10px] text-white/70">缺陷位置</p>
                <p className="text-sm font-medium text-white">箱体右下角</p>
              </div>
            </div>
            <div className="mt-3 rounded bg-white/10 p-3 text-left">
              <AgentSuggestion
                label="Agent建议："
                suggestion="外观缺陷判定为NG件。建议拍照存档，标记问题件编号IQ-2024-0003，移交至问题件处理流程。"
              />
            </div>
          </FullScreenAlert>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {alertOpen && currentState === 'intercept' && (
          <FullScreenAlert
            visible={alertOpen}
            severity="danger"
            title="L1 强制拦截"
            message="严重外包装破损（3件）+ 标签完全缺失"
            onClose={() => setAlertOpen(false)}
            actionButtons={
              <>
                <button className="rounded bg-white px-4 py-2 text-sm font-medium text-danger transition-colors hover:bg-white/90">
                  人工复核
                </button>
                <button className="rounded border border-white/50 bg-transparent px-4 py-2 text-sm text-white transition-colors hover:bg-white/10">
                  拍照存档
                </button>
              </>
            }
          >
            {/* Timeline */}
            <div className="mt-4 w-full max-w-md space-y-2">
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-white/60" />
                <span className="font-mono text-xs text-white/60">09:32:15</span>
                <span className="text-xs text-white/90">AI检测触发拦截</span>
              </div>
              <div className="flex items-center gap-3">
                <Bell className="h-4 w-4 text-white/60" />
                <span className="font-mono text-xs text-white/60">09:32:16</span>
                <span className="text-xs text-white/90">自动通知质检主管</span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-warning" />
                <span className="font-mono text-xs text-warning">09:32:20</span>
                <span className="text-xs text-warning">等待人工确认</span>
              </div>
            </div>
            <div className="mt-4 rounded bg-white/10 p-3 text-left">
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-white" />
                <L1Badge />
                <span className="text-sm font-bold text-white">强拦截</span>
              </div>
              <p className="mt-2 font-mono text-lg font-bold text-accent">
                涉及金额 ¥12,800
              </p>
            </div>
            <div className="mt-3 rounded bg-white/10 p-3 text-left">
              <AgentSuggestion
                label="Agent建议："
                suggestion="L1强拦截已触发。该批次存在严重质量问题（3件破损+标签缺失），不建议入库。已自动：1）通知质检主管 2）生成问题件编号 3）记录拦截日志。请等待人工复核或联系主管授权处理。"
              />
            </div>
          </FullScreenAlert>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {alertOpen && currentState === 'multiModal' && (
          <FullScreenAlert
            visible={alertOpen}
            severity="danger-deep"
            title="多模态异常检测"
            message="视觉+重力+红外三模交叉验证失败"
            onClose={() => setAlertOpen(false)}
            actionButtons={
              <>
                <button className="rounded bg-danger px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-danger/90">
                  启动应急预案
                </button>
                <button className="rounded border border-white/50 bg-transparent px-4 py-2 text-sm text-white transition-colors hover:bg-white/10">
                  通知安全部门
                </button>
              </>
            }
          >
            {/* Fire alert indicator */}
            <div className="mb-2 flex items-center gap-2">
              <div className="h-3 w-3 animate-pulse rounded-full bg-accent" />
              <span className="rounded bg-accent px-2 py-0.5 text-xs font-bold text-primary-dark">
                消防联动已触发
              </span>
              <L1Badge />
            </div>

            <div className="mt-2 w-full max-w-md rounded-lg bg-white/10 p-3">
              <p className="text-sm font-medium text-white">
                检测到疑似危险品泄漏（化学气味+外观变色+温度异常）
              </p>
              <div className="mt-2 grid grid-cols-3 gap-2">
                <div className="rounded bg-white/10 p-2 text-center">
                  <p className="text-[10px] text-white/70">视觉</p>
                  <p className="text-xs font-medium text-danger">外观变色</p>
                </div>
                <div className="rounded bg-white/10 p-2 text-center">
                  <p className="text-[10px] text-white/70">温度</p>
                  <p className="text-xs font-medium text-danger">高出12°C</p>
                </div>
                <div className="rounded bg-white/10 p-2 text-center">
                  <p className="text-[10px] text-white/70">气体</p>
                  <p className="text-xs font-medium text-danger">VOC超标</p>
                </div>
              </div>
            </div>

            <div className="mt-3 w-full max-w-md space-y-1 rounded bg-white/10 p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/80">消防系统</span>
                <span className="flex items-center gap-1 text-xs text-success">
                  <CheckCircle className="h-3 w-3" /> 已联动
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/80">通风系统</span>
                <span className="flex items-center gap-1 text-xs text-success">
                  <CheckCircle className="h-3 w-3" /> 已启动
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/80">安全部门</span>
                <span className="flex items-center gap-1 text-xs text-warning">
                  <Clock className="h-3 w-3" /> 通知中
                </span>
              </div>
            </div>

            <div className="mt-3 rounded bg-white/10 p-3 text-left">
              <AgentSuggestion
                label="Agent建议："
                suggestion="多模态异常检测触发——同时满足视觉异常+温度异常+气体异常三个条件，风险等级最高。已自动联动消防预警系统。请立即：1）疏散周边人员 2）启动应急预案 3）等待安全部门到场。切勿擅自处理。"
              />
            </div>
          </FullScreenAlert>
        )}
      </AnimatePresence>
    </div>
  );
};

const StationReceive: FC = () => {
  const [searchParams] = useSearchParams();
  const demo = searchParams.get('demo');

  if (isCapabilityDemoKey(demo)) {
    return <CapabilityDemoStation config={capabilityDemoConfigs[demo]} />;
  }

  return <StationReceiveDefault />;
};

export default StationReceive;
