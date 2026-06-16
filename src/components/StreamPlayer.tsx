import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';

interface StreamPlayerProps {
  src: string;
  className?: string;
  onClick?: () => void;
  muted?: boolean;
  autoPlay?: boolean;
  controls?: boolean;
  style?: React.CSSProperties;
}

const StreamPlayer: React.FC<StreamPlayerProps> = ({
  src,
  className,
  onClick,
  muted = true,
  autoPlay = false,
  controls = false,
  style,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [status, setStatus] = useState<'connecting' | 'ready' | 'error'>('connecting');
  const [retryCount, setRetryCount] = useState(0);

  const retryStream = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setRetryCount((count) => count + 1);
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    setStatus('connecting');

    const markReady = () => setStatus('ready');
    const markError = () => setStatus('error');

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: false,
        lowLatencyMode: true,
        backBufferLength: 90,
      });
      hls.loadSource(src);
      hls.attachMedia(video);
      hlsRef.current = hls;

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        markReady();
        if (autoPlay) {
          video.play().catch(() => {});
        }
      });
      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          markError();
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
      video.addEventListener('loadedmetadata', markReady);
      video.addEventListener('error', markError);
    } else {
      markError();
    }

    return () => {
      video.removeEventListener('loadedmetadata', markReady);
      video.removeEventListener('error', markError);
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [src, autoPlay, retryCount]);

  return (
    <div className="relative h-full w-full bg-slate-950">
      <video
        ref={videoRef}
        className={className}
        onClick={onClick}
        muted={muted}
        autoPlay={autoPlay}
        controls={controls}
        playsInline
        style={style}
      />

      {status === 'connecting' && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-950/80 text-sm font-semibold text-white">
          Connecting stream...
        </div>
      )}

      {status === 'error' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-950/90 px-4 text-center text-white">
          <div>
            <p className="text-sm font-bold">Stream unavailable</p>
            <p className="mt-1 text-xs text-slate-300">Check CAMT network access or stream routing.</p>
          </div>
          <button
            type="button"
            className="rounded-[var(--pp-radius)] border border-white/30 px-3 py-2 text-xs font-bold text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/60"
            onClick={retryStream}
          >
            Retry stream
          </button>
        </div>
      )}
    </div>
  );
};

export default StreamPlayer;
