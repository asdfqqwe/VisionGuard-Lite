import type { FC } from 'react';
import { useState } from 'react';
import {
  ClipboardList,
  Search,
  Plus,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { PageHeader } from '@/components/admin/PageHeader';
import { StatusBadge } from '@/components/admin/StatusBadge';
import type { WorkOrder } from '@/data/mockData';

type TabKey = '全部' | '待处理' | '处理中' | '已完结';

const tabs: TabKey[] = ['全部', '待处理', '处理中', '已完结'];

export const AdminWorkOrders: FC = () => {
  const { workOrders, agentEvents } = useData();
  const [activeTab, setActiveTab] = useState<TabKey>('全部');
  const [selectedWO, setSelectedWO] = useState<WorkOrder | null>(workOrders[0] || null);
  const [searchText, setSearchText] = useState('');
  const [typeFilter, setTypeFilter] = useState('全部');

  const filteredWO = workOrders.filter((wo) => {
    if (activeTab !== '全部' && wo.status !== activeTab) return false;
    if (searchText && !wo.workOrderId.includes(searchText)) return false;
    return true;
  });

  const stats = {
    total: workOrders.length,
    processing: workOrders.filter((w) => w.status === '处理中').length,
    pending: workOrders.filter((w) => w.status === '待处理').length,
    completed: workOrders.filter((w) => w.status === '已完结').length,
  };

  const relatedEvent = selectedWO
    ? agentEvents.find((e) => e.eventNo === selectedWO.eventNo)
    : null;

  return (
    <div className="p-6">
      <PageHeader
        title="工单中心"
        breadcrumbs={[{ label: '作业' }, { label: '工单中心' }]}
        actions={
          <button className="flex items-center gap-1.5 rounded-md bg-accent px-3 py-1.5 text-xs font-medium text-primary-dark transition-colors hover:bg-accent-dark">
            <Plus className="h-3.5 w-3.5" />
            新建工单
          </button>
        }
      />

      {/* Stats */}
      <div className="mb-6 grid grid-cols-4 gap-4">
        <div className="rounded-lg bg-gray-100 p-4">
          <p className="text-xl font-bold text-text-primary font-data">{stats.total}</p>
          <p className="mt-1 text-xs text-text-muted">本月工单</p>
        </div>
        <div className="rounded-lg bg-gray-100 p-4">
          <p className="text-xl font-bold text-info font-data">{stats.processing}</p>
          <p className="mt-1 text-xs text-text-muted">处理中</p>
        </div>
        <div className="rounded-lg bg-gray-100 p-4">
          <p className="text-xl font-bold text-warning font-data">{stats.pending}</p>
          <p className="mt-1 text-xs text-text-muted">待确认</p>
        </div>
        <div className="rounded-lg bg-gray-100 p-4">
          <p className="text-xl font-bold text-success font-data">{stats.completed}</p>
          <p className="mt-1 text-xs text-text-muted">已完成</p>
        </div>
      </div>

      {/* Filter + Tabs */}
      <div className="mb-4 flex items-center gap-3">
        <div className="flex items-center gap-2 rounded-md bg-gray-100 px-3 py-1.5">
          <Filter className="h-3.5 w-3.5 text-text-muted" />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-transparent text-xs text-text-primary outline-none"
          >
            <option>全部</option>
            <option>收货拦截</option>
            <option>标签缺失</option>
            <option>外观缺陷</option>
            <option>多模态异常</option>
          </select>
        </div>
        <div className="flex items-center gap-2 rounded-md bg-gray-100 px-3 py-1.5">
          <Search className="h-3.5 w-3.5 text-text-muted" />
          <input
            type="text"
            placeholder="搜索工单号"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="bg-transparent text-xs text-text-primary outline-none placeholder:text-text-muted"
          />
        </div>
        <div className="ml-auto flex rounded-md bg-gray-100 p-0.5">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded px-3 py-1.5 text-xs font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-info/20 text-info'
                  : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Split View */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left: Work Order List */}
        <div className="col-span-5 rounded-lg bg-gray-100 p-4">
          <h3 className="mb-3 text-sm font-semibold text-text-primary">工单列表</h3>
          <div className="space-y-2">
            {filteredWO.map((wo) => (
              <button
                key={wo.workOrderId}
                onClick={() => setSelectedWO(wo)}
                className={`w-full rounded-md p-3 text-left transition-colors ${
                  selectedWO?.workOrderId === wo.workOrderId
                    ? 'bg-info/10 border-l-2 border-info'
                    : 'hover:bg-gray-100/50 border-l-2 border-transparent'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-data text-xs font-bold text-text-primary">{wo.workOrderId}</span>
                  <StatusBadge status={wo.status} />
                </div>
                <p className="mt-1 text-xs text-text-secondary">{wo.title}</p>
                <div className="mt-1 flex items-center gap-2 text-[10px] text-text-muted">
                  <span>{wo.anomalyType}</span>
                  <span>|</span>
                  <span>{wo.createdAt}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right: Work Order Detail */}
        <div className="col-span-7 space-y-4">
          {selectedWO && (
            <>
              <div className="rounded-lg bg-gray-100 p-5">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-text-primary">{selectedWO.title}</h3>
                  <StatusBadge status={selectedWO.status} />
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="rounded-md bg-gray-100/40 p-3">
                    <p className="text-text-muted">工单号</p>
                    <p className="mt-1 font-data text-text-primary">{selectedWO.workOrderId}</p>
                  </div>
                  <div className="rounded-md bg-gray-100/40 p-3">
                    <p className="text-text-muted">关联事件</p>
                    <p className="mt-1 font-data text-info">{selectedWO.eventNo}</p>
                  </div>
                  <div className="rounded-md bg-gray-100/40 p-3">
                    <p className="text-text-muted">异常类型</p>
                    <p className="mt-1 text-text-primary">{selectedWO.anomalyType}</p>
                  </div>
                  <div className="rounded-md bg-gray-100/40 p-3">
                    <p className="text-text-muted">优先级</p>
                    <div className="mt-1">
                      <StatusBadge status={selectedWO.level} />
                    </div>
                  </div>
                  <div className="rounded-md bg-gray-100/40 p-3">
                    <p className="text-text-muted">创建时间</p>
                    <p className="mt-1 text-text-primary">{selectedWO.createdAt}</p>
                  </div>
                  <div className="rounded-md bg-gray-100/40 p-3">
                    <p className="text-text-muted">处理人</p>
                    <p className="mt-1 text-text-primary">{selectedWO.assignedTo}</p>
                  </div>
                </div>
                <div className="mt-4 rounded-md bg-gray-100/40 p-3">
                  <p className="text-text-muted">问题描述</p>
                  <p className="mt-1 leading-relaxed text-text-secondary">{selectedWO.description}</p>
                </div>
              </div>

              {/* Agent Initial Suggestion */}
              <div className="rounded-lg border-l-[3px] border-l-info bg-gray-100 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <ClipboardList className="h-4 w-4 text-info" />
                  <h3 className="text-sm font-semibold text-info">Agent初始建议</h3>
                </div>
                {relatedEvent && (
                  <div className="space-y-2 text-xs text-text-secondary">
                    <p>建议动作：<span className="text-text-primary">{relatedEvent.suggestedActions.join('、')}</span></p>
                    <p>建议处理人：<span className="text-text-primary">
                      {relatedEvent.eventNo === 'AE-001' ? '收货主管' :
                       relatedEvent.eventNo === 'AE-002' ? '复核员' :
                       relatedEvent.eventNo === 'AE-003' ? '巡检员' :
                       relatedEvent.eventNo === 'AE-004' ? '收货主管' :
                       relatedEvent.eventNo === 'AE-005' ? '质检员' : '安全主管'}
                    </span></p>
                    <p>关联编号：
                      <span className="font-data text-info">{relatedEvent.linkedIds.workOrderId}</span>
                      {relatedEvent.linkedIds.problemItemNo && (
                        <> / <span className="font-data text-warning">{relatedEvent.linkedIds.problemItemNo}</span></>
                      )}
                      {relatedEvent.linkedIds.claimNo && (
                        <> / <span className="font-data text-danger">{relatedEvent.linkedIds.claimNo}</span></>
                      )}
                    </p>
                  </div>
                )}
              </div>

              {/* Field Evidence */}
              <div className="rounded-lg bg-gray-100 p-4">
                <h3 className="mb-3 text-sm font-semibold text-text-primary">现场证据</h3>
                <div className="flex gap-2">
                  {['检测截图-1', '检测截图-2', 'Station记录'].map((name, i) => (
                    <div
                      key={i}
                      className="flex h-16 w-24 items-center justify-center rounded-md bg-[#F1F5F9] text-[10px] text-text-muted"
                    >
                      {name}
                    </div>
                  ))}
                </div>
              </div>

              {/* Human Processing Result */}
              <div className="rounded-lg bg-gray-100 p-4">
                <h3 className="mb-3 text-sm font-semibold text-text-primary">人工处理结果</h3>
                <div className="flex items-center gap-3">
                  <button className="flex items-center gap-1.5 rounded-md bg-success px-3 py-2 text-xs text-white transition-colors hover:bg-success/80">
                    <CheckCircle className="h-3.5 w-3.5" />
                    确认AI正确
                  </button>
                  <button className="flex items-center gap-1.5 rounded-md bg-warning px-3 py-2 text-xs text-primary-dark transition-colors hover:bg-warning/80">
                    <Clock className="h-3.5 w-3.5" />
                    修正并提交
                  </button>
                  <button className="flex items-center gap-1.5 rounded-md bg-danger px-3 py-2 text-xs text-white transition-colors hover:bg-danger/80">
                    <XCircle className="h-3.5 w-3.5" />
                    关闭工单
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminWorkOrders;
