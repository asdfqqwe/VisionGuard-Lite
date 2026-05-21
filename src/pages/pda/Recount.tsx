import type { FC } from 'react';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Camera, CheckCircle2, MonitorCheck, ScanLine, Smartphone, Tag } from 'lucide-react';
import { inspectionTasks, recountTasks } from '@/data/mockData';
import { cn } from '@/lib/utils';

const recountData = [
  { materialName: '矿泉水', systemQty: 12, actualQty: 10, unit: '箱' },
  { materialName: '丁腈手套', systemQty: 40, actualQty: 40, unit: '盒' },
  { materialName: '前轮轴承', systemQty: 20, actualQty: 20, unit: '件' },
  { materialName: '5W-40机油', systemQty: 6, actualQty: 6, unit: '桶' },
];

const Recount: FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [locationScanned, setLocationScanned] = useState(true);
  const [barcodeScanned, setBarcodeScanned] = useState(true);
  const [labelStatus, setLabelStatus] = useState<'正常' | '缺失' | '破损'>('正常');
  const [detectionMode, setDetectionMode] = useState<'pda' | 'station'>('pda');
  const state = location.state as { taskNo?: string; actualQuantity?: number } | null;
  const recountTask = recountTasks.find((task) => task.taskNo === state?.taskNo) || recountTasks[0];
  const inspectionTask = inspectionTasks.find((task) => task.taskNo === state?.taskNo || task.location === recountTask.location);
  const currentRows = inspectionTask
    ? [{
        materialName: inspectionTask.materialName,
        systemQty: inspectionTask.systemQuantity,
        actualQty: state?.actualQuantity ?? inspectionTask.actualQuantity ?? inspectionTask.systemQuantity,
        unit: inspectionTask.unit,
      }]
    : recountData;

  const hasDiff = currentRows.some(r => r.systemQty !== r.actualQty);
  const readyToSubmit = locationScanned && barcodeScanned;

  return (
    <div className="h-full bg-primary px-4 pt-3 pb-4">
      {/* Info Card */}
      <div className="rounded-lg bg-white p-3">
        <div className="font-data text-sm font-semibold text-info">{recountTask.taskNo}</div>
        <div className="mt-1 text-sm text-text-primary">{recountTask.location} 区域盘点</div>
        <div className="mt-1 text-xs text-text-muted">触发原因：{recountTask.triggerSource}{inspectionTask ? `（${inspectionTask.taskNo}）` : ''}</div>
        <div className="mt-2">
          <span className="rounded bg-warning/15 px-2 py-0.5 text-[11px] text-warning">进行中</span>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <button
          onClick={() => setLocationScanned(true)}
          className={cn(
            'rounded-lg border bg-white p-3 text-left transition-all',
            locationScanned && 'border-success bg-success/10',
          )}
        >
          <div className="flex items-center gap-2">
            <ScanLine className={cn('h-4 w-4', locationScanned ? 'text-success' : 'text-info')} />
            <span className="text-xs font-semibold text-text-primary">扫库位码</span>
          </div>
          <div className="mt-1 font-data text-xs text-text-secondary">{recountTask.location}</div>
          {locationScanned && <div className="mt-1 text-[11px] text-success">库位已确认</div>}
        </button>
        <button
          onClick={() => setBarcodeScanned(true)}
          className={cn(
            'rounded-lg border bg-white p-3 text-left transition-all',
            barcodeScanned && 'border-success bg-success/10',
          )}
        >
          <div className="flex items-center gap-2">
            <ScanLine className={cn('h-4 w-4', barcodeScanned ? 'text-success' : 'text-info')} />
            <span className="text-xs font-semibold text-text-primary">扫货物码</span>
          </div>
          <div className="mt-1 font-data text-xs text-text-secondary">SKU-{recountTask.taskNo.replace('RC-', 'INV-')}</div>
          {barcodeScanned && <div className="mt-1 text-[11px] text-success">物资匹配</div>}
        </button>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        <button
          onClick={() => navigate('/station/recount?scenario=recount')}
          className="flex h-10 items-center justify-center rounded bg-info text-[11px] font-semibold text-white"
        >
          Station 复核
        </button>
        <button
          onClick={() => navigate('/pda/recount/result', { state: { taskNo: recountTask.taskNo } })}
          className="flex h-10 items-center justify-center rounded bg-warning text-[11px] font-semibold text-white"
        >
          处理差异
        </button>
        <button
          onClick={() => navigate('/pda')}
          className="flex h-10 items-center justify-center rounded bg-success text-[11px] font-semibold text-white"
        >
          确认无误
        </button>
      </div>

      <div className="mt-3 rounded-lg border border-warning/30 bg-warning/10 p-3">
        <p className="text-xs font-semibold text-text-primary">下一步操作</p>
        <p className="mt-1 text-[11px] leading-relaxed text-text-secondary">
          当前库位和货物条码已预填确认。可直接处理数量差异，或送 Station 做整箱视觉复核。
        </p>
      </div>

      <div className="mt-3 rounded-lg bg-white p-3">
        <div className="mb-2 flex items-center gap-2">
          <Tag className="h-4 w-4 text-info" />
          <h3 className="text-sm font-semibold text-text-primary">标签巡检</h3>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {(['正常', '缺失', '破损'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setLabelStatus(status)}
              className={cn(
                'rounded border px-2 py-2 text-xs font-semibold',
                labelStatus === status
                  ? status === '正常'
                    ? 'border-success bg-success/10 text-success'
                    : 'border-warning bg-warning/10 text-warning'
                  : 'border-border bg-primary text-text-secondary',
              )}
            >
              {status}
            </button>
          ))}
        </div>
        <p className="mt-2 text-[11px] leading-relaxed text-text-muted">
          检查标签是否缺失、破损、遮挡、倒置或错贴；异常可在结果页补打整改。
        </p>
      </div>

      <div className="mt-3 rounded-lg bg-white p-3">
        <div className="mb-2 flex items-center gap-2">
          <Camera className="h-4 w-4 text-info" />
          <h3 className="text-sm font-semibold text-text-primary">检测方式</h3>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {[
            { key: 'pda', label: 'PDA 就地检测', icon: Smartphone, text: '拍照 + 人工修正' },
            { key: 'station', label: '送 Station', icon: MonitorCheck, text: '整箱 / 大件视觉计数' },
          ].map((item) => {
            const Icon = item.icon;
            const active = detectionMode === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setDetectionMode(item.key as 'pda' | 'station')}
                className={cn(
                  'rounded-lg border px-3 py-2 text-left transition-all',
                  active ? 'border-info bg-info/10 text-info' : 'border-border bg-primary text-text-secondary',
                )}
              >
                <Icon className="h-4 w-4" />
                <div className="mt-1 text-xs font-semibold">{item.label}</div>
                <div className="mt-0.5 text-[10px] text-text-muted">{item.text}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3-Column Comparison Table */}
      <div className="mt-4">
        <h3 className="mb-2 text-sm font-semibold text-text-primary">数量对比</h3>
        <div className="overflow-hidden rounded-lg border border-border">
          {/* Header */}
          <div className="grid grid-cols-3 bg-primary">
            <div className="px-2 py-2 text-center text-[11px] text-text-muted">系统数量</div>
            <div className="px-2 py-2 text-center text-[11px] text-text-muted">现场数量</div>
            <div className="px-2 py-2 text-center text-[11px] text-text-muted">差异值</div>
          </div>
          {/* Rows */}
          {currentRows.map((row, idx) => {
            const diff = row.actualQty - row.systemQty;
            return (
              <div key={idx} className={cn('grid grid-cols-3 border-t border-border',
                idx % 2 === 0 ? 'bg-white' : 'bg-transparent'
              )}>
                <div className="px-2 py-2.5 text-center font-data text-sm text-text-primary">{row.systemQty}</div>
                <div className="px-2 py-2.5 text-center font-data text-sm text-text-primary">{row.actualQty}</div>
                <div className={cn('px-2 py-2.5 text-center font-data text-sm font-semibold',
                  diff > 0 ? 'text-warning' : diff < 0 ? 'text-danger' : 'text-success'
                )}>
                  {diff > 0 ? '+' : ''}{diff}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Diff Warning */}
      {hasDiff && (
        <div className="mt-4 rounded-lg border border-warning/30 bg-warning/10 p-3">
          <div className="text-xs font-semibold text-warning">差异警告</div>
          <div className="mt-1 text-xs text-text-secondary">发现数量差异，建议转问题件并查监控</div>
        </div>
      )}

      {/* Agent Suggestion */}
      <div className="mt-4 rounded-md border-l-[3px] border-l-info bg-white p-3">
        <span className="text-xs font-semibold text-info">Agent建议：</span>
        <p className="mt-1 text-xs leading-relaxed text-text-secondary">
          {detectionMode === 'station'
            ? '整箱或大件建议送 Station 做视觉计数与 OCR 复核；结果会带回盘点报告。'
            : '就地巡检建议保留库位码、货物码、标签状态和现场照片，差异项转人工复核。'}
        </p>
      </div>

      <div className="mt-3 flex items-center gap-2 rounded-lg bg-white p-3">
        <CheckCircle2 className={cn('h-4 w-4', readyToSubmit ? 'text-success' : 'text-text-muted')} />
        <div>
          <div className="text-xs font-semibold text-text-primary">
            {readyToSubmit ? '库位与货物已核对' : '请先完成库位和货物条码核对'}
          </div>
          <div className="mt-0.5 text-[10px] text-text-muted">标签：{labelStatus} · 检测：{detectionMode === 'station' ? 'Station' : 'PDA'}</div>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="mt-6 flex gap-3">
        <button
          onClick={() => navigate('/pda/recount/result', { state: { taskNo: recountTask.taskNo } })}
          className={cn(
            'flex h-11 flex-1 items-center justify-center rounded text-sm font-semibold text-white',
            'bg-warning',
          )}
        >
          处理差异
        </button>
        <button
          onClick={() => navigate('/pda')}
          className={cn(
            'flex h-11 flex-1 items-center justify-center rounded text-sm font-semibold text-white',
            labelStatus === '正常' ? 'bg-success' : 'bg-success/40',
          )}
        >
          确认无误
        </button>
      </div>
    </div>
  );
};

export default Recount;
