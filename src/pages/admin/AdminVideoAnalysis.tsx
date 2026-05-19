import type { FC } from 'react';
import { useState } from 'react';
import {
  Video,
  AlertTriangle,
  Camera,
  Clock,
  Play,
  Pause,
  Volume2,
  VolumeX,
  FileText,
} from 'lucide-react';
import { PageHeader } from '@/components/admin/PageHeader';

interface ViolationEvent {
  id: string;
  time: string;
  camera: string;
  type: string;
  confidence: number;
  screenshot: boolean;
  workOrder: string;
  image: string;
}

const violationEvents: ViolationEvent[] = [
  { id: 'VD-001', time: '09:23:15', camera: 'CAM-03', type: '未戴安全帽', confidence: 94.2, screenshot: true, workOrder: 'WO-2024-0100', image: '/images/violation-no-helmet.jpg' },
  { id: 'VD-002', time: '10:05:32', camera: 'CAM-07', type: '违规堆高', confidence: 87.6, screenshot: true, workOrder: 'WO-2024-0101', image: '/images/violation-overstack.jpg' },
  { id: 'VD-003', time: '10:45:08', camera: 'CAM-12', type: '烟火异常', confidence: 99.1, screenshot: true, workOrder: 'WO-2024-0102', image: '/images/violation-fire.jpg' },
];

