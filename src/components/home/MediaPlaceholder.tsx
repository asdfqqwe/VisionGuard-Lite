import type { FC, ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { ImageIcon, Video } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MediaPlaceholderProps {
  kind?: 'image' | 'video';
  imageSrc?: string;
  videoSrc?: string;
  posterSrc?: string;
  title: string;
  label?: string;
  icon?: ReactNode;
  className?: string;
  mediaClassName?: string;
}

export const MediaPlaceholder: FC<MediaPlaceholderProps> = ({
  kind = 'image',
  imageSrc,
  videoSrc,
  posterSrc,
  title,
  label,
  icon,
  className,
  mediaClassName,
}) => {
  const [imageReady, setImageReady] = useState(Boolean(imageSrc));
  const [videoReady, setVideoReady] = useState(Boolean(videoSrc));

  useEffect(() => {
    setImageReady(Boolean(imageSrc));
  }, [imageSrc]);

  useEffect(() => {
    setVideoReady(Boolean(videoSrc));
  }, [videoSrc]);

  const showImage = kind === 'image' && Boolean(imageSrc) && imageReady;
  const showVideo = kind === 'video' && Boolean(videoSrc) && videoReady;

  return (
    <div
      className={cn(
        'relative h-full w-full overflow-hidden bg-[#EAF2FB]',
        className
      )}
    >
      {showImage ? (
        <img
          src={imageSrc}
          alt={title}
          loading="lazy"
          onError={() => setImageReady(false)}
          className={cn('h-full w-full object-cover', mediaClassName)}
        />
      ) : null}

      {showVideo ? (
        <video
          src={videoSrc}
          poster={posterSrc}
          autoPlay
          muted
          loop
          playsInline
          onError={() => setVideoReady(false)}
          className={cn('h-full w-full object-cover', mediaClassName)}
        />
      ) : null}

      {!showImage && !showVideo ? (
        <div className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(circle_at_24%_18%,rgba(59,130,246,0.20),transparent_32%),linear-gradient(135deg,#F8FAFC_0%,#EAF2FB_46%,#DCEBFA_100%)]">
          <div
            className="absolute inset-0 opacity-[0.12]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(59,130,246,0.65) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.45) 1px, transparent 1px)',
              backgroundSize: '34px 34px',
            }}
            aria-hidden
          />
          <div
            className="absolute left-0 top-0 h-full w-1/2 bg-gradient-to-r from-white/38 to-transparent"
            aria-hidden
          />
          <div className="relative flex flex-col items-center gap-3 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-blue-100 bg-white/78 text-info shadow-[0_10px_28px_rgba(59,130,246,0.16)] backdrop-blur-sm">
              {icon ?? (kind === 'video' ? <Video className="h-6 w-6" /> : <ImageIcon className="h-6 w-6" />)}
            </span>
            <div>
              <p className="text-sm font-semibold text-[#16345C]">{title}</p>
              <p className="mt-1 text-xs text-text-muted">
                {label ?? (kind === 'video' ? '视频素材预留' : '图片素材预留')}
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default MediaPlaceholder;
