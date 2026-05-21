import type { FC } from 'react';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Barcode, Camera, CheckCircle2, FileSearch, Minus, Plus, PlayCircle, Tag } from 'lucide-react';
import { inspectionTasks } from '@/data/mockData';
import { cn } from '@/lib/utils';

const samplingTaskMap = {
  'QI-20260521-01': {
    taskNo: 'QI-20260521-01',
    location: 'A-01 入库区',
    materialName: '前保险杠',
    systemQuantity: 20,
    actualQuantity: 5,
    unit: '件',
    samplePlan: '随机抽取 #02、#05、#08、#11、#14',
    source: '系统抽检规则',
    mode: '抽检',
  },
  'QI-20260521-03': {
    taskNo: 'QI-20260521-03',
    location: 'A-04-01',
    materialName: '丁腈手套',
    systemQuantity: 40,
    actualQuantity: 40,
    unit: '盒',
    samplePlan: '标签缺失后同批次排查 40 / 40',
    source: '异常触发',
    mode: '整批排查',
  },
};

const evidenceMap: Record<string, { src: string; label: string; status: string; boxes: { className: string; label: string }[] }> = {
  'QI-20260521-01': {
    src: '/images/inspect-bumper-line-overhead.png',
    label: '前保险杠样本图',
    status: '5 件样本已锁定',
    boxes: [
      { className: 'left-[7%] top-[15%] h-[25%] w-[18%]', label: '#02' },
      { className: 'left-[31%] top-[15%] h-[25%] w-[18%]', label: '#05' },
      { className: 'left-[55%] top-[15%] h-[25%] w-[18%]', label: '#08' },
      { className: 'left-[19%] top-[56%] h-[25%] w-[18%]', label: '#11' },
      { className: 'left-[67%] top-[56%] h-[25%] w-[18%]', label: '#14' },
    ],
  },
  'QI-20260521-03': {
    src: '/images/inspect-gloves-tag-missing.jpg',
    label: '丁腈手套标签图',
    status: '标签缺失待补标',
    boxes: [
      { className: 'left-[47%] top-[31%] h-[36%] w-[39%] border-warning', label: '缺失标签区' },
    ],
  },
};

