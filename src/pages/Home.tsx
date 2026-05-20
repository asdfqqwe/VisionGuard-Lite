import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Smartphone,
  Monitor,
  LayoutDashboard,
  ClipboardCheck,
  TrendingUp,
  Target,
  Activity,
  ShieldAlert,
  Cloud,
  ShieldCheck,
  Wallet,
  Gauge,
  Zap,
  Workflow,
  BrainCircuit,
  AlertTriangle,
  RefreshCcw,
  ArrowRight,
} from 'lucide-react';
import { dashboardData } from '@/data/mockData';
import {
  GlobeWithChips,
  KpiMetricCard,
  TerminalCard,
  SectionTitle,
  RuntimeStatusCard,
  ValueCard,
} from '@/components/home';

// ─── 编排假数据(C1)───
const KPI_SPARKS = {
  intercept: [820, 940, 880, 1020, 960, 1140, 1247],
  value: [280, 305, 290, 340, 320, 360, 386],
  accuracy: [98.4, 98.7, 99.0, 98.9, 99.3, 99.5, 99.7],
};

const RUNTIME_SPARKS = {
  station: [3, 4, 4, 5, 4, 4, 4],
  pda: [9, 10, 11, 12, 11, 13, 12],
  exception: [5, 4, 6, 3, 4, 3, 3],
  l1: [0, 1, 0, 0, 1, 0, 0],
};

const HERO_FEATURES = [
  {
    icon: <Workflow className="h-3.5 w-3.5" />,
    title: '全链路质检',
    desc: '覆盖入库 · 出库全流程',
  },
  {
    icon: <BrainCircuit className="h-3.5 w-3.5" />,
    title: 'AI智能识别',
    desc: '多模态融合,高精度检测',
  },
  {
    icon: <AlertTriangle className="h-3.5 w-3.5" />,
    title: '风险实时拦截',
    desc: '异常自动预警与拦截',
  },
  {
    icon: <RefreshCcw className="h-3.5 w-3.5" />,
    title: '数据闭环',
    desc: '规则供给,持续进化',
  },
];

