import type { FC } from 'react';
import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  Barcode,
  CheckCircle2,
  ClipboardCheck,
  Database,
  FileText,
  PackageCheck,
  ScanLine,
  Tag,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { ImageInspectArea, type DetectBox } from '@/components/station';
import { AgentSuggestion } from '@/components/shared';
import { returnInboundOrders } from '@/data/mockData';
import { cn } from '@/lib/utils';

const stationBoxes: DetectBox[] = [
  { x: 18, y: 20, w: 22, h: 28, label: '前轮轴承 12件', confidence: 98.6, type: 'pass' },
  { x: 46, y: 18, w: 24, h: 30, label: '发动机线束 6件', confidence: 94.2, type: 'warning' },
  { x: 35, y: 58, w: 20, h: 18, label: '雨刮电机 3件', confidence: 97.9, type: 'pass' },
  { x: 62, y: 44, w: 8, h: 9, label: '标签磨损', confidence: 82.4, type: 'warning' },
];

const checks = [
  {
    key: '条码重新采集绑定',
    icon: Barcode,
    value: '2/3 已重绑',
    detail: '雨刮电机等待 PDA 扫新码确认',
    tone: 'warning',
  },
  {
    key: '标签完整性复检',
    icon: Tag,
    value: '2 完整 / 1 磨损',
    detail: '未发现缺失、遮挡、倒置、错贴',
    tone: 'warning',
  },
  {
    key: '视觉点数校对',
    icon: ScanLine,
    value: '21/21 件',
    detail: '与 RT-001 明细数量一致',
    tone: 'success',
  },
  {
    key: 'OCR 全量复核',
    icon: FileText,
    value: '7/8 字段通过',
    detail: '发动机线束批次字段待人工确认',
    tone: 'warning',
  },
  {
    key: '分类入库存储',
    icon: Database,
    value: '3 类库位',
    detail: '关键件、标准件、临时位分开入库',
    tone: 'success',
  },
];

