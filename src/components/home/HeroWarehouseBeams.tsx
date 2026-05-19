import type { ReactNode } from 'react';
import { forwardRef, useRef } from 'react';
import {
  Boxes,
  ClipboardCheck,
  ScanLine,
  Smartphone,
  Warehouse,
  MonitorCheck,
  Truck,
  ShieldAlert,
  FileWarning,
} from 'lucide-react';
import { AnimatedBeam } from '@/components/ui/animated-beam';

/**
 * Hero 区"仓储质检全链路 integration"动画。
 * - 抄 Magic UI Animated Beam 的 Multiple Inputs / Outputs 范式
 * - 4 业务来源 → 质检中枢 → 4 业务去向
 * - 蓝色 beam = 正常质检流;金色 beam = 异常 / 索赔流
 * - pointer-events: none + z-0,Hero 内容层 z-10
 */

type Tone = 'blue' | 'gold' | 'green' | 'gray';

type FlowNodeProps = {
  label: string;
  icon: ReactNode;
  tone?: Tone;
  className?: string;
};

const toneClassMap: Record<Tone, string> = {
  blue: 'border-blue-200/60 bg-blue-50/60 text-blue-700 shadow-blue-500/10',
  gold: 'border-yellow-200/70 bg-yellow-50/70 text-yellow-700 shadow-yellow-500/10',
  green:
    'border-emerald-200/60 bg-emerald-50/60 text-emerald-700 shadow-emerald-500/10',
  gray: 'border-slate-200/70 bg-white/55 text-slate-600 shadow-slate-500/10',
};

const FlowNode = forwardRef<HTMLDivElement, FlowNodeProps>(
  ({ label, icon, tone = 'blue', className = '' }, ref) => (
    <div
      ref={ref}
      className={[
        'z-10 flex items-center gap-2 rounded-full border px-3 py-1.5',
        'backdrop-blur-md shadow-lg',
        'text-[12px] leading-none whitespace-nowrap',
        'transition-transform duration-300',
        toneClassMap[tone],
        className,
      ].join(' ')}
    >
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/70">
        {icon}
      </span>
      <span>{label}</span>
    </div>
  )
);
FlowNode.displayName = 'FlowNode';

