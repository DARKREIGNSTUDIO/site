import { useEffect, useRef, useState } from 'react';
import type { PointerEvent } from 'react';
import { soundEngine } from '../audio/soundEngine';
import { computeScrollProgress } from '../data/portfolio';

type CorridorPhase = 'dormant' | 'approaching' | 'active' | 'dissolving';

function getPhaseFromProgress(p: number): CorridorPhase {
  if (p < 0.14) return 'dormant';
  if (p < 0.38) return 'approaching';
  if (p < 0.78) return 'active';
  return 'dissolving';
}

export function HorrorTransitionCorridor() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const lastPhaseRef = useRef<CorridorPhase>('dormant');
  const [phase, setPhase] = useState<CorridorPhase>('dormant');
  const [progressPct, setProgressPct] = useState(0);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    let rafId = 0;

    const updateScroll = () => {
      rafId = 0;
      const rect = el.getBoundingClientRect();
      const progress = computeScrollProgress(rect.top, rect.height, window.innerHeight);

      el.style.setProperty('--cp', progress.toFixed(4));

      // Compute symmetric intensity peak in the middle of the corridor [0 -> 1 -> 0]
      const peak = Math.sin(progress * Math.PI);
      el.style.setProperty('--cpeak', peak.toFixed(4));

      const nextPhase = getPhaseFromProgress(progress);
      if (nextPhase !== lastPhaseRef.current) {
        if (nextPhase === 'active' && lastPhaseRef.current !== 'dissolving') {
          soundEngine.playHorrorCorridorSting();
        }
        lastPhaseRef.current = nextPhase;
        setPhase(nextPhase);
      }

      const rounded = Math.round(progress * 100);
      setProgressPct((prev) => (Math.abs(prev - rounded) >= 2 ? rounded : prev));
    };

    const scheduleUpdate = () => {
      if (rafId === 0) {
        rafId = window.requestAnimationFrame(updateScroll);
      }
    };

    updateScroll();
    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate, { passive: true });

    return () => {
      if (rafId !== 0) {
        window.cancelAnimationFrame(rafId);
      }
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);
    };
  }, []);

  const handlePointerMove = (e: PointerEvent<HTMLElement>) => {
    const el = sectionRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    el.style.setProperty('--fx', `${x.toFixed(1)}px`);
    el.style.setProperty('--fy', `${y.toFixed(1)}px`);

    const nx = (x / rect.width) * 2 - 1;
    const ny = (y / rect.height) * 2 - 1;
    el.style.setProperty('--eye-x', `${(nx * 5).toFixed(2)}px`);
    el.style.setProperty('--eye-y', `${(ny * 4).toFixed(2)}px`);

    const speed = Math.hypot(e.movementX || 0, e.movementY || 0);
    if (speed > 12) {
      soundEngine.playPhotoHoverGlide(nx, speed);
    }
  };

  return (
    <section
      ref={sectionRef}
      id="corridor"
      className={`horror-corridor phase-${phase}`}
      data-phase={phase}
      data-progress={progressPct}
      aria-label="راهروی انتقالی و حضور سایه‌ها پیش از پروژه‌ها"
      onPointerMove={handlePointerMove}
    >
      {/* Interactive flashlight overlay illuminating hidden wall carvings */}
      <div className="corridor-backdrop" aria-hidden="true" />
      <div className="corridor-flashlight" aria-hidden="true" />
      <div className="corridor-static-band" aria-hidden="true" />

      {/* Faint etched analog-horror markings revealed in the dark */}
      <div className="corridor-etchings" aria-hidden="true">
        <span className="etch-left">DO NOT REWIND // TAPE 04</span>
        <span className="etch-right">00:02:45 · SIGNAL LOST</span>
        <span className="etch-marks">||||/ ||||/ |||</span>
      </div>

      {/* Top Surveillance HUD */}
      <div className="corridor-hud" dir="ltr" aria-hidden="true">
        <span className="corridor-cam">
          <i /> CAM-04 // TUNNEL SECTOR
        </span>
        <span className="corridor-sig">
          INTERFERENCE: {phase === 'active' ? 'CRITICAL' : phase === 'approaching' ? 'ELEVATED' : 'SCANNING'} [{String(progressPct).padStart(3, '0')}%]
        </span>
      </div>

      {/* 5 Scroll-Driven Analog-Horror Shadow Figures */}
      <div className="corridor-entities" aria-hidden="true">
        {/* 1. Background Lurker Left */}
        <svg className="entity entity-lurk-a" viewBox="0 0 120 300" fill="none">
          <path
            d="M60 18c-14 0-24 14-22 31 1 11 8 19 8 27-16 14-28 45-30 96l15 110h19l6-86 8 86h21l12-112c-2-48-14-79-29-93 0-9 7-17 9-28 2-17-4-31-17-31z"
            fill="#040407"
            stroke="rgba(239, 233, 223, 0.16)"
            strokeWidth="1.2"
          />
          <circle cx="52" cy="44" r="2.4" className="eye-pale" />
          <circle cx="67" cy="45" r="2.4" className="eye-pale" />
        </svg>

        {/* 2. Background Lurker Right */}
        <svg className="entity entity-lurk-b" viewBox="0 0 130 310" fill="none">
          <path
            d="M68 20c-16 1-25 18-21 36 2 10 9 17 7 26-22 18-32 58-34 114l18 98h18l8-78 9 78h19l15-102c-2-52-14-92-31-110-1-9 5-16 7-26 4-19-2-37-15-36z"
            fill="#040407"
            stroke="rgba(255, 59, 59, 0.2)"
            strokeWidth="1.2"
          />
          <circle cx="59" cy="47" r="2.3" className="eye-red" />
          <circle cx="74" cy="46" r="2.3" className="eye-red" />
        </svg>

        {/* 3. Tall Looming Watcher (Left Foreground) */}
        <svg className="entity entity-watcher-l" viewBox="0 0 180 380" fill="none">
          <path
            d="M92 14c-19 0-30 20-26 44 2 14 12 24 10 34-26 16-44 52-49 124-2 28-14 68-17 96l14 4c5-28 12-58 17-82l9 132h22l12-122 14 122h21l8-136c6 26 15 62 21 88l13-5c-5-32-16-74-20-104-6-62-22-96-46-114-2-10 8-20 11-34 5-24-5-47-24-47z"
            fill="#030306"
            stroke="rgba(239, 233, 223, 0.24)"
            strokeWidth="1.4"
          />
          {/* Elongated clawed fingers */}
          <path
            d="M15 304l-9 24m14-22l-3 27m9-25l5 25M157 306l9 25m-14-23l3 26m-9-24l-5 24"
            stroke="rgba(239, 233, 223, 0.28)"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          <g className="entity-eyes">
            <ellipse cx="82" cy="48" rx="3.6" ry="2.8" className="eye-pale" />
            <ellipse cx="101" cy="50" rx="3.6" ry="2.8" className="eye-pale" />
          </g>
        </svg>

        {/* 4. Inverted Ceiling Crawler (Center — REWIND-80 Tunnel Echo) */}
        <svg className="entity entity-crawler" viewBox="0 0 220 260" fill="none">
          {/* Gripping arms clinging to upper tunnel */}
          <path
            d="M42 0l14 78c4 22 18 34 32 42l-8 56c-1 10 4 19 12 25 6 19 20 34 34 32 14-2 25-18 27-38 7-7 11-16 9-26l-10-50c14-9 26-22 30-42L196 0h-22l-11 66c-3 14-14 24-28 28h-50c-14-4-24-14-27-28L47 0H42z"
            fill="#030306"
            stroke="rgba(255, 59, 59, 0.34)"
            strokeWidth="1.5"
          />
          {/* Inverted hollow eyes & distorted grin */}
          <g className="entity-eyes">
            <circle cx="102" cy="196" r="4.0" className="eye-red" />
            <circle cx="128" cy="194" r="4.0" className="eye-red" />
            <path
              d="M99 178c9-9 23-9 32 0"
              stroke="rgba(239,233,223,0.62)"
              strokeWidth="2.4"
              strokeLinecap="round"
            />
          </g>
        </svg>

        {/* 5. Crooked Stalker (Right Foreground) */}
        <svg className="entity entity-stalker-r" viewBox="0 0 190 360" fill="none">
          <path
            d="M116 26c-17-5-35 9-36 30-1 14 7 25 4 36-30 14-50 48-58 108l-16 64 16 6 18-56 14 134h21l11-116 16 116h21l9-128c14 26 22 52 25 76l15-4c-4-42-18-88-42-120-2-10 6-22 9-34 5-22-6-45-27-52z"
            fill="#030306"
            stroke="rgba(255, 59, 59, 0.28)"
            strokeWidth="1.4"
          />
          <g className="entity-eyes">
            <circle cx="104" cy="57" r="3.4" className="eye-red" />
            <circle cx="122" cy="61" r="3.4" className="eye-red" />
          </g>
        </svg>
      </div>

      {/* Central Atmospheric Whisper & Transition Cue into #projects */}
      <div className="corridor-center">
        <div className="corridor-tag bdi-ltr">SIGNAL BREACH // ARCHIVE ENTRY</div>
        <h3 className="corridor-title">پشت هر قاب، یک سیستمِ زنده نفس می‌کشد</h3>
        <p className="corridor-sub">
          عبور از راهروی کد و اتمسفر به سمت بایگانی پروژه‌های <span className="bdi-ltr">Unity</span>
        </p>
        <div className="corridor-portal" aria-hidden="true">
          <span className="corridor-portal-line" />
          <span className="corridor-portal-label bdi-ltr">▼ PROJECTS ARCHIVE UNLOCKED</span>
          <span className="corridor-portal-line" />
        </div>
      </div>
    </section>
  );
}