const InspectCheck: FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const taskNo = (location.state as { taskNo?: string } | null)?.taskNo || 'INS-002';
  const samplingTask = samplingTaskMap[taskNo as keyof typeof samplingTaskMap];
  const task = samplingTask || inspectionTasks.find((item) => item.taskNo === taskNo) || inspectionTasks[1] || inspectionTasks[0];
  const [count, setCount] = useState<number>(task.actualQuantity ?? 0);
  const [anomaly, setAnomaly] = useState(false);
  const [anomalyType, setAnomalyType] = useState('');
  const [photoCaptured, setPhotoCaptured] = useState(false);
  const evidence = evidenceMap[task.taskNo] ?? {
    src: '/images/inspect-shelf.jpg',
    label: '库位现场图',
    status: '库位标签与货物已入镜',
    boxes: [{ className: 'left-[16%] top-[36%] h-[22%] w-[66%]', label: task.location }],
  };

  const systemQty = samplingTask ? task.actualQuantity ?? task.systemQuantity : task.systemQuantity;
  const diff = count - systemQty;

  const handleSubmit = () => {
    if (diff !== 0) {
      navigate('/pda/recount', { state: { taskNo: task.taskNo, actualQuantity: count } });
    } else {
      navigate('/pda');
    }
  };

  return (
    <div className="h-full bg-primary px-4 pt-3 pb-4">
      {/* Inspect Info Card */}
      <div className="rounded-lg bg-white p-3">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold text-text-primary">巡检区域：{task.location}</div>
          {samplingTask && (
            <span className="rounded bg-info/10 px-2 py-0.5 text-[11px] font-semibold text-info">{samplingTask.mode}</span>
          )}
        </div>
        <div className="mt-1 text-xs text-text-primary">物资：{task.materialName}</div>
        <div className="mt-1 text-xs text-text-muted">
          {samplingTask ? `${samplingTask.source}：${samplingTask.samplePlan}` : '检查货品摆放是否整齐，标签是否完好'}
        </div>
      </div>

      {samplingTask && (
        <div className="mt-3 grid grid-cols-3 gap-2">
          {[
            { icon: Barcode, label: '条码核查', value: '待扫码' },
            { icon: Tag, label: '标签巡检', value: '拍照确认' },
            { icon: FileSearch, label: 'OCR字段', value: '料号/批次' },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="rounded-lg bg-white p-2">
                <Icon className="h-4 w-4 text-info" />
                <p className="mt-1 text-[10px] text-text-muted">{item.label}</p>
                <p className="text-[11px] font-semibold text-text-primary">{item.value}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* Photo Area */}
      <div className="mt-4">
        <h3 className="mb-2 text-sm font-semibold text-text-primary">拍照记录</h3>
        <div className="relative overflow-hidden rounded-lg bg-white">
          <img src={evidence.src} alt={evidence.label} className="h-40 w-full object-cover" />
          <div className="absolute left-2 top-2 rounded bg-black/60 px-2 py-1 text-[10px] font-semibold text-white">
            {evidence.status}
          </div>
          {photoCaptured &&
            evidence.boxes.map((box) => (
              <div key={box.label} className={cn('absolute rounded border-2 border-info shadow-[0_0_0_2px_rgba(59,130,246,0.18)]', box.className)}>
                <span className="absolute -top-5 left-0 rounded bg-info px-1.5 py-0.5 text-[10px] font-semibold text-white">
                  {box.label}
                </span>
              </div>
            ))}
        </div>
        <button
          onClick={() => setPhotoCaptured(true)}
          className={cn(
            'mt-2 flex h-10 w-full items-center justify-center gap-2 rounded text-xs font-semibold',
            photoCaptured ? 'bg-success text-white' : 'bg-info text-white',
          )}
        >
          {photoCaptured ? <CheckCircle2 className="h-4 w-4" /> : <Camera className="h-4 w-4" />}
          {photoCaptured ? '照片已采集，继续提交' : '拍照并识别样本'}
        </button>
        <div className="mt-2 grid grid-cols-4 gap-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex h-14 items-center justify-center rounded bg-white">
              <Camera className={cn('h-5 w-5', photoCaptured ? 'text-success' : 'text-text-muted')} />
            </div>
          ))}
        </div>
      </div>

      {/* AI Appearance Result */}
      <div className="mt-4 rounded-lg border border-success/30 bg-success/10 p-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-success">{samplingTask ? '样本初检' : 'AI外观检测'}</span>
          <span className={cn('rounded px-2 py-0.5 text-[11px] font-bold text-white', photoCaptured ? 'bg-success' : 'bg-text-muted')}>
            {photoCaptured ? '正常' : '待识别'}
          </span>
        </div>
        <div className="mt-1 text-xs text-text-secondary">
          {photoCaptured
            ? samplingTask
              ? '条码可识别，标签字段完整，OCR 置信度 96.8%'
              : '包装完整，标签清晰，无外观缺陷'
            : '请先点击“拍照并识别样本”。'}
        </div>
        {samplingTask && (
          <div className="mt-2 flex items-center gap-1 text-[11px] text-success">
            <CheckCircle2 className="h-3.5 w-3.5" />
            当前样本记录会随任务回传到 Admin。
          </div>
        )}
      </div>

      {/* Manual Count */}
      <div className="mt-4">
        <h3 className="mb-2 text-sm font-semibold text-text-primary">人工计数</h3>
        <div className="flex items-center justify-center gap-6">
          <button
            onClick={() => setCount(Math.max(0, count - 1))}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-text-primary active:bg-border"
          >
            <Minus className="h-5 w-5" />
          </button>
          <span className="font-data text-2xl font-bold text-text-primary">{count}</span>
          <button
            onClick={() => setCount(count + 1)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-text-primary active:bg-border"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-2 text-center">
          <span className="text-xs text-text-muted">系统数量：{systemQty}</span>
          {count > 0 && (
            <span className={cn('ml-3 text-xs font-semibold', diff === 0 ? 'text-success' : 'text-warning')}>
              差异：{diff > 0 ? '+' : ''}{diff}
            </span>
          )}
        </div>
      </div>

      {/* Anomaly Toggle */}
      <div className="mt-4 flex items-center gap-3">
        <span className="text-sm text-text-primary">发现异常</span>
        <button
          onClick={() => setAnomaly(!anomaly)}
          className={cn('h-6 w-11 rounded-full transition-colors', anomaly ? 'bg-info' : 'bg-border')}
        >
          <div className={cn('h-5 w-5 rounded-full bg-white shadow transition-transform', anomaly ? 'translate-x-6' : 'translate-x-0.5')} />
        </button>
      </div>

      {anomaly && (
        <div className="mt-3 space-y-2">
          {['标签缺失', '外观破损', '数量不符', '其他'].map((type) => (
            <button
              key={type}
              onClick={() => setAnomalyType(type)}
              className={cn('w-full rounded bg-white px-3 py-2 text-left text-xs text-text-primary transition-all',
                anomalyType === type && 'border border-info'
              )}
            >
              {type}
            </button>
          ))}
        </div>
      )}

      {/* Bottom CTA */}
      <div className="mt-6">
        <button
          onClick={() => {
            if (!photoCaptured) {
              setPhotoCaptured(true);
              return;
            }
            handleSubmit();
          }}
          className={cn('flex h-11 w-full items-center justify-center gap-2 rounded-md text-sm font-semibold text-white',
            !photoCaptured ? 'bg-info' : diff !== 0 ? 'bg-warning' : 'bg-accent-gradient'
          )}
        >
          {!photoCaptured && <PlayCircle className="h-4 w-4" />}
          {photoCaptured ? (diff !== 0 ? '差异确认 → 盘点复点' : '提交巡检结果') : '先拍照识别，再提交'}
        </button>
        {samplingTask && anomaly && (
          <button
            onClick={() => navigate('/pda/problem/handover')}
            className="mt-2 h-10 w-full rounded-md border border-warning bg-white text-sm font-semibold text-warning"
          >
            生成同批次排查任务
          </button>
        )}
      </div>
    </div>
  );
};

export default InspectCheck;
