import { useEffect, useState } from 'react';
import type { MouseEvent, PointerEvent } from 'react';
import { soundEngine } from '../audio/soundEngine';
import { HERO_COLLAGE, ROLE_TITLES, formatTimecode } from '../data/portfolio';

interface HeroSectionProps {
  onNavigate: (targetId: string) => void;
}

export function HeroSection({ onNavigate }: HeroSectionProps) {
  const [roleText, setRoleText] = useState(ROLE_TITLES[0]);
  const [timecode, setTimecode] = useState('00:00:00');
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  useEffect(() => {
    const start = Date.now();
    const timer = window.setInterval(() => {
      setTimecode(formatTimecode(Date.now() - start));
    }, 60);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    let roleIndex = 0;
    let charIndex = 0;
    let deleting = false;
    let timeoutId = 0;

    const tick = () => {
      const target = ROLE_TITLES[roleIndex];
      charIndex += deleting ? -1 : 1;
      setRoleText(target.slice(0, charIndex));

      let wait = deleting ? 35 : 80;
      if (!deleting && charIndex === target.length) {
        deleting = true;
        wait = 1400;
      } else if (deleting && charIndex === 0) {
        deleting = false;
        roleIndex = (roleIndex + 1) % ROLE_TITLES.length;
        wait = 350;
      }
      timeoutId = window.setTimeout(tick, wait);
    };

    timeoutId = window.setTimeout(tick, 120);
    return () => window.clearTimeout(timeoutId);
  }, []);

  const handleNav = (e: MouseEvent<HTMLAnchorElement>, id: string) => {
    if (!document.getElementById(id)) return;
    e.preventDefault();
    soundEngine.playUiTick('click');
    onNavigate(id);
  };

  const handlePhotoGlide = (e: PointerEvent<HTMLElement>, idx: number, isEnter = false) => {
    if (isEnter) {
      setHoveredIdx(idx);
    }
    const pan = (e.clientX / Math.max(1, window.innerWidth)) * 2 - 1;
    const speed = isEnter ? 24 : Math.hypot(e.movementX || 0, e.movementY || 0);
    if (isEnter || speed > 5) {
      soundEngine.playPhotoHoverGlide(pan, speed);
    }
  };

  return (
    <header id="home">
      <div className="cor hud" style={{ top: '86px', left: '5vw' }}>
        REC <span style={{ color: 'var(--rec)' }}>●</span> <span>{timecode}</span>
      </div>
      <div className="cor hud" style={{ bottom: '28px', left: '5vw' }}>
        ▶ PLAY · SP
      </div>

      <div>
        <div className="hv" style={{ ['--i' as string]: 1 }}>
          <span className="bd" style={{ fontSize: '14px' }}>
            Game Developer · ۲۱ ساله · بندرعباس
          </span>
        </div>

        <h1 className="hero-title hv" style={{ ['--i' as string]: 2 }} data-t="آرمین">
          آرمین
        </h1>

        <div className="role hv" style={{ ['--i' as string]: 3 }}>
          {roleText}
        </div>

        <p className="lead hv" style={{ ['--i' as string]: 4 }}>
          توسعه‌دهنده بازی با ۳ سال تجربه عملی در{' '}
          <span className="bdi-ltr">Unity</span> و <span className="bdi-ltr">C#</span>. از{' '}
          <span className="bdi-ltr">Core Systems</span> و گیم‌پلی تا بهینه‌سازی برای موبایل؛
          بازی‌هایی می‌سازم که از زیرِ پوست هم درست کار کنن.
        </p>

        <div className="hv" style={{ ['--i' as string]: 5 }}>
          <a
            className="btn"
            href="#projects"
            onMouseEnter={() => soundEngine.playUiTick('hover')}
            onClick={(e) => handleNav(e, 'projects')}
          >
            دیدن پروژه‌ها
          </a>
          <a
            className="btn g"
            href="#skills"
            onMouseEnter={() => soundEngine.playUiTick('hover')}
            onClick={(e) => handleNav(e, 'skills')}
          >
            مهارت‌ها
          </a>
        </div>
      </div>

      <div className="fl hv" style={{ ['--i' as string]: 3 }}>
        <div className="fl-aura" aria-hidden="true" />
        {HERO_COLLAGE.map((item, idx) => {
          const isFront = item.layer === 'front';
          const isHovered = hoveredIdx === idx;
          return (
            <div
              key={`${item.layer}-${item.src}`}
              className={`fl-card ${isFront ? 'fl-front' : 'fl-back'}${isHovered ? ' is-active' : ''}`}
              style={item.style}
              onPointerEnter={isFront ? (e) => handlePhotoGlide(e, idx, true) : undefined}
              onPointerMove={isFront ? (e) => handlePhotoGlide(e, idx, false) : undefined}
              onPointerLeave={isFront ? () => setHoveredIdx(null) : undefined}
              onClick={
                isFront
                  ? () => {
                      soundEngine.playUiTick('click');
                      onNavigate('projects');
                    }
                  : undefined
              }
            >
              <img src={item.src} alt={item.alt} referrerPolicy="no-referrer" />
              {isFront && item.badge && <span className="fl-tag">{item.badge}</span>}
            </div>
          );
        })}
      </div>
    </header>
  );
}
