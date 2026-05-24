import type { FC } from 'react';
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AlertTriangle, CheckCircle2, FileText, Send } from 'lucide-react';
import { problemItems } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { DemoStepBadge } from '@/components/shared';
import { purchaseReceiveGuide } from '@/data/purchaseReceiveGuide';

const receivers = ['质检主管', '收货主管', '安全主管', '巡检员'];
const disposeOptions = [
  { label: '复核通过入库', location: 'A-04-01', tone: 'success' },
  { label: '隔离待整改', location: 'Q-A03', tone: 'warning' },
  { label: '退回供应商', location: 'Q-RETURN', tone: 'danger' },
] as const;
const recountDisposeOptions = [
  { label: '生成盘点差异单', value: 'DIFF-RC-001', tone: 'danger' },
  { label: '提交仓库主管核查', value: '王磊', tone: 'warning' },
  { label: '同步后台库存差异', value: '-2 箱', tone: 'success' },
] as const;
const qualityDisposeOptions = [
  { label: '提交质检确认', value: '质检主管', tone: 'warning' },
  { label: '外观通过，标签待人工录入', value: 'QI-MANUAL', tone: 'success' },
  { label: '暂存待复核', value: 'QI-HOLD', tone: 'danger' },
] as const;

const ProblemHandover: FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isPurchaseGuide = searchParams.get('scenario') === 'purchase-receive';
  const isRecountGuide = searchParams.get('scenario') === 'recount';
  const isQualityGuide = searchParams.get('scenario') === 'daily-quality-check';
  const item = problemItems[0] || {
    problemItemNo: 'IQ-001',
    materialName: '一次性丁腈手套',
    anomalyType: '外箱缺产品标识标签',
    tempLocation: 'TMP-Q01',
    images: ['/images/handover-photo-1.jpg', '/images/handover-photo-2.jpg', '/images/handover-photo-3.jpg'],
  };
  const displayItem = isQualityGuide
    ? {
        problemItemNo: 'QI-20260521-01',
        materialName: '前保险杠',
        anomalyType: '标签/OCR 待核对',
        tempLocation: 'A-01 入库暂存区',
      }
    : isRecountGuide
    ? {
        problemItemNo: 'IQ-RC-001',
        materialName: '矿泉水',
        anomalyType: '漏盘 2 箱',
        tempLocation: 'A-03-05',
      }
    : isPurchaseGuide
    ? {
        problemItemNo: 'IQ-78910',
        materialName: purchaseReceiveGuide.damagedMaterialName,
        anomalyType: purchaseReceiveGuide.damagedIssue,
        tempLocation: purchaseReceiveGuide.tempLocation,
      }
    : item;
  const displayImages = isQualityGuide
    ? [
        '/images/inspect-bumper-line-overhead.png',
        '/images/inspect-bumper-pass.jpg',
        '/images/inspect-bumper-line-overhead.png',
      ]
    : isRecountGuide
    ? [
        '/images/recount-pda-location-scan.png',
        '/images/recount-pda-item-scan.png',
        '/images/recount-pda-count-entry.png',
      ]
    : isPurchaseGuide
    ? [
        '/images/purchase-receive-quarantine.png',
        '/images/purchase-receive-damaged-label.png',
        '/images/purchase-receive-ocr-label.png',
      ]
    : item.images;
  const [receiver, setReceiver] = useState('收货主管');
  const [disposeAction, setDisposeAction] = useState<string>(
    isPurchaseGuide
      ? '复核通过入库'
      : isRecountGuide
        ? '生成盘点差异单'
        : isQualityGuide
          ? '提交质检确认'
          : '隔离待整改',
  );
  const [fixed, setFixed] = useState(isPurchaseGuide);
  const [manualNote, setManualNote] = useState(
    isQualityGuide ? 'PDA 照片可判断外观无明显异常，但样本小标签不可可靠读取，提交质检确认标签字段。' : '',
  );
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    setSubmitted(true);
    setTimeout(() => navigate('/pda'), 1500);
  };

  if (submitted) {
    return (
      <div className="flex h-full flex-col items-center justify-center bg-primary px-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/20">
          <svg className="h-8 w-8 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="mt-4 text-lg font-semibold text-success">{isRecountGuide ? '盘点差异已提交' : '现场处理已登记'}</p>
        <p className="mt-2 text-sm text-text-muted">{displayItem.problemItemNo} · {disposeAction}</p>
      </div>
    );
  }

  if (isRecountGuide) {
    return (
      <div className="flex h-full flex-col bg-primary px-4 py-3">
        <div className="rounded-lg border-2 border-danger/30 bg-danger/10 p-3">
          <div className="inline-flex rounded-full bg-danger px-2 py-0.5 text-[10px] font-bold text-white">
            PDA 盘点差异已带入
          </div>
          <h2 className="mt-2 text-sm font-semibold text-text-primary">提交盘点差异处理</h2>
          <p className="mt-1 text-[11px] leading-relaxed text-text-secondary">
            A-03-05 库位矿泉水系统 12 箱，现场 10 箱，差异 2 箱。照片、库位码、货物码和标签记录已随单保存。
          </p>
        </div>

        <div className="mt-3 rounded-lg bg-white p-3">
          <div className="flex items-center justify-between">
            <span className="font-data text-base font-semibold text-info">{displayItem.problemItemNo}</span>
            <span className="rounded bg-defect-badge px-2 py-0.5 text-[11px] font-bold text-white">
              {displayItem.anomalyType}
            </span>
          </div>
          <div className="mt-2 text-sm text-text-primary">{displayItem.materialName}</div>
          <div className="mt-2 grid grid-cols-3 gap-2 text-center">
            <div className="rounded bg-primary px-2 py-1.5">
              <div className="text-[10px] text-text-muted">库位</div>
              <div className="font-data text-[11px] font-semibold text-info">{displayItem.tempLocation}</div>
            </div>
            <div className="rounded bg-primary px-2 py-1.5">
              <div className="text-[10px] text-text-muted">现场</div>
              <div className="font-data text-[11px] font-semibold text-warning">10 箱</div>
            </div>
            <div className="rounded bg-primary px-2 py-1.5">
              <div className="text-[10px] text-text-muted">差异</div>
              <div className="font-data text-[11px] font-semibold text-danger">-2 箱</div>
            </div>
          </div>
        </div>

        <div className="mt-3">
          <h3 className="mb-2 text-sm font-semibold text-text-primary">现场照片</h3>
          <div className="grid grid-cols-3 gap-2">
            {displayImages.map((src, idx) => (
              <div
                key={src}
                className="h-20 overflow-hidden rounded border border-border bg-white"
              >
                <img src={src} alt={`盘点照片-${idx + 1}`} className="h-full w-full object-cover" />
              </div>
            ))}
          </div>
        </div>

        <div className="mt-3 rounded-lg bg-white p-3">
          <div className="mb-2 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-danger" />
            <h3 className="text-sm font-semibold text-text-primary">处理方式</h3>
          </div>
          <div className="grid grid-cols-1 gap-2">
            {recountDisposeOptions.map((option) => {
              const active = disposeAction === option.label;
              return (
                <button
                  key={option.label}
                  onClick={() => setDisposeAction(option.label)}
                  className={cn(
                    'flex items-center justify-between rounded border px-3 py-2 text-left transition-all',
                    active
                      ? option.tone === 'success'
                        ? 'border-success bg-success/10 text-success'
                        : option.tone === 'danger'
                          ? 'border-danger bg-danger/10 text-danger'
                          : 'border-warning bg-warning/10 text-warning'
                      : 'border-border bg-primary text-text-secondary',
                  )}
                >
                  <span className="text-xs font-semibold">{option.label}</span>
                  <span className="font-data text-[11px]">{option.value}</span>
                </button>
              );
            })}
          </div>
          <div className="mt-3 rounded border border-info/20 bg-info/10 px-3 py-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-info">
              <FileText className="h-4 w-4" />
              后台记录
            </div>
            <p className="mt-1 text-[11px] leading-relaxed text-text-secondary">
              提交后后台生成盘点差异单，仓库主管继续核查移库、领用或丢失原因。
            </p>
          </div>
        </div>

        <div className="mt-auto shrink-0 border-t border-border-light bg-primary pt-3">
          <button
            onClick={handleSubmit}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-md bg-danger-gradient text-sm font-semibold text-white"
          >
            <DemoStepBadge step={4} />
            <Send className="h-4 w-4" />
            生成差异单并同步后台
          </button>
        </div>
      </div>
    );
  }

  if (isQualityGuide) {
    return (
      <div className="flex h-full flex-col bg-primary px-4 py-3">
        <div className="rounded-lg border-2 border-warning/30 bg-warning/10 p-3">
          <div className="inline-flex rounded-full bg-warning px-2 py-0.5 text-[10px] font-bold text-white">
            PDA 抽检异常已带入
          </div>
          <h2 className="mt-2 text-sm font-semibold text-text-primary">提交抽检人工核对</h2>
          <p className="mt-1 text-[11px] leading-relaxed text-text-secondary">
            前保险杠照片可判断外观，但标签与 OCR 字段不可可靠读取，需要提交质检确认或人工录入标签字段。
          </p>
        </div>

        <div className="mt-3 rounded-lg bg-white p-3">
          <div className="flex items-center justify-between">
            <span className="font-data text-base font-semibold text-info">{displayItem.problemItemNo}</span>
            <span className="rounded bg-warning px-2 py-0.5 text-[11px] font-bold text-white">
              {displayItem.anomalyType}
            </span>
          </div>
          <div className="mt-2 text-sm text-text-primary">{displayItem.materialName}</div>
          <div className="mt-2 grid grid-cols-3 gap-2 text-center">
            <div className="rounded bg-primary px-2 py-1.5">
              <div className="text-[10px] text-text-muted">库位</div>
              <div className="font-data text-[11px] font-semibold text-info">A-01</div>
            </div>
            <div className="rounded bg-primary px-2 py-1.5">
              <div className="text-[10px] text-text-muted">样本</div>
              <div className="font-data text-[11px] font-semibold text-success">5 / 20</div>
            </div>
            <div className="rounded bg-primary px-2 py-1.5">
              <div className="text-[10px] text-text-muted">标签</div>
              <div className="font-data text-[11px] font-semibold text-warning">需近拍</div>
            </div>
          </div>
        </div>

        <div className="mt-3">
          <h3 className="mb-2 text-sm font-semibold text-text-primary">现场照片</h3>
          <div className="grid grid-cols-3 gap-2">
            {displayImages.map((src, idx) => (
              <div key={`${src}-${idx}`} className="h-20 overflow-hidden rounded border border-border bg-white">
                <img
                  src={src}
                  alt={`抽检照片-${idx + 1}`}
                  className="h-full w-full object-cover"
                  onError={(event) => {
                    event.currentTarget.src = '/images/inspect-bumper-line-overhead.png';
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="mt-3 rounded-lg bg-white p-3">
          <div className="mb-2 flex items-center gap-2">
            <FileText className="h-4 w-4 text-info" />
            <h3 className="text-sm font-semibold text-text-primary">人工备注</h3>
          </div>
          <textarea
            value={manualNote}
            onChange={(event) => setManualNote(event.target.value)}
            className="h-20 w-full resize-none rounded border border-border bg-primary px-3 py-2 text-xs leading-relaxed text-text-primary outline-none focus:border-info"
            placeholder="请输入现场核对说明、标签字段录入意见或处理意见"
          />
        </div>

        <div className="mt-3 rounded-lg bg-white p-3">
          <div className="mb-2 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-warning" />
            <h3 className="text-sm font-semibold text-text-primary">处理方式</h3>
          </div>
          <div className="grid grid-cols-1 gap-2">
            {qualityDisposeOptions.map((option) => {
              const active = disposeAction === option.label;
              return (
                <button
                  key={option.label}
                  onClick={() => setDisposeAction(option.label)}
                  className={cn(
                    'flex items-center justify-between rounded border px-3 py-2 text-left transition-all',
                    active
                      ? option.tone === 'success'
                        ? 'border-success bg-success/10 text-success'
                        : option.tone === 'danger'
                          ? 'border-danger bg-danger/10 text-danger'
                          : 'border-warning bg-warning/10 text-warning'
                      : 'border-border bg-primary text-text-secondary',
                  )}
                >
                  <span className="text-xs font-semibold">{option.label}</span>
                  <span className="font-data text-[11px]">{option.value}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-auto shrink-0 border-t border-border-light bg-primary pt-3">
          <button
            onClick={handleSubmit}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-md bg-warning text-sm font-semibold text-white"
          >
            <DemoStepBadge step={3} />
            <Send className="h-4 w-4" />
            提交抽检核对结果
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-primary px-4 py-3">
      {isPurchaseGuide && (
        <div className="mb-3 rounded-lg border-2 border-info bg-info/10 p-3 shadow-[0_0_0_3px_rgba(59,130,246,0.08)]">
          <div className="inline-flex rounded-full bg-info px-2 py-0.5 text-[10px] font-bold text-white">
            Station 异常结论已带入
          </div>
          <h2 className="mt-2 text-sm font-semibold text-text-primary">登记现场处置结果</h2>
          <p className="mt-1 text-[11px] leading-relaxed text-text-secondary">
            Station 已完成正式检测。PDA 用于现场补拍、整改确认、隔离或退货登记。
          </p>
        </div>
      )}
      <div className="min-h-0 flex-1 overflow-y-auto pb-3" style={{ scrollbarWidth: 'none' }}>
      {/* Problem Item Info */}
      <div className="rounded-lg bg-white p-3">
        <div className="flex items-center justify-between">
          <span className="font-data text-base font-semibold text-info">{displayItem.problemItemNo}</span>
          <span className="rounded bg-defect-badge px-2 py-0.5 text-[11px] font-bold text-white">
            {displayItem.anomalyType}
          </span>
        </div>
        <div className="mt-2 text-sm text-text-primary">{displayItem.materialName}</div>
        <div className="mt-1 text-xs text-text-muted">
          {isRecountGuide ? '盘点库位' : '临时库位'}：<span className="font-data text-info">{displayItem.tempLocation}</span>
        </div>
        {isPurchaseGuide && (
          <div className="mt-2 grid grid-cols-2 gap-2 text-[11px]">
            <span className="rounded bg-primary px-2 py-1 text-text-secondary">采购单 {purchaseReceiveGuide.purchaseOrderNo}</span>
            <span className="rounded bg-primary px-2 py-1 text-text-secondary">箱序 {purchaseReceiveGuide.damagedCartonNo}</span>
            <span className="rounded bg-primary px-2 py-1 text-text-secondary">料号 {purchaseReceiveGuide.damagedPartNo}</span>
            <span className="rounded bg-primary px-2 py-1 text-text-secondary">数量 {purchaseReceiveGuide.damagedQty}</span>
          </div>
        )}
      </div>

      {/* 3 Photo Thumbnails */}
      <div className="mt-4">
        <h3 className="mb-2 text-sm font-semibold text-text-primary">现场照片</h3>
        <div className="flex gap-2">
          {displayImages.map((src, idx) => (
            <div
              key={idx}
              className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded bg-white border border-border"
            >
              <img src={src} alt={`现场照片-${idx + 1}`} className="h-full w-full object-cover" />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 rounded-lg bg-white p-3">
        <h3 className="mb-2 text-sm font-semibold text-text-primary">整改与去向</h3>
        <label className="flex items-center gap-2 rounded border border-border px-3 py-2">
          <input
            type="checkbox"
            checked={fixed}
            onChange={(e) => setFixed(e.target.checked)}
            className="h-4 w-4 accent-info"
          />
          <span className="text-xs text-text-secondary">问题项已整改，复拍照片已上传</span>
        </label>
        <div className="mt-3 grid grid-cols-1 gap-2">
          {disposeOptions.map((option) => {
            const active = disposeAction === option.label;
            return (
              <button
                key={option.label}
                onClick={() => setDisposeAction(option.label)}
                className={cn(
                  'flex items-center justify-between rounded border px-3 py-2 text-left transition-all',
                  active
                    ? option.tone === 'success'
                      ? 'border-success bg-success/10 text-success'
                      : option.tone === 'danger'
                        ? 'border-danger bg-danger/10 text-danger'
                        : 'border-warning bg-warning/10 text-warning'
                    : 'border-border bg-primary text-text-secondary',
                )}
              >
                <span className="text-xs font-semibold">{option.label}</span>
                <span className="font-data text-[11px]">{option.location}</span>
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-[11px] leading-relaxed text-text-muted">
          {isRecountGuide
            ? '提交后后台生成盘点差异记录，仓库主管继续核查移库、领用或丢失原因。'
            : '现场整改通过后生成上架任务；仍有问题则留在隔离区，等待退货或供应商整改。'}
        </p>
      </div>

      {/* Receiver */}
      <div className="mt-4">
        <label className="mb-2 block text-sm text-text-primary">接收人</label>
        <div className="grid grid-cols-2 gap-2">
          {receivers.map((r) => (
            <button
              key={r}
              onClick={() => setReceiver(r)}
              className={cn('rounded py-2.5 text-xs text-text-primary transition-all',
                receiver === r
                  ? 'border border-info bg-info/15 text-info'
                  : 'border border-border bg-white'
              )}
            >
              {r}
            </button>
          ))}
        </div>
      </div>
      </div>

      {/* Bottom CTA */}
      <div className="shrink-0 border-t border-border-light bg-primary pt-3">
        <button
          onClick={handleSubmit}
          className={cn('flex h-11 w-full items-center justify-center gap-2 rounded-md text-sm font-semibold text-white',
            fixed && disposeAction === '复核通过入库' ? 'bg-success' : 'bg-danger-gradient'
          )}
        >
          {isPurchaseGuide && <DemoStepBadge step={10} />}
          {isRecountGuide && <DemoStepBadge step={4} />}
          {fixed && disposeAction === '复核通过入库' ? <CheckCircle2 className="h-4 w-4" /> : <Send className="h-4 w-4" />}
          确认处理并同步后台
        </button>
      </div>
    </div>
  );
};

export default ProblemHandover;
