import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Smartphone,
  Monitor,
  LayoutDashboard,
  ClipboardCheck,
  TrendingUp,
  Target,
  Workflow,
  BrainCircuit,
  AlertTriangle,
  RefreshCcw,
} from 'lucide-react';
import { dashboardData } from '@/data/mockData';
import {
  GlobeWithChips,
  TerminalCard,
  SectionTitle,
  CoreCapabilitiesSection,
  BusinessScenariosSection,
  Sparkline,
} from '@/components/home';

// ─── 编排假数据(C1)───
const KPI_SPARKS = {
  intercept: [820, 940, 880, 1020, 960, 1140, 1247],
  value: [280, 305, 290, 340, 320, 360, 386],
  accuracy: [98.4, 98.7, 99.0, 98.9, 99.3, 99.5, 99.7],
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

const HERO_KPIS = [
  {
    icon: <ClipboardCheck className="h-4 w-4" />,
    value: dashboardData.todayInterceptCount.toLocaleString(),
    label: '今日拦截件数',
    trend: '+12.5%',
    color: '#3B82F6',
    valueClass: 'text-[#F2B600]',
    sparkData: KPI_SPARKS.intercept,
  },
  {
    icon: <TrendingUp className="h-4 w-4" />,
    value: '¥386万',
    label: '今日拦截价值',
    trend: '+8.3%',
    color: '#EAB308',
    valueClass: 'text-[#EAB308]',
    sparkData: KPI_SPARKS.value,
  },
  {
    icon: <Target className="h-4 w-4" />,
    value: '99.7%',
    label: 'AI识别准确率',
    trend: '+0.2%',
    color: '#22C55E',
    valueClass: 'text-[#22C55E]',
    sparkData: KPI_SPARKS.accuracy,
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

        <div className="relative mx-auto grid w-full max-w-[1280px] grid-cols-1 gap-x-8 gap-y-6 px-6 pt-7 pb-4 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:pt-8">
          {/* 左栏:文案 + KPI */}
          <div className="flex flex-col justify-center pb-4 lg:pb-0">
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

            <div className="mt-6 grid max-w-[560px] grid-cols-1 gap-4 sm:grid-cols-3">
              {HERO_KPIS.map((item, index) => (
                <motion.div
                    key={item.label}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.42, delay: 0.34 + index * 0.08, ease: 'easeOut' }}
                    className="relative min-h-[150px] overflow-hidden rounded-xl border border-white/78 bg-white/88 px-4 py-4 shadow-[0_14px_32px_rgba(15,23,42,0.06)] backdrop-blur-sm"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="flex h-8 w-8 items-center justify-center rounded-lg shadow-[inset_0_0_0_1px_rgba(255,255,255,0.75)] [&>svg]:h-4 [&>svg]:w-4"
                        style={{ backgroundColor: `${item.color}14`, color: item.color }}
                      >
                        {item.icon}
                      </span>
                      <span className="text-[12px] font-medium leading-4 text-[#7B8FA8]">{item.label}</span>
                    </div>
                    <div className={`mt-4 font-data text-[28px] font-bold leading-none ${item.valueClass}`}>
                      {item.value}
                    </div>
                    <div className="mt-4 flex items-end justify-between gap-3">
                      <div className="text-[11px] font-semibold text-[#22C55E]">
                        <span className="block text-[10px] text-[#9AAAC0]">较昨日</span>
                        {item.trend}
                      </div>
                      <Sparkline data={item.sparkData} color={item.color} width={72} height={24} />
                    </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-11 grid max-w-[790px] grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-4">
              {HERO_FEATURES.map((f, i) => (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.58 + i * 0.06 }}
                  className="flex min-h-[44px] items-start gap-2.5 rounded-lg px-1 py-1.5"
                >
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-50/80 text-[#4C7FD9] shadow-[inset_0_0_0_1px_rgba(147,197,253,0.38)] [&>svg]:h-3.5 [&>svg]:w-3.5">
                    {f.icon}
                  </span>
                  <div className="min-w-0">
                    <div className="text-[12px] font-semibold text-[#233B5D]">
                      {f.title}
                    </div>
                    <div className="mt-0.5 whitespace-nowrap text-[10px] leading-4 text-[#7A8CA5]">{f.desc}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* 右栏:地球 + 围绕胶囊 */}
          <div className="relative flex h-[390px] items-center justify-center lg:h-[460px]">
            <GlobeWithChips />
          </div>
        </div>
      </section>

      <BusinessScenariosSection />

      <CoreCapabilitiesSection />

      {/* ─── 选择终端设备 ─── */}
      <section className="mx-auto max-w-[1280px] px-6 pt-8 pb-10">
        <SectionTitle
          title={
            <span className="inline-flex items-center gap-2.5">
              <span className="h-7 w-1 rounded-full bg-[#155E9F]" aria-hidden />
              <span>选择终端设备</span>
            </span>
          }
          hideUnderline
        />
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          <TerminalCard
            icon={<Smartphone className="h-5 w-5" />}
            title="PDA手持终端"
            description="扫码收货 · 上架拣货 · 巡检盘点 · 异常处理"
            delay={200}
            imageSrc="/images/cover-pda.jpg"
            imageAlt="PDA手持终端封面"
          />
          <TerminalCard
            icon={<Monitor className="h-5 w-5" />}
            title="Station检测工位"
            description="收货检测 · 出库复核 · 包装分流 · AI视觉判定"
            delay={320}
            imageSrc="/images/cover-station.jpg"
            imageAlt="Station检测工位封面"
          />
          <TerminalCard
            icon={<LayoutDashboard className="h-5 w-5" />}
            title="Admin管理后台"
            description="工作台 · 数据看板 · 规则配置 · 供应商分析 · 索赔协同"
            delay={440}
            imageSrc="/images/cover-admin.jpg"
            imageAlt="Admin管理后台封面"
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
          </div>
        </div>
      </footer>
    </div>
  );
}
