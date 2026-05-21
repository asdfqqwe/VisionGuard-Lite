import type { FC } from 'react';
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  AlertTriangle,
  CalendarClock,
  Camera,
  ClipboardList,
  Database,
  FileText,
  ListChecks,
  MonitorCheck,
  PackageCheck,
  Ruler,
  ScanLine,
  Shuffle,
  Settings2,
  Smartphone,
  Weight,
} from 'lucide-react';
import { PageHeader } from '@/components/admin/PageHeader';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { purchaseReceiveGuide } from '@/data/purchaseReceiveGuide';

const appointmentRows = [
  {
    no: purchaseReceiveGuide.appointmentNo,
    po: purchaseReceiveGuide.purchaseOrderNo,
    supplier: purchaseReceiveGuide.supplier,
    batch: purchaseReceiveGuide.batchNo,
    sku: purchaseReceiveGuide.skuCount,
    qty: purchaseReceiveGuide.expectedQty,
    pack: '整托 + 散装',
    station: purchaseReceiveGuide.stationCode,
    status: '已到货',
  },
  {
    no: 'APT-002',
    po: 'PO-009',
    supplier: '精工汽配',
    batch: 'L20260318C',
    sku: '3',
    qty: '48 件',
    pack: '箱装',
    station: '移动视觉 PDA',
    status: '待到货',
  },
];

const fieldTemplates = [
  '配件料号',
  '奇瑞料号',
  '批次号',
  '生产日期',
  '供应商编码',
  '数量',
  '有效期',
];

const boxRules = [
  { name: purchaseReceiveGuide.scanMaterialName, pack: '6 箱/托，50 EA/箱', calc: '6 × 50 = 300 EA' },
  { name: purchaseReceiveGuide.ocrMaterialName, pack: '250 件/箱', calc: '按 OCR 数量字段确认' },
  { name: purchaseReceiveGuide.damagedMaterialName, pack: '单件约 4.1 kg', calc: '称重约 1 件' },
];

const ngTypes = [
  { material: purchaseReceiveGuide.damagedMaterialName, types: ['标签破损', '覆膜遮挡', '边角受压'], sample: '64 张' },
  { material: purchaseReceiveGuide.ocrMaterialName, types: ['字段缺失', '批次不符', '日期不清晰'], sample: '92 张' },
  { material: '纸箱包装', types: ['破损', '遮挡', '倒置', '错贴'], sample: '210 张' },
];

const barcodeBindingRows = [
  { code: purchaseReceiveGuide.palletCode, target: `${purchaseReceiveGuide.purchaseOrderNo} / 托盘`, result: '已绑定', owner: purchaseReceiveGuide.stationCode },
  { code: purchaseReceiveGuide.cartonCode, target: '箱码 / Brake Caliper', result: '已绑定', owner: 'PDA-12' },
  { code: purchaseReceiveGuide.ocrPartNo, target: 'OCR 标签 / Brake Pad Set', result: '待复核', owner: 'PDA-12' },
];

const exceptionPolicies = [
  { condition: '标签缺失、倒置或错贴', action: '暂存隔离区，PDA 补拍后确认', level: 'L2' },
  { condition: 'OCR 字段与采购单不一致', action: '生成工单，转质检员复核', level: 'L2' },
  { condition: '数量差异超过容差', action: '转盘点复点，锁定同批次', level: 'L2' },
  { condition: '关键件型号不符', action: '强制拦截并通知主管', level: 'L1' },
];

const qualityTaskRows = [
  {
    taskNo: 'QI-20260522-01',
    scope: `A-01 入库区 / ${purchaseReceiveGuide.scanMaterialName}`,
    rule: '整托纸箱点数与箱规核对',
    samples: '6 / 6 箱',
    terminal: purchaseReceiveGuide.stationCode,
    status: '待执行',
  },
  {
    taskNo: 'QI-20260522-02',
    scope: `A-01 入库区 / ${purchaseReceiveGuide.ocrMaterialName}`,
    rule: 'OCR 字段抽检',
    samples: '1 / 1 标签',
    terminal: 'PDA-12',
    status: '待执行',
  },
  {
    taskNo: 'QI-20260522-03',
    scope: `Q-A03 隔离区 / ${purchaseReceiveGuide.damagedMaterialName}`,
    rule: '标签破损复核',
    samples: purchaseReceiveGuide.damagedCartonNo,
    terminal: 'PDA-12',
    status: '待执行',
  },
];

const stationOptions = [
  { id: 'station', label: '固定式视觉相机', icon: MonitorCheck },
  { id: 'pda', label: '移动视觉 PDA', icon: Smartphone },
] as const;

