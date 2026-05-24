import type { FC } from 'react';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Barcode, CheckCircle2, FileText, Minus, ScanLine, Tag } from 'lucide-react';
import { DemoStepBadge } from '@/components/shared';
import { recountTasks } from '@/data/mockData';
import { cn } from '@/lib/utils';

type FieldStepKey = 'location' | 'item' | 'label' | 'count';

const fieldSteps: Array<{
  key: FieldStepKey;
  title: string;
  value: string;
  image: string;
  fallback: string;
  icon: typeof ScanLine;
  box: { x: number; y: number; w: number; h: number; tone: 'success' | 'warning'; rotate?: number };
  objectPosition?: string;
  rows: Array<{ label: string; value: string; tone?: 'success' | 'warning' | 'danger' }>;
  agentText: string;
}> = [
  {
    key: 'location',
    title: '扫库位码',
    value: 'A-03-05',
    image: '/images/recount-pda-location-scan.png',
    fallback: '/assets/placeholders/scenario-recount.png',
    icon: ScanLine,
    box: { x: 59, y: 29, w: 29, h: 16, tone: 'success' },
    objectPosition: 'center 18%',
    rows: [
      { label: '库位', value: 'A-03-05', tone: 'success' },
      { label: '库区', value: 'A-03' },
      { label: '状态', value: '已扫', tone: 'success' },
    ],
    agentText: '正在读取货架横梁右侧条码。识别到库位 A-03-05，所属库区 A-03，条码清晰，可进入货物码扫描。',
  },
  {
    key: 'item',
    title: '扫货物码',
    value: 'WATER-550ML',
    image: '/images/recount-pda-item-scan.png',
    fallback: '/images/inspect-water-pass.jpg',
    icon: Barcode,
    box: { x: 33, y: 45, w: 41, h: 39, tone: 'success' },
    objectPosition: 'center 45%',
    rows: [
      { label: 'SKU', value: 'WATER-550ML', tone: 'success' },
      { label: '品名', value: '矿泉水' },
      { label: '状态', value: '已匹配', tone: 'success' },
    ],
    agentText: '正在读取外箱货物码。识别到 SKU WATER-550ML，品名矿泉水，与当前库位盘点任务一致。',
  },
  {
    key: 'label',
    title: '标签巡检',
    value: 'LOT B20260310A',
    image: '/images/recount-pda-label-check.png',
    fallback: '/images/inspect-shelf.jpg',
    icon: Tag,
    box: { x: 20, y: 34, w: 66, h: 55, tone: 'success' },
    objectPosition: 'center 45%',
    rows: [
      { label: '批次', value: 'B20260310A', tone: 'success' },
      { label: '日期', value: '2026-03-10' },
      { label: '数量', value: '20 x 500ml' },
    ],
    agentText: '正在检查外箱标签。批次 B20260310A、生产日期 2026-03-10、箱规 20 x 500ml 均可读，标签无明显破损。',
  },
  {
    key: 'count',
    title: '录入现场数量',
    value: '10 / 12 箱',
    image: '/images/recount-pda-count-entry.png',
    fallback: '/assets/placeholders/scenario-recount.png',
    icon: Minus,
    box: { x: 6, y: 5, w: 86, h: 74, tone: 'warning' },
    objectPosition: 'center 58%',
    rows: [
      { label: '系统', value: '12 箱' },
      { label: '现场', value: '10 箱', tone: 'warning' },
      { label: '差异', value: '-2 箱', tone: 'danger' },
    ],
    agentText: '正在统计画面中的矿泉水箱数。现场可见 10 箱，系统库存 12 箱，少 2 箱，建议提交盘点差异。',
  },
];

const nextStepByKey: Record<FieldStepKey, FieldStepKey | 'result'> = {
  location: 'item',
  item: 'label',
  label: 'count',
  count: 'result',
};

