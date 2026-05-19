import type { FC } from 'react';
import { ZoomIn, ZoomOut, Maximize, RotateCcw, Camera, ScanLine } from 'lucide-react';
import { cn } from '@/lib/utils';

export type DetectBoxType = 'pass' | 'warning' | 'danger' | 'defect' | 'blur';

export interface DetectBox {
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  confidence?: number;
  type: DetectBoxType;
}

interface ImageInspectAreaProps {
  imageUrl?: string;
  fallbackImageUrl?: string;
  boxes?: DetectBox[];
  infoText?: string;
  status?: 'pass' | 'warning' | 'danger' | 'blur' | 'tagMissing' | 'defect' | 'multiModal';
  className?: string;
  overlayContent?: React.ReactNode;
}

const boxColors: Record<DetectBoxType, string> = {
  pass: 'border-success',
  warning: 'border-warning',
  danger: 'border-danger',
  defect: 'border-defect-badge border-dashed',
  blur: 'border-warning border-dashed',
};



export const ImageInspectArea: FC<ImageInspectAreaProps> = ({
  imageUrl,
  fallbackImageUrl,
  boxes = [],
  infoText = '正在检测：外包装完整性 | 置信度 97.3%',
  status = 'pass',
  className,
  overlayContent,
}) => {
  const statusBorder = {
    pass: 'border-success/30',
    warning: 'border-warning/30',
    danger: 'border-danger/30',
    blur: 'border-warning/30',
    tagMissing: 'border-danger/30',
    defect: 'border-defect-badge/30',
    multiModal: 'border-danger/30',
  }[status];

  return (
    <div className={cn('relative flex h-full flex-col', className)}>
      {/* Image area */}
      <div
        className={cn(
          'relative flex flex-1 items-center justify-center overflow-hidden rounded-lg border-2',
          statusBorder,
          'bg-[#F1F5F9]'
        )}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt="检测图像"
            className="h-full w-full object-contain"
          />
        ) : (
          <>
            {!imageUrl && !fallbackImageUrl && (
              <div className="flex flex-col items-center gap-3">
                <ScanLine className="h-12 w-12 text-text-muted" />
                <span className="text-sm text-text-muted">等待检测图像...</span>
              </div>
            )}
            {!imageUrl && fallbackImageUrl && (
              <img src={fallbackImageUrl} alt="检测图像" className="h-full w-full object-contain" />
            )}
          </>
        )}

        {/* Detection boxes overlay */}
        {boxes.map((box, i) => (
          <div
            key={i}
            className={cn(
              'absolute border',
              boxColors[box.type],
              box.type === 'danger' && 'animate-flash-alert'
            )}
            style={{
              left: `${box.x}%`,
              top: `${box.y}%`,
              width: `${box.w}%`,
              height: `${box.h}%`,
            }}
          >
            {/* Label */}
            <div
              className={cn(
                'absolute -top-5 left-0 whitespace-nowrap rounded px-1 py-0.5 text-[10px] font-medium text-white',
                box.type === 'pass'
                  ? 'bg-success'
                  : box.type === 'danger'
                    ? 'bg-danger'
                    : box.type === 'defect'
                      ? 'bg-defect-badge'
                      : 'bg-warning'
              )}
            >
              {box.label}
              {box.confidence !== undefined && ` ${box.confidence.toFixed(1)}%`}
            </div>
          </div>
        ))}

        {/* Custom overlay (for triage evidence, etc) */}
        {overlayContent}
      </div>

      {/* Info bar */}
      <div className="mt-2 flex items-center justify-between rounded bg-[#F1F5F9] px-3 py-2">
        <span className="text-[11px] text-text-secondary">{infoText}</span>

        {/* Toolbar */}
        <div className="flex gap-1">
          <button className="rounded p-1 text-text-muted transition-colors hover:bg-primary hover:text-text-secondary">
            <ZoomIn className="h-4 w-4" />
          </button>
          <button className="rounded p-1 text-text-muted transition-colors hover:bg-primary hover:text-text-secondary">
            <ZoomOut className="h-4 w-4" />
          </button>
          <button className="rounded p-1 text-text-muted transition-colors hover:bg-primary hover:text-text-secondary">
            <Maximize className="h-4 w-4" />
          </button>
          <button className="rounded p-1 text-text-muted transition-colors hover:bg-primary hover:text-text-secondary">
            <RotateCcw className="h-4 w-4" />
          </button>
          <button className="rounded p-1 text-text-muted transition-colors hover:bg-primary hover:text-text-secondary">
            <Camera className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageInspectArea;
