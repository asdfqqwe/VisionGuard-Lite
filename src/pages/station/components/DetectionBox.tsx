/**
 * 单个 AI 检测框，叠加在 CameraPreview 之上。
 * 接受百分比坐标，浮现时 framer-motion 做 opacity+scale 入场，
 * OCR 芯片堆 stagger 出现在框右上方，超出容器右边时自动翻转到框左侧。
 */

import type { FC } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { DetectionBox as DetectionBoxData } from '../detection-script';

interface DetectionBoxProps {
  box: DetectionBoxData;
  revealed: boolean;
}

const TYPE_STYLES: Record<DetectionBoxData['type'], {
  border: string;
  label: string;
  shadow: string;
}> = {
  pass: {
    border: 'border-success',
    label: 'bg-success text-white',
    shadow: 'shadow-[0_0_0_3px_rgba(16,185,129,0.18)]',
  },
  warning: {
    border: 'border-l2-badge',
    label: 'bg-l2-badge text-white',
    shadow: 'shadow-[0_0_0_3px_rgba(217,119,6,0.20)]',
  },
  danger: {
    border: 'border-l1-badge',
    label: 'bg-l1-badge text-white',
    shadow: 'shadow-[0_0_0_3px_rgba(220,38,38,0.25)]',
  },
};

export const DetectionBox: FC<DetectionBoxProps> = ({ box, revealed }) => {
  const style = TYPE_STYLES[box.type];
  const flipChips = box.x + box.w > 70; // 框靠右时把 chips 放到左边

  return (
    <AnimatePresence>
      {revealed && (
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className={cn(
            'absolute rounded-md border-2 backdrop-blur-[1px]',
            style.border,
            style.shadow,
          )}
          style={{
            left: `${box.x}%`,
            top: `${box.y}%`,
            width: `${box.w}%`,
            height: `${box.h}%`,
          }}
        >
          {/* 框名 + 置信度（贴在框左上） */}
          <div
            className={cn(
              'absolute -top-5 left-0 flex items-center gap-1 rounded px-1.5 py-0.5 font-mono text-[10px] font-bold whitespace-nowrap',
              style.label,
            )}
          >
            <span>{box.label}</span>
            {box.confidence != null && (
              <span className="opacity-90">· {box.confidence.toFixed(1)}%</span>
            )}
          </div>

          {/* OCR chip 堆 — 靠右框时翻转到左侧 */}
          {box.ocr && box.ocr.length > 0 && (
            <div
              className={cn(
                'absolute top-0 flex flex-col gap-1',
                flipChips ? '-left-1 -translate-x-full' : '-right-1 translate-x-full',
              )}
            >
              {box.ocr.map((chip, i) => (
                <motion.div
                  key={`${chip.label}-${chip.value}`}
                  initial={{ opacity: 0, x: flipChips ? 8 : -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: 0.18 + i * 0.08 }}
                  className="flex items-center gap-1 whitespace-nowrap rounded bg-black/75 px-1.5 py-0.5 backdrop-blur-sm"
                >
                  <span className="text-[9px] text-white/70">{chip.label}</span>
                  <span className="font-mono text-[10px] font-semibold text-white">
                    {chip.value}
                  </span>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DetectionBox;
