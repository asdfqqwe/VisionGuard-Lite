import type { FC } from 'react';
import { Cpu, Shield, Battery, Wifi, Camera, Monitor, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';

export type DeviceType = 'pda' | 'station' | 'desktop-camera';

interface SpecItem {
  icon: React.ReactNode;
  label: string;
  value: string;
}

interface HardwareSpecCardProps {
  deviceType: DeviceType;
  className?: string;
}

const pdaSpecs: SpecItem[] = [
  { icon: <Cpu className="h-3.5 w-3.5" />, label: '型号', value: 'ZJ-PDA-Pro 工业手持终端' },
  { icon: <Shield className="h-3.5 w-3.5" />, label: '防护等级', value: 'IP65（防尘防水）' },
  { icon: <Battery className="h-3.5 w-3.5" />, label: '续航', value: '≥8小时连续作业' },
  { icon: <Camera className="h-3.5 w-3.5" />, label: '摄像头', value: '800万像素 + 自动对焦' },
  { icon: <Wifi className="h-3.5 w-3.5" />, label: '通信', value: 'WiFi 6 + 4G/5G 双链路' },
  { icon: <Monitor className="h-3.5 w-3.5" />, label: '屏幕', value: '5.5寸 1080P 电容触控' },
];

const stationSpecs: SpecItem[] = [
  { icon: <Camera className="h-3.5 w-3.5" />, label: '固定相机', value: '≥500万像素，ROI自由配置' },
  { icon: <Monitor className="h-3.5 w-3.5" />, label: '桌面检测台', value: '≤600×400mm 检测台面' },
  { icon: <Sun className="h-3.5 w-3.5" />, label: '补光灯', value: '亮度可调 0-100%' },
  { icon: <Cpu className="h-3.5 w-3.5" />, label: '处理器', value: '工业边缘计算盒' },
  { icon: <Wifi className="h-3.5 w-3.5" />, label: '通信', value: '千兆以太网 + WiFi 6' },
  { icon: <Shield className="h-3.5 w-3.5" />, label: '防护', value: '工业级电磁兼容' },
];

const desktopCameraSpecs: SpecItem[] = [
  { icon: <Camera className="h-3.5 w-3.5" />, label: '分辨率', value: '≥500万像素（2592×1944）' },
  { icon: <Monitor className="h-3.5 w-3.5" />, label: '检测范围', value: '整托/箱装/盒装自适应' },
  { icon: <Sun className="h-3.5 w-3.5" />, label: '光源', value: 'LED阵列 可调亮度' },
  { icon: <Cpu className="h-3.5 w-3.5" />, label: 'ROI配置', value: '自由框选检测区域' },
  { icon: <Wifi className="h-3.5 w-3.5" />, label: '接口', value: 'GigE Vision / USB3.0' },
  { icon: <Shield className="h-3.5 w-3.5" />, label: '防护等级', value: 'IP54 工业级' },
];

const specMap: Record<DeviceType, SpecItem[]> = {
  pda: pdaSpecs,
  station: stationSpecs,
  'desktop-camera': desktopCameraSpecs,
};

const titleMap: Record<DeviceType, string> = {
  pda: 'PDA手持终端参数',
  station: 'Station检测工位参数',
  'desktop-camera': '固定式视觉相机参数',
};

export const HardwareSpecCard: FC<HardwareSpecCardProps> = ({ deviceType, className }) => {
  const specs = specMap[deviceType];
  const title = titleMap[deviceType];

  return (
    <div className={cn('rounded-lg border border-border-light bg-[#F1F5F9]/80 p-3', className)}>
      <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-muted">
        {title}
      </h4>
      <div className="space-y-1.5">
        {specs.map((spec, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <span className="text-info">{spec.icon}</span>
            <span className="text-text-muted">{spec.label}：</span>
            <span className="font-medium text-text-secondary">{spec.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HardwareSpecCard;
