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
  PlayCircle,
  Ruler,
  ScanLine,
  Shuffle,
  Settings2,
  Smartphone,
  Weight,
} from 'lucide-react';
import { PageHeader } from '@/components/admin/PageHeader';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { DemoStepBadge } from '@/components/shared';
import { purchaseReceiveGuide } from '@/data/purchaseReceiveGuide';

const appointmentRows = [
  {
    no: purchaseReceiveGuide.appointmentNo,
    po: purchaseReceiveGuide.purchaseOrderNo,
    source: 'ERP',
    supplier: purchaseReceiveGuide.supplier,
    batch: purchaseReceiveGuide.batchNo,
    sku: purchaseReceiveGuide.skuCount,
    qty: purchaseReceiveGuide.expectedQty,
    pack: '整托 + 散装',
    station: purchaseReceiveGuide.stationCode,
    status: '待收货',
    eta: '08:00-10:00',
  },
  {
    no: 'APT-002',
    po: 'PO-009',
    source: 'SRM',
    supplier: '精工汽配',
    batch: 'L20260318C',
    sku: '3',
    qty: '48 件',
    pack: '箱装',
    station: '移动视觉 PDA',
    status: '待到货',
    eta: '10:00-12:00',
  },
  {
    no: 'APT-003',
    po: 'PO-010',
    source: 'ERP',
    supplier: '江南华盛',
    batch: 'B20260521C',
    sku: '5',
    qty: '120 枚',
    pack: '散装',
    station: 'Station-02',
    status: '待确认',
    eta: '13:00-15:00',
  },
  {
    no: 'APT-004',
    po: 'PO-011',
    source: 'SRM',
    supplier: '环球物流',
    batch: 'R20260522B',
    sku: '2',
    qty: '2 托',
    pack: '整托',
    station: 'Station-04',
    status: '已生成任务',
    eta: '15:00-17:00',
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
  { condition: '标签缺失、倒置或错贴', action: '暂存隔离区，收货员用 PDA 补拍后确认', level: 'L2' },
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
    executor: '收货员 张伟',
    terminal: `${purchaseReceiveGuide.stationCode} 正式检测`,
    status: '待执行',
  },
  {
    taskNo: 'QI-20260522-02',
    scope: `A-01 入库区 / ${purchaseReceiveGuide.ocrMaterialName}`,
    rule: 'PDA 预读后送 Station OCR 复核',
    samples: '1 / 1 标签',
    executor: '收货员 张伟',
    terminal: 'PDA-12 采集 / Station-03 检测',
    status: '待执行',
  },
  {
    taskNo: 'QI-20260522-03',
    scope: `Q-A03 隔离区 / ${purchaseReceiveGuide.damagedMaterialName}`,
    rule: '标签破损复核',
    samples: purchaseReceiveGuide.damagedCartonNo,
    executor: '质检员 李娜',
    terminal: 'PDA-12 现场处置登记',
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
  const [selectedAppointmentNo, setSelectedAppointmentNo] = useState(appointmentRows[0].no);
  const [stationMode, setStationMode] = useState<(typeof stationOptions)[number]['id']>('station');
  const [inspectionMode, setInspectionMode] = useState<'全检' | '抽检'>('抽检');
  const [sampleRatio, setSampleRatio] = useState(20);
  const [autoCreated, setAutoCreated] = useState(false);
  const isPurchaseGuide = searchParams.get('scenario') === 'purchase-receive';
  const selectedAppointment =
    isPurchaseGuide
      ? appointmentRows[0]
      : appointmentRows.find((row) => row.no === selectedAppointmentNo) ?? appointmentRows[0];

  const currentStationLabel =
    stationOptions.find((item) => item.id === stationMode)?.label ?? '固定式视觉相机';

  const currentInspectionPlan = selectedAppointment.pack.includes('散装')
    ? 'PDA 采集后，Station 做整托点数、散装称重和 OCR 复核'
    : '箱码采集、标签 OCR、外观检测';

  const agentDecisionCards = [
    {
      label: '收货顺序',
      value: `${selectedAppointment.eta} 先处理 ${selectedAppointment.po}`,
      note: '到货窗口最近，任务先发给收货员 PDA。',
    },
    {
      label: '现场动作',
      value: '核对车辆、采购单、托码和箱码',
      note: '收货员只按任务采集实物信息。',
    },
    {
      label: '检测策略',
      value: currentInspectionPlan,
      note: '低风险小件可 PDA 完成；当前批次建议 Station 正式检测。',
    },
    {
      label: '异常去向',
      value: '标签、OCR、数量异常转人工复核',
      note: '严重问题自动进入隔离区待处理。',
    },
  ];

  const agentResultCards = [
    { label: '任务状态', value: '已生成收货执行任务' },
    { label: '人员安排', value: '收货员 张伟负责收货，质检员 李娜负责异常复核' },
    { label: '设备判断', value: 'PDA 先采集，当前批次由 Station-03 做正式检测' },
    { label: '结果记录', value: '照片、字段、数量和结论会回写到当前采购单' },
  ];

  const handleSelectAppointment = (appointmentNo: string) => {
    const next = appointmentRows.find((row) => row.no === appointmentNo);
    if (!next) return;
    setSelectedAppointmentNo(next.no);
  };

  const handleCreateReceiveTask = () => {
    navigate('/pda/receive/appointment?scenario=purchase-receive', {
      state: {
        appointment: selectedAppointment,
      },
    });
  };

  return (
    <div className="p-6">
      <PageHeader
        title={isPurchaseGuide ? '采购到货确认' : '入库质检配置'}
        breadcrumbs={isPurchaseGuide ? [{ label: '采购对接' }, { label: '采购到货确认' }] : [{ label: '配置' }, { label: '入库质检配置' }]}
        actions={
          <button className="flex items-center gap-1.5 rounded-md bg-info px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-info/80">
            <Settings2 className="h-3.5 w-3.5" />
            保存配置
          </button>
        }
      />

      {isPurchaseGuide && (
        <div className="mb-6 rounded-xl border-2 border-info bg-info/10 p-5 shadow-[0_0_0_4px_rgba(59,130,246,0.08)]">
          <div className="grid grid-cols-12 gap-5">
            <div className="col-span-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="inline-flex rounded-full bg-info px-2.5 py-1 text-[11px] font-bold text-white">
                    采购到货入库
                  </div>
                  <h2 className="mt-3 text-lg font-semibold text-text-primary">
                    Agent 已生成收货执行任务
                  </h2>
                  <p className="mt-1 text-sm leading-relaxed text-text-secondary">
                    系统根据 ERP / SRM 同步采购单、到货时间、包装方式和历史异常，给出现场收货与检测建议。PDA 能完成低风险采集与确认，当前演示批次需要 Station 做正式检测。
                  </p>
                </div>
                <button
                  onClick={handleCreateReceiveTask}
                  className="shrink-0 rounded-lg border border-amber-400 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-950 shadow-sm transition-colors hover:bg-amber-100"
                >
                  <span className="flex items-center gap-2">
                    <DemoStepBadge step={1} tone="light" />
                    <PlayCircle className="h-4 w-4" />
                    去 PDA 现场收货
                  </span>
                </button>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                {agentDecisionCards.map((item) => (
                  <div key={item.label} className="rounded-lg bg-white p-3">
                    <p className="text-[10px] text-text-muted">{item.label}</p>
                    <p className="mt-1 text-sm font-semibold leading-relaxed text-text-primary">{item.value}</p>
                    <p className="mt-2 text-[11px] leading-relaxed text-text-secondary">{item.note}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="col-span-4 rounded-lg bg-white p-4">
              <div className="flex items-center gap-2">
                <Shuffle className="h-4 w-4 text-info" />
                <h3 className="text-sm font-semibold text-text-primary">当前安排</h3>
              </div>
              <div className="mt-3 space-y-2">
                {[
                  `采购单 ${selectedAppointment.po}`,
                  `供应商 ${selectedAppointment.supplier}`,
                  `预计到货 ${selectedAppointment.eta}`,
                  '执行人 收货员 张伟',
                  `包装 ${selectedAppointment.pack}`,
                ].map((item) => (
                  <div key={item} className="rounded-md bg-info/10 px-3 py-2 text-xs font-semibold text-info">
                    {item}
                  </div>
                ))}
              </div>
              <div className="mt-4 space-y-2">
                {agentResultCards.map((item) => (
                  <div key={item.label} className="border-t border-border-light pt-2">
                    <p className="text-[10px] text-text-muted">{item.label}</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-text-primary">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
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
        <section className="col-span-12 rounded-lg bg-gray-100 p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-info" />
              <div>
                <h3 className="text-sm font-semibold text-text-primary">原始采购单据</h3>
                <p className="mt-0.5 text-[11px] text-text-muted">这些是 Agent 作出安排时使用的 ERP / SRM 同步数据，只读展示，不用于人工改派任务。</p>
              </div>
            </div>
            <span className="rounded bg-info/10 px-2 py-1 text-[11px] font-semibold text-info">
              当前演示：{selectedAppointment.po}
            </span>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-light">
                {['来源', '预约号', '采购单', '供应商', '批次', '包装', '数量', '状态', '任务安排'].map((head) => (
                  <th key={head} className="px-2 py-2 text-left text-[11px] font-semibold text-text-muted">
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {appointmentRows.map((row) => {
                const isCurrentDemo = selectedAppointmentNo === row.no;
                const ArrangementIcon = isCurrentDemo ? PlayCircle : PackageCheck;

                return (
                  <tr
                    key={row.no}
                    onClick={isPurchaseGuide ? undefined : () => handleSelectAppointment(row.no)}
                    className={`border-b border-border-light/30 transition-colors ${
                      isCurrentDemo ? 'bg-info/10' : isPurchaseGuide ? '' : 'cursor-pointer hover:bg-white/70'
                    }`}
                  >
                    <td className="px-2 py-2 text-xs text-text-secondary">{row.source}</td>
                    <td className="px-2 py-2 font-data text-xs text-info">{row.no}</td>
                    <td className="px-2 py-2 font-data text-xs text-text-primary">{row.po}</td>
                    <td className="px-2 py-2 text-xs text-text-secondary">{row.supplier}</td>
                    <td className="px-2 py-2 font-data text-xs text-text-secondary">{row.batch}</td>
                    <td className="px-2 py-2 text-xs text-text-secondary">{row.pack}</td>
                    <td className="px-2 py-2 text-xs text-text-secondary">{row.qty}</td>
                    <td className="px-2 py-2">
                      <StatusBadge status={row.status} />
                    </td>
                    <td className="px-2 py-2">
                      <span className={`inline-flex items-center gap-1 rounded px-2 py-1 text-[11px] font-semibold ${
                        isCurrentDemo ? 'bg-info text-white' : 'bg-success/10 text-success'
                      }`}>
                        <ArrangementIcon className="h-3 w-3" />
                        {isCurrentDemo ? '当前演示单' : '已安排任务'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>

        {!isPurchaseGuide && (
          <section className="col-span-4 rounded-lg bg-gray-100 p-5">
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
        )}

        <section className="col-span-12 rounded-lg bg-gray-100 p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Shuffle className="h-4 w-4 text-info" />
              <div>
                <h3 className="text-sm font-semibold text-text-primary">Agent 检测安排</h3>
                <p className="mt-0.5 text-[11px] text-text-muted">
                  按品类、风险和批次安排检查项，低风险任务可由 PDA 完成，复杂批次再交给 Station。
                </p>
              </div>
            </div>
            {!isPurchaseGuide && (
              <button
                onClick={() => setAutoCreated(true)}
                className="flex items-center gap-1.5 rounded-md bg-info px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-info/80"
              >
                <ListChecks className="h-3.5 w-3.5" />
                查看今日安排
              </button>
            )}
          </div>

          <div className="grid grid-cols-4 gap-3">
            <div className="rounded-md bg-white p-3">
              <p className="text-[10px] text-text-muted">抽样方式</p>
              <p className="mt-1 text-sm font-semibold text-text-primary">批次内随机</p>
              <p className="mt-1 text-[11px] text-text-secondary">Agent 锁定样本序号，现场按任务提示扫码、拍照或送检。</p>
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
                {isPurchaseGuide ? '已下发执行' : autoCreated ? '已显示今日安排' : '已自动安排'}
              </p>
              <p className="mt-1 text-[11px] text-text-secondary">
                {isPurchaseGuide
                  ? '收货员先在 PDA 采集，当前批次再送 Station 正式检测。'
                  : autoCreated
                    ? '下方展示当前采购单关联的检查项。'
                    : '点击按钮查看完整检查项。'}
              </p>
            </div>
          </div>

          <table className="mt-4 w-full text-sm">
            <thead>
              <tr className="border-b border-border-light">
                {['任务号', '范围', '规则', '样本', '执行人', '执行端', '状态'].map((head) => (
                  <th key={head} className="px-2 py-2 text-left text-[11px] font-semibold text-text-muted">
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(isPurchaseGuide || autoCreated ? qualityTaskRows : qualityTaskRows.slice(0, 1)).map((row) => (
                <tr key={row.taskNo} className="border-b border-border-light/30">
                  <td className="px-2 py-2 font-data text-xs text-info">{row.taskNo}</td>
                  <td className="px-2 py-2 text-xs text-text-secondary">{row.scope}</td>
                  <td className="px-2 py-2 text-xs text-text-secondary">{row.rule}</td>
                  <td className="px-2 py-2 font-data text-xs text-text-primary">{row.samples}</td>
                  <td className="px-2 py-2 text-xs font-semibold text-text-primary">{row.executor}</td>
                  <td className="px-2 py-2 text-xs text-text-secondary">{row.terminal}</td>
                  <td className="px-2 py-2">
                    <StatusBadge status={isPurchaseGuide || autoCreated ? row.status : '待处理'} />
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
