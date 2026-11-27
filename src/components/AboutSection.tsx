import { useEffect, useRef, useState } from 'react';
import { PROFILE_INFO_ROWS, STATS_COUNTERS } from '../data/portfolio';
import { useTiltHandlers } from '../hooks/useMotionFx';

function AnimatedCounter({ target }: { target: number }) {
  const ref = useRef<HTMLElement | null>(null);
  const [display, setDisplay] = useState('۰');

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const start = performance.now();
          const step = (now: number) => {
            const k = Math.min(1, (now - start) / 1400);
            const value = Math.round(target * (1 - Math.pow(1 - k, 3)));
            setDisplay(value.toLocaleString('fa-IR'));
            if (k < 1) {
              requestAnimationFrame(step);
            }
          };
          requestAnimationFrame(step);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.6 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [target]);

  return <b ref={ref}>{display}</b>;
}

export function AboutSection() {
  const tilt = useTiltHandlers();

  return (
    <section id="about" className="sec">
      <div className="k">ABOUT</div>
      <h2 className="sec-h2">یه بازی‌ساز مستقل که با پروژه واقعی بزرگ شده</h2>

      <div className="g2">
        <div
          className="pn"
          onPointerMove={tilt.onPointerMove}
          onPointerLeave={tilt.onPointerLeave}
        >
          <p>
            من آرمین‌ام؛ حدود ۳ سال تجربه عملی در{' '}
            <span className="bdi-ltr">Unity</span> و <span className="bdi-ltr">C#</span> که
            بخش عمده مسیرم رو مستقل و با ساخت پروژه‌های شخصی و آزمایش سیستم‌های مختلف بازی طی
            کردم. روی سبک‌های <span className="bdi-ltr">Horror</span>،{' '}
            <span className="bdi-ltr">Survival</span>، <span className="bdi-ltr">RPG</span>،{' '}
            <span className="bdi-ltr">Action</span>، داستان‌محور و{' '}
            <span className="bdi-ltr">2D</span> کار کردم و فقط روی گیم‌پلی نموندم؛{' '}
            <span className="bdi-ltr">Core Systems</span>، سیستم‌های بازیکن، تعاملات،{' '}
            <span className="bdi-ltr">Save/Load</span>، <span className="bdi-ltr">Combat</span>،{' '}
            <span className="bdi-ltr">Audio</span>، <span className="bdi-ltr">UI</span>،{' '}
            <span className="bdi-ltr">State Management</span> و{' '}
            <span className="bdi-ltr">Performance</span> رو هم دست‌به‌کد تجربه کردم.
          </p>
          <br />
          <p>
            علاقه اصلی من <span className="bdi-ltr">Core Development</span>،{' '}
            <span className="bdi-ltr">Systems Programming</span>، بهینه‌سازی و ساختار فنی
            پروژه‌هاست و ورود سریع به سیستم‌های جدید رو دوست دارم. پروژه تجاری منتشرشده و سابقه
            همکاری رسمی ندارم و تجربه فعلی‌ام حاصل توسعه مستقل پروژه‌های شخصی است.
          </p>

          <div className="st">
            {STATS_COUNTERS.map((stat) => (
              <div key={stat.label}>
                <AnimatedCounter target={stat.n} />
                <small>{stat.label}</small>
              </div>
            ))}
          </div>
        </div>

        <div
          className="pn"
          onPointerMove={tilt.onPointerMove}
          onPointerLeave={tilt.onPointerLeave}
        >
          <ul className="inf">
            {PROFILE_INFO_ROWS.map((row) => (
              <li key={row.label}>
                <span>{row.label}</span>
                <strong className={row.ltr ? 'bdi-ltr' : ''} style={{ fontWeight: 500 }}>
                  {row.value}
                </strong>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
