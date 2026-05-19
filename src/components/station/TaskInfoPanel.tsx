import type { FC } from 'react';
import { Package, Truck, Hash, Boxes, Weight, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DeliveryItem, OutboundItem } from '@/data/mockData';

interface TaskInfoPanelProps {
  type: 'receive' | 'outbound';
  orderNo?: string;
  supplier?: string;
  source?: string;
  totalItems?: number;
  weight?: string;
  arrivalTime?: string;
  items?: (DeliveryItem | OutboundItem)[];
  currentItemIndex?: number;
  className?: string;
}

const isDeliveryItem = (item: DeliveryItem | OutboundItem): item is DeliveryItem =>
  'inspectionMode' in item;

export const TaskInfoPanel: FC<TaskInfoPanelProps> = ({
  type,
  orderNo = 'PKG-2024-001247',
  supplier = '华东物流',
  source = '收货台 PKG-01',
  totalItems = 12,
  weight = '23.5kg',
  arrivalTime = '09:32:15',
  items = [],
  currentItemIndex = 0,
  className,
}) => {
  return (
    <div className={cn('flex h-full flex-col', className)}>
      {/* Order Info Card */}
      <div className="rounded-lg bg-[#F1F5F9] p-3">
        <h3 className="text-xs font-semibold text-text-primary">
          {type === 'receive' ? '运单信息' : '出库单信息'}
        </h3>

        <div className="mt-2 space-y-2">
          <div className="flex items-center gap-2">
            <Package className="h-3.5 w-3.5 text-text-muted" />
            <span className="text-[11px] text-text-muted">
              {type === 'receive' ? '运单号' : '出库单号'}
            </span>
            <span className="ml-auto font-mono text-xs text-text-primary">{orderNo}</span>
          </div>
          <div className="flex items-center gap-2">
            <Truck className="h-3.5 w-3.5 text-text-muted" />
            <span className="text-[11px] text-text-muted">
              {type === 'receive' ? '来源' : '客户'}
            </span>
            <span className="ml-auto text-xs text-text-primary">{supplier}</span>
          </div>
          <div className="flex items-center gap-2">
            <Hash className="h-3.5 w-3.5 text-text-muted" />
            <span className="text-[11px] text-text-muted">
              {type === 'receive' ? '供应商' : '订单类型'}
            </span>
            <span className="ml-auto text-xs text-text-primary">{source}</span>
          </div>
          <div className="flex items-center gap-2">
            <Boxes className="h-3.5 w-3.5 text-text-muted" />
            <span className="text-[11px] text-text-muted">件数</span>
            <span className="ml-auto font-mono text-xs text-text-primary">{totalItems}</span>
          </div>
          {weight && (
            <div className="flex items-center gap-2">
              <Weight className="h-3.5 w-3.5 text-text-muted" />
              <span className="text-[11px] text-text-muted">重量</span>
              <span className="ml-auto font-mono text-xs text-text-primary">{weight}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Clock className="h-3.5 w-3.5 text-text-muted" />
            <span className="text-[11px] text-text-muted">
              {type === 'receive' ? '到库时间' : '要求发货'}
            </span>
            <span className="ml-auto font-mono text-xs text-text-primary">{arrivalTime}</span>
          </div>
        </div>
      </div>

      {/* Item List */}
      {items.length > 0 && (
        <div className="mt-3 flex-1 overflow-hidden rounded-lg bg-[#F1F5F9]">
          <div className="border-b border-border px-3 py-2">
            <h3 className="text-xs font-semibold text-text-primary">
              货品清单（{items.length}件）
            </h3>
          </div>
          <div className="max-h-[240px] overflow-y-auto p-1.5">
            {items.map((item, idx) => {
              const isCurrent = idx === currentItemIndex;
              const statusColor =
                item.status === '通过'
                  ? 'bg-success'
                  : item.status === '拦截' || item.status === '多模态异常'
                    ? 'bg-danger'
                    : item.status === '警示' || item.status === '不清晰'
                      ? 'bg-warning'
                      : item.status === '标签缺失'
                        ? 'bg-danger'
                        : item.status === '外观缺陷'
                          ? 'bg-defect-badge'
                          : 'bg-text-muted';

              return (
                <div
                  key={item.id}
                  className={cn(
                    'flex items-center gap-2 rounded px-2 py-1.5 transition-colors',
                    isCurrent && 'bg-info/15',
                    !isCurrent && 'hover:bg-primary/30'
                  )}
                >
                  <span className="w-5 text-[10px] text-text-muted">{item.lineNo}</span>
                  <span className="flex-1 truncate text-[11px] text-text-primary">
                    {item.materialName}
                  </span>
                  {isDeliveryItem(item) && (
                    <span className="rounded bg-primary px-1 py-0.5 text-[10px] text-text-muted">
                      {item.inspectionMode}
                    </span>
                  )}
                  <div className={cn('h-2 w-2 rounded-full', statusColor)} />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Bottom action buttons */}
      <div className="mt-3 flex gap-2">
        <button className="flex-1 rounded bg-primary py-2 text-xs text-text-secondary transition-colors hover:bg-gray-100">
          重新检测
        </button>
        <button className="flex-1 rounded bg-info py-2 text-xs font-medium text-white transition-colors hover:bg-info/90">
          确认结果
        </button>
      </div>
    </div>
  );
};

export default TaskInfoPanel;
