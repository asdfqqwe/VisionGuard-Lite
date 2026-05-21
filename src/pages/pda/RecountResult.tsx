import type { FC } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Camera, CheckCircle2, FileText, ScanLine, ScanText, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';

const recountData = [
  { materialName: '矿泉水', systemQty: 12, actualQty: 10, unit: '箱', issue: '漏盘' },
  { materialName: '丁腈手套', systemQty: 40, actualQty: 40, unit: '盒', issue: '一致' },
];

const ocrFields = [
  { label: '批次', value: 'B20260310A', status: '匹配' },
  { label: '料号', value: 'CHERY-GLOVE-L', status: '匹配' },
  { label: '数量', value: '40 盒', status: '匹配' },
  { label: '标签', value: '1 处缺失', status: '待整改' },
];

const issueTypes = ['混批', '错放', '漏盘', '多盘'];

const RecountResult: FC = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'consistent' | 'diff' | null>(null);
  const [selectedIssue, setSelectedIssue] = useState('漏盘');
  const [reportWritten, setReportWritten] = useState(false);

  return (
    <div className="h-full bg-primary px-4 pt-3 pb-4">
      {/* Summary Card */}
      <div className="rounded-lg bg-white p-3">
        <div className="font-data text-sm font-semibold text-info">RC-001 盘点结果</div>
        <div className="mt-2 flex justify-around">
          <div className="text-center">
            <div className="font-data text-lg font-bold text-text-primary">2</div>
            <div className="text-[10px] text-text-muted">盘点项</div>
          </div>
          <div className="text-center">
            <div className="font-data text-lg font-bold text-success">1</div>
            <div className="text-[10px] text-text-muted">一致</div>
          </div>
          <div className="text-center">
            <div className="font-data text-lg font-bold text-danger">1</div>
            <div className="text-[10px] text-text-muted">差异</div>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="mt-4 space-y-2">
        {recountData.map((item, idx) => {
          const diff = item.actualQty - item.systemQty;
          return (
            <div key={idx} className={cn('rounded-lg border p-3',
              diff === 0 ? 'border-success/30 bg-success/10' : 'border-danger/30 bg-danger/10'
            )}>
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-primary">{item.materialName}</span>
                <span className={cn('rounded px-2 py-0.5 text-[11px] font-bold',
                  diff === 0 ? 'bg-success text-white' : 'bg-danger text-white'
                )}>
                  {diff === 0 ? '一致' : '差异'}
                </span>
              </div>
              <div className="mt-1 grid grid-cols-3 gap-2">
                <div className="text-center">
                  <div className="text-[11px] text-text-muted">系统</div>
                  <div className="font-data text-sm">{item.systemQty}</div>
                </div>
                <div className="text-center">
                  <div className="text-[11px] text-text-muted">现场</div>
                  <div className="font-data text-sm">{item.actualQty}</div>
                </div>
                <div className="text-center">
                  <div className="text-[11px] text-text-muted">差异</div>
                  <div className={cn('font-data text-sm font-semibold', diff === 0 ? 'text-success' : 'text-danger')}>
                    {diff > 0 ? '+' : ''}{diff}
                  </div>
                </div>
              </div>
              {diff !== 0 && (
                <div className="mt-2 flex items-center gap-1.5 text-[11px] text-danger">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  初判：{item.issue}，需人工复核确认
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-4 rounded-lg bg-white p-3">
        <div className="mb-2 flex items-center gap-2">
          <ScanText className="h-4 w-4 text-info" />
          <h3 className="text-sm font-semibold text-text-primary">存疑批次 OCR 全量识别</h3>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {ocrFields.map((field) => (
            <div key={field.label} className="rounded bg-primary px-2 py-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-text-muted">{field.label}</span>
                <span className={cn('text-[10px]', field.status === '待整改' ? 'text-warning' : 'text-success')}>
                  {field.status}
                </span>
              </div>
              <div className="mt-0.5 truncate font-data text-[11px] text-text-primary">{field.value}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 rounded-lg bg-white p-3">
        <div className="mb-2 text-sm font-semibold text-text-primary">问题分类</div>
        <div className="grid grid-cols-4 gap-1.5">
          {issueTypes.map((issue) => (
            <button
              key={issue}
              onClick={() => setSelectedIssue(issue)}
              className={cn(
                'rounded border px-2 py-1.5 text-[11px] font-semibold',
                selectedIssue === issue
                  ? 'border-danger bg-danger/10 text-danger'
                  : 'border-border bg-primary text-text-secondary',
              )}
            >
              {issue}
            </button>
          ))}
        </div>
        <p className="mt-2 text-[11px] text-text-muted">当前选择：{selectedIssue}。提交后进入后台差异处理列表。</p>
      </div>

      <div className="mt-4 rounded-lg bg-white p-3">
        <div className="mb-2 flex items-center gap-2">
          <FileText className="h-4 w-4 text-info" />
          <h3 className="text-sm font-semibold text-text-primary">现场证据</h3>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {[
            { icon: ScanLine, label: '库位码', value: 'A-03-05 已确认', ok: true },
            { icon: ScanLine, label: '货物码', value: 'SKU-INV-001 已匹配', ok: true },
            { icon: Tag, label: '标签状态', value: '1 项需补打', ok: false },
            { icon: Camera, label: '照片', value: '4 张已上传', ok: true },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="rounded bg-primary px-2 py-2">
                <div className="flex items-center justify-between">
                  <Icon className={cn('h-4 w-4', item.ok ? 'text-success' : 'text-warning')} />
                  <CheckCircle2 className={cn('h-3.5 w-3.5', item.ok ? 'text-success' : 'text-warning')} />
                </div>
                <p className="mt-1 text-[10px] text-text-muted">{item.label}</p>
                <p className="mt-0.5 text-[11px] font-semibold text-text-primary">{item.value}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Agent Suggestion */}
      <div className="mt-4 rounded-md border-l-[3px] border-l-info bg-white p-3">
        <span className="text-xs font-semibold text-info">Agent建议：</span>
        <p className="mt-1 text-xs text-text-secondary">
          一致项生成盘点报告写库，差异项转问题件处理
        </p>
      </div>

      {/* Action buttons */}
      <div className="mt-6 space-y-2">
        <button
          onClick={() => {
            setMode('consistent');
            setReportWritten(true);
          }}
          className={cn('h-11 w-full rounded-md text-sm font-semibold text-white',
            mode === 'consistent' ? 'bg-success' : 'bg-success/70'
          )}
        >
          {reportWritten ? '报告已生成 · 最新盘点日期已写入' : '一致 — 生成报告写库'}
        </button>
        <button
          onClick={() => navigate('/pda/problem/handover')}
          className={cn('h-11 w-full rounded-md text-sm font-semibold text-white',
            mode === 'diff' ? 'bg-danger' : 'bg-danger/70'
          )}
        >
          差异 — 转问题件
        </button>
        <button
          onClick={() => navigate('/pda/recount/reprint')}
          className="h-11 w-full rounded-md border border-border bg-white text-sm text-text-secondary"
        >
          补打标签
        </button>
      </div>

      {reportWritten && (
        <div className="mt-3 flex items-center gap-2 rounded-lg bg-success/10 p-3">
          <CheckCircle2 className="h-4 w-4 text-success" />
          <div>
            <div className="text-xs font-semibold text-success">盘点结果已写入</div>
            <div className="mt-0.5 flex items-center gap-1 text-[10px] text-text-muted">
              <FileText className="h-3 w-3" />
              报告编号 RC-RPT-20260521-001
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecountResult;