export const AdminVideoAnalysis: FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<ViolationEvent | null>(violationEvents[0]);

  return (
    <div className="p-6">
      <PageHeader title="视频违规分析" breadcrumbs={[{ label: '分析' }, { label: '视频违规分析' }]} />

      {/* Stats */}
      <div className="mb-6 grid grid-cols-3 gap-4">
        <div className="rounded-lg bg-gray-100 p-5">
          <div className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-info" />
            <span className="text-2xl font-bold text-text-primary font-data">24</span>
          </div>
          <p className="mt-1 text-xs text-text-muted">今日视频数</p>
        </div>
        <div className="rounded-lg bg-gray-100 p-5">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-video-alert" />
            <span className="text-2xl font-bold text-video-alert font-data">3</span>
          </div>
          <p className="mt-1 text-xs text-text-muted">违规检测</p>
        </div>
        <div className="rounded-lg bg-gray-100 p-5">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-warning" />
            <span className="text-2xl font-bold text-warning font-data">0</span>
          </div>
          <p className="mt-1 text-xs text-text-muted">待复核</p>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Video Stream */}
        <div className="col-span-8">
          <div className="rounded-lg bg-gray-100 p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-text-primary">
                监控画面 · CAM-03 收货区主通道
              </h3>
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-danger opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-danger" />
                </span>
                <span className="text-[10px] text-danger font-medium">LIVE</span>
              </div>
            </div>

            {/* Video Placeholder */}
            <div className="relative flex h-80 items-center justify-center rounded-md bg-black">
              <div className="text-center">
                <Video className="mx-auto mb-2 h-12 w-12 text-text-muted/30" />
                <p className="text-sm text-text-muted">模拟视频流</p>
                <p className="text-xs text-text-muted/60">CAM-03 收货区主通道</p>
              </div>

              {/* Overlay controls */}
              <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between bg-black/60 px-4 py-2">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="rounded p-1 text-white/80 hover:bg-white/10"
                  >
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="rounded p-1 text-white/80 hover:bg-white/10"
                  >
                    {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </button>
                </div>
                <span className="text-[10px] text-white/60 font-data">{new Date().toLocaleTimeString('zh-CN')}</span>
              </div>

              {/* Event highlight overlay */}
              {selectedEvent && (
                <div className="absolute left-4 top-4 rounded-md bg-video-alert/80 px-2 py-1">
                  <span className="text-[10px] font-bold text-white">{selectedEvent.type} · {selectedEvent.confidence}%</span>
                </div>
              )}
            </div>

            {/* Camera selector */}
            <div className="mt-3 flex gap-2">
              {['CAM-01', 'CAM-02', 'CAM-03', 'CAM-07', 'CAM-12'].map((cam) => (
                <button
                  key={cam}
                  className={`rounded-md px-2.5 py-1 text-[10px] font-medium transition-colors ${
                    cam === 'CAM-03'
                      ? 'bg-video-alert/20 text-video-alert'
                      : 'bg-[#F1F5F9] text-text-muted hover:text-text-secondary'
                  }`}
                >
                  {cam}
                </button>
              ))}
            </div>
          </div>

          {/* Screenshot Evidence */}
          {selectedEvent && (
            <div className="mt-4 rounded-lg bg-gray-100 p-4">
              <h3 className="mb-3 text-sm font-semibold text-text-primary">截图证据</h3>
              <div className="flex gap-3">
                <div className="relative flex h-20 w-28 items-center justify-center overflow-hidden rounded-md bg-[#F1F5F9]">
                  <img src={selectedEvent?.image} alt="违规截图" className="h-full w-full object-cover" />
                  <span className="absolute bottom-1 left-1 text-[9px] text-text-muted font-data">{selectedEvent.time}</span>
                </div>
                <div className="relative flex h-20 w-28 items-center justify-center overflow-hidden rounded-md bg-[#F1F5F9]">
                  <img src={selectedEvent?.image} alt="违规截图" className="h-full w-full object-cover" />
                  <span className="absolute bottom-1 left-1 text-[9px] text-text-muted font-data">-5s</span>
                </div>
                <div className="relative flex h-20 w-28 items-center justify-center overflow-hidden rounded-md bg-[#F1F5F9]">
                  <img src={selectedEvent?.image} alt="违规截图" className="h-full w-full object-cover" />
                  <span className="absolute bottom-1 left-1 text-[9px] text-text-muted font-data">+5s</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: Violation Timeline */}
        <div className="col-span-4 space-y-4">
          {/* Violation Event Timeline */}
          <div className="rounded-lg bg-gray-100 p-4">
            <h3 className="mb-3 text-sm font-semibold text-text-primary">违规事件时间线</h3>
            <div className="relative ml-3">
              {/* Vertical line */}
              <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-border-light" />
              <div className="space-y-4">
                {violationEvents.map((event) => (
                  <div
                    key={event.id}
                    className="relative flex gap-3 cursor-pointer"
                    onClick={() => setSelectedEvent(event)}
                  >
                    {/* Icon */}
                    <div className={`relative z-10 flex h-6 w-6 items-center justify-center rounded-full ${
                      selectedEvent?.id === event.id ? 'bg-video-alert' : 'bg-video-alert/50'
                    }`}>
                      <AlertTriangle className="h-3 w-3 text-white" />
                    </div>
                    {/* Content */}
                    <div className={`flex-1 rounded-md p-2.5 transition-colors ${
                      selectedEvent?.id === event.id ? 'bg-video-alert/10 border border-video-alert/30' : 'bg-gray-100/40'
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-text-primary">{event.type}</span>
                        <span className="font-data text-[10px] text-text-muted">{event.time}</span>
                      </div>
                      <div className="mt-1 flex items-center gap-2 text-[10px] text-text-muted">
                        <span>{event.camera}</span>
                        <span>·</span>
                        <span className="text-video-alert font-data">{event.confidence}%</span>
                      </div>
                      <div className="mt-1.5 flex items-center gap-2">
                        <span className="font-data text-[10px] text-info">{event.workOrder}</span>
                        <button className="text-[10px] text-info hover:underline">查看工单</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Associated Work Orders */}
          <div className="rounded-lg bg-gray-100 p-4">
            <h3 className="mb-3 text-sm font-semibold text-text-primary">关联工单</h3>
            <div className="space-y-2">
              {violationEvents.map((v) => (
                <div key={v.workOrder} className="flex items-center justify-between rounded-md bg-gray-100/40 px-3 py-2">
                  <div>
                    <span className="text-[10px] font-data text-info">{v.workOrder}</span>
                    <p className="text-[10px] text-text-muted">{v.type} · {v.camera}</p>
                  </div>
                  <button className="rounded p-1 text-text-muted hover:bg-primary hover:text-info">
                    <FileText className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminVideoAnalysis;
