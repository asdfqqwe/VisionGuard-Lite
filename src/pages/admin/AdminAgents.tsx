import type { FC } from 'react';
import { useState } from 'react';
import {
  Bot,
  Search,
  Send,
  Filter,
  ChevronDown,
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { PageHeader } from '@/components/admin/PageHeader';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const performanceData = [
  { hour: '08:00', generated: 12, adopted: 10, rejected: 2 },
  { hour: '09:00', generated: 18, adopted: 16, rejected: 2 },
  { hour: '10:00', generated: 25, adopted: 22, rejected: 3 },
  { hour: '11:00', generated: 15, adopted: 14, rejected: 1 },
  { hour: '12:00', generated: 8, adopted: 7, rejected: 1 },
  { hour: '13:00', generated: 20, adopted: 18, rejected: 2 },
  { hour: '14:00', generated: 22, adopted: 19, rejected: 3 },
  { hour: '15:00', generated: 16, adopted: 15, rejected: 1 },
];

const suggestionHistory = [
  { id: 1, time: '10:30', content: '发动机线束型号不符，建议创建工单并隔离', status: '已采纳' as const },
  { id: 2, time: '10:25', content: '丁腈手套标签缺失，建议暂缓签收', status: '待确认' as const },
  { id: 3, time: '10:15', content: '矿泉水库存差异，建议盘点复点', status: '已采纳' as const },
  { id: 4, time: '10:08', content: '机油标准号不清晰，建议人工复核', status: '已驳回' as const },
  { id: 5, time: '09:55', content: '动力电池组温度异常，建议立即隔离', status: '已采纳' as const },
];

export const AdminAgents: FC = () => {
  const { agentEvents } = useData();
  const [selectedEvent, setSelectedEvent] = useState(agentEvents[0] || null);
  const [statusFilter, setStatusFilter] = useState('全部');
  const [typeFilter] = useState('全部');
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { from: 'agent', text: '今日已处理47条建议，其中3条待人工确认。', time: '10:30' },
    { from: 'user', text: '重点关注江南华盛供应商的连续异常。', time: '10:31' },
    { from: 'agent', text: '已记录：供应商【江南华盛】近7日第3次型号异常，已推送提醒。', time: '10:32' },
  ]);

  const filteredEvents = agentEvents.filter((e) => {
    if (statusFilter !== '全部' && e.status !== statusFilter) return false;
    if (typeFilter !== '全部' && !e.anomalyType.includes(typeFilter)) return false;
    return true;
  });

  const handleSend = () => {
    if (!chatInput.trim()) return;
    setChatMessages([...chatMessages, { from: 'user', text: chatInput, time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }) }]);
    setChatInput('');
    setTimeout(() => {
      setChatMessages(prev => [...prev, { from: 'agent', text: '已收到您的指令，正在处理中...', time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }) }]);
    }, 800);
  };

  return (
    <div className="p-6">
      <PageHeader title="Agent协作台" breadcrumbs={[{ label: '工作台' }, { label: 'Agent协作台' }]} />

      {/* Stat Cards */}
      <div className="mb-6 grid grid-cols-3 gap-6">
        <div className="rounded-lg bg-gray-100 p-5">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-info" />
            <span className="text-2xl font-bold text-info font-data">4</span>
          </div>
          <p className="mt-1 text-xs text-text-muted">在线Agent</p>
          <div className="mt-2 space-y-1 text-[10px] text-text-secondary">
            <p>质检Agent <span className="ml-1 inline-block h-1.5 w-1.5 rounded-full bg-success" /></p>
            <p>调度Agent <span className="ml-1 inline-block h-1.5 w-1.5 rounded-full bg-success" /></p>
            <p>分析Agent <span className="ml-1 inline-block h-1.5 w-1.5 rounded-full bg-success" /></p>
            <p>预警Agent <span className="ml-1 inline-block h-1.5 w-1.5 rounded-full bg-success" /></p>
          </div>
        </div>
        <div className="rounded-lg bg-gray-100 p-5">
          <p className="text-2xl font-bold text-text-primary font-data">47</p>
          <p className="text-xs text-text-muted">今日建议</p>
          <p className="mt-2 text-xs text-success">采纳率 89.4%</p>
        </div>
        <div className="rounded-lg bg-gray-100 p-5">
          <p className="text-2xl font-bold text-warning font-data">3</p>
          <p className="text-xs text-text-muted">待人工确认</p>
          <p className="mt-2 text-xs text-danger">其中L1拦截 2 件</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="mb-4 flex items-center gap-3">
        <div className="flex items-center gap-2 rounded-md bg-gray-100 px-3 py-1.5">
          <Filter className="h-3.5 w-3.5 text-text-muted" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-transparent text-xs text-text-primary outline-none"
          >
            <option>全部</option>
            <option>待人工确认</option>
            <option>已提醒</option>
            <option>处理中</option>
            <option>已处理</option>
          </select>
          <ChevronDown className="h-3 w-3 text-text-muted" />
        </div>
        <div className="flex items-center gap-2 rounded-md bg-gray-100 px-3 py-1.5">
          <Search className="h-3.5 w-3.5 text-text-muted" />
          <input
            type="text"
            placeholder="搜索事件号或类型"
            className="bg-transparent text-xs text-text-primary outline-none placeholder:text-text-muted"
          />
        </div>
      </div>

      {/* Main Content: Event List + Chat + History */}
      <div className="mb-6 grid grid-cols-12 gap-6">
        {/* Event List (Left) */}
        <div className="col-span-3 rounded-lg bg-gray-100 p-4">
          <h3 className="mb-3 text-sm font-semibold text-text-primary">异常事件</h3>
          <div className="space-y-2">
            {filteredEvents.map((event) => (
              <button
                key={event.eventNo}
                onClick={() => setSelectedEvent(event)}
                className={`w-full rounded-md p-3 text-left transition-colors ${
                  selectedEvent?.eventNo === event.eventNo
                    ? 'bg-info/10 border-l-2 border-info'
                    : 'hover:bg-gray-100/50 border-l-2 border-transparent'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-data text-[10px] font-bold text-info">{event.eventNo}</span>
                  <StatusBadge status={event.status} />
                </div>
                <p className="mt-1 truncate text-xs text-text-secondary">{event.anomalyType}</p>
                <p className="text-[10px] text-text-muted">{event.materialName}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Area (Center) */}
        <div className="col-span-5 rounded-lg bg-gray-100 p-4">
          <h3 className="mb-3 text-sm font-semibold text-text-primary">Agent协作对话</h3>
          <div className="h-[340px] space-y-3 overflow-y-auto rounded-md bg-gray-100/40 p-3">
            {chatMessages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.from === 'agent' ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-3 py-2 ${
                    msg.from === 'agent'
                      ? 'rounded-tl-none bg-[#F1F5F9] text-text-secondary'
                      : 'rounded-tr-none bg-info/20 text-text-primary'
                  }`}
                >
                  <p className="text-xs">{msg.text}</p>
                  <span className="mt-1 block text-[10px] text-text-muted">{msg.time}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-2 flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="输入指令..."
              className="flex-1 rounded-md border border-border-light bg-[#F1F5F9] px-3 py-2 text-xs text-text-primary outline-none focus:border-info"
            />
            <button
              onClick={handleSend}
              className="rounded-md bg-info p-2 text-white transition-colors hover:bg-info/80"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Event Detail + Suggestion History (Right) */}
        <div className="col-span-4 space-y-4">
          {/* Event Detail */}
          {selectedEvent && (
            <div className="rounded-lg bg-gray-100 p-4">
              <h3 className="mb-3 text-sm font-semibold text-text-primary">事件详情</h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-text-muted">事件号</span>
                  <span className="font-data text-text-primary">{selectedEvent.eventNo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">来源</span>
                  <span className="text-text-primary">{selectedEvent.source}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">异常类型</span>
                  <span className="text-text-primary">{selectedEvent.anomalyType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">物资</span>
                  <span className="text-text-primary">{selectedEvent.materialName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">检测等级</span>
                  <StatusBadge status={selectedEvent.detectLevel} />
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">状态</span>
                  <StatusBadge status={selectedEvent.status} />
                </div>
                {selectedEvent.linkedIds.workOrderId && (
                  <div className="flex justify-between">
                    <span className="text-text-muted">关联工单</span>
                    <span className="font-data text-info">{selectedEvent.linkedIds.workOrderId}</span>
                  </div>
                )}
              </div>
              <div className="mt-3 rounded-md border-l-2 border-info bg-gray-100/50 p-2">
                <p className="text-[10px] text-info">Agent建议：</p>
                <p className="mt-0.5 text-xs text-text-secondary">
                  {selectedEvent.suggestedActions.join('、')}
                </p>
              </div>
              <div className="mt-3 flex gap-2">
                <button className="rounded-md bg-success px-3 py-1.5 text-xs text-white transition-colors hover:bg-success/80">
                  确认处理
                </button>
                <button className="rounded-md bg-[#F1F5F9] px-3 py-1.5 text-xs text-text-secondary transition-colors hover:text-text-primary">
                  查看工单
                </button>
                <button className="rounded-md bg-[#F1F5F9] px-3 py-1.5 text-xs text-text-secondary transition-colors hover:text-text-primary">
                  转人工
                </button>
              </div>
            </div>
          )}

          {/* Suggestion History */}
          <div className="rounded-lg bg-gray-100 p-4">
            <h3 className="mb-3 text-sm font-semibold text-text-primary">建议历史</h3>
            <div className="space-y-2">
              {suggestionHistory.map((s) => (
                <div
                  key={s.id}
                  className={`rounded-md border-l-2 p-2 ${
                    s.status === '已采纳'
                      ? 'border-success bg-success/5'
                      : s.status === '待确认'
                      ? 'border-warning bg-warning/5'
                      : 'border-danger bg-danger/5'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-text-muted">{s.time}</span>
                    <span
                      className={`text-[10px] font-bold ${
                        s.status === '已采纳'
                          ? 'text-success'
                          : s.status === '待确认'
                          ? 'text-warning'
                          : 'text-danger'
                      }`}
                    >
                      {s.status}
                    </span>
                  </div>
                  <p className="mt-0.5 line-clamp-2 text-xs text-text-secondary">{s.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Performance Chart */}
      <div className="rounded-lg bg-gray-100 p-5">
        <h3 className="mb-4 text-sm font-semibold text-text-primary">Agent 24小时性能趋势</h3>
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="hour" stroke="#64748B" fontSize={11} />
              <YAxis stroke="#64748B" fontSize={11} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '6px', fontSize: '12px' }}
                labelStyle={{ color: '#94A3B8' }}
              />
              <Line type="monotone" dataKey="generated" name="生成建议" stroke="#3B82F6" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="adopted" name="采纳建议" stroke="#22C55E" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="rejected" name="驳回建议" stroke="#DC2626" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AdminAgents;