export const StationReturnInbound: FC = () => {
  const order = returnInboundOrders[0];
  const [activeCheck, setActiveCheck] = useState(checks[0].key);
  const [submitted, setSubmitted] = useState(false);

  const current = useMemo(
    () => checks.find((item) => item.key === activeCheck) ?? checks[0],
    [activeCheck],
  );

  return (
    <div className="flex h-full">
      <aside className="h-full w-[320px] border-r border-border bg-primary p-3">
        <div className="rounded-lg bg-[#F1F5F9] p-3">
          <div className="flex items-center gap-2">
            <ClipboardCheck className="h-4 w-4 text-info" />
            <h3 className="text-sm font-semibold text-text-primary">退料复检任务</h3>
          </div>
          <div className="mt-3 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-text-muted">退料单</span>
              <span className="font-data text-info">{order.returnNo}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">来源</span>
              <span className="text-text-primary">{order.workshop}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">原因</span>
              <span className="text-text-primary">{order.reason}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">状态</span>
              <span className="text-warning">{submitted ? '复检通过' : order.stationStatus}</span>
            </div>
          </div>
        </div>

        <div className="mt-3 rounded-lg bg-[#F1F5F9] p-3">
          <h3 className="text-xs font-semibold text-text-primary">物料明细</h3>
          <div className="mt-2 space-y-2">
            {order.items.map((item) => (
              <div key={item.id} className="rounded bg-white px-3 py-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-text-primary">{item.materialName}</span>
                  <span className="font-data text-[11px] text-info">
                    {item.actualQty}/{item.expectedQty} {item.unit}
                  </span>
                </div>
                <div className="mt-1 flex items-center justify-between text-[11px] text-text-muted">
                  <span>{item.category}</span>
                  <span>{item.targetLocation}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-3 space-y-2">
          {checks.map((item) => {
            const Icon = item.icon;
            const selected = activeCheck === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setActiveCheck(item.key)}
                className={cn(
                  'flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-left transition-colors',
                  selected ? 'border-info bg-info/10' : 'border-border bg-[#F1F5F9]',
                )}
              >
                <Icon className={cn('h-4 w-4', selected ? 'text-info' : 'text-text-muted')} />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-text-primary">{item.key}</p>
                  <p className="mt-0.5 truncate text-[10px] text-text-muted">{item.value}</p>
                </div>
                {item.tone === 'success' ? (
                  <CheckCircle2 className="h-4 w-4 text-success" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-warning" />
                )}
              </button>
            );
          })}
        </div>
      </aside>

      <main className="flex flex-1 flex-col bg-[#F1F5F9] p-3">
        <div className="mb-3 flex items-center justify-between rounded-lg border border-info/20 bg-primary px-4 py-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded bg-info px-2 py-0.5 text-[11px] font-bold text-white">RET-IN</span>
              <h2 className="text-sm font-semibold text-text-primary">生产退料入库复检</h2>
              <span className="font-data text-xs text-text-muted">{order.returnNo}</span>
            </div>
            <p className="mt-1 text-xs text-text-muted">
              Station 负责标签完整性、视觉点数和 OCR 全量复核，结果回传给 PDA 和 Admin。
            </p>
          </div>
          <button
            onClick={() => setSubmitted(true)}
            className="flex items-center gap-1.5 rounded-md bg-success px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-success/90"
          >
            <PackageCheck className="h-3.5 w-3.5" />
            {submitted ? '已提交' : '提交复检结果'}
          </button>
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-12 gap-3">
          <section className="col-span-8 flex min-h-0 flex-col rounded-lg bg-primary p-3">
            <ImageInspectArea
              imageUrl="/images/station-cam/cam-01-shelf-overview.jpg"
              boxes={stationBoxes}
              status={current.tone === 'success' ? 'pass' : 'warning'}
              infoText={`${current.key}：${current.value}，${current.detail}`}
              overlayContent={
                <div className="absolute left-3 top-3 rounded bg-black/65 px-3 py-2 text-white backdrop-blur-sm">
                  <p className="text-xs font-semibold">{current.key}</p>
                  <p className="mt-1 font-data text-lg font-bold">{current.value}</p>
                </div>
              }
            />
          </section>

          <section className="col-span-4 flex min-h-0 flex-col gap-3">
            <motion.div
              key={current.key}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-lg bg-primary p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs text-text-muted">当前复检项</p>
                  <h3 className="mt-1 text-base font-semibold text-text-primary">{current.key}</h3>
                </div>
                {current.tone === 'success' ? (
                  <CheckCircle2 className="h-5 w-5 text-success" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-warning" />
                )}
              </div>
              <p className="mt-3 font-data text-2xl font-bold text-info">{current.value}</p>
              <p className="mt-2 text-xs leading-relaxed text-text-secondary">{current.detail}</p>
            </motion.div>

            <div className="rounded-lg bg-primary p-4">
              <h3 className="text-sm font-semibold text-text-primary">字段复核结果</h3>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {['料号', '批次', '数量', '供应商', '退料原因', '车间', '旧码', '新码'].map((field) => {
                  const warn = field === '批次';
                  return (
                    <div key={field} className="rounded bg-[#F1F5F9] px-3 py-2">
                      <p className="text-[10px] text-text-muted">{field}</p>
                      <p className={cn('mt-1 text-xs font-semibold', warn ? 'text-warning' : 'text-success')}>
                        {warn ? '待确认' : '通过'}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            <AgentSuggestion
              suggestion="数量一致，标签仅有轻微磨损。建议 Admin 审核通过后，PDA 先把发动机线束入临时位，其余物料按分类库位入库。"
              className="bg-primary"
            />

            {submitted && (
              <div className="rounded-lg bg-success/15 p-3 text-xs text-success">
                复检结果已回传：PDA 可确认入库，Admin 可查看完整记录。
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};

export default StationReturnInbound;
