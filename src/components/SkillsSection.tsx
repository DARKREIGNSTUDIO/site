import { SKILL_CATEGORIES } from '../data/portfolio';
import { useTiltHandlers } from '../hooks/useMotionFx';

export function SkillsSection() {
  const tilt = useTiltHandlers();

  return (
    <section id="skills" className="sec">
      <div className="k">SKILLS</div>
      <h2 className="sec-h2">چیزهایی که باهاشون می‌سازم</h2>

      <div className="sk">
        {SKILL_CATEGORIES.map((group) => (
          <div
            key={group.title}
            className="pn"
            onPointerMove={tilt.onPointerMove}
            onPointerLeave={tilt.onPointerLeave}
          >
            <h3>{group.title}</h3>
            <div>
              {group.chips.map((chip) => {
                const hasLatin = /[A-Za-z0-9#]/.test(chip) && !/[\u0600-\u06FF]/.test(chip);
                return (
                  <span
                    key={chip}
                    className={`ch ${hasLatin ? 'bdi-ltr' : ''}`}
                  >
                    {chip}
                  </span>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
