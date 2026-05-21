import type { FC } from 'react';
import { useState } from 'react';
import {
  FileText,
  CheckCircle,
  Send,
  MessageSquare,
} from 'lucide-react';
import { PageHeader } from '@/components/admin/PageHeader';
import { StatusBadge } from '@/components/admin/StatusBadge';

interface ClaimPhoto {
  name: string;
  src: string;
}

interface Claim {
  id: string;
  supplier: string;
  amount: number;
  status: string;
  date: string;
  handler: string;
  material: string;
  photos: ClaimPhoto[];
}

const claimList: Claim[] = [
  { id: 'CL-001', supplier: '江南华盛', amount: 12500, status: '待处理', date: '2024-03-15', handler: '张主管', material: '发动机线束', photos: [
    { name: '现场照片-1', src: '/images/claim-photo-1.jpg' },
    { name: '现场照片-2', src: '/images/claim-photo-2.jpg' },
    { name: '监控截图', src: '/images/claim-screenshot.jpg' },
  ]},
  { id: 'CL-002', supplier: '北方能源', amount: 86000, status: '处理中', date: '2024-03-15', handler: '赵主管', material: '动力电池组', photos: [
    { name: '现场照片-1', src: '/images/claim-photo-1.jpg' },
    { name: '现场照片-2', src: '/images/claim-photo-2.jpg' },
    { name: '监控截图', src: '/images/claim-screenshot.jpg' },
  ]},
  { id: 'CL-003', supplier: '精工汽配', amount: 3200, status: '已结案', date: '2024-03-10', handler: '李质检', material: '前轮轴承', photos: [
    { name: '现场照片-1', src: '/images/claim-photo-1.jpg' },
    { name: '现场照片-2', src: '/images/claim-photo-2.jpg' },
    { name: '监控截图', src: '/images/claim-screenshot.jpg' },
  ]},
];

const processSteps = [
  { label: '问题发现', done: true },
  { label: '证据收集', done: true },
  { label: '索赔申请', done: true },
  { label: '供应商确认', done: false },
  { label: '赔付协商', done: false },
  { label: '结案', done: false },
];

const messages = [
  { from: 'system', time: '2024-03-15 09:35', text: '索赔单 CL-001 已自动创建，关联事件 AE-001' },
  { from: 'handler', time: '2024-03-15 10:00', text: '已上传现场照片3张和Station检测记录' },
  { from: 'supplier', time: '2024-03-15 14:30', text: '已收到索赔申请，正在核实' },
  { from: 'handler', time: '2024-03-16 09:00', text: '请提供近批次质量检测报告' },
];

