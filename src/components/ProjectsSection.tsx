import { useState } from 'react';
import type { PointerEvent } from 'react';
import { soundEngine } from '../audio/soundEngine';
import { PROJECTS, getNextIndex, type ProjectItem } from '../data/portfolio';
import { useRevealRef, useTiltHandlers } from '../hooks/useMotionFx';

interface ProjectsSectionProps {
  onOpenLightbox: (project: ProjectItem, index: number) => void;
}

function ProjectCard({
  project,
  index,
  onOpenLightbox,
}: {
  project: ProjectItem;
  index: number;
  onOpenLightbox: (project: ProjectItem, index: number) => void;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [revealKey, setRevealKey] = useState(0);
  const [slideDir, setSlideDir] = useState<'next' | 'prev'>('next');
  const tilt = useTiltHandlers();
  const { ref, visible } = useRevealRef<HTMLElement>();

  const hasImages = project.i.length > 0;
  const total = project.i.length;
  const activeSrc = hasImages ? project.i[activeIndex] ?? project.i[0] : '';
  const prevIdx = total > 1 ? getNextIndex(activeIndex, 'prev', total) : 0;
  const nextIdx = total > 1 ? getNextIndex(activeIndex, 'next', total) : 0;
  const farIdx = total > 2 ? getNextIndex(nextIdx, 'next', total) : nextIdx;
  const isWideMenu = activeSrc.includes('rw2.jpg');

  const handleSelect = (idx: number, direction?: 'next' | 'prev') => {
    if (idx === activeIndex || total <= 1) return;
    const inferredDir =
      direction ?? (idx > activeIndex || (activeIndex === total - 1 && idx === 0) ? 'next' : 'prev');
    setSlideDir(inferredDir);
    setActiveIndex(idx);
    setRevealKey((prev) => prev + 1);
    soundEngine.playCardSlide(inferredDir);
  };

  const handleStep = (direction: 'next' | 'prev') => {
    if (total <= 1) return;
    const target = getNextIndex(activeIndex, direction, total);
    handleSelect(target, direction);
  };

  const handlePhotoGlide = (e: PointerEvent<HTMLElement>, isEnter = false) => {
    const pan = (e.clientX / Math.max(1, window.innerWidth)) * 2 - 1;
    const speed = isEnter ? 22 : Math.hypot(e.movementX || 0, e.movementY || 0);
    if (isEnter || speed > 5) {
      soundEngine.playPhotoHoverGlide(pan, speed);
    }
  };

  return (
    <article
      ref={ref}
      className={`pj rv${visible ? ' in' : ''}${project.pt ? ' pt' : ''}`}
    >
      <div>
        {hasImages ? (
          <>
            <div className={`deck${project.pt ? ' deck-pt' : ''}`}>
              {total > 2 && (
                <div className="deck-under deck-under-far" aria-hidden="true">
                  <img src={project.i[farIdx]} alt="" referrerPolicy="no-referrer" />
                </div>
              )}

              {total > 1 && (
                <button
                  type="button"
                  className="deck-under deck-under-left"
                  onClick={() => handleStep('prev')}
                  onPointerEnter={(e) => handlePhotoGlide(e, true)}
                  aria-label={`تصویر قبلی ${project.n}`}
                >
                  <img src={project.i[prevIdx]} alt="" referrerPolicy="no-referrer" />
                </button>
              )}

              {total > 1 && (
                <button
                  type="button"
                  className="deck-under deck-under-right"
                  onClick={() => handleStep('next')}
                  onPointerEnter={(e) => handlePhotoGlide(e, true)}
                  aria-label={`تصویر بعدی ${project.n}`}
                >
                  <img src={project.i[nextIdx]} alt="" referrerPolicy="no-referrer" />
                </button>
              )}

              <div
                className="fr deck-center"
                onPointerMove={(e) => {
                  tilt.onPointerMove(e);
                  handlePhotoGlide(e, false);
                }}
                onPointerEnter={(e) => handlePhotoGlide(e, true)}
                onPointerLeave={tilt.onPointerLeave}
              >
                <div className="in2">
                  <img
                    key={`${project.id}-${revealKey}`}
                    src={activeSrc}
                    alt={project.n}
                    referrerPolicy="no-referrer"
                    onClick={() => {
                      soundEngine.playUiTick('click');
                      onOpenLightbox(project, activeIndex);
                    }}
                    className={`${
                      revealKey > 0
                        ? slideDir === 'next'
                          ? 'emerge-next '
                          : 'emerge-prev '
                        : ''
                    }${isWideMenu ? 'contain-wide' : ''}`}
                  />
                  {total > 1 && (
                    <span className="deck-counter" aria-hidden="true">
                      {activeIndex + 1} / {total}
                    </span>
                  )}
                </div>

                {total > 1 && (
                  <div className="deck-controls">
                    <button
                      type="button"
                      className="deck-arrow"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStep('prev');
                      }}
                      aria-label={`قبلی در ${project.n}`}
                    >
                      ‹ قبلی
                    </button>
                    <button
                      type="button"
                      className="deck-arrow"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStep('next');
                      }}
                      aria-label={`بعدی در ${project.n}`}
                    >
                      بعدی ›
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="th" role="group" aria-label={`تصاویر پروژه ${project.n}`}>
              {project.i.map((src, idx) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => handleSelect(idx)}
                  onPointerEnter={(e) => handlePhotoGlide(e, true)}
                  className={idx === activeIndex ? 'on' : ''}
                  aria-label={`نمایش تصویر ${idx + 1} از ${project.n}`}
                  aria-pressed={idx === activeIndex}
                >
                  <img src={src} alt="" referrerPolicy="no-referrer" />
                </button>
              ))}
            </div>
          </>
        ) : (
          <div
            className="fr"
            onPointerMove={(e) => {
              tilt.onPointerMove(e);
              handlePhotoGlide(e, false);
            }}
            onPointerEnter={(e) => handlePhotoGlide(e, true)}
            onPointerLeave={tilt.onPointerLeave}
          >
            <div className="in2 ph">
              <div>
                {project.phMain}
                {project.phSub && <small>{project.phSub}</small>}
              </div>
            </div>
          </div>
        )}
      </div>

      <div>
        <div className="pj-badges">
          <span className="bd">منتشر نشده · پروژه مستقل</span>
          <span className="bd-tape bdi-ltr">
            TAPE 0{index + 1}
          </span>
        </div>
        <h3 className="pn2">{project.n}</h3>
        <div className="sb">{project.t}</div>
        <p className="pj-desc">{project.d}</p>
        <div>
          {project.c.map((chip) => (
            <span key={chip} className="ch bdi-ltr">
              {chip}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}

export function ProjectsSection({ onOpenLightbox }: ProjectsSectionProps) {
  return (
    <section id="projects" className="sec">
      <div className="k">PROJECTS</div>
      <h2 className="sec-h2">پروژه‌های من</h2>

      <div className="note">
        هیچ‌کدوم از این پروژه‌ها منتشر نشدن. همه‌شون پروژه‌های مستقلی هستن که برای یادگیری،
        آزمایش سیستم‌ها و تمرین ساخت واقعی ساختم؛ پس تصاویر زیر از خودِ بازی‌ها و محیط{' '}
        <span className="bdi-ltr">Unity</span> هستن، نه از استور.
      </div>

      <div>
        {PROJECTS.map((project, index) => (
          <ProjectCard
            key={project.id}
            project={project}
            index={index}
            onOpenLightbox={onOpenLightbox}
          />
        ))}
      </div>
    </section>
  );
}
