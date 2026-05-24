import type { FC, KeyboardEvent, ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Boxes, ClipboardList, Plane, RefreshCcw, ShieldCheck, Truck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { SectionTitle } from './SectionTitle';
import { MediaPlaceholder } from './MediaPlaceholder';

interface DroneAgvScenario {
  title: string;
  description: string;
  flow: string[];
  terminals: string[];
  route: string;
  videoSrc: string;
  posterSrc: string;
}

interface BusinessScenario {
  no: string;
  title: string;
  value: string;
  flow: string[];
  terminals: string[];
  badge: string;
  route: string;
  imageSrc: string;
  fallbackImageSrc?: string;
  tone: 'blue' | 'gold';
  icon: ReactNode;
}

const droneAgvScenario: DroneAgvScenario = {
  title: '空地协同仓储巡检',
  description: '大范围巡检，高位识别，异常拍照与自动回传，助力仓储智能化升级。',
  flow: ['智能巡检', '自动回传', 'AI协同', '异常预警'],
  terminals: ['无人机', 'AGV', 'Admin'],
  route: '/admin/dashboard?scene=drone-agv',
  videoSrc: '/assets/videos/drone-agv-warehouse-inspection.mp4',
  posterSrc: '',
};

const businessScenarios: BusinessScenario[] = [
  {
    no: '01',
    title: '采购到货入库',
    value: '扫码收货、AI检测与异常分流一体完成',
    flow: ['到货预约', '扫码收货', 'AI检测', '异常分流'],
    terminals: ['PDA', 'Station', 'Admin'],
    badge: 'Admin + PDA + Station',
    route: '/admin/inbound-config?scenario=purchase-receive',
    imageSrc: '/assets/placeholders/scenario-purchase-receive.png',
    tone: 'blue',
    icon: <Boxes className="h-4 w-4" />,
  },
  {
    no: '02',
    title: '生产退料入库',
    value: '车间退料回仓后完成审核、复检与分类入库',
    flow: ['退料单审核', '现场验收', 'Station复检', '分类入库'],
    terminals: ['Admin', 'PDA', 'Station'],
    badge: 'Admin + PDA + Station',
    route: '/admin/return-inbound?scenario=production-return',
    imageSrc: '/assets/placeholders/scenario-production-return.png',
    tone: 'blue',
    icon: <RefreshCcw className="h-4 w-4" />,
  },
  {
    no: '03',
    title: '在库循环盘点',
    value: '按任务执行巡检复点并处理库存差异',
    flow: ['任务下发', 'PDA巡检', '数量复点', '差异处理'],
    terminals: ['PDA', 'Admin'],
    badge: 'PDA',
    route: '/pda/recount/task?scenario=recount',
    imageSrc: '/assets/placeholders/scenario-recount.png',
    tone: 'gold',
    icon: <ClipboardList className="h-4 w-4" />,
  },
  {
    no: '04',
    title: '出库发货复核',
    value: '出库前完成拣货结果复核与包装放行',
    flow: ['拣货扫码', 'Station复核', '包装放行', '单据归档'],
    terminals: ['PDA', 'Station', 'Admin'],
    badge: 'Station',
    route: '/station/outbound?scenario=outbound-review',
    imageSrc: '/assets/placeholders/scenario-outbound-review.png',
    tone: 'blue',
    icon: <Truck className="h-4 w-4" />,
  },
  {
    no: '05',
    title: '仓库日常质量抽检',
    value: '围绕重点物资执行抽检识别与整改确认',
    flow: ['抽检任务', '拍照识别', '质量判定', '整改确认'],
    terminals: ['PDA', 'Admin'],
    badge: 'PDA',
    route: '/pda/inspect/task?scenario=daily-quality-check',
    imageSrc: '/assets/placeholders/scenario-daily-quality-check.png',
    tone: 'gold',
    icon: <ShieldCheck className="h-4 w-4" />,
  },
];

function keyboardClick(event: KeyboardEvent<HTMLElement>, action: () => void) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    action();
  }
}

const smoothEase = [0.4, 0, 0.2, 1] as const;
const stageTransition = { duration: 0.95, ease: smoothEase };
const listTransition = { duration: 0.78, ease: smoothEase };

