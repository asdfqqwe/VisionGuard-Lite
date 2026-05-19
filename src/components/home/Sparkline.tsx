import type { FC } from 'react';

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  /** 线条颜色,默认科技蓝 */
  color?: string;
  /** 渐变填充色基础色,默认与线同色 */
  fillColor?: string;
  className?: string;
}

/**
 * 极简 sparkline:SVG 折线 + 底部柔和渐变填充。
 * 自适应数据归一化,无 axis、无 label。
 */
export const Sparkline: FC<SparklineProps> = ({
  data,
  width = 120,
  height = 36,
  color = '#3B82F6',
  fillColor,
  className,
}) => {
  if (!data.length) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;
  const stepX = width / Math.max(1, data.length - 1);
  const points = data
    .map((v, i) => {
      const x = i * stepX;
      const y = height - 4 - ((v - min) / span) * (height - 8);
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(' ');
  const fill = fillColor ?? color;
  const id = `spark-${color.replace(/[^a-z0-9]/gi, '')}`;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      aria-hidden
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={fill} stopOpacity="0.32" />
          <stop offset="100%" stopColor={fill} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon
        fill={`url(#${id})`}
        points={`0,${height} ${points} ${width},${height}`}
      />
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
};

export default Sparkline;