export const AdminInboundConfig: FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [stationMode, setStationMode] = useState<(typeof stationOptions)[number]['id']>('station');
  const [inspectionMode, setInspectionMode] = useState<'全检' | '抽检'>('抽检');
  const [sampleRatio, setSampleRatio] = useState(20);
  const [autoCreated, setAutoCreated] = useState(false);
  const isPurchaseGuide = searchParams.get('scenario') === 'purchase-receive';

  const currentStationLabel =
    stationOptions.find((item) => item.id === stationMode)?.label ?? '固定式视觉相机';

  return (
    <div className="p-6">
      <PageHeader
        title="入库质检配置"
        breadcrumbs={[{ label: '配置' }, { label: '入库质检配置' }]}
        actions={
          <button className="flex items-center gap-1.5 rounded-md bg-info px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-info/80">
            <Settings2 className="h-3.5 w-3.5" />
            保存配置
          </button>
        }
      />

      {isPurchaseGuide && (
        <div className="mb-6 rounded-xl border-2 border-info bg-info/10 p-4 shadow-[0_0_0_4px_rgba(59,130,246,0.08)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="inline-flex rounded-full bg-info px-2.5 py-1 text-[11px] font-bold text-white">
                采购到货入库
              </div>
              <h2 className="mt-3 text-base font-semibold text-text-primary">
                先确认采购单、供应商、批次、包装方式和检测工位
              </h2>
              <p className="mt-1 text-sm text-text-secondary">
                这里是从首页进入后的起点。确认无误后，把同一批到货交给 PDA 做现场预约登记。
              </p>
            </div>
            <button
              onClick={() => navigate('/pda/receive/appointment?scenario=purchase-receive')}
              className="shrink-0 rounded-md bg-info px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-info/80"
            >
              交给 PDA 预约登记
            </button>
          </div>
          <div className="mt-4 grid grid-cols-4 gap-3 text-xs">
            {[
              `采购单 ${purchaseReceiveGuide.purchaseOrderNo}`,
              `供应商 ${purchaseReceiveGuide.supplier}`,
              `托码 ${purchaseReceiveGuide.palletCode}`,
              `工位 ${purchaseReceiveGuide.stationCode}`,
            ].map((item) => (
              <div key={item} className="rounded-md bg-white px-3 py-2 font-semibold text-info">
                {item}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mb-6 grid grid-cols-4 gap-4">
        {[
          { icon: CalendarClock, label: '今日预约', value: '12 单', tone: 'text-info' },
          { icon: Camera, label: '在线工位', value: '4 个', tone: 'text-success' },
          { icon: AlertTriangle, label: '待复核', value: '3 件', tone: 'text-warning' },
          { icon: PackageCheck, label: '待上架', value: '9 批', tone: 'text-accent' },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="rounded-lg bg-gray-100 p-4">
              <div className="flex items-center gap-2">
                <Icon className={`h-4 w-4 ${item.tone}`} />
                <span className="text-xs text-text-muted">{item.label}</span>
              </div>
              <p className={`mt-2 font-data text-2xl font-bold ${item.tone}`}>{item.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-12 gap-6">
        <section className="col-span-7 rounded-lg bg-gray-100 p-5">
          <div className="mb-4 flex items-center gap-2">
            <ClipboardList className="h-4 w-4 text-info" />
            <h3 className="text-sm font-semibold text-text-primary">到货预约与采购信息</h3>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-light">
                {['预约号', '采购单', '供应商', '批次', 'SKU', '数量', '包装', '工位', '状态'].map((head) => (
                  <th key={head} className="px-2 py-2 text-left text-[11px] font-semibold text-text-muted">
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {appointmentRows.map((row) => (
                <tr key={row.no} className="border-b border-border-light/30">
                  <td className="px-2 py-2 font-data text-xs text-info">{row.no}</td>
                  <td className="px-2 py-2 font-data text-xs text-text-primary">{row.po}</td>
                  <td className="px-2 py-2 text-xs text-text-secondary">{row.supplier}</td>
                  <td className="px-2 py-2 font-data text-xs text-text-secondary">{row.batch}</td>
                  <td className="px-2 py-2 text-xs text-text-secondary">{row.sku}</td>
                  <td className="px-2 py-2 text-xs text-text-secondary">{row.qty}</td>
                  <td className="px-2 py-2 text-xs text-text-secondary">{row.pack}</td>
                  <td className="px-2 py-2 text-xs text-text-secondary">{row.station}</td>
                  <td className="px-2 py-2">
                    <StatusBadge status={row.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="col-span-5 rounded-lg bg-gray-100 p-5">
          <div className="mb-4 flex items-center gap-2">
            <Camera className="h-4 w-4 text-info" />
            <h3 className="text-sm font-semibold text-text-primary">视觉检测工位</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {stationOptions.map((option) => {
              const Icon = option.icon;
              const active = stationMode === option.id;
              return (
                <button
                  key={option.id}
                  onClick={() => setStationMode(option.id)}
                  className={`rounded-lg border p-3 text-left transition-all ${
                    active ? 'border-info bg-info/10 text-info' : 'border-border bg-white text-text-secondary'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <p className="mt-2 text-xs font-semibold">{option.label}</p>
                  <p className="mt-1 text-[10px] text-text-muted">
                    {option.id === 'station' ? '相机 + 扫码枪 + 重力台' : '现场拍照 + 手动修正'}
                  </p>
                </button>
              );
            })}
          </div>
          <div className="mt-4 rounded-md bg-white p-3">
            <p className="text-[11px] text-text-muted">当前默认工位</p>
            <p className="mt-1 text-sm font-semibold text-text-primary">{currentStationLabel}</p>
          </div>
        </section>

        <section className="col-span-12 rounded-lg bg-gray-100 p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Shuffle className="h-4 w-4 text-info" />
              <div>
                <h3 className="text-sm font-semibold text-text-primary">质量抽检任务生成</h3>
                <p className="mt-0.5 text-[11px] text-text-muted">按品类、风险和批次生成 PDA / Station 可执行任务。</p>
              </div>
            </div>
            <button
              onClick={() => setAutoCreated(true)}
              className="flex items-center gap-1.5 rounded-md bg-info px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-info/80"
            >
              <ListChecks className="h-3.5 w-3.5" />
              生成抽检任务
            </button>
          </div>

          <div className="grid grid-cols-4 gap-3">
            <div className="rounded-md bg-white p-3">
              <p className="text-[10px] text-text-muted">抽样方式</p>
              <p className="mt-1 text-sm font-semibold text-text-primary">批次内随机</p>
              <p className="mt-1 text-[11px] text-text-secondary">生成后锁定样本序号，现场按序扫码或拍照。</p>
            </div>
            <div className="rounded-md bg-white p-3">
              <p className="text-[10px] text-text-muted">默认比例</p>
              <div className="mt-2 flex items-center gap-2">
                <input
                  type="range"
                  min={5}
                  max={50}
                  step={5}
                  value={sampleRatio}
                  onChange={(event) => setSampleRatio(Number(event.target.value))}
                  className="h-1 flex-1 accent-info"
                />
                <span className="w-10 text-right font-data text-sm font-bold text-info">{sampleRatio}%</span>
              </div>
              <p className="mt-2 text-[11px] text-text-secondary">关键零部件低于 10 件时自动全检。</p>
            </div>
            <div className="rounded-md bg-white p-3">
              <p className="text-[10px] text-text-muted">异常后处理</p>
              <p className="mt-1 text-sm font-semibold text-danger">同批次继续排查</p>
              <p className="mt-1 text-[11px] text-text-secondary">L1 或标签缺失会生成批次排查任务。</p>
            </div>
            <div className="rounded-md bg-white p-3">
              <p className="text-[10px] text-text-muted">任务状态</p>
              <p className={`mt-1 text-sm font-semibold ${autoCreated ? 'text-success' : 'text-warning'}`}>
                {autoCreated ? '已生成并下发' : '待生成'}
              </p>
              <p className="mt-1 text-[11px] text-text-secondary">
                {autoCreated ? 'PDA 与 Station 队列已出现对应任务。' : '点击按钮后展示今日任务。'}
              </p>
            </div>
          </div>

          <table className="mt-4 w-full text-sm">
            <thead>
              <tr className="border-b border-border-light">
                {['任务号', '范围', '规则', '样本', '执行端', '状态'].map((head) => (
                  <th key={head} className="px-2 py-2 text-left text-[11px] font-semibold text-text-muted">
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(autoCreated ? qualityTaskRows : qualityTaskRows.slice(0, 1)).map((row) => (
                <tr key={row.taskNo} className="border-b border-border-light/30">
                  <td className="px-2 py-2 font-data text-xs text-info">{row.taskNo}</td>
                  <td className="px-2 py-2 text-xs text-text-secondary">{row.scope}</td>
                  <td className="px-2 py-2 text-xs text-text-secondary">{row.rule}</td>
                  <td className="px-2 py-2 font-data text-xs text-text-primary">{row.samples}</td>
                  <td className="px-2 py-2 text-xs text-text-secondary">{row.terminal}</td>
                  <td className="px-2 py-2">
                    <StatusBadge status={autoCreated ? row.status : '待处理'} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="col-span-4 rounded-lg bg-gray-100 p-5">
          <div className="mb-4 flex items-center gap-2">
            <FileText className="h-4 w-4 text-info" />
            <h3 className="text-sm font-semibold text-text-primary">OCR 字段模板</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {fieldTemplates.map((field) => (
              <span key={field} className="rounded bg-info/10 px-2 py-1 text-xs text-info">
                {field}
              </span>
            ))}
          </div>
          <div className="mt-4 rounded-md bg-white p-3">
            <p className="text-[11px] text-text-muted">不清晰处理</p>
            <p className="mt-1 text-xs text-text-secondary">转人工复核，保留截图、字段值和置信度。</p>
          </div>
        </section>

        <section className="col-span-4 rounded-lg bg-gray-100 p-5">
          <div className="mb-4 flex items-center gap-2">
            <ScanLine className="h-4 w-4 text-info" />
            <h3 className="text-sm font-semibold text-text-primary">托码 / 箱码采集</h3>
          </div>
          {barcodeBindingRows.map((item) => (
            <div key={item.code} className="mb-2 rounded bg-white px-3 py-2">
              <div className="flex items-center justify-between">
                <span className="font-data text-xs text-text-primary">{item.code}</span>
                <StatusBadge status={item.result} />
              </div>
              <div className="mt-1 flex items-center justify-between text-[11px] text-text-muted">
                <span>{item.target}</span>
                <span>{item.owner}</span>
              </div>
            </div>
          ))}
        </section>

        <section className="col-span-4 rounded-lg bg-gray-100 p-5">
          <div className="mb-4 flex items-center gap-2">
            <Database className="h-4 w-4 text-info" />
            <h3 className="text-sm font-semibold text-text-primary">入库检频次</h3>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {(['抽检', '全检'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setInspectionMode(mode)}
                className={`rounded-md border px-3 py-2 text-sm font-semibold transition-all ${
                  inspectionMode === mode ? 'border-info bg-info/10 text-info' : 'border-border bg-white text-text-secondary'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
          <p className="mt-3 text-xs text-text-secondary">
            当前策略：{inspectionMode}，关键零部件和特殊库物资默认全检。
          </p>
        </section>

        <section className="col-span-6 rounded-lg bg-gray-100 p-5">
          <div className="mb-4 flex items-center gap-2">
            <Ruler className="h-4 w-4 text-info" />
            <h3 className="text-sm font-semibold text-text-primary">箱规与整托计算</h3>
          </div>
          <div className="space-y-2">
            {boxRules.map((rule) => (
              <div key={rule.name} className="grid grid-cols-3 gap-2 rounded bg-white px-3 py-2 text-xs">
                <span className="font-semibold text-text-primary">{rule.name}</span>
                <span className="text-text-secondary">{rule.pack}</span>
                <span className="font-data text-info">{rule.calc}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="col-span-6 rounded-lg bg-gray-100 p-5">
          <div className="mb-4 flex items-center gap-2">
            <Weight className="h-4 w-4 text-info" />
            <h3 className="text-sm font-semibold text-text-primary">散装件重量估算</h3>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: '总重量', value: '5.2 kg' },
              { label: '单件重量', value: '4.1 kg' },
              { label: '估算数量', value: '1 件' },
            ].map((item) => (
              <div key={item.label} className="rounded bg-white p-3">
                <p className="text-[10px] text-text-muted">{item.label}</p>
                <p className="mt-1 font-data text-lg font-bold text-text-primary">{item.value}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="col-span-12 rounded-lg bg-gray-100 p-5">
          <div className="mb-4 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-warning" />
            <h3 className="text-sm font-semibold text-text-primary">NG 类型库</h3>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {ngTypes.map((item) => (
              <div key={item.material} className="rounded-md bg-white p-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-text-primary">{item.material}</p>
                  <span className="font-data text-[10px] text-text-muted">{item.sample}</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {item.types.map((type) => (
                    <span key={type} className="rounded bg-warning/15 px-2 py-0.5 text-[11px] text-warning">
                      {type}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="col-span-12 rounded-lg bg-gray-100 p-5">
          <div className="mb-4 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-warning" />
            <h3 className="text-sm font-semibold text-text-primary">异常处理规则</h3>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {exceptionPolicies.map((item) => (
              <div key={item.condition} className="rounded-md bg-white p-3">
                <div className="flex items-center justify-between">
                  <StatusBadge status={item.level} />
                  <span className="text-[10px] text-text-muted">自动分派</span>
                </div>
                <p className="mt-2 text-sm font-semibold text-text-primary">{item.condition}</p>
                <p className="mt-1 text-[11px] leading-relaxed text-text-secondary">{item.action}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminInboundConfig;