const DroneAgvVideoBanner: FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="relative mt-4 min-h-[340px] overflow-hidden rounded-xl border border-border-light/70 bg-white/80 shadow-[0_2px_16px_rgba(15,23,42,0.05)] lg:min-h-[430px]"
      aria-label="无人机巡检 / AGV 联动视频"
    >
      <div className="absolute inset-0">
        <MediaPlaceholder
          kind="video"
          title="无人机巡检 / AGV 联动"
          label="无人机巡检视频"
          videoSrc={droneAgvScenario.videoSrc}
          posterSrc={droneAgvScenario.posterSrc}
          icon={<Plane className="h-6 w-6" />}
        />
      </div>
      <div
        className="absolute inset-0 bg-[linear-gradient(to_bottom_left,rgba(2,8,23,0)_0%,rgba(2,8,23,0.08)_30%,rgba(2,8,23,0.26)_58%,rgba(2,8,23,0.66)_100%)]"
        aria-hidden
      />
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_left_bottom,rgba(2,8,23,0.72)_0%,rgba(2,8,23,0.48)_34%,rgba(2,8,23,0.14)_60%,rgba(2,8,23,0)_82%)]"
        aria-hidden
      />
      <div className="relative flex min-h-[340px] items-end px-6 py-8 lg:min-h-[430px] lg:px-8 lg:py-10">
        <div className="max-w-[460px]">
          <h2 className="text-[22px] font-semibold tracking-normal text-white/95 drop-shadow-[0_2px_12px_rgba(0,0,0,0.62)] md:text-[26px]">
            {droneAgvScenario.title}
          </h2>
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
            {droneAgvScenario.flow.map((item) => (
              <span key={item} className="text-[13px] font-semibold leading-none text-blue-50/95 [text-shadow:0_2px_10px_rgba(0,0,0,0.78)]">
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const ScenarioStage: FC<{ scenario: BusinessScenario; activeIndex: number }> = ({ scenario, activeIndex }) => {
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();
  const go = () => navigate(scenario.route);
  const [previousIndex, setPreviousIndex] = useState(activeIndex);

  useEffect(() => {
    setPreviousIndex(activeIndex);
  }, [activeIndex]);

  return (
    <div
      role="link"
      tabIndex={0}
      onClick={go}
      onKeyDown={(event) => keyboardClick(event, go)}
      className="group relative min-h-[380px] cursor-pointer overflow-hidden rounded-[20px] border border-white/80 bg-[#071426] shadow-[0_18px_46px_rgba(15,23,42,0.11)] transition-all duration-300 hover:border-blue-200/70 hover:shadow-[0_22px_54px_rgba(37,99,235,0.15)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-info/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#F1F5F9] lg:h-full lg:min-h-0"
      aria-label={`${scenario.title}，进入演示页面`}
    >
      {businessScenarios.map((item, index) => {
        const isActive = index === activeIndex;
        const isPrevious = index === previousIndex;
        const isVisible = isActive || isPrevious;

        return (
          <motion.div
            key={item.no}
            className="absolute inset-0"
            initial={false}
            animate={{
              opacity: isActive ? 1 : isPrevious ? 1 : 0,
              scale: shouldReduceMotion ? 1 : isActive ? 1 : 1.01,
            }}
            transition={stageTransition}
            style={{
              zIndex: isActive ? 2 : isPrevious ? 1 : 0,
              pointerEvents: 'none',
              visibility: isVisible ? 'visible' : 'hidden',
            }}
            aria-hidden={!isActive}
          >
            <MediaPlaceholder
              title={item.title}
              label="场景图片预留"
              imageSrc={item.imageSrc}
              fallbackImageSrc={item.fallbackImageSrc}
              icon={item.icon}
              className="absolute inset-0"
              mediaClassName="transition-transform duration-700 ease-out group-hover:scale-[1.02]"
            />
          </motion.div>
        );
      })}
      <div className="pointer-events-none absolute inset-0 z-[3]">
        <div
          className="absolute inset-0 bg-[linear-gradient(to_bottom_left,rgba(8,20,38,0)_0%,rgba(8,20,38,0.04)_30%,rgba(8,20,38,0.18)_54%,rgba(5,13,29,0.52)_78%,rgba(2,6,23,0.82)_100%)] transition-opacity duration-300 group-hover:opacity-95"
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_left_bottom,rgba(2,6,23,0.56)_0%,rgba(3,12,28,0.30)_30%,rgba(8,20,38,0.08)_56%,rgba(8,20,38,0)_78%)] transition-opacity duration-300 group-hover:opacity-95"
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-[linear-gradient(135deg,rgba(59,130,246,0.08)_0%,rgba(59,130,246,0.03)_34%,rgba(255,255,255,0.06)_100%)]"
          aria-hidden
        />
      </div>
      <AnimatePresence initial={false}>
        <motion.div
          key={scenario.no}
          className="absolute bottom-[22px] left-5 right-5 z-[4] w-auto max-w-none md:bottom-[30px] md:left-8 md:right-auto md:w-[380px] md:max-w-[46%]"
          initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -6 }}
          transition={shouldReduceMotion ? { duration: 0.42, ease: smoothEase, delay: 0.08 } : { duration: 0.78, ease: smoothEase, delay: 0.18 }}
        >
          <div className="mb-2.5 flex items-center gap-2 text-[12px] font-semibold leading-none text-blue-50/90 [text-shadow:0_1px_8px_rgba(0,0,0,0.50)]">
            <span>
              {scenario.badge}
            </span>
          </div>
          <h3 className="mb-2.5 text-[23px] font-bold leading-[1.15] tracking-normal text-white/95 shadow-none [text-shadow:0_2px_12px_rgba(0,0,0,0.56)] md:text-[28px]">
            {scenario.title}
          </h3>
          <p className="mb-3.5 line-clamp-2 max-w-[360px] text-sm font-medium leading-[1.55] text-white/90 [text-shadow:0_2px_10px_rgba(0,0,0,0.56)] md:text-[15px]">
            {scenario.value}
          </p>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            {scenario.flow.map((item, index) => (
              <motion.span
                key={item}
                className="text-xs font-semibold leading-none text-white/80 [text-shadow:0_1px_8px_rgba(0,0,0,0.54)]"
                initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={shouldReduceMotion ? { duration: 0.32, ease: smoothEase, delay: 0.18 + index * 0.04 } : { duration: 0.52, ease: smoothEase, delay: 0.34 + index * 0.07 }}
              >
                {item}
              </motion.span>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

const ScenarioList: FC<{
  selectedIndex: number;
  onSelect: (index: number) => void;
}> = ({ selectedIndex, onSelect }) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="relative overflow-hidden rounded-xl border border-border-light/70 bg-white/90 shadow-[0_10px_30px_rgba(15,23,42,0.07)] backdrop-blur-sm lg:h-full">
      <div className="pointer-events-none absolute left-[37px] top-10 bottom-10 w-[3px] rounded-full bg-blue-100/75 blur-[1px]" aria-hidden />
      <div className="pointer-events-none absolute left-[38px] top-10 bottom-10 w-px bg-[linear-gradient(180deg,rgba(37,99,235,0.10)_0%,rgba(37,99,235,0.34)_18%,rgba(125,181,255,0.54)_48%,rgba(37,99,235,0.28)_82%,rgba(37,99,235,0.08)_100%)] shadow-[0_0_10px_rgba(59,130,246,0.18)]" aria-hidden />
      {businessScenarios.map((scenario, index) => {
        const isActive = selectedIndex === index;

        return (
          <button
            key={scenario.title}
            type="button"
            onClick={() => onSelect(index)}
            className="group relative flex min-h-[74px] w-full items-center gap-4 px-5 py-3 text-left transition-colors duration-200 hover:bg-[linear-gradient(90deg,rgba(239,246,255,0.55)_0%,rgba(255,255,255,0)_86%)] focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-info/65 focus-visible:ring-inset lg:h-1/5"
            aria-pressed={isActive}
          >
            {isActive ? (
              <motion.span
                layoutId="business-scenario-active-row"
                className="absolute inset-y-1 left-2 right-2 rounded-xl bg-[linear-gradient(90deg,rgba(239,246,255,0.98)_0%,rgba(248,251,255,0.86)_70%,rgba(255,255,255,0.94)_100%)]"
                transition={shouldReduceMotion ? { duration: 0.4, ease: smoothEase } : listTransition}
                aria-hidden
              />
            ) : null}
            <motion.span
              className={cn(
                'relative z-[1] flex h-9 w-9 shrink-0 items-center justify-center rounded-full border font-data text-[12px] font-bold shadow-[0_8px_18px_rgba(15,23,42,0.08)] transition-colors duration-200',
                isActive
                  ? 'border-info bg-info text-white'
                  : 'border-blue-100 bg-[#F0F7FF] text-[#48617F] group-hover:border-blue-200 group-hover:bg-blue-50 group-hover:text-info'
              )}
              animate={shouldReduceMotion ? undefined : { scale: isActive ? 1.04 : 1 }}
              transition={shouldReduceMotion ? { duration: 0.4, ease: smoothEase } : listTransition}
            >
              {isActive ? (
                <motion.span
                  layoutId="business-scenario-dot-glow"
                  className="absolute inset-[-7px] rounded-full bg-blue-400/20 blur-[3px]"
                  transition={shouldReduceMotion ? { duration: 0.4, ease: smoothEase } : listTransition}
                  aria-hidden
                />
              ) : null}
              <span className="relative z-[1] h-2 w-2 rounded-full bg-current" />
            </motion.span>
            <span className="relative z-[1] min-w-0 flex-1">
              <motion.span
                className="block text-[13px] font-semibold leading-5 sm:text-sm"
                animate={{
                  x: shouldReduceMotion ? 0 : isActive ? 2 : 0,
                  color: isActive ? '#0B2B55' : '#10243D',
                }}
                transition={shouldReduceMotion ? { duration: 0.32, ease: smoothEase } : { duration: 0.58, ease: smoothEase }}
              >
                {scenario.title}
              </motion.span>
              <motion.span
                className="mt-1 block truncate text-[12px] leading-4"
                animate={{
                  x: shouldReduceMotion ? 0 : isActive ? 2 : 0,
                  color: isActive ? '#5E718A' : '#718198',
                  opacity: isActive ? 1 : 0.86,
                }}
                transition={shouldReduceMotion ? { duration: 0.32, ease: smoothEase } : { duration: 0.58, ease: smoothEase, delay: isActive ? 0.06 : 0 }}
              >
                {scenario.flow.slice(0, 2).join(' → ')}
              </motion.span>
            </span>
          </button>
        );
      })}
    </div>
  );
};

const ScenarioTheater: FC = () => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const current = businessScenarios[selectedIndex];

  useEffect(() => {
    businessScenarios.forEach((scenario) => {
      const image = new Image();
      image.src = scenario.imageSrc;
    });
  }, []);

  return (
    <div className="mt-5 grid gap-4 lg:h-[430px] lg:grid-cols-[minmax(0,0.68fr)_minmax(320px,0.32fr)]">
      <ScenarioStage scenario={current} activeIndex={selectedIndex} />
      <ScenarioList selectedIndex={selectedIndex} onSelect={setSelectedIndex} />
    </div>
  );
};

export const BusinessScenariosSection: FC = () => (
  <section className="mx-auto max-w-[1280px] px-6 pt-4 pb-8">
    <SectionTitle
      title={
        <span className="relative inline-flex items-end gap-2 pb-2">
          <span className="relative inline-flex">
            <span
              className="font-data text-[56px] font-black italic leading-[0.78] tracking-[-0.06em] text-[#155E9F] drop-shadow-[0_8px_16px_rgba(37,99,235,0.16)] md:text-[66px]"
            >
              6
            </span>
          </span>
          <span className="pb-1.5">业务场景</span>
          <span className="absolute bottom-0 left-0 h-[3px] w-[78px] rounded-full bg-[linear-gradient(90deg,#0F6EA8_0%,#2AA7D9_70%,rgba(42,167,217,0)_100%)] shadow-[0_4px_12px_rgba(14,116,144,0.22)]" />
        </span>
      }
      hideUnderline
      extra={
        <span className="hidden max-w-[560px] text-right text-xs leading-5 text-text-muted lg:block">
          覆盖无人巡检、到货入库、退料入库、循环盘点、出库复核与日常质量抽检。
        </span>
      }
    />
    <p className="-mt-2 mb-6 text-sm leading-6 text-text-muted lg:hidden">
      覆盖无人巡检、到货入库、退料入库、循环盘点、出库复核与日常质量抽检。
    </p>
    <DroneAgvVideoBanner />
    <ScenarioTheater />
  </section>
);

export default BusinessScenariosSection;