const Recount: FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [, setLabelStatus] = useState<'正常' | '缺失' | '破损'>('正常');
  const [activeStep, setActiveStep] = useState<FieldStepKey>('location');
  const [scanStarted, setScanStarted] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [typedAgentText, setTypedAgentText] = useState('');
  const state = location.state as { taskNo?: string; actualQuantity?: number } | null;
  const recountTask = recountTasks.find((task) => task.taskNo === state?.taskNo) || recountTasks[0];

  const activeFieldStep = fieldSteps.find((step) => step.key === activeStep) ?? fieldSteps[0];
  const ActiveFieldIcon = activeFieldStep.icon;

  useEffect(() => {
    setScanStarted(false);
    setScanComplete(false);
    setTypedAgentText('');
  }, [activeStep]);

  useEffect(() => {
    if (!scanStarted) return;

    setScanComplete(false);
    setTypedAgentText('');
    let index = 0;
    const timer = window.setInterval(() => {
      index += 1;
      setTypedAgentText(activeFieldStep.agentText.slice(0, index));
      if (index >= activeFieldStep.agentText.length) {
        window.clearInterval(timer);
        setScanComplete(true);
      }
    }, 18);

    return () => window.clearInterval(timer);
  }, [activeFieldStep.agentText, scanStarted]);

  const handleDemoNext = () => {
    if (!scanStarted) {
      setScanStarted(true);
      return;
    }
    if (!scanComplete) return;

    const next = nextStepByKey[activeStep];
    if (next === 'result') {
      navigate('/pda/recount/result?scenario=recount', { state: { taskNo: recountTask.taskNo } });
      return;
    }
    setActiveStep(next);
    if (next === 'label') setLabelStatus('正常');
  };

  return (
    <div className="h-full overflow-hidden bg-primary px-4 pt-3 pb-3">
      {/* Info Card */}
      <div className="rounded-lg bg-white p-3">
        <div className="font-data text-sm font-semibold text-info">{recountTask.taskNo}</div>
        <div className="mt-1 text-sm text-text-primary">{recountTask.location} 区域盘点</div>
        <div className="mt-1 text-xs text-text-muted">触发原因：{recountTask.triggerSource}</div>
        <div className="mt-2">
          <span
            className={cn(
              'rounded px-2 py-0.5 text-[11px]',
              activeStep === 'count' && scanComplete
                ? 'bg-danger/10 text-danger'
                : scanComplete
                  ? 'bg-success/10 text-success'
                  : 'bg-warning/15 text-warning',
            )}
          >
            {activeStep === 'count' && scanComplete ? '差异待提交' : scanComplete ? '已识别' : '进行中'}
          </span>
        </div>
      </div>

      <div className="mt-2 overflow-hidden rounded-lg bg-white">
        <div className="relative h-[258px] bg-[#0F172A]">
          <img
            key={activeFieldStep.image}
            src={activeFieldStep.image}
            alt={activeFieldStep.title}
            onError={(event) => {
              const img = event.currentTarget;
              if (img.src.endsWith(activeFieldStep.fallback)) return;
              img.src = activeFieldStep.fallback;
            }}
            className="h-full w-full object-cover"
            style={{ objectPosition: activeFieldStep.objectPosition ?? 'center' }}
          />
          {scanStarted && (
            <div
              className={cn(
                'absolute rounded-md border-2 shadow-[0_0_0_3px_rgba(15,23,42,0.2)]',
                activeFieldStep.box.tone === 'success' ? 'border-success' : 'border-warning',
              )}
              style={{
                left: `${activeFieldStep.box.x}%`,
                top: `${activeFieldStep.box.y}%`,
                width: `${activeFieldStep.box.w}%`,
                height: `${activeFieldStep.box.h}%`,
                transform: activeFieldStep.box.rotate ? `rotate(${activeFieldStep.box.rotate}deg)` : undefined,
                transformOrigin: 'center',
              }}
            >
              <div
                className={cn(
                  'absolute -top-6 left-0 flex items-center gap-1 rounded px-2 py-1 text-[10px] font-semibold text-white',
                  activeFieldStep.box.tone === 'success' ? 'bg-success' : 'bg-warning',
                )}
              >
                <ActiveFieldIcon className="h-3 w-3" />
                {activeFieldStep.title}
              </div>
            </div>
          )}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white">{activeFieldStep.title}</span>
              <span className="rounded bg-white/15 px-2 py-1 font-data text-[11px] text-white">
                {scanComplete ? activeFieldStep.value : '等待扫描'}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-1.5 p-1.5">
          {fieldSteps.map((step, index) => {
            const StepIcon = step.icon;
            const active = step.key === activeStep;
            return (
              <button
                key={step.key}
                onClick={() => setActiveStep(step.key)}
                className={cn(
                  'rounded-md border px-1.5 py-1.5 text-center transition-all',
                  active ? 'border-info bg-info/10 text-info' : 'border-border bg-primary text-text-secondary',
                )}
              >
                <StepIcon className="mx-auto h-4 w-4" />
                <div className="mt-0.5 text-[10px] font-semibold">{index + 1}</div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-2 rounded-lg bg-white p-2.5">
        <div className="mb-2 flex items-center gap-2">
          <CheckCircle2 className={cn('h-4 w-4', scanComplete ? 'text-success' : 'text-text-muted')} />
          <span className="text-xs font-semibold text-text-primary">Agent 识别</span>
          <span
            className={cn(
              'ml-auto rounded px-2 py-0.5 text-[10px]',
              scanComplete ? 'bg-success/10 text-success' : 'bg-info/10 text-info',
            )}
          >
            {scanStarted ? (scanComplete ? '待人工核对' : '识别中') : '未开始'}
          </span>
        </div>
        <p className="min-h-[34px] text-[11px] leading-relaxed text-text-secondary">
          {scanStarted
            ? typedAgentText
            : '点击开始扫描后，PDA 会读取画面中的条码、标签或箱数，并把结果带到下方供人工核对。'}
          {scanStarted && !scanComplete && <span className="ml-0.5 animate-pulse text-info">|</span>}
        </p>
        {scanComplete && (
          <div className="mt-2 grid grid-cols-3 gap-1.5">
            {activeFieldStep.rows.map((row) => (
              <label key={row.label} className="rounded bg-primary px-2 py-1.5">
                <span className="block text-[10px] text-text-muted">{row.label}</span>
                <input
                  defaultValue={row.value}
                  className={cn(
                    'mt-0.5 w-full truncate bg-transparent font-data text-[11px] font-semibold outline-none',
                    row.tone === 'danger'
                      ? 'text-danger'
                      : row.tone === 'warning'
                        ? 'text-warning'
                        : row.tone === 'success'
                          ? 'text-success'
                          : 'text-text-primary',
                  )}
                />
              </label>
            ))}
          </div>
        )}
      </div>

      <div className="mt-2 rounded-lg border border-warning/30 bg-warning/10 p-2.5">
        <p className="text-xs font-semibold text-text-primary">下一步操作</p>
        <p className="mt-0.5 text-[11px] leading-relaxed text-text-secondary">
          {!scanStarted && '请先点击开始扫描，PDA 会自动读取当前画面。'}
          {scanStarted && !scanComplete && 'Agent 正在识别画面，请稍等片刻。'}
          {scanComplete && activeStep === 'location' && '库位 A-03-05 已识别，可继续扫描货物条码。'}
          {scanComplete && activeStep === 'item' && '货物码 WATER-550ML 已匹配，可继续检查外箱标签字段。'}
          {scanComplete && activeStep === 'label' && '标签字段完整，可继续录入现场点数并确认差异。'}
          {scanComplete && activeStep === 'count' && '现场点数 10 箱，系统库存 12 箱，可提交本次 PDA 盘点结果。'}
        </p>
        <button
          onClick={handleDemoNext}
          disabled={scanStarted && !scanComplete}
          className={cn(
            'mt-1.5 flex h-10 w-full items-center justify-center gap-2 rounded text-xs font-semibold text-white',
            scanStarted && !scanComplete ? 'bg-warning/50' : 'bg-warning',
          )}
        >
          <DemoStepBadge step={2} />
          <FileText className="h-4 w-4" />
          {!scanStarted ? '开始扫描' : scanComplete ? (activeStep === 'count' ? '提交盘点结果' : '继续下一项') : '识别中'}
        </button>
      </div>
    </div>
  );
};

export default Recount;
