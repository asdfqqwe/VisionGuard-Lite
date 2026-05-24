import type { FC } from 'react';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AlertTriangle, Camera, CheckCircle2, ClipboardCheck, PlayCircle } from 'lucide-react';
import { DemoStepBadge } from '@/components/shared';
import { cn } from '@/lib/utils';

const taskMap = {
  'QI-20260521-01': {
    taskNo: 'QI-20260521-01',
    location: 'A-01 入库暂存区',
    materialName: '前保险杠',
    samplePlan: '抽 5 / 20 件',
    source: '日常质量抽检规则',
    image: '/images/inspect-bumper-line-overhead.png',
    summary: '前保险杠抽检样本',
  },
  'QI-20260521-02': {
    taskNo: 'QI-20260521-02',
    location: 'A-06-03',
    materialName: '5W-40 机油',
    samplePlan: '抽 2 / 6 桶',
    source: '效期巡检',
    image: '/images/inspect-oil-line-overhead.png',
    summary: '机油抽检样本',
  },
  'QI-20260521-03': {
    taskNo: 'QI-20260521-03',
    location: 'B-01-02',
    materialName: '前轮轴承',
    samplePlan: '抽 3 / 20 件',
    source: '重点物资抽检',
    image: '/images/inspect-bearing-pass.jpg',
    summary: '轴承抽检样本',
  },
};

const agentText =
  '正在一次性识别当前抽检画面。画面中可见 8 件前保险杠，其中本次抽检样本按任务锁定 5 件；外观未见明显划伤、变形和缺角。当前照片中小标签不可可靠读取，建议提交抽检核对，由质检人员确认标签字段。';

const resultRows = [
  { label: '样本数量', value: '5 / 20 件', tone: 'success' },
  { label: '外观结论', value: '未见异常', tone: 'success' },
  { label: '标签/OCR', value: '需近拍', tone: 'warning' },
];

const InspectCheck: FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const taskNo = (location.state as { taskNo?: string } | null)?.taskNo || 'QI-20260521-01';
  const task = taskMap[taskNo as keyof typeof taskMap] ?? taskMap['QI-20260521-01'];
  const [scanStarted, setScanStarted] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [typedAgentText, setTypedAgentText] = useState('');

  useEffect(() => {
    if (!scanStarted) return;

    setScanComplete(false);
    setTypedAgentText('');
    let index = 0;
    const timer = window.setInterval(() => {
      index += 1;
      setTypedAgentText(agentText.slice(0, index));
      if (index >= agentText.length) {
        window.clearInterval(timer);
        setScanComplete(true);
      }
    }, 18);

    return () => window.clearInterval(timer);
  }, [scanStarted]);

  const handleAction = () => {
    if (!scanStarted) {
      setScanStarted(true);
      return;
    }
    if (!scanComplete) return;
    navigate('/pda/problem/handover?scenario=daily-quality-check');
  };

  return (
    <div className="h-full overflow-hidden bg-primary px-4 pt-3 pb-3">
      <div className="rounded-lg bg-white p-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-data text-sm font-semibold text-info">{task.taskNo}</div>
            <div className="mt-1 text-sm font-semibold text-text-primary">{task.location}</div>
          </div>
          <span
            className={cn(
              'rounded px-2 py-0.5 text-[11px] font-semibold',
              scanComplete ? 'bg-success/10 text-success' : 'bg-info/10 text-info',
            )}
          >
            {scanComplete ? '待提交' : '抽检中'}
          </span>
        </div>
        <div className="mt-1 text-xs text-text-primary">物资：{task.materialName}</div>
        <div className="mt-1 text-xs text-text-muted">{task.source}：{task.samplePlan}</div>
      </div>

      <div className="mt-2 overflow-hidden rounded-lg bg-white">
        <div className="relative h-[258px] bg-[#0F172A]">
          <img src={task.image} alt={task.summary} className="h-full w-full object-cover" />
          {scanStarted && (
            <div
              className="absolute rounded-md border-2 border-success shadow-[0_0_0_3px_rgba(15,23,42,0.18)]"
              style={{ left: '5%', top: '13%', width: '90%', height: '72%' }}
            >
              <div className="absolute -top-6 left-0 flex items-center gap-1 rounded bg-success px-2 py-1 text-[10px] font-semibold text-white">
                <Camera className="h-3 w-3" />
                一次识别
              </div>
            </div>
          )}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white">样本外观抽检</span>
              <span className="rounded bg-white/15 px-2 py-1 text-[11px] text-white">
                {scanComplete ? '识别完成' : '等待识别'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-2 rounded-lg bg-white p-2.5">
        <div className="mb-2 flex items-center gap-2">
          <CheckCircle2 className={cn('h-4 w-4', scanComplete ? 'text-success' : 'text-text-muted')} />
          <span className="text-xs font-semibold text-text-primary">Agent 识别</span>
          <span
            className={cn(
              'ml-auto rounded px-2 py-0.5 text-[10px]',
              scanComplete ? 'bg-warning/10 text-warning' : 'bg-info/10 text-info',
            )}
          >
            {scanStarted ? (scanComplete ? '待人工核对' : '识别中') : '未开始'}
          </span>
        </div>
        <p className="min-h-[54px] text-[11px] leading-relaxed text-text-secondary">
          {scanStarted ? typedAgentText : '点击开始识别后，PDA 会一次性读取样本数量、外观状态和标签可见性。'}
          {scanStarted && !scanComplete && <span className="ml-0.5 animate-pulse text-info">|</span>}
        </p>
        {scanComplete && (
          <div className="mt-2 grid grid-cols-3 gap-1.5">
            {resultRows.map((row) => (
              <label key={row.label} className="rounded bg-primary px-2 py-1.5">
                <span className="block text-[10px] text-text-muted">{row.label}</span>
                <input
                  defaultValue={row.value}
                  className={cn(
                    'mt-0.5 w-full truncate bg-transparent font-data text-[11px] font-semibold outline-none',
                    row.tone === 'warning' ? 'text-warning' : 'text-success',
                  )}
                />
              </label>
            ))}
          </div>
        )}
      </div>

      <div className="mt-2 rounded-lg border border-warning/30 bg-warning/10 p-2.5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-text-primary">人工核对</p>
            <p className="mt-0.5 text-[11px] text-text-secondary">
              {scanComplete ? '系统已生成抽检记录草稿，提交后进入人工核对详情。' : '请先开始识别当前画面。'}
            </p>
          </div>
        </div>
        {scanComplete && (
          <div className="mt-2 flex items-center gap-1.5 rounded bg-white px-2 py-1.5 text-[11px] text-warning">
            <AlertTriangle className="h-3.5 w-3.5" />
            标签/OCR 未自动通过，提交后由人工在核对详情中处理。
          </div>
        )}
        <button
          onClick={handleAction}
          disabled={scanStarted && !scanComplete}
          className={cn(
            'mt-2 flex h-10 w-full items-center justify-center gap-2 rounded text-xs font-semibold text-white',
            scanStarted && !scanComplete ? 'bg-info/50' : 'bg-info',
          )}
        >
          <DemoStepBadge step={2} />
          {!scanStarted ? <PlayCircle className="h-4 w-4" /> : <ClipboardCheck className="h-4 w-4" />}
          {!scanStarted ? '开始识别' : scanComplete ? '提交抽检记录' : '识别中'}
        </button>
      </div>
    </div>
  );
};

export default InspectCheck;
