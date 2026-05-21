import type { FC, ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';
import {
  Boxes,
  ClipboardList,
  Drone,
  RefreshCcw,
  Truck,
  ShieldCheck,
} from 'lucide-react';
import { WarehouseGlobeBackground } from './WarehouseGlobeBackground';

/**
 * Hero 右栏:点阵 3D 地球 + 围绕地球的业务胶囊。
 * 用 ResizeObserver 把容器尺寸传给 Globe(react-globe.gl 需要数字尺寸)。
 */

type Tone = 'blue' | 'gold' | 'green' | 'gray';

const toneClassMap: Record<Tone, string> = {
  blue: 'border-blue-200/75 bg-white/78 text-blue-700 hover:border-blue-300/90 hover:bg-white/92 hover:shadow-blue-200/55',
  gold: 'border-amber-200/80 bg-amber-50/78 text-amber-700 hover:border-amber-300/90 hover:bg-amber-50/95 hover:shadow-amber-200/60',
  green: 'border-emerald-200/75 bg-white/78 text-emerald-700 hover:border-emerald-300/90 hover:bg-white/92 hover:shadow-emerald-200/50',
  gray: 'border-slate-200/75 bg-white/78 text-slate-600 hover:border-slate-300/90 hover:bg-white/92 hover:shadow-slate-200/50',
};

interface ChipDef {
  pos: string;
  label: string;
  icon: ReactNode;
  tone: Tone;
}

const CHIPS: ChipDef[] = [
  { pos: 'right-[calc(50%+150px)] top-[14%]', label: '采购到货入库', icon: <Boxes className="h-3.5 w-3.5" />, tone: 'blue' },
  { pos: 'right-[calc(50%+178px)] top-[42%]', label: '生产退料入库', icon: <RefreshCcw className="h-3.5 w-3.5" />, tone: 'green' },
  { pos: 'right-[calc(50%+162px)] top-[70%]', label: '在库循环盘点', icon: <ClipboardList className="h-3.5 w-3.5" />, tone: 'gray' },
  { pos: 'left-[calc(50%+150px)] top-[14%]', label: '出库发货复核', icon: <Truck className="h-3.5 w-3.5" />, tone: 'blue' },
  { pos: 'left-[calc(50%+178px)] top-[42%]', label: '仓库日常质量抽检', icon: <ShieldCheck className="h-3.5 w-3.5" />, tone: 'gold' },
  { pos: 'left-[calc(50%+162px)] top-[70%]', label: '无人机巡检+AGV', icon: <Drone className="h-3.5 w-3.5" />, tone: 'green' },
];

const SPARKS = [
  'left-[23%] top-[16%] h-1.5 w-1.5 bg-blue-300/80 shadow-[0_0_12px_rgba(96,165,250,0.8)]',
  'right-[27%] bottom-[24%] h-1.5 w-1.5 bg-amber-300/90 shadow-[0_0_14px_rgba(251,191,36,0.8)]',
  'left-[36%] bottom-[18%] h-1 w-1 bg-white shadow-[0_0_10px_rgba(147,197,253,0.9)]',
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
        style={{ width: 'min(94%, 500px)', aspectRatio: '1 / 1' }}
      >
        {/* 底部投影,用来托起球体的立体感。 */}
        <div
          className="absolute left-1/2 bottom-[4%] h-[18%] w-[62%] -translate-x-1/2 rounded-full"
          style={{
            background:
              'radial-gradient(ellipse at center, rgba(86,126,190,0.24) 0%, rgba(126,167,224,0.13) 42%, rgba(148,163,184,0) 72%)',
            filter: 'blur(16px)',
          }}
          aria-hidden
        />
        <div
          className="absolute inset-[7%] rounded-full border border-white/70 shadow-[inset_0_0_30px_rgba(255,255,255,0.74),inset_0_-28px_42px_rgba(96,165,250,0.13)]"
          aria-hidden
        />
        <div
          className="absolute inset-[12%] rounded-full"
          style={{
            background:
              'linear-gradient(138deg, rgba(255,255,255,0.56) 0%, rgba(255,255,255,0.12) 16%, rgba(255,255,255,0) 34%)',
          }}
          aria-hidden
        />
        {SPARKS.map((spark) => (
          <span
            key={spark}
            className={`absolute rounded-full ${spark}`}
            aria-hidden
          />
        ))}
        {size.w > 0 && (
          <WarehouseGlobeBackground width={size.w} height={size.h} />
        )}
      </div>

      {/* 业务胶囊 */}
      <div className="absolute inset-0">
        {CHIPS.map((c) => (
          <div
            key={c.label}
            className={`group absolute ${c.pos} pointer-events-auto z-10 flex origin-center items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold leading-none whitespace-nowrap shadow-[0_8px_22px_rgba(59,130,246,0.10)] backdrop-blur-xl transition-[transform,box-shadow,background-color,border-color] duration-200 ease-out hover:-translate-y-0.5 hover:scale-[1.08] hover:shadow-[0_14px_30px_rgba(59,130,246,0.16)] ${toneClassMap[c.tone]}`}
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/85 shadow-inner transition-transform duration-200 ease-out group-hover:scale-105 [&>svg]:h-4 [&>svg]:w-4">
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
