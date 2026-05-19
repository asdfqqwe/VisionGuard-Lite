import type { FC } from 'react';
import { useState } from 'react';
import {
  BookOpen,
  Search,
  ChevronRight,
  ChevronDown,
  Pencil,
  Eye,
  Folder,
  FolderOpen,
  FileText,
} from 'lucide-react';
import { PageHeader } from '@/components/admin/PageHeader';

interface StandardCategory {
  name: string;
  children: { name: string; standards: Standard[] }[];
}

interface Standard {
  id: string;
  name: string;
  supplier: string;
  method: string;
  sampleQty: number;
  requiredFields: string[];
  version: string;
}

const categories: StandardCategory[] = [
  {
    name: '收货质检标准',
    children: [
      {
        name: '外包装完整性',
        standards: [
          { id: 'STD-001', name: '纸箱包装强度检验', supplier: '通用', method: '目视+抗压测试', sampleQty: 5, requiredFields: ['尺寸','重量','抗压值'], version: 'V2.1' },
          { id: 'STD-002', name: '托盘货物稳定性检查', supplier: '通用', method: '目视+晃动测试', sampleQty: 3, requiredFields: ['绑带数量','堆叠层数'], version: 'V1.5' },
        ],
      },
      {
        name: '标签规范性',
        standards: [
          { id: 'STD-003', name: '产品标签完整性检验', supplier: '通用', method: '目视+OCR', sampleQty: 10, requiredFields: ['产品名称','执行标准','生产日期','批次号'], version: 'V3.0' },
          { id: 'STD-004', name: '条码可读性验证', supplier: '通用', method: '扫码枪+OCR', sampleQty: 10, requiredFields: ['一维码','二维码','校验位'], version: 'V2.2' },
        ],
      },
      {
        name: '数量准确性',
        standards: [
          { id: 'STD-005', name: '件数清点规范', supplier: '通用', method: '视觉计数', sampleQty: 100, requiredFields: ['系统数量','实点数量','差异数'], version: 'V2.0' },
        ],
      },
    ],
  },
  {
    name: '出库质检标准',
    children: [
      {
        name: '包装合规性',
        standards: [
          { id: 'STD-006', name: '出库包装完整性', supplier: '通用', method: '目视检查', sampleQty: 5, requiredFields: ['包装状态','防护材料'], version: 'V1.8' },
        ],
      },
      {
        name: '标签正确性',
        standards: [
          { id: 'STD-007', name: '出库标签核验', supplier: '通用', method: 'OCR+条码', sampleQty: 10, requiredFields: ['SKU','数量','目的地'], version: 'V2.3' },
        ],
      },
    ],
  },
  {
    name: '巡检标准',
    children: [
      {
        name: '库位巡检',
        standards: [
          { id: 'STD-008', name: '库位物资一致性检查', supplier: '通用', method: '扫码+目视', sampleQty: 20, requiredFields: ['库位号','系统物资','现场物资'], version: 'V1.5' },
          { id: 'STD-009', name: '效期巡检规范', supplier: '通用', method: '目视检查', sampleQty: 15, requiredFields: ['生产日期','有效期','预警天数'], version: 'V2.0' },
        ],
      },
    ],
  },
  {
    name: '消防关联标准',
    children: [
      {
        name: '特殊库物资',
        standards: [
          { id: 'STD-010', name: '动力电池入库安全检验', supplier: '北方能源', method: '视觉+重力+红外', sampleQty: 100, requiredFields: ['温度','重量','外观','SOC'], version: 'V3.5' },
          { id: 'STD-011', name: '油液类物资温控检验', supplier: '北方能源', method: '温度传感器', sampleQty: 100, requiredFields: ['当前温度','闪点','储存条件'], version: 'V2.8' },
        ],
      },
    ],
  },
];

