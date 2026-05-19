import type { FC } from 'react';
import { useState } from 'react';
import {
  Filter,
  X,
} from 'lucide-react';
import { PageHeader } from '@/components/admin/PageHeader';
import { StatusBadge } from '@/components/admin/StatusBadge';

type AnomalyFilter = '全部' | '型号不符' | '标签缺失' | '外观缺陷' | '数量异常' | '效期异常' | '多模态异常' | '包装破损' | '条码异常';

const anomalyTypes: AnomalyFilter[] = ['全部', '型号不符', '标签缺失', '外观缺陷', '数量异常'];

interface GalleryItem {
  id: string;
  title: string;
  desc: string;
  amount: string;
  level: string;
  type: AnomalyFilter;
  date: string;
  image: string;
}

const galleryItems: GalleryItem[] = [
  { id: 'AE-001', title: '型号不符', desc: '发动机线束型号与订单不符', amount: '¥12,800', level: 'L1', type: '型号不符', date: '2024-03-15', image: '/images/case-model-mismatch.jpg' },
  { id: 'AE-004', title: '标签缺失', desc: '丁腈手套外箱缺少产品标识', amount: '¥3,200', level: 'L1', type: '标签缺失', date: '2024-03-15', image: '/images/case-label-missing.jpg' },
  { id: 'AE-003', title: '数量差异', desc: '矿泉水现场数量少于系统记录', amount: '¥860', level: 'L2', type: '数量异常', date: '2024-03-15', image: '/images/case-qty-discrepancy.jpg' },
  { id: 'AE-005', title: '效期预警', desc: '5W-40机油效期临近', amount: '¥5,400', level: 'L2', type: '效期异常', date: '2024-03-15', image: '/images/case-expiry-warning.jpg' },
  { id: 'AE-006', title: '多模态异常', desc: '动力电池温度异常+外观变色', amount: '¥48,000', level: 'L1', type: '多模态异常', date: '2024-03-15', image: '/images/case-multimodal-alert.jpg' },
  { id: 'NG-001', title: '外观缺陷', desc: '前保险杠表面划痕', amount: '¥2,600', level: 'NG', type: '外观缺陷', date: '2024-03-15', image: '/images/case-appearance-defect.jpg' },
  { id: 'DM-001', title: '包装破损', desc: '外包装严重破损影响内部件', amount: '¥7,800', level: 'L2', type: '包装破损', date: '2024-03-15', image: '/images/case-damaged-package.jpg' },
  { id: 'BC-001', title: '条码无效', desc: '条码无法识别或损坏', amount: '¥1,200', level: 'L2', type: '条码异常', date: '2024-03-15', image: '/images/case-barcode-invalid.jpg' },
];

export const AdminGallery: FC = () => {
  const [activeFilter, setActiveFilter] = useState<AnomalyFilter>('全部');
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);

  const filtered = activeFilter === '全部'
    ? galleryItems
    : galleryItems.filter((item) => item.type === activeFilter);

  return (
    <div className="p-6">
      <PageHeader title="异常案例库" breadcrumbs={[{ label: '知识库' }, { label: '异常案例库' }]} />

      {/* Filters */}
      <div className="mb-6 flex items-center gap-3">
        <Filter className="h-4 w-4 text-text-muted" />
        {anomalyTypes.map((type) => (
          <button
            key={type}
            onClick={() => setActiveFilter(type)}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              activeFilter === type
                ? 'bg-info/20 text-info'
                : 'text-text-muted hover:bg-gray-100 hover:text-text-secondary'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-4 gap-4">
        {filtered.map((item) => (
          <button
            key={item.id}
            onClick={() => setSelectedItem(item)}
            className="group relative overflow-hidden rounded-lg bg-gray-100 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
          >
            {/* Case Image */}
            <div className="relative flex h-32 items-center justify-center bg-[#F1F5F9]">
              <img src={item.image} alt={item.title} className="h-full w-full object-cover" />
              {/* Overlay on hover */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/40">
                <span className="text-xs font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
                  查看详情
                </span>
              </div>
              {/* Type badge */}
              <span className="absolute left-2 top-2">
                <StatusBadge status={item.level as 'L1' | 'L2' | 'NG'} />
              </span>
            </div>
            {/* Info */}
            <div className="p-3">
              <div className="flex items-center justify-between">
                <span className="font-data text-[10px] font-bold text-info">{item.id}</span>
                <span className="text-[10px] text-text-muted">{item.date}</span>
              </div>
              <p className="mt-1 text-xs font-medium text-text-primary">{item.title}</p>
              <p className="text-[10px] text-text-muted">{item.desc}</p>
              <p className="mt-1 text-xs font-data font-medium text-accent">
                {item.amount}
              </p>
            </div>
          </button>
        ))}
      </div>

      {/* Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSelectedItem(null)} />
          <div className="relative w-[600px] rounded-lg bg-[#F1F5F9] p-6 shadow-xl">
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute right-4 top-4 rounded p-1 text-text-muted hover:text-text-primary"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="flex gap-6">
              {/* Left: Case Image */}
              <div className="flex h-48 w-64 items-center justify-center rounded-lg bg-gray-100 overflow-hidden">
                <img src={selectedItem.image} alt={selectedItem.title} className="h-full w-full object-cover" />
              </div>
              {/* Right: Info */}
              <div className="flex-1">
                <div className="mb-3 flex items-center gap-2">
                  <span className="font-data text-sm font-bold text-info">{selectedItem.id}</span>
                  <StatusBadge status={selectedItem.level as 'L1' | 'L2' | 'NG'} />
                </div>
                <h3 className="text-base font-semibold text-text-primary">{selectedItem.title}</h3>
                <div className="mt-3 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-text-muted">异常类型</span>
                    <span className="text-text-primary">{selectedItem.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">描述</span>
                    <span className="text-text-primary">{selectedItem.desc}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">发现时间</span>
                    <span className="font-data text-text-primary">{selectedItem.date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">影响金额</span>
                    <span className="font-data text-accent">{selectedItem.amount}</span>
                  </div>
                </div>
                <div className="mt-3 rounded-md bg-gray-100 p-2.5">
                  <p className="text-xs text-text-secondary">{selectedItem.desc}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminGallery;
