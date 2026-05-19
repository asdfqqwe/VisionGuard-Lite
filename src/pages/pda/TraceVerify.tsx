import type { FC } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, ShieldAlert, ScanLine } from 'lucide-react';
import { traceRecords } from '@/data/mockData';
import { cn } from '@/lib/utils';

const TraceVerify: FC = () => {
  const navigate = useNavigate();
  const [verified, setVerified] = useState(false);
  const [record, setRecord] = useState<typeof traceRecords[0] | null>(null);

  const handleVerify = () => {
    setRecord(traceRecords[0]);
    setVerified(true);
  };

  // Default to first trace record if available
  const data = record || traceRecords[0];

  return (
    <div className="h-full bg-primary px-4 pt-3 pb-4">
      {!verified ? (
        <>
          {/* Scan/Input Area */}
          <div className="flex flex-col items-center justify-center" style={{ height: '40%' }}>
            <div className="relative flex items-center justify-center" style={{ width: '200px', height: '160px' }}>
              <div className="absolute top-0 left-0 h-5 w-5 border-t-2 border-l-2 border-info" />
              <div className="absolute top-0 right-0 h-5 w-5 border-t-2 border-r-2 border-info" />
              <div className="absolute bottom-0 left-0 h-5 w-5 border-b-2 border-l-2 border-info" />
              <div className="absolute bottom-0 right-0 h-5 w-5 border-b-2 border-r-2 border-info" />
              <ScanLine className="h-10 w-10 text-info/40" />
            </div>
            <p className="mt-3 text-xs text-text-secondary">扫描防伪二维码</p>
          </div>

          <div className="mt-4">
            <input
              placeholder="输入二维码编号"
              className={cn('h-11 w-full rounded border border-border bg-white px-3 text-sm text-text-primary outline-none', 'placeholder:text-text-muted focus:border-info')}
            />
          </div>

          <button
            onClick={handleVerify}
            className="mt-4 h-11 w-full rounded-md bg-accent-gradient text-sm font-semibold text-white"
          >
            查询验证
          </button>
        </>
      ) : (
        <>
          {/* Result Card */}
          <div className={cn('rounded-lg p-4',
            data?.status === '通过' ? 'border border-success/30 bg-success/10' : 'border border-danger/30 bg-danger/10'
          )}>
            <div className="flex flex-col items-center">
              {data?.status === '通过' ? (
                <ShieldCheck className="h-12 w-12 text-success" />
              ) : (
                <ShieldAlert className="h-12 w-12 text-danger" />
              )}
              <h3 className={cn('mt-2 text-lg font-bold',
                data?.status === '通过' ? 'text-success' : 'text-danger'
              )}>
                {data?.status === '通过' ? '正品验证通过' : '检测到异常'}
              </h3>
              {/* New/Old QR code version badge */}
              <div className="mt-2">
                <span className={cn('rounded px-2 py-0.5 text-[11px] font-bold',
                  data?.isNewCode ? 'bg-info text-white' : 'bg-text-muted text-white'
                )}>
                  {data?.isNewCode ? 'V2 新版标签' : 'V1 旧版标签'}
                </span>
              </div>
              {data?.status === '伪造' && (
                <span className="mt-2 rounded bg-l1-badge px-2 py-0.5 text-[11px] font-bold text-white">L1</span>
              )}
            </div>
          </div>

          {/* Trace Details */}
          <div className="mt-4 rounded-lg bg-white p-3">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-xs text-text-muted">批次 Lot</span>
                <span className="font-data text-xs text-text-primary">{data?.batchLot}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-text-muted">来源单号</span>
                <span className="font-data text-xs text-info">{data?.sourceOrderNo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-text-muted">物资</span>
                <span className="text-xs text-text-primary">{data?.materialName}</span>
              </div>
              {data?.expiryDate && (
                <div className="flex justify-between">
                  <span className="text-xs text-text-muted">效期</span>
                  <span className="font-data text-xs text-warning">{data.expiryDate}</span>
                </div>
              )}
            </div>
          </div>

          {/* Timeline */}
          <div className="mt-4">
            <h3 className="mb-2 text-sm font-semibold text-text-primary">溯源链路</h3>
            <div className="relative pl-4">
              <div className="absolute left-1.5 top-0 bottom-0 w-px bg-info/30" />
              {data?.timeline.map((node, idx) => (
                <div key={idx} className="relative mb-3 flex gap-3">
                  <div className={cn('absolute -left-[10px] h-2 w-2 rounded-full',
                    idx === (data.timeline.length - 1) ? 'bg-info' : 'bg-text-muted'
                  )} />
                  <div>
                    <div className="text-xs text-text-primary">{node.stage}</div>
                    <div className="font-data text-[11px] text-text-muted">{node.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="mt-4 space-y-2">
            <button
              onClick={() => setVerified(false)}
              className="h-11 w-full rounded-md bg-accent-gradient text-sm font-semibold text-white"
            >
              重新查询
            </button>
            <button
              onClick={() => navigate('/pda/trace')}
              className="h-11 w-full rounded-md border border-border bg-white text-sm text-text-secondary"
            >
              查看完整溯源
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default TraceVerify;
