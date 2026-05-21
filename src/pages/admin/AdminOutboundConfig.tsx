import type { FC } from 'react';
import { useState } from 'react';
import {
  AlertTriangle,
  Barcode,
  Boxes,
  CheckCircle2,
  ClipboardList,
  Database,
  FileText,
  PackageCheck,
  ScanLine,
  Settings2,
  ShieldAlert,
  Truck,
} from 'lucide-react';
import { PageHeader } from '@/components/admin/PageHeader';
import { StatusBadge } from '@/components/admin/StatusBadge';

const outboundOrders = [
  {
    no: 'SO-031',
    customer: '华南电商',
    pickTask: 'PK-001 ~ PK-003',
    station: 'Station-03',
    status: '待复核',
    shipTime: '14:00',
  },
  {
    no: 'SO-032',
    customer: '广州售后仓',
    pickTask: 'PK-004 ~ PK-006',
    station: 'Station-02',
    status: '待拣货',
    shipTime: '16:30',
  },
];

const strategyRows = [
  { material: '关键零部件', mode: '全检', reason: '型号错发风险高，逐件核对标签、条码和 OCR 字段' },
  { material: '低风险日用品', mode: '抽检', reason: '按箱码和数量确认，异常供应商自动转全检' },
  { material: '退回重拣件', mode: '全检', reason: 'Station 已退回，重新拣货后必须复核' },
];

const ngLibrary = [
  { product: '雨刮电机', types: ['型号不符', '铭牌遮挡', '外壳划伤'], samples: '72 张', model: 'NG-WPM-v1.3' },
  { product: '前轮轴承', types: ['防锈油异常', '包装破损', '批次错贴'], samples: '118 张', model: 'NG-BRG-v2.1' },
  { product: '丁腈手套', types: ['标签缺失', '箱码损坏', '数量不符'], samples: '96 张', model: 'NG-GLOVES-v1.0' },
];

const inventoryLogs = [
  { time: '10:24', order: 'SO-031', action: '复核拦截', material: '雨刮电机', qty: '5 件', stock: '未扣减' },
  { time: '10:18', order: 'SO-031', action: 'OK 放行', material: '前轮轴承', qty: '10 件', stock: '待整单扣减' },
  { time: '10:12', order: 'SO-031', action: '拣货完成', material: '丁腈手套 L', qty: '20 盒', stock: '拣货占用' },
];

const requiredFields = ['SKU', '批次', '数量', '生产日期', '客户料号'];

