import { useEffect, useRef, useState } from 'react';
import type { FC } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Monitor, Settings, Bell, Wifi } from 'lucide-react';
import { cn } from '@/lib/utils';
import { EntrySidebar } from '@/components/layout/EntrySidebar';
import {
  StationIdle,
  StationReceive,
  StationOutbound,
  StationTriage,
  StationRecount,
  StationReturnInbound,
} from '@/pages/station';

interface StationFrameProps {
  className?: string;
}

const modeLabels: Record<string, { label: string; color: string }> = {
  '/station': { label: '待机模式', color: 'text-text-muted' },
  '/station/': { label: '待机模式', color: 'text-text-muted' },
  '/station/receive': { label: '收货检测', color: 'text-info' },
  '/station/outbound': { label: '出库复核', color: 'text-success' },
  '/station/triage': { label: '包装分流', color: 'text-warning' },
  '/station/recount': { label: '盘点复核', color: 'text-warning' },
  '/station/return-inbound': { label: '退料复检', color: 'text-info' },
};

const DEVICE_WIDTH = 1280;
const DEVICE_HEIGHT = 800;
/** Allow the screen to grow up to this multiple of its native size. */
const MAX_SCALE = 1.6;
/** Don't shrink below this (preserves legibility on tiny windows). */
const MIN_SCALE = 0.4;

export const StationFrame: FC<StationFrameProps> = ({ className }) => {
  const location = useLocation();
  const currentMode = modeLabels[location.pathname] || modeLabels['/station'];
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  // Auto-fit the 1280x720 device into the available viewport.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const compute = () => {
      const rect = el.getBoundingClientRect();
      const cs = window.getComputedStyle(el);
      const padX = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight);
      const padY = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom);
      // Available content area = box minus padding minus a small breathing room.
      const availW = rect.width - padX - 16;
      const availH = rect.height - padY - 16;
      const fitW = availW / DEVICE_WIDTH;
      const fitH = availH / DEVICE_HEIGHT;
      const next = Math.min(MAX_SCALE, Math.max(MIN_SCALE, Math.min(fitW, fitH)));
      setScale(next);
    };

    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(el);
    window.addEventListener('resize', compute);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', compute);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn(
        'flex h-[100dvh] items-center justify-center overflow-hidden bg-[#F1F5F9] pl-16 py-4',
        className,
      )}
    >
      <EntrySidebar />

      {/* Scale wrapper. Reserve scaled footprint so flex centering works correctly. */}
      <div
        style={{
          width: DEVICE_WIDTH * scale,
          height: DEVICE_HEIGHT * scale,
        }}
        className="relative"
      >
        {/* Device Frame at native 1280x720, scaled via CSS transform */}
        <div
          className="absolute left-0 top-0 origin-top-left overflow-hidden rounded-xl border-4 border-border-light shadow-2xl"
          style={{
            width: DEVICE_WIDTH,
            height: DEVICE_HEIGHT,
            transform: `scale(${scale})`,
          }}
        >
          {/* Top status bar */}
          <div className="flex h-12 items-center justify-between border-b border-border-light/30 bg-[#F1F5F9] px-4">
            {/* Left: Logo + station name */}
            <div className="flex items-center gap-3">
              <Monitor className="h-5 w-5 text-info" />
              <span className="text-sm font-semibold text-text-primary">
                智见 · Station-03
              </span>
              <div className="flex h-5 items-center rounded bg-success/20 px-2">
                <div className="mr-1.5 h-2 w-2 animate-pulse rounded-full bg-success" />
                <span className="text-[11px] font-medium text-success">在线</span>
              </div>
            </div>

            {/* Center: Current mode */}
            <div className="flex items-center gap-2">
              <Wifi className="h-4 w-4 text-success" />
              <span className={cn('text-sm font-semibold', currentMode.color)}>
                {currentMode.label}
              </span>
            </div>

            {/* Right: Time + notifications + settings */}
            <div className="flex items-center gap-4">
              <span className="font-mono text-sm text-text-secondary">10:24:36</span>
              <div className="flex items-center gap-1.5 text-text-muted">
                <Bell className="h-4 w-4" />
                <span className="text-xs font-medium">3</span>
              </div>
              <Settings className="h-4 w-4 cursor-pointer text-text-muted transition-colors hover:text-text-secondary" />
            </div>
          </div>

          {/* Content area with nested routes */}
          <div className="h-[calc(800px-48px)] bg-primary">
            <Routes>
              <Route path="/" element={<StationIdle />} />
              <Route path="/receive" element={<StationReceive />} />
              <Route path="/outbound" element={<StationOutbound />} />
              <Route path="/triage" element={<StationTriage />} />
              <Route path="/recount" element={<StationRecount />} />
              <Route path="/return-inbound" element={<StationReturnInbound />} />
            </Routes>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StationFrame;
