import type { FC, ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';
import {
  Boxes,
  ClipboardCheck,
  ScanLine,
  Smartphone,
  MonitorCheck,
  Truck,
  ShieldAlert,
  FileWarning,
} from 'lucide-react';
import { WarehouseGlobeBackground } from './WarehouseGlobeBackground';

/**
 * Hero 右栏:点阵 3D 地球 + 围绕地球的业务胶囊。
 * 用 ResizeObserver 把容器尺寸传给 Globe(react-globe.gl 需要数字尺寸)。
 */

type Tone = 'blue' | 'gold' | 'green' | 'gray';

const toneClassMap: Record<Tone, string> = {
  blue: 'border-blue-200/70 bg-blue-50/85 text-blue-700',
  gold: 'border-yellow-200/80 bg-yellow-50/85 text-yellow-700',
  green: 'border-emerald-200/70 bg-emerald-50/85 text-emerald-700',
  gray: 'border-slate-200/80 bg-white/85 text-slate-600',
};

interface ChipDef {
  pos: string;
  label: string;
  icon: ReactNode;
  tone: Tone;
}

const CHIPS: ChipDef[] = [
  { pos: 'left-[1%] top-[10%]', label: '供应商来料', icon: <Boxes className="h-3.5 w-3.5" />, tone: 'blue' },
  { pos: 'left-[-2%] top-[34%]', label: 'PDA巡检', icon: <Smartphone className="h-3.5 w-3.5" />, tone: 'green' },
  { pos: 'left-[2%] top-[58%]', label: '条码采集', icon: <ScanLine className="h-3.5 w-3.5" />, tone: 'gray' },
  { pos: 'left-[14%] top-[82%]', label: '到货预约', icon: <ClipboardCheck className="h-3.5 w-3.5" />, tone: 'blue' },
  { pos: 'right-[1%] top-[10%]', label: 'Station复核', icon: <MonitorCheck className="h-3.5 w-3.5" />, tone: 'blue' },
  { pos: 'right-[-2%] top-[34%]', label: '出库放行', icon: <Truck className="h-3.5 w-3.5" />, tone: 'blue' },
  { pos: 'right-[2%] top-[58%]', label: '问题件隔离', icon: <ShieldAlert className="h-3.5 w-3.5" />, tone: 'gold' },
  { pos: 'right-[14%] top-[82%]', label: '索赔协同', icon: <FileWarning className="h-3.5 w-3.5" />, tone: 'gold' },
];

export const GlobeWithChips: FC = () => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const update = () => {
      const r = el.getBoundingClientRect();
      const dim = Math.min(r.width, r.height);
      setSize({ w: dim, h: dim });
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div className="relative h-full w-full">
      {/* 地球容器:正方形,居中 */}
      <div
        ref={wrapperRef}
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{ width: 'min(100%, 540px)', aspectRatio: '1 / 1' }}
      >
        {/* 球外柔光 halo */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background:
              'radial-gradient(circle at 50% 50%, rgba(59,130,246,0.18) 0%, rgba(147,197,253,0.12) 42%, rgba(241,245,249,0) 70%)',
            filter: 'blur(12px)',
          }}
          aria-hidden
        />
        {size.w > 0 && (
          <WarehouseGlobeBackground width={size.w} height={size.h} />
        )}
      </div>

      {/* 业务胶囊 */}
      <div className="pointer-events-none absolute inset-0">
        {CHIPS.map((c) => (
          <div
            key={c.label}
            className={`absolute ${c.pos} flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] leading-none whitespace-nowrap shadow-[0_4px_14px_rgba(15,23,42,0.10)] backdrop-blur-md ${toneClassMap[c.tone]}`}
          >
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white/80">
              {c.icon}
            </span>
            <span>{c.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GlobeWithChips;
