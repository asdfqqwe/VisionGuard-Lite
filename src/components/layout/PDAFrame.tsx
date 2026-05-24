import { useEffect, useRef, useState } from 'react';
import type { FC } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Home, ScanLine } from 'lucide-react';
import { cn } from '@/lib/utils';
import { EntrySidebar } from '@/components/layout/EntrySidebar';

import {
  PDHome,
  ReceiveScan,
  ReceiveDetail,
  ReceiveSummary,
  ReceiveAppointment,
  PutawayTask,
  PutawayScan,
  PickTask,
  PickScan,
  InspectTask,
  InspectCheck,
  ExceptionsList,
  ExceptionResult,
  ReportEdit,
  ExceptionDetail,
  ProblemHandover,
  Recount,
  RecountTask,
  RecountResult,
  RecountReprint,
  ReturnScan,
  ReturnDetail,
  TraceVerify,
  TraceQuery,
  Mine,
} from '@/pages/pda';

interface PDAFrameProps {
  className?: string;
}

const routeTitles: Record<string, string> = {
  '/pda': '仓储作业',
  '/pda/': '仓储作业',
  '/pda/receive/scan': '扫码收货',
  '/pda/receive/detail': '收货详情',
  '/pda/receive/summary': '签收汇总',
  '/pda/receive/appointment': '到货预约',
  '/pda/putaway/task': '上架任务',
  '/pda/putaway/scan': '扫码上架',
  '/pda/pick/task': '拣货任务',
  '/pda/pick/scan': '拣货执行',
  '/pda/inspect/task': '巡检任务',
  '/pda/inspect/check': '巡检执行',
  '/pda/exceptions': '异常处理',
  '/pda/problem/handover': '问题件移交',
  '/pda/recount': '盘点复点',
  '/pda/recount/task': '盘点任务',
  '/pda/recount/result': '盘点结果',
  '/pda/recount/reprint': '盘点记录',
  '/pda/return/scan': '退料扫码',
  '/pda/return/detail': '退料结果',
  '/pda/trace/verify': '防伪溯源',
  '/pda/trace': '溯源查询',
  '/pda/mine': '我的',
};

const DEVICE_WIDTH = 375;
const DEVICE_HEIGHT = 850;
const MAX_SCALE = 1;
const MIN_SCALE = 0.35;

function getTitle(path: string, search: string): string {
  if (path === '/pda/problem/handover' && new URLSearchParams(search).get('scenario') === 'recount') {
    return '盘点差异';
  }
  if (path === '/pda/problem/handover' && new URLSearchParams(search).get('scenario') === 'daily-quality-check') {
    return '抽检核对';
  }
  if (routeTitles[path]) return routeTitles[path];
  if (path.startsWith('/pda/exceptions/result/')) return '异常结果';
  if (path.startsWith('/pda/report/edit/')) return '编辑上报';
  if (path.startsWith('/pda/exceptions/')) return '异常详情';
  return 'PDA终端';
}