// ─── Home Page ───
export default function Home() {
  return (
    <div className="min-h-[100dvh] bg-[#F1F5F9]">
      {/* ─── Top Navigation: 仅 Logo,右侧空白 ─── */}
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
        </div>
      </motion.header>

      {/* ─── Hero Section:左右两栏 ─── */}
      <section className="relative overflow-hidden pt-16">
        {/* Hero 背景渐变 */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, #F8FAFC 0%, #EEF4FB 60%, #F1F5F9 100%)',
          }}
          aria-hidden
        />
        {/* 极淡网格 */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(rgba(148,163,184,0.5) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(148,163,184,0.5) 1px, transparent 1px)`,
            backgroundSize: '48px 48px',
          }}
          aria-hidden
        />

        <div className="relative mx-auto grid w-full max-w-[1280px] grid-cols-1 gap-6 px-6 py-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:py-10">
          {/* 左栏:文案 + KPI + 特性 */}
          <div className="flex flex-col justify-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="text-[34px] font-bold tracking-tight text-[#0B1F3A] md:text-[38px]"
            >
              <span className="inline-flex items-baseline gap-2">
                <span
                  className="font-black text-[#1273EA]"
                  style={{
                    fontFamily: '"SF Pro Display", "PingFang SC", "Noto Sans SC", sans-serif',
                    letterSpacing: '0.01em',
                    textShadow: '0 8px 22px rgba(18,115,234,0.14)',
                  }}
                >
                  智见
                </span>
                <span className="relative -top-0.5 rounded-md border border-blue-200/80 bg-blue-50/80 px-1.5 py-0.5 text-[0.55em] font-extrabold tracking-[0.08em] text-[#2563EB] shadow-[0_8px_18px_rgba(37,99,235,0.10)]">
                  Lite
                </span>
              </span>
              <span className="mx-2 text-[#94A3B8]">·</span>
              <span className="font-extrabold text-[#081B33]">仓储质检AI系统</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.22 }}
              className="mt-2.5 text-sm text-text-secondary md:text-base"
              style={{ letterSpacing: '0.02em' }}
            >
              AI驱动的全链路仓储质检 · 从入库到出库 · 拦截每一件异常
            </motion.p>

            {/* KPI 玻璃卡组(带 sparkline + 同比) */}
            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <KpiMetricCard
                icon={<ClipboardCheck className="h-4 w-4" />}
                value={dashboardData.todayInterceptCount}
                label="今日拦截件数"
                trend={12.5}
                sparkData={KPI_SPARKS.intercept}
                sparkColor="#3B82F6"
                delay={300}
              />
              <KpiMetricCard
                icon={<TrendingUp className="h-4 w-4" />}
                value={386}
                formatter={(n) => `¥${n}万`}
                label="今日拦截价值"
                trend={8.3}
                sparkData={KPI_SPARKS.value}
                sparkColor="#EAB308"
                delay={380}
              />
              <KpiMetricCard
                icon={<Target className="h-4 w-4" />}
                value={997}
                formatter={(n) => `${(n / 10).toFixed(1)}%`}
                label="AI识别准确率"
                valueColor="text-success"
                trend={0.2}
                sparkData={KPI_SPARKS.accuracy}
                sparkColor="#22C55E"
                delay={460}
              />
            </div>

            {/* 4 个特性 */}
            <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {HERO_FEATURES.map((f, i) => (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.55 + i * 0.06 }}
                  className="flex min-h-[58px] items-start gap-2.5 rounded-lg border border-blue-100/65 bg-white/38 px-3 py-2.5 shadow-[0_10px_24px_rgba(59,130,246,0.045)] backdrop-blur-sm"
                >
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-blue-50/90 text-[#2F80ED] shadow-inner">
                    {f.icon}
                  </span>
                  <div className="min-w-0">
                    <div className="text-[13px] font-semibold text-[#16345C]">
                      {f.title}
                    </div>
                    <div className="mt-0.5 text-[11px] leading-4 text-[#7B8FA8]">{f.desc}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* 右栏:地球 + 围绕胶囊 */}
          <div className="relative flex h-[400px] items-center justify-center lg:h-[480px]">
            <GlobeWithChips />
          </div>
        </div>
      </section>

      {/* ─── 选择终端设备 ─── */}
      <section className="mx-auto max-w-[1280px] px-6 pt-6 pb-8">
        <SectionTitle title="选择终端设备" />
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
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

      {/* ─── 实时运行状态 ─── */}
      <section className="mx-auto max-w-[1280px] px-6 py-8">
        <SectionTitle
          title="实时运行状态"
          extra={
            <div className="flex items-center gap-3">
              <span>更新时间:2026年5月20日 14:32:18</span>
              <Link
                to="/admin/dashboard"
                className="inline-flex items-center gap-1 rounded-md bg-info/10 px-2.5 py-1 text-info transition-colors hover:bg-info/15"
              >
                进入实时监控
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          }
        />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <RuntimeStatusCard
            icon={<Activity className="h-3.5 w-3.5" />}
            label="在线Station"
            value={dashboardData.onlineStations}
            total={6}
            tone="success"
            sparkData={RUNTIME_SPARKS.station}
            delay={0}
          />
          <RuntimeStatusCard
            icon={<Smartphone className="h-3.5 w-3.5" />}
            label="在线PDA"
            value={dashboardData.onlinePDAs}
            total={18}
            tone="info"
            sparkData={RUNTIME_SPARKS.pda}
            delay={80}
          />
          <RuntimeStatusCard
            icon={<ShieldAlert className="h-3.5 w-3.5" />}
            label="待处理异常"
            value={dashboardData.pendingExceptions}
            unit="件"
            tone="warning"
            sparkData={RUNTIME_SPARKS.exception}
            delay={160}
          />
          <RuntimeStatusCard
            icon={<Cloud className="h-3.5 w-3.5" />}
            label="L1拦截中"
            value={dashboardData.l1Intercepting}
            unit="件"
            tone={dashboardData.l1Intercepting > 0 ? 'danger' : 'muted'}
            sparkData={RUNTIME_SPARKS.l1}
            delay={240}
          />
        </div>
      </section>

      {/* ─── 系统价值 ─── */}
      <section className="mx-auto max-w-[1280px] px-6 pt-2 pb-10">
        <SectionTitle title="系统价值" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <ValueCard
            icon={<ShieldCheck className="h-4 w-4" />}
            label="拦截准确率"
            value="99.7%"
            caption="AI智能识别 · 精准拦截"
            tone="success"
            delay={0}
          />
          <ValueCard
            icon={<Wallet className="h-4 w-4" />}
            label="拦截价值(今日)"
            value="¥386万"
            caption="减少损失 · 提升品质"
            tone="accent"
            delay={80}
          />
          <ValueCard
            icon={<Gauge className="h-4 w-4" />}
            label="拦截率"
            value="提升92%"
            caption="相比人工质检效率"
            tone="info"
            delay={160}
          />
          <ValueCard
            icon={<Zap className="h-4 w-4" />}
            label="异常响应提速"
            value="提升68%"
            caption="平均响应时间缩短"
            tone="info"
            delay={240}
          />
        </div>
      </section>

      {/* ─── Footer (B3) ─── */}
      <footer className="border-t border-border-light/60 bg-[#F1F5F9]">
        <div className="mx-auto flex max-w-[1280px] flex-col items-start justify-between gap-3 px-6 py-5 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2.5">
            <img src="/images/logo.png" alt="智见Lite" className="h-7 w-auto" />
            <span className="text-xs text-text-muted">
              AI驱动的仓储质检系统,让每一件产品都值得信赖
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs text-text-muted">
            <span>智见 © 2026 仓储质检AI系统</span>
            <a className="transition-colors hover:text-text-secondary" href="#">
              隐私政策
            </a>
            <a className="transition-colors hover:text-text-secondary" href="#">
              使用条款
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
