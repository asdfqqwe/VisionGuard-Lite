import { useEffect, useState } from 'react';

/**
 * 数字 count-up 动画 hook。
 * - 支持延迟启动
 * - 自动尊重 prefers-reduced-motion(直接显示终值)
 * - 卸载时清理 timer / rAF
 */
export function useCountUp(target: number, duration = 800, delay = 0): number {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const reduceMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    if (reduceMotion) {
      setCount(target);
      return;
    }

    let raf = 0;
    const timer = window.setTimeout(() => {
      const start = performance.now();
      const step = (now: number) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setCount(Math.floor(target * eased));
        if (progress < 1) raf = requestAnimationFrame(step);
        else setCount(target);
      };
      raf = requestAnimationFrame(step);
    }, delay);

    return () => {
      window.clearTimeout(timer);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [target, duration, delay]);

  return count;
}