export const AdminOutboundConfig: FC = () => {
  const [inspectionMode, setInspectionMode] = useState<'抽检' | '全检'>('全检');
  const [autoCreateReturnTask, setAutoCreateReturnTask] = useState(true);

  return (
    <div className="p-6">
      <PageHeader
        title="出库复核配置"
        breadcrumbs={[{ label: '配置' }, { label: '出库复核配置' }]}
        actions={
          <button className="flex items-center gap-1.5 rounded-md bg-info px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-info/80">
            <Settings2 className="h-3.5 w-3.5" />
            保存配置
          </button>
        }
      />

      <div className="mb-6 grid grid-cols-4 gap-4">
        {[
          { icon: Truck, label: '待发货', value: '8 单', tone: 'text-info' },
          { icon: PackageCheck, label: '复核通过', value: '21 件', tone: 'text-success' },
          { icon: AlertTriangle, label: '退回重拣', value: '1 件', tone: 'text-warning' },
          { icon: ShieldAlert, label: '待人工复核', value: '2 件', tone: 'text-danger' },
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
            <h3 className="text-sm font-semibold text-text-primary">出库单与拣货下发</h3>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-light">
                {['出库单', '客户', '拣货任务', '复核工位', '发货时间', '状态'].map((head) => (
                  <th key={head} className="px-2 py-2 text-left text-[11px] font-semibold text-text-muted">
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {outboundOrders.map((row) => (
                <tr key={row.no} className="border-b border-border-light/30">
                  <td className="px-2 py-2 font-data text-xs text-info">{row.no}</td>
                  <td className="px-2 py-2 text-xs text-text-secondary">{row.customer}</td>
                  <td className="px-2 py-2 font-data text-xs text-text-primary">{row.pickTask}</td>
                  <td className="px-2 py-2 text-xs text-text-secondary">{row.station}</td>
                  <td className="px-2 py-2 font-data text-xs text-text-secondary">{row.shipTime}</td>
                  <td className="px-2 py-2">
                    <StatusBadge status={row.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-4 flex gap-2">
            <button className="rounded bg-info px-3 py-2 text-xs font-medium text-white">下发拣货</button>
            <button className="rounded bg-success px-3 py-2 text-xs font-medium text-white">生成复核任务</button>
          </div>
        </section>

        <section className="col-span-5 rounded-lg bg-gray-100 p-5">
          <div className="mb-4 flex items-center gap-2">
            <ScanLine className="h-4 w-4 text-info" />
            <h3 className="text-sm font-semibold text-text-primary">本次复核策略</h3>
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
          <label className="mt-4 flex items-center justify-between rounded bg-white px-3 py-2">
            <span className="text-xs text-text-secondary">NG 后自动生成重拣任务</span>
            <input
              type="checkbox"
              checked={autoCreateReturnTask}
              onChange={(event) => setAutoCreateReturnTask(event.target.checked)}
              className="h-4 w-4 accent-info"
            />
          </label>
          <p className="mt-3 text-xs leading-relaxed text-text-secondary">
            当前策略：{inspectionMode}。异常供应商、退回重拣件和关键零部件默认走全检。
          </p>
        </section>

        <section className="col-span-4 rounded-lg bg-gray-100 p-5">
          <div className="mb-4 flex items-center gap-2">
            <Barcode className="h-4 w-4 text-info" />
            <h3 className="text-sm font-semibold text-text-primary">条码与标签规则</h3>
          </div>
          {[
            { label: '条码匹配', value: '必须命中出库单明细' },
            { label: '箱标位置', value: '正面可读区域' },
            { label: '重复码', value: '拦截并转人工' },
          ].map((item) => (
            <div key={item.label} className="mb-2 flex items-center justify-between rounded bg-white px-3 py-2">
              <span className="text-xs text-text-muted">{item.label}</span>
              <span className="text-xs text-text-primary">{item.value}</span>
              <CheckCircle2 className="h-3.5 w-3.5 text-success" />
            </div>
          ))}
        </section>

        <section className="col-span-4 rounded-lg bg-gray-100 p-5">
          <div className="mb-4 flex items-center gap-2">
            <FileText className="h-4 w-4 text-info" />
            <h3 className="text-sm font-semibold text-text-primary">OCR 必填字段</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {requiredFields.map((field) => (
              <span key={field} className="rounded bg-info/10 px-2 py-1 text-xs text-info">
                {field}
              </span>
            ))}
          </div>
          <p className="mt-4 rounded bg-white p-3 text-xs text-text-secondary">
            任一字段低于阈值时，Station 显示截图、字段值和置信度，并要求人工复核。
          </p>
        </section>

        <section className="col-span-4 rounded-lg bg-gray-100 p-5">
          <div className="mb-4 flex items-center gap-2">
            <Boxes className="h-4 w-4 text-info" />
            <h3 className="text-sm font-semibold text-text-primary">点数与放行</h3>
          </div>
          {[
            { label: '应发数量', value: '35 件' },
            { label: '视觉点数', value: '35 件' },
            { label: '差异处理', value: '禁止放行' },
          ].map((item) => (
            <div key={item.label} className="mb-2 rounded bg-white px-3 py-2">
              <p className="text-[10px] text-text-muted">{item.label}</p>
              <p className="mt-0.5 text-sm font-semibold text-text-primary">{item.value}</p>
            </div>
          ))}
        </section>

        <section className="col-span-6 rounded-lg bg-gray-100 p-5">
          <div className="mb-4 flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-warning" />
            <h3 className="text-sm font-semibold text-text-primary">产品 NG 类型库</h3>
          </div>
          <div className="space-y-2">
            {ngLibrary.map((item) => (
              <div key={item.product} className="rounded bg-white p-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-text-primary">{item.product}</p>
                  <span className="font-data text-[10px] text-text-muted">{item.model}</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {item.types.map((type) => (
                    <span key={type} className="rounded bg-warning/15 px-2 py-0.5 text-[11px] text-warning">
                      {type}
                    </span>
                  ))}
                </div>
                <p className="mt-2 font-data text-[10px] text-text-muted">样本：{item.samples}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="col-span-6 rounded-lg bg-gray-100 p-5">
          <div className="mb-4 flex items-center gap-2">
            <Database className="h-4 w-4 text-info" />
            <h3 className="text-sm font-semibold text-text-primary">库存记录</h3>
          </div>
          <div className="space-y-2">
            {inventoryLogs.map((log) => (
              <div key={`${log.time}-${log.material}`} className="grid grid-cols-[52px_74px_80px_1fr_62px_76px] gap-2 rounded bg-white px-3 py-2 text-xs">
                <span className="font-data text-text-muted">{log.time}</span>
                <span className="font-data text-info">{log.order}</span>
                <span className="text-text-primary">{log.action}</span>
                <span className="text-text-secondary">{log.material}</span>
                <span className="font-data text-text-primary">{log.qty}</span>
                <span className="text-warning">{log.stock}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="col-span-12 rounded-lg bg-gray-100 p-5">
          <div className="mb-4 flex items-center gap-2">
            <Truck className="h-4 w-4 text-info" />
            <h3 className="text-sm font-semibold text-text-primary">策略说明</h3>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {strategyRows.map((row) => (
              <div key={row.material} className="rounded bg-white p-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-text-primary">{row.material}</p>
                  <StatusBadge status={row.mode} />
                </div>
                <p className="mt-2 text-xs leading-relaxed text-text-secondary">{row.reason}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminOutboundConfig;