export const PDAFrame: FC<PDAFrameProps> = ({ className }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const title = getTitle(location.pathname, location.search);
  const isHome = location.pathname === '/pda' || location.pathname === '/pda/';
  const isMine = location.pathname === '/pda/mine';
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const compute = () => {
      const rect = el.getBoundingClientRect();
      const style = window.getComputedStyle(el);
      const padX = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
      const padY = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
      const availW = rect.width - padX - 12;
      const availH = rect.height - padY - 12;
      const next = Math.min(
        MAX_SCALE,
        Math.max(MIN_SCALE, Math.min(availW / DEVICE_WIDTH, availH / DEVICE_HEIGHT)),
      );
      setScale(next);
    };

    compute();
    const resizeObserver = new ResizeObserver(compute);
    resizeObserver.observe(el);
    window.addEventListener('resize', compute);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', compute);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn('flex h-[100dvh] items-center justify-center overflow-hidden bg-[#F1F5F9] py-3 pl-[76px] pr-3', className)}
    >
      <EntrySidebar />
      <div
        className="relative"
        style={{
          width: DEVICE_WIDTH * scale,
          height: DEVICE_HEIGHT * scale,
        }}
      >
      <div
        className="absolute left-0 top-0 h-[850px] w-[375px] origin-top-left overflow-hidden rounded-[32px] border-[6px] border-border-light bg-primary shadow-2xl"
        style={{ transform: `scale(${scale})` }}
      >
        {/* Status bar */}
        <div className="flex h-7 items-center justify-between bg-[#F1F5F9] px-6">
          <span className="text-[11px] font-medium text-text-secondary">9:41</span>
          <div className="flex gap-1">
            <div className="h-2.5 w-2.5 rounded-full bg-success" />
            <div className="h-2.5 w-2.5 rounded-full bg-warning" />
          </div>
        </div>

        {/* Top nav */}
        <div className="flex h-11 items-center justify-between border-b border-border-light/30 bg-[#F1F5F9] px-4">
          {!isHome ? (
            <button
              onClick={() => navigate(-1)}
              className="flex h-9 w-9 items-center justify-center text-text-secondary transition-colors hover:text-text-primary"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          ) : (
            <div className="h-9 w-9" />
          )}
          <span className="text-sm font-semibold text-text-primary">{title}</span>
          {isHome || isMine ? (
            <button
              onClick={() => navigate('/pda/mine')}
              className={cn('flex h-9 w-9 items-center justify-center transition-colors',
                isMine ? 'text-info' : 'text-text-secondary hover:text-text-primary'
              )}
            >
              <Home className="h-5 w-5" />
            </button>
          ) : (
            <button
              onClick={() => navigate('/pda')}
              className="flex h-9 w-9 items-center justify-center text-text-secondary transition-colors hover:text-text-primary"
            >
              <ScanLine className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Content area with absolute paths */}
        <div className="relative h-[734px] overflow-y-auto bg-primary" style={{ scrollbarWidth: 'none' }}>
          <Routes>
            <Route path="" element={<PDHome />} />
            <Route path="receive/scan" element={<ReceiveScan />} />
            <Route path="receive/detail" element={<ReceiveDetail />} />
            <Route path="receive/summary" element={<ReceiveSummary />} />
            <Route path="receive/appointment" element={<ReceiveAppointment />} />
            <Route path="putaway/task" element={<PutawayTask />} />
            <Route path="putaway/scan" element={<PutawayScan />} />
            <Route path="pick/task" element={<PickTask />} />
            <Route path="pick/scan" element={<PickScan />} />
            <Route path="inspect/task" element={<InspectTask />} />
            <Route path="inspect/check" element={<InspectCheck />} />
            <Route path="exceptions" element={<ExceptionsList />} />
            <Route path="exceptions/result/:draftId" element={<ExceptionResult />} />
            <Route path="report/edit/:draftId" element={<ReportEdit />} />
            <Route path="exceptions/:reportId" element={<ExceptionDetail />} />
            <Route path="problem/handover" element={<ProblemHandover />} />
            <Route path="recount" element={<Recount />} />
            <Route path="recount/task" element={<RecountTask />} />
            <Route path="recount/result" element={<RecountResult />} />
            <Route path="recount/reprint" element={<RecountReprint />} />
            <Route path="return/scan" element={<ReturnScan />} />
            <Route path="return/detail" element={<ReturnDetail />} />
            <Route path="trace/verify" element={<TraceVerify />} />
            <Route path="trace" element={<TraceQuery />} />
            <Route path="mine" element={<Mine />} />
          </Routes>
        </div>

        {/* Bottom indicator */}
        <div className="flex h-8 items-center justify-center bg-[#F1F5F9]">
          <div className="h-1 w-28 rounded-full bg-text-muted/30" />
        </div>
      </div>
      </div>

    </div>
  );
};

// Stub placeholder for external route compatibility
export const PDAPage: FC = () => (
  <div className="flex h-full items-center justify-center">
    <div className="text-center">
      <p className="text-lg font-semibold text-text-primary">PDA手持终端</p>
      <p className="mt-2 text-sm text-text-muted">页面加载中...</p>
    </div>
  </div>
);

export default PDAFrame;
