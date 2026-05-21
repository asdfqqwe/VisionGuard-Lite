import type { FC } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { traceRecords } from '@/data/mockData';
import { cn } from '@/lib/utils';

const TraceQuery: FC = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState(traceRecords[0]?.barcode ?? 'FX-2026-0331-8842');

  return (
    <div className="h-full bg-primary px-4 pt-3 pb-4">
      {/* Input */}
      <div className="mb-4">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="输入批次号或二维码编号"
          className={cn('h-11 w-full rounded border border-border bg-white px-3 text-sm text-text-primary outline-none', 'placeholder:text-text-muted focus:border-info')}
        />
      </div>

      {/* Trace Records */}
      <div className="space-y-3">
        {traceRecords.map((record) => (
          <button
            key={record.traceNo}
            onClick={() => navigate('/pda/trace/verify')}
            className="w-full rounded-lg bg-white p-3 text-left transition-all active:scale-[0.98]"
          >
            <div className="flex items-center justify-between">
              <span className="font-data text-sm font-semibold text-info">{record.traceNo}</span>
              <span className={cn('rounded px-2 py-0.5 text-[11px] font-bold',
                record.status === '通过' ? 'bg-success text-white' : 'bg-l1-badge text-white'
              )}>
                {record.status}
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-xs text-text-primary">{record.materialName}</span>
              <span className={cn('rounded px-1.5 py-0.5 text-[10px] font-bold',
                record.isNewCode ? 'bg-info text-white' : 'bg-text-muted text-white'
              )}>
                {record.isNewCode ? 'V2' : 'V1'}
              </span>
            </div>
            <div className="mt-1 font-data text-[11px] text-text-muted">{record.sourceOrderNo}</div>

            {/* Mini Timeline */}
            <div className="mt-2 flex gap-1">
              {record.timeline.map((node, idx) => (
                <div key={idx} className="flex items-center gap-1">
                  <div className={cn('h-1.5 w-1.5 rounded-full',
                    idx === record.timeline.length - 1 ? 'bg-info' : 'bg-text-muted'
                  )} />
                  <span className="text-[10px] text-text-muted">{node.stage}</span>
                  {idx < record.timeline.length - 1 && (
                    <span className="text-[10px] text-text-muted mx-0.5">→</span>
                  )}
                </div>
              ))}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default TraceQuery;