export function HeroWarehouseBeams() {
  const containerRef = useRef<HTMLDivElement>(null);

  const appointmentRef = useRef<HTMLDivElement>(null);
  const supplierRef = useRef<HTMLDivElement>(null);
  const pdaRef = useRef<HTMLDivElement>(null);
  const barcodeRef = useRef<HTMLDivElement>(null);

  const centerRef = useRef<HTMLDivElement>(null);

  const stationRef = useRef<HTMLDivElement>(null);
  const outboundRef = useRef<HTMLDivElement>(null);
  const quarantineRef = useRef<HTMLDivElement>(null);
  const claimRef = useRef<HTMLDivElement>(null);

  return (
    <div
      className="hero-warehouse-beams pointer-events-none absolute inset-0 z-0 overflow-hidden"
      aria-hidden="true"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(59,130,246,0.12),transparent_34%),radial-gradient(circle_at_82%_55%,rgba(234,179,8,0.08),transparent_24%)]" />

      <div ref={containerRef} className="relative mx-auto h-full max-w-[1280px]">
        {/* 左侧业务来源节点 */}
        <div className="absolute left-[5%] top-[46px] flex flex-col gap-7">
          <FlowNode
            ref={appointmentRef}
            label="到货预约"
            icon={<ClipboardCheck className="h-3.5 w-3.5" />}
            tone="blue"
          />
          <FlowNode
            ref={supplierRef}
            label="供应商来料"
            icon={<Boxes className="h-3.5 w-3.5" />}
            tone="blue"
          />
          <FlowNode
            ref={pdaRef}
            label="PDA巡检"
            icon={<Smartphone className="h-3.5 w-3.5" />}
            tone="green"
          />
          <FlowNode
            ref={barcodeRef}
            label="条码采集"
            icon={<ScanLine className="h-3.5 w-3.5" />}
            tone="gray"
          />
        </div>

        {/* 中心节点 */}
        <div className="absolute left-1/2 top-[172px] -translate-x-1/2">
          <div
            ref={centerRef}
            className={[
              'z-10 flex h-[72px] w-[72px] items-center justify-center rounded-full',
              'border border-blue-200/70 bg-white/55 text-blue-700',
              'shadow-[0_0_36px_rgba(59,130,246,0.22)] backdrop-blur-xl',
            ].join(' ')}
          >
            <Warehouse className="h-7 w-7" />
          </div>
          <div className="mt-1 text-center text-[11px] font-medium text-blue-700/55">
            质检中枢
          </div>
        </div>

        {/* 右侧业务去向节点 */}
        <div className="absolute right-[5%] top-[52px] flex flex-col gap-7">
          <FlowNode
            ref={stationRef}
            label="Station复核"
            icon={<MonitorCheck className="h-3.5 w-3.5" />}
            tone="blue"
          />
          <FlowNode
            ref={outboundRef}
            label="出库放行"
            icon={<Truck className="h-3.5 w-3.5" />}
            tone="blue"
          />
          <FlowNode
            ref={quarantineRef}
            label="问题件隔离"
            icon={<ShieldAlert className="h-3.5 w-3.5" />}
            tone="gold"
          />
          <FlowNode
            ref={claimRef}
            label="索赔协同"
            icon={<FileWarning className="h-3.5 w-3.5" />}
            tone="gold"
          />
        </div>

        {/* 左侧 → 中心 */}
        <AnimatedBeam
          containerRef={containerRef}
          fromRef={appointmentRef}
          toRef={centerRef}
          curvature={-42}
          duration={8}
          delay={0}
          pathWidth={1.4}
          pathOpacity={0.28}
          pathColor="#93C5FD"
          gradientStartColor="#3B82F6"
          gradientStopColor="#60A5FA"
          endYOffset={-10}
        />
        <AnimatedBeam
          containerRef={containerRef}
          fromRef={supplierRef}
          toRef={centerRef}
          curvature={-16}
          duration={7}
          delay={0.4}
          pathWidth={1.4}
          pathOpacity={0.3}
          pathColor="#93C5FD"
          gradientStartColor="#3B82F6"
          gradientStopColor="#60A5FA"
        />
        <AnimatedBeam
          containerRef={containerRef}
          fromRef={pdaRef}
          toRef={centerRef}
          curvature={18}
          duration={9}
          delay={0.9}
          pathWidth={1.3}
          pathOpacity={0.24}
          pathColor="#86EFAC"
          gradientStartColor="#22C55E"
          gradientStopColor="#60A5FA"
        />
        <AnimatedBeam
          containerRef={containerRef}
          fromRef={barcodeRef}
          toRef={centerRef}
          curvature={46}
          duration={10}
          delay={1.2}
          pathWidth={1.2}
          pathOpacity={0.22}
          pathColor="#CBD5E1"
          gradientStartColor="#94A3B8"
          gradientStopColor="#60A5FA"
          endYOffset={12}
        />

        {/* 中心 → 右侧 */}
        <AnimatedBeam
          containerRef={containerRef}
          fromRef={centerRef}
          toRef={stationRef}
          curvature={42}
          duration={8}
          delay={0.2}
          pathWidth={1.4}
          pathOpacity={0.3}
          pathColor="#93C5FD"
          gradientStartColor="#60A5FA"
          gradientStopColor="#3B82F6"
          startYOffset={-10}
        />
        <AnimatedBeam
          containerRef={containerRef}
          fromRef={centerRef}
          toRef={outboundRef}
          curvature={18}
          duration={7}
          delay={0.7}
          pathWidth={1.4}
          pathOpacity={0.28}
          pathColor="#93C5FD"
          gradientStartColor="#60A5FA"
          gradientStopColor="#3B82F6"
        />
        <AnimatedBeam
          containerRef={containerRef}
          fromRef={centerRef}
          toRef={quarantineRef}
          curvature={-18}
          duration={9}
          delay={1}
          pathWidth={1.5}
          pathOpacity={0.34}
          pathColor="#FDE68A"
          gradientStartColor="#EAB308"
          gradientStopColor="#F59E0B"
        />
        <AnimatedBeam
          containerRef={containerRef}
          fromRef={centerRef}
          toRef={claimRef}
          curvature={-46}
          duration={10}
          delay={1.4}
          pathWidth={1.5}
          pathOpacity={0.36}
          pathColor="#FDE68A"
          gradientStartColor="#EAB308"
          gradientStopColor="#F59E0B"
          startYOffset={12}
        />
      </div>

      {/* 中央柔光遮罩,保证标题和 KPI 可读 */}
      <div className="absolute inset-0 z-[2] bg-[radial-gradient(ellipse_at_center,rgba(248,250,252,0.72)_0%,rgba(248,250,252,0.42)_34%,rgba(248,250,252,0.08)_62%,transparent_100%)]" />
    </div>
  );
}

export default HeroWarehouseBeams;
