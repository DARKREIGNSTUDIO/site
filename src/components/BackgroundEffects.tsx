import { useEffect, useRef, useState } from 'react';
import { soundEngine } from '../audio/soundEngine';

interface BackgroundEffectsProps {
  trackingTick: number;
  onReady: () => void;
}

export function BackgroundEffects({ trackingTick, onReady }: BackgroundEffectsProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const glowRef = useRef<HTMLDivElement | null>(null);
  const progRef = useRef<HTMLDivElement | null>(null);
  const [loadPct, setLoadPct] = useState(0);
  const [loaderOut, setLoaderOut] = useState(false);
  const [trackingActive, setTrackingActive] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (params.get('autostart') === '1' || reduced) {
      setLoadPct(100);
      setLoaderOut(true);
      onReady();
      return;
    }

    let current = 0;
    const interval = window.setInterval(() => {
      current = Math.min(100, current + 12 + Math.random() * 14);
      setLoadPct(current);
      if (current >= 100) {
        window.clearInterval(interval);
        window.setTimeout(() => {
          setLoaderOut(true);
          onReady();
        }, 320);
      }
    }, 95);

    return () => window.clearInterval(interval);
  }, [onReady]);

  const handleLoaderTap = () => {
    void soundEngine.unlock().then((ok) => {
      if (ok) {
        soundEngine.playLoadingSequence();
      }
    });
  };

  useEffect(() => {
    if (trackingTick === 0) {
      return;
    }
    setTrackingActive(false);
    soundEngine.playTrackingGlitch();
    const frame = window.requestAnimationFrame(() => {
      setTrackingActive(true);
    });
    const timer = window.setTimeout(() => setTrackingActive(false), 580);
    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(timer);
    };
  }, [trackingTick]);

  useEffect(() => {
    const root = document.documentElement;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) {
      return;
    }

    let width = 0;
    let height = 0;
    let mouseX = -999;
    let mouseY = -999;
    let rafId = 0;

    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
    }

    let nodes: Particle[] = [];

    const resize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      const count = Math.min(80, Math.floor(width / 16));
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
      }));
    };

    const onPointerMove = (e: PointerEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      root.style.setProperty('--mx', String((e.clientX / window.innerWidth) * 2 - 1));
      root.style.setProperty('--my', String((e.clientY / window.innerHeight) * 2 - 1));
      if (glowRef.current) {
        glowRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
      }
    };

    const onScroll = () => {
      if (!progRef.current) {
        return;
      }
      const maxScroll = Math.max(1, document.body.scrollHeight - window.innerHeight);
      progRef.current.style.width = `${(window.scrollY / maxScroll) * 100}%`;
    };

    resize();
    onScroll();
    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('scroll', onScroll, { passive: true });

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        a.x += a.vx;
        a.y += a.vy;
        if (a.x < 0 || a.x > width) a.vx *= -1;
        if (a.y < 0 || a.y > height) a.vy *= -1;
        const dx = a.x - mouseX;
        const dy = a.y - mouseY;
        const dist = Math.hypot(dx, dy);
        if (dist > 0 && dist < 140) {
          a.x += (dx / dist) * 1.6;
          a.y += (dy / dist) * 1.6;
        }
        ctx.fillStyle = 'rgba(239, 233, 223, 0.55)';
        ctx.fillRect(a.x, a.y, 2, 2);

        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const linkDist = Math.hypot(a.x - b.x, a.y - b.y);
          if (linkDist < 120) {
            ctx.strokeStyle = `rgba(53, 224, 255, ${0.16 * (1 - linkDist / 120)})`;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
      rafId = window.requestAnimationFrame(draw);
    };

    rafId = window.requestAnimationFrame(draw);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  const phaseText =
    loadPct < 35
      ? 'INSERTING TAPE…'
      : loadPct < 80
        ? 'TRACKING SYNC…'
        : 'SYSTEM READY';

  return (
    <>
      <div
        id="load"
        className={loaderOut ? 'out' : ''}
        aria-hidden={loaderOut}
        onClick={handleLoaderTap}
      >
        <div className="load-reel" aria-hidden="true">
          <span className="reel-disc" />
          <span className="reel-disc" />
        </div>
        <div className="load-title">
          <b>▶</b> PLAY
        </div>
        <div className="tr" dir="ltr">
          <i style={{ width: `${loadPct}%` }} />
        </div>
        <div className="load-meta" dir="ltr">
          <span>{phaseText}</span>
          <span>{String(Math.round(loadPct)).padStart(3, '0')}%</span>
        </div>
        <div className="load-hint">کلیک برای شروع با صدا و افکت</div>
      </div>

      <canvas ref={canvasRef} id="bg" aria-hidden="true" />
      <div ref={glowRef} id="glow" aria-hidden="true" />
      <div className="crt" aria-hidden="true" />
      <div id="trk" className={trackingActive ? 'on' : ''} aria-hidden="true" />
      <div ref={progRef} id="prog" aria-hidden="true" />
    </>
  );
}