export const AdminClaims: FC = () => {
  const [selectedClaim, setSelectedClaim] = useState<Claim>(claimList[0]);
  const [chatInput, setChatInput] = useState('请确认本批发动机线束型号差异，并在今日内回复处理意见。');
  const [chatMessages, setChatMessages] = useState(messages);

  const handleSend = () => {
    if (!chatInput.trim()) return;
    setChatMessages([...chatMessages, {
      from: 'handler',
      time: new Date().toLocaleString('zh-CN'),
      text: chatInput,
    }]);
    setChatInput('');
  };

  const currentStep = processSteps.filter((s) => s.done).length;

  return (
    <div className="p-6">
      <PageHeader title="索赔协同" breadcrumbs={[{ label: '运营' }, { label: '索赔协同' }]} />

      {/* Stats */}
      <div className="mb-6 grid grid-cols-4 gap-4">
        <div className="rounded-lg bg-gray-100 p-4">
          <p className="text-xl font-bold text-accent font-data">¥12.8万</p>
          <p className="mt-1 text-xs text-text-muted">本月索赔金额</p>
        </div>
        <div className="rounded-lg bg-gray-100 p-4">
          <p className="text-xl font-bold text-info font-data">8</p>
          <p className="mt-1 text-xs text-text-muted">进行中索赔</p>
        </div>
        <div className="rounded-lg bg-gray-100 p-4">
          <p className="text-xl font-bold text-success font-data">15</p>
          <p className="mt-1 text-xs text-text-muted">本月完结</p>
        </div>
        <div className="rounded-lg bg-gray-100 p-4">
          <p className="text-xl font-bold text-success font-data">92%</p>
          <p className="mt-1 text-xs text-text-muted">索赔成功率</p>
        </div>
      </div>

      {/* Process Flow */}
      <div className="mb-6 rounded-lg bg-gray-100 p-5">
        <h3 className="mb-4 text-sm font-semibold text-text-primary">索赔流程</h3>
        <div className="flex items-center gap-2">
          {processSteps.map((step, i) => (
            <div key={step.label} className="flex flex-1 items-center">
              <div className="flex flex-1 flex-col items-center">
                <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                  step.done ? 'bg-success text-white' : 'bg-[#F1F5F9] text-text-muted'
                }`}>
                  {step.done ? <CheckCircle className="h-4 w-4" /> : <span className="h-2 w-2 rounded-full bg-current" />}
                </div>
                <span className={`mt-1.5 text-[10px] ${step.done ? 'text-success font-medium' : 'text-text-muted'}`}>
                  {step.label}
                </span>
              </div>
              {i < processSteps.length - 1 && (
                <div className={`h-0.5 w-8 ${
                  i < currentStep - 1 ? 'bg-success' : 'bg-border-light'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Split View */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left: Claim List */}
        <div className="col-span-4 rounded-lg bg-gray-100 p-4">
          <h3 className="mb-3 text-sm font-semibold text-text-primary">索赔列表</h3>
          <div className="space-y-2">
            {claimList.map((claim) => (
              <button
                key={claim.id}
                onClick={() => setSelectedClaim(claim)}
                className={`w-full rounded-md p-3 text-left transition-colors ${
                  selectedClaim.id === claim.id
                    ? 'bg-info/10 border-l-2 border-info'
                    : 'hover:bg-gray-100/50 border-l-2 border-transparent'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-data text-[10px] font-bold text-info">{claim.id}</span>
                  <StatusBadge status={claim.status as '待处理' | '处理中' | '已结案'} />
                </div>
                <p className="mt-1 text-xs text-text-primary">{claim.supplier}</p>
                <p className="text-[10px] text-text-muted">{claim.material}</p>
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-xs font-data font-medium text-accent">
                    ¥{claim.amount.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-text-muted">{claim.date}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right: Claim Detail */}
        <div className="col-span-8 space-y-4">
          {/* Detail Card */}
          <div className="rounded-lg bg-gray-100 p-5">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-info" />
                <span className="font-data text-lg font-bold text-text-primary">{selectedClaim.id}</span>
              </div>
              <StatusBadge status={selectedClaim.status as '待处理' | '处理中' | '已结案'} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-md bg-gray-100/50 p-3">
                <p className="text-[10px] text-text-muted">供应商</p>
                <p className="mt-1 text-sm text-text-primary">{selectedClaim.supplier}</p>
              </div>
              <div className="rounded-md bg-gray-100/50 p-3">
                <p className="text-[10px] text-text-muted">索赔金额</p>
                <p className="mt-1 text-sm font-data text-accent">¥{selectedClaim.amount.toLocaleString()}</p>
              </div>
              <div className="rounded-md bg-gray-100/50 p-3">
                <p className="text-[10px] text-text-muted">处理人</p>
                <p className="mt-1 text-sm text-text-primary">{selectedClaim.handler}</p>
              </div>
            </div>

            {/* Evidence */}
            <div className="mt-4">
              <h4 className="mb-2 text-xs font-semibold text-text-primary">证据材料</h4>
              <div className="flex gap-2">
                {selectedClaim.photos.map((photo) => (
                  <div key={photo.name} className="flex h-16 w-20 flex-col items-center justify-center overflow-hidden rounded-md bg-[#F1F5F9] text-[10px] text-text-muted">
                    <img src={photo.src} alt={photo.name} className="h-full w-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Communication Log */}
          <div className="rounded-lg bg-gray-100 p-4">
            <h4 className="mb-3 flex items-center gap-2 text-xs font-semibold text-text-primary">
              <MessageSquare className="h-4 w-4" />
              沟通记录
            </h4>
            <div className="mb-3 space-y-3">
              {chatMessages.map((msg, i) => (
                <div key={i} className="flex gap-3">
                  <div className={`mt-0.5 h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    msg.from === 'system' ? 'bg-info/20 text-info' :
                    msg.from === 'supplier' ? 'bg-warning/20 text-warning' :
                    'bg-success/20 text-success'
                  }`}>
                    {msg.from === 'system' ? 'S' : msg.from === 'supplier' ? '供' : '我'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-medium text-text-secondary">
                        {msg.from === 'system' ? '系统' : msg.from === 'supplier' ? '供应商' : '处理人'}
                      </span>
                      <span className="text-[10px] text-text-muted">{msg.time}</span>
                    </div>
                    <p className="mt-0.5 text-xs text-text-primary">{msg.text}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="输入消息..."
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

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-1.5 rounded-md bg-success px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-success/80">
              <CheckCircle className="h-3.5 w-3.5" />
              标记结案
            </button>
            <button className="flex items-center gap-1.5 rounded-md bg-[#F1F5F9] px-4 py-2 text-xs font-medium text-text-secondary transition-colors hover:text-text-primary">
              <FileText className="h-3.5 w-3.5" />
              上传证据
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminClaims;
