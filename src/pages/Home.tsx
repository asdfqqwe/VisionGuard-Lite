import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Smartphone,
  Monitor,
  LayoutDashboard,
  ClipboardCheck,
  TrendingUp,
  Target,
} from 'lucide-react';
import { dashboardData } from '@/data/mockData';
import {
  HeroWarehouseBeams,
  KpiMetricCard,
  TerminalCard,
  SystemStatusBar,
} from '@/components/home';

// ─── Home Page ───
export default function Home() {
  const heroRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // 鼠标视差,reduced-motion 时直接禁用
  useEffect(() => {
    const reduceMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!heroRef.current) return;
      const rect = heroRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 12;
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * 12;
      setMousePos({ x, y });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="min-h-[100dvh] bg-[#F1F5F9]">
      {/* ─── Top Navigation ─── */}
      <motion.header
        initial={{ y: -64 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="fixed top-0 z-[60] h-16 w-full border-b border-border-light/60 bg-[#F1F5F9]/80 backdrop-blur-md"
      >
        <div className="mx-auto flex h-full max-w-[1440px] items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-3">
            <img src="/images/logo.png" alt="智见Lite" className="h-14 w-auto" />
          </Link>
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xs text-text-muted"
          >
            V3.2.1
          </motion.span>
        </div>
      </motion.header>

      {/* ─── Hero Section ─── */}
      <section
        ref={heroRef}
        className="relative flex min-h-[460px] items-center justify-center overflow-hidden pt-16"
      >
        {/* 仓储质检全链路 integration 动画背景 */}
        <HeroWarehouseBeams />

        {/* 极淡网格(增加质感,但不抢戏) */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(rgba(148,163,184,0.5) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(148,163,184,0.5) 1px, transparent 1px)`,
            backgroundSize: '48px 48px',
          }}
          aria-hidden
        />

        {/* Hero 内容 */}
        <motion.div
          className="relative z-10 mx-auto w-full max-w-[1100px] px-6 text-center"
          animate={{ x: mousePos.x * 0.4, y: mousePos.y * 0.4 }}
          transition={{ type: 'tween', ease: 'linear', duration: 0.2 }}
        >
          {/* 主标题 */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="text-5xl font-bold tracking-tight text-[#0F172A] md:text-[48px]"
          >
            <span className="text-accent">智见</span>
            <span> · 仓储质检AI系统</span>
          </motion.h1>

          {/* 副标题 */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.32 }}
            className="mt-4 text-base text-text-secondary md:text-lg"
            style={{ letterSpacing: '0.04em' }}
          >
            AI驱动的全链路仓储质检 · 从入库到出库 · 拦截每一件异常
          </motion.p>

          {/* KPI 玻璃卡组 */}
          <div className="mx-auto mt-8 grid max-w-[860px] grid-cols-1 gap-4 sm:grid-cols-3">
            <KpiMetricCard
              icon={<ClipboardCheck className="h-5 w-5" />}
              value={dashboardData.todayInterceptCount}
              label="今日拦截件数"
              delay={500}
            />
            <KpiMetricCard
              icon={<TrendingUp className="h-5 w-5" />}
              value={386}
              formatter={(n) => `¥${n}万`}
              label="今日拦截价值"
              delay={580}
            />
            <KpiMetricCard
              icon={<Target className="h-5 w-5" />}
              value={997}
              formatter={(n) => `${(n / 10).toFixed(1)}%`}
              label="AI识别准确率"
              valueColor="text-success"
              delay={660}
            />
          </div>
        </motion.div>
      </section>

      {/* ─── Device Cards Section ─── */}
      <section className="mx-auto max-w-[1200px] px-6 pt-12 pb-10">
        {/* 段标题 */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <h2 className="text-2xl font-semibold text-[#0F172A]">选择终端设备</h2>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: 60 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="mt-2 h-1 rounded bg-accent"
          />
        </motion.div>

        {/* 卡片网格 */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <TerminalCard
            icon={<Smartphone className="h-5 w-5" />}
            title="PDA手持终端"
            description="扫码收货 · 上架拣货 · 巡检盘点 · 异常处理"
            to="/pda"
            delay={200}
            imageSrc="/images/cover-pda.jpg"
            imageAlt="PDA手持终端封面"
          />
          <TerminalCard
            icon={<Monitor className="h-5 w-5" />}
            title="Station检测工位"
            description="收货检测 · 出库复核 · 包装分流 · AI视觉判定"
            to="/station"
            delay={320}
            imageSrc="/images/cover-station.jpg"
            imageAlt="Station检测工位封面"
          />
          <TerminalCard
            icon={<LayoutDashboard className="h-5 w-5" />}
            title="Admin管理后台"
            description="工作台 · 数据看板 · 规则配置 · 供应商分析 · 索赔协同"
            to="/admin"
            delay={440}
            imageSrc="/images/cover-admin.jpg"
            imageAlt="Admin管理后台封面"
          />
        </div>
      </section>

      {/* ─── System Status Bar ─── */}
      <section className="mx-auto max-w-[1200px] px-6 pb-12">
        <SystemStatusBar
          onlineStations={dashboardData.onlineStations}
          onlinePDAs={dashboardData.onlinePDAs}
          pendingExceptions={dashboardData.pendingExceptions}
          l1Intercepting={dashboardData.l1Intercepting}
        />
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-border-light/60 bg-[#F1F5F9] py-4">
        <p className="text-center text-xs text-text-muted">
          智见 © 2024 仓储质检AI系统 v3.2.1
        </p>
      </footer>
    </div>
  );
}
