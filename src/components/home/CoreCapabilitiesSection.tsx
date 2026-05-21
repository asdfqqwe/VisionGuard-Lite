import type { FC, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Barcode, Camera, FileText, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SectionTitle } from './SectionTitle';
import { MediaPlaceholder } from './MediaPlaceholder';

interface CapabilityCardConfig {
  title: string;
  tags: string[];
  route: string;
  imageSrc: string;
  tone: 'blue' | 'cyan' | 'indigo' | 'gold';
  icon: ReactNode;
}

const toneClassMap: Record<
  CapabilityCardConfig['tone'],
  {
    icon: string;
    hover: string;
  }
> = {
  blue: {
    icon: 'text-blue-300',
    hover: 'group-hover:text-blue-100 group-focus-visible:text-blue-100',
  },
  cyan: {
    icon: 'text-cyan-300',
    hover: 'group-hover:text-cyan-100 group-focus-visible:text-cyan-100',
  },
  indigo: {
    icon: 'text-indigo-300',
    hover: 'group-hover:text-indigo-100 group-focus-visible:text-indigo-100',
  },
  gold: {
    icon: 'text-amber-300',
    hover: 'group-hover:text-amber-100 group-focus-visible:text-amber-100',
  },
};

const capabilityCards: CapabilityCardConfig[] = [
  {
    title: '视觉自动点数',
    tags: ['图像流', '件数识别', '数量差异'],
    route: '/station/receive?demo=counting',
    imageSrc: '/assets/placeholders/capability-counting.png',
    tone: 'blue',
    icon: <Camera className="h-5 w-5" />,
  },
  {
    title: '标签存在性检测',
    tags: ['包装图像', '标签完整性', '合规提示'],
    route: '/station/receive?demo=label-check',
    imageSrc: '/assets/placeholders/capability-label-check.png',
    tone: 'cyan',
    icon: <Tag className="h-5 w-5" />,
  },
  {
    title: '关键字段 OCR 抽检',
    tags: ['标签图像', 'OCR核验', '人工复核'],
    route: '/station/receive?demo=ocr',
    imageSrc: '/assets/placeholders/capability-ocr.png',
    tone: 'indigo',
    icon: <FileText className="h-5 w-5" />,
  },
  {
    title: '条码自动采集',
    tags: ['条码采集', '编码校验', '流转追溯'],
    route: '/station/receive?demo=barcode',
    imageSrc: '/assets/placeholders/capability-barcode.png',
    tone: 'gold',
    icon: <Barcode className="h-5 w-5" />,
  },
];

const CapabilityImageCard: FC<{ item: CapabilityCardConfig; index: number }> = ({ item, index }) => {
  const tone = toneClassMap[item.tone];
  const textTone = cn(
    'text-[rgba(255,255,255,0.84)] drop-shadow-[0_2px_8px_rgba(0,0,0,0.78)] transition-colors duration-200',
    tone.hover
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.36, delay: index * 0.06, ease: 'easeOut' }}
      className="h-full"
    >
      <Link
        to={item.route}
        className="group relative block aspect-[3/2] h-full cursor-pointer overflow-hidden rounded-lg border border-border-light/70 bg-slate-900 shadow-[0_2px_14px_rgba(15,23,42,0.055)] transition-all duration-300 hover:-translate-y-[3px] hover:border-info/35 hover:shadow-[0_14px_36px_rgba(59,130,246,0.16)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-info/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#F1F5F9] active:translate-y-0"
        aria-label={`${item.title}，进入能力演示`}
      >
        <MediaPlaceholder
          title={item.title}
          label="能力图片预留"
          imageSrc={item.imageSrc}
          icon={item.icon}
          className="absolute inset-0 bg-slate-900"
          mediaClassName="transition-transform duration-500 ease-out group-hover:scale-[1.035] group-focus-visible:scale-[1.035]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.04)_0%,rgba(2,6,23,0.12)_42%,rgba(2,6,23,0.74)_100%)]" aria-hidden />
        <div
          className="absolute inset-x-0 bottom-0 h-[68%] bg-[radial-gradient(ellipse_at_left_bottom,rgba(2,6,23,0.90)_0%,rgba(6,18,34,0.62)_44%,rgba(15,23,42,0)_80%)]"
          aria-hidden
        />
        <div className="absolute inset-x-0 bottom-0 p-4 pb-3.5">
          <div className="flex items-center gap-2.5">
            <span
              className={cn(
                'flex h-5 w-5 shrink-0 items-center justify-center drop-shadow-[0_2px_8px_rgba(0,0,0,0.72)] transition-colors duration-200',
                tone.icon,
                tone.hover
              )}
            >
              {item.icon}
            </span>
            <h3 className={cn('min-w-0 text-[15px] font-semibold leading-5', textTone)}>
              {item.title}
            </h3>
          </div>
          <div className="mt-2.5 flex flex-wrap gap-x-3 gap-y-1.5">
            {item.tags.map((tag) => (
              <span
                key={tag}
                className={cn(
                  'text-[11px] font-medium leading-none',
                  textTone
                )}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export const CoreCapabilitiesSection: FC = () => (
  <section className="mx-auto max-w-[1280px] px-6 pt-8 pb-8">
    <SectionTitle
      title={
        <span className="relative inline-flex items-end gap-2 pb-2">
          <span className="relative inline-flex">
            <span className="font-data text-[56px] font-black italic leading-[0.78] tracking-[-0.06em] text-[#155E9F] drop-shadow-[0_8px_16px_rgba(37,99,235,0.16)] md:text-[66px]">
              4
            </span>
          </span>
          <span className="pb-1.5">核心功能</span>
          <span className="absolute bottom-0 left-0 h-[3px] w-[78px] rounded-full bg-[linear-gradient(90deg,#0F6EA8_0%,#2AA7D9_70%,rgba(42,167,217,0)_100%)] shadow-[0_4px_12px_rgba(14,116,144,0.22)]" />
        </span>
      }
      hideUnderline
      extra={
        <span className="hidden max-w-[520px] text-right text-xs leading-5 text-text-muted md:block">
          覆盖点数、标签、OCR、条码四类基础能力。
        </span>
      }
    />
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {capabilityCards.map((item, index) => (
        <CapabilityImageCard key={item.title} item={item} index={index} />
      ))}
    </div>
  </section>
);

export default CoreCapabilitiesSection;