export const AdminStandards: FC = () => {
  const [expandedCats, setExpandedCats] = useState<Record<string, boolean>>({ '收货质检标准': true });
  const [expandedSub, setExpandedSub] = useState<Record<string, boolean>>({});
  const [selectedStd, setSelectedStd] = useState<Standard | null>(null);
  const [searchText, setSearchText] = useState('');

  const toggleCat = (name: string) => setExpandedCats((p) => ({ ...p, [name]: !p[name] }));
  const toggleSub = (name: string) => setExpandedSub((p) => ({ ...p, [name]: !p[name] }));

  const allStandards = categories.flatMap((c) => c.children.flatMap((s) => s.standards));
  const filtered = searchText
    ? allStandards.filter((s) => s.name.includes(searchText) || s.id.includes(searchText))
    : [];

  return (
    <div className="p-6">
      <PageHeader title="质量标准库" breadcrumbs={[{ label: '知识库' }, { label: '质量标准库' }]} />

      {/* Search */}
      <div className="mb-6 flex items-center gap-2 rounded-md bg-gray-100 px-3 py-2">
        <Search className="h-4 w-4 text-text-muted" />
        <input
          type="text"
          placeholder="搜索标准编号或名称..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="flex-1 bg-transparent text-sm text-text-primary outline-none placeholder:text-text-muted"
        />
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Left: Category Tree */}
        <div className="col-span-4 rounded-lg bg-gray-100 p-4">
          <h3 className="mb-3 text-sm font-semibold text-text-primary">标准分类</h3>
          {searchText ? (
            <div className="space-y-2">
              {filtered.map((std) => (
                <button
                  key={std.id}
                  onClick={() => setSelectedStd(std)}
                  className={`w-full rounded-md px-3 py-2 text-left text-xs transition-colors ${
                    selectedStd?.id === std.id ? 'bg-info/10 text-info' : 'text-text-secondary hover:bg-gray-100/50'
                  }`}
                >
                  <span className="font-data">{std.id}</span> · {std.name}
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-1">
              {categories.map((cat) => (
                <div key={cat.name}>
                  <button
                    onClick={() => toggleCat(cat.name)}
                    className="flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-semibold text-text-primary hover:bg-gray-100/50"
                  >
                    {expandedCats[cat.name] ? (
                      <FolderOpen className="h-3.5 w-3.5 text-warning" />
                    ) : (
                      <Folder className="h-3.5 w-3.5 text-text-muted" />
                    )}
                    {cat.name}
                    {expandedCats[cat.name] ? (
                      <ChevronDown className="ml-auto h-3 w-3 text-text-muted" />
                    ) : (
                      <ChevronRight className="ml-auto h-3 w-3 text-text-muted" />
                    )}
                  </button>
                  {expandedCats[cat.name] && (
                    <div className="ml-5 space-y-1">
                      {cat.children.map((sub) => (
                        <div key={sub.name}>
                          <button
                            onClick={() => toggleSub(sub.name)}
                            className="flex w-full items-center gap-1 rounded-md px-2 py-1 text-[11px] text-text-secondary hover:bg-gray-100/50"
                          >
                            <FileText className="h-3 w-3 text-text-muted" />
                            {sub.name}
                            {expandedSub[sub.name] ? (
                              <ChevronDown className="ml-auto h-3 w-3 text-text-muted" />
                            ) : (
                              <ChevronRight className="ml-auto h-3 w-3 text-text-muted" />
                            )}
                          </button>
                          {expandedSub[sub.name] && (
                            <div className="ml-4 space-y-0.5">
                              {sub.standards.map((std) => (
                                <button
                                  key={std.id}
                                  onClick={() => setSelectedStd(std)}
                                  className={`w-full rounded-md px-2 py-1 text-left text-[10px] transition-colors ${
                                    selectedStd?.id === std.id
                                      ? 'bg-info/10 text-info'
                                      : 'text-text-muted hover:text-text-secondary'
                                  }`}
                                >
                                  <span className="font-data">{std.id}</span> · {std.name}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Detail */}
        <div className="col-span-8">
          {selectedStd ? (
            <div className="rounded-lg bg-gray-100 p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-data text-sm font-bold text-info">{selectedStd.id}</span>
                    <span className="rounded bg-[#F1F5F9] px-2 py-0.5 text-[10px] text-text-muted">
                      {selectedStd.version}
                    </span>
                  </div>
                  <h3 className="mt-1 text-lg font-semibold text-text-primary">{selectedStd.name}</h3>
                </div>
                <div className="flex gap-2">
                  <button className="flex items-center gap-1 rounded-md bg-[#F1F5F9] px-3 py-1.5 text-xs text-text-secondary transition-colors hover:text-text-primary">
                    <Eye className="h-3.5 w-3.5" />
                    预览
                  </button>
                  <button className="flex items-center gap-1 rounded-md bg-info px-3 py-1.5 text-xs text-white transition-colors hover:bg-info/80">
                    <Pencil className="h-3.5 w-3.5" />
                    编辑
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-md bg-gray-100/50 p-3">
                  <p className="text-[10px] text-text-muted">供应商</p>
                  <p className="mt-1 text-sm text-text-primary">{selectedStd.supplier}</p>
                </div>
                <div className="rounded-md bg-gray-100/50 p-3">
                  <p className="text-[10px] text-text-muted">检验方式</p>
                  <p className="mt-1 text-sm text-text-primary">{selectedStd.method}</p>
                </div>
                <div className="rounded-md bg-gray-100/50 p-3">
                  <p className="text-[10px] text-text-muted">抽样数量</p>
                  <p className="mt-1 text-sm font-data text-text-primary">{selectedStd.sampleQty} 件</p>
                </div>
              </div>

              <div className="mt-4 rounded-md bg-gray-100/50 p-3">
                <p className="mb-2 text-[10px] text-text-muted">必检字段</p>
                <div className="flex flex-wrap gap-2">
                  {selectedStd.requiredFields.map((field) => (
                    <span key={field} className="rounded bg-info/10 px-2 py-1 text-xs text-info">
                      {field}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-4">
                <p className="mb-2 text-xs text-text-muted">参考样图</p>
                <div className="flex h-32 items-center justify-center rounded-md bg-[#F1F5F9] text-xs text-text-muted">
                  <BookOpen className="mr-2 h-5 w-5" />
                  标准样图预览区域
                </div>
              </div>
            </div>
          ) : (
            <div className="flex h-96 flex-col items-center justify-center rounded-lg bg-gray-100 text-text-muted">
              <BookOpen className="mb-3 h-12 w-12" />
              <p className="text-sm">请从左侧选择一项标准查看详情</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminStandards;
